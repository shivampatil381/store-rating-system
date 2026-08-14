const db = require("../config/db");
const bcrypt = require("bcryptjs");

const getDashboard = async (req, res) => {
    try {
        const ownerId = req.user.id;

        const [stores] = await db.query(
            `SELECT
                s.id,
                s.name,
                s.email,
                s.address,
                COALESCE(ROUND(AVG(r.rating), 1), 0) AS average_rating,
                COUNT(r.id) AS total_ratings
             FROM stores s
             LEFT JOIN ratings r
                ON s.id = r.store_id
             WHERE s.owner_id = ?
             GROUP BY
                s.id,
                s.name,
                s.email,
                s.address`,
            [ownerId]
        );

        if (stores.length === 0) {
            return res.status(404).json({
                message: "No store assigned to this owner"
            });
        }

        res.status(200).json({
            store: stores[0]
        });

    } catch (error) {
        console.error("Owner dashboard error:", error);

        res.status(500).json({
            message: "Failed to load owner dashboard"
        });
    }
};

const getRatings = async (req, res) => {
    try {
        const ownerId = req.user.id;

        const [ratings] = await db.query(
            `SELECT
                r.id AS rating_id,
                r.rating,
                r.created_at,
                r.updated_at,

                u.id AS user_id,
                u.name AS user_name,
                u.email AS user_email,
                u.address AS user_address,

                s.id AS store_id,
                s.name AS store_name

             FROM ratings r

             INNER JOIN users u
                ON r.user_id = u.id

             INNER JOIN stores s
                ON r.store_id = s.id

             WHERE s.owner_id = ?

             ORDER BY r.created_at DESC`,
            [ownerId]
        );

        res.status(200).json({
            ratings
        });

    } catch (error) {
        console.error("Get owner ratings error:", error);

        res.status(500).json({
            message: "Failed to fetch ratings"
        });
    }
};

const updatePassword = async (req, res) => {
    try {
        const ownerId = req.user.id;

        const {
            currentPassword,
            newPassword
        } = req.body;

        // Validate fields
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message:
                    "Current password and new password are required"
            });
        }

        // Password validation
        const passwordRegex =
            /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({
                message:
                    "Password must be 8-16 characters and contain at least one uppercase letter and one special character"
            });
        }

        // Get current password
        const [owners] = await db.query(
            `SELECT password
             FROM users
             WHERE id = ?
             AND role = 'OWNER'`,
            [ownerId]
        );

        if (owners.length === 0) {
            return res.status(404).json({
                message: "Store owner not found"
            });
        }

        // Compare current password
        const passwordMatch = await bcrypt.compare(
            currentPassword,
            owners[0].password
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
                ownerId
            ]
        );

        res.status(200).json({
            message: "Password updated successfully"
        });

    } catch (error) {
        console.error("Owner password error:", error);

        res.status(500).json({
            message: "Failed to update password"
        });
    }
};

module.exports = {
    getDashboard,
    getRatings,
    updatePassword
};