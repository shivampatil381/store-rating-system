const db = require("../config/db");
const bcrypt = require("bcryptjs");

const getStores = async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            search = "",
            sortBy = "name",
            order = "ASC"
        } = req.query;

        const allowedSortColumns = {
            name: "s.name",
            address: "s.address",
            rating: "average_rating"
        };

        const sortColumn =
            allowedSortColumns[sortBy] || "s.name";

        const sortOrder =
            order.toUpperCase() === "DESC"
                ? "DESC"
                : "ASC";

        const searchValue = `%${search}%`;

        const [stores] = await db.query(
            `SELECT
                s.id,
                s.name,
                s.address,

                COALESCE(AVG(all_ratings.rating), 0)
                    AS average_rating,

                user_rating.rating
                    AS user_rating

             FROM stores s

             LEFT JOIN ratings all_ratings
                ON s.id = all_ratings.store_id

             LEFT JOIN ratings user_rating
                ON s.id = user_rating.store_id
                AND user_rating.user_id = ?

             WHERE
                s.name LIKE ?
                OR s.address LIKE ?

             GROUP BY
                s.id,
                s.name,
                s.address,
                user_rating.rating

             ORDER BY ${sortColumn} ${sortOrder}`,
            [
                userId,
                searchValue,
                searchValue
            ]
        );

        res.status(200).json({
            stores
        });

    } catch (error) {
        console.error("Get user stores error:", error);

        res.status(500).json({
            message: "Failed to fetch stores"
        });
    }
};

const submitRating = async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            store_id,
            rating
        } = req.body;

        // Validate fields
        if (!store_id || rating === undefined) {
            return res.status(400).json({
                message: "store_id and rating are required"
            });
        }

        // Validate rating
        const numericRating = Number(rating);

        if (
            !Number.isInteger(numericRating) ||
            numericRating < 1 ||
            numericRating > 5
        ) {
            return res.status(400).json({
                message: "Rating must be an integer between 1 and 5"
            });
        }

        // Check store
        const [stores] = await db.query(
            "SELECT id FROM stores WHERE id = ?",
            [store_id]
        );

        if (stores.length === 0) {
            return res.status(404).json({
                message: "Store not found"
            });
        }

        // Check whether user already rated this store
        const [existingRating] = await db.query(
            `SELECT id
             FROM ratings
             WHERE user_id = ?
             AND store_id = ?`,
            [userId, store_id]
        );

        if (existingRating.length > 0) {
            return res.status(409).json({
                message: "You have already rated this store"
            });
        }

        // Insert rating
        const [result] = await db.query(
            `INSERT INTO ratings
            (user_id, store_id, rating)
            VALUES (?, ?, ?)`,
            [
                userId,
                store_id,
                numericRating
            ]
        );

        res.status(201).json({
            message: "Rating submitted successfully",
            ratingId: result.insertId
        });

    } catch (error) {
        console.error("Submit rating error:", error);

        res.status(500).json({
            message: "Failed to submit rating"
        });
    }
};

const updateRating = async (req, res) => {
    try {
        const userId = req.user.id;
        const storeId = req.params.storeId;

        const {
            rating
        } = req.body;

        // Validate rating
        const numericRating = Number(rating);

        if (
            !Number.isInteger(numericRating) ||
            numericRating < 1 ||
            numericRating > 5
        ) {
            return res.status(400).json({
                message: "Rating must be an integer between 1 and 5"
            });
        }

        // Find existing rating
        const [existingRating] = await db.query(
            `SELECT id
             FROM ratings
             WHERE user_id = ?
             AND store_id = ?`,
            [
                userId,
                storeId
            ]
        );

        if (existingRating.length === 0) {
            return res.status(404).json({
                message: "You have not rated this store yet"
            });
        }

        // Update rating
        await db.query(
            `UPDATE ratings
             SET rating = ?, updated_at = CURRENT_TIMESTAMP
             WHERE user_id = ?
             AND store_id = ?`,
            [
                numericRating,
                userId,
                storeId
            ]
        );

        res.status(200).json({
            message: "Rating updated successfully"
        });

    } catch (error) {
        console.error("Update rating error:", error);

        res.status(500).json({
            message: "Failed to update rating"
        });
    }
};

const updatePassword = async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            currentPassword,
            newPassword
        } = req.body;

        // Validate fields
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: "Current password and new password are required"
            });
        }

        // Validate new password
        const passwordRegex =
            /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({
                message:
                    "Password must be 8-16 characters and contain at least one uppercase letter and one special character"
            });
        }

        // Get current password
        const [users] = await db.query(
            `SELECT password
             FROM users
             WHERE id = ?`,
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Compare old password
        const passwordMatch = await bcrypt.compare(
            currentPassword,
            users[0].password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Current password is incorrect"
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(
            newPassword,
            10
        );

        // Update password
        await db.query(
            `UPDATE users
             SET password = ?
             WHERE id = ?`,
            [
                hashedPassword,
                userId
            ]
        );

        res.status(200).json({
            message: "Password updated successfully"
        });

    } catch (error) {
        console.error("Update password error:", error);

        res.status(500).json({
            message: "Failed to update password"
        });
    }
};

module.exports = {
    getStores,
    submitRating,
    updateRating,
    updatePassword
};