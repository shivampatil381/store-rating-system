const db = require("../config/db");
const bcrypt = require("bcryptjs");

const getDashboard = async (req, res) => {
    try {
        const [userResult] = await db.query(
            "SELECT COUNT(*) AS totalUsers FROM users"
        );

        const [storeResult] = await db.query(
            "SELECT COUNT(*) AS totalStores FROM stores"
        );

        const [ratingResult] = await db.query(
            "SELECT COUNT(*) AS totalRatings FROM ratings"
        );

        res.status(200).json({
            totalUsers: userResult[0].totalUsers,
            totalStores: storeResult[0].totalStores,
            totalRatings: ratingResult[0].totalRatings
        });

    } catch (error) {
        console.error("Dashboard error:", error);

        res.status(500).json({
            message: "Failed to load dashboard"
        });
    }
};

const createUser = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            address,
            role
        } = req.body;

        // Required fields
        if (!name || !email || !password || !address || !role) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // Validate role
        if (!["USER", "ADMIN", "OWNER"].includes(role)) {
            return res.status(400).json({
                message: "Role must be USER, ADMIN or OWNER"
            });
        }

        // Validate name
        if (name.length < 20 || name.length > 60) {
            return res.status(400).json({
                message: "Name must be between 20 and 60 characters"
            });
        }

        // Validate address
        if (address.length > 400) {
            return res.status(400).json({
                message: "Address must not exceed 400 characters"
            });
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Invalid email format"
            });
        }

        // Validate password
        const passwordRegex =
            /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message:
                    "Password must be 8-16 characters and contain at least one uppercase letter and one special character"
            });
        }

        // Check duplicate email
        const [existingUsers] = await db.query(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        // Insert user
        const [result] = await db.query(
            `INSERT INTO users
            (name, email, password, address, role)
            VALUES (?, ?, ?, ?, ?)`,
            [
                name,
                email,
                hashedPassword,
                address,
                role
            ]
        );

        res.status(201).json({
            message: "User created successfully",
            userId: result.insertId
        });

    } catch (error) {
        console.error("Create user error:", error);

        res.status(500).json({
            message: "Failed to create user"
        });
    }
};

const createStore = async (req, res) => {
    try {
        const {
            name,
            email,
            address,
            owner_id
        } = req.body;

        // 1. Required fields
        if (!name || !email || !address) {
            return res.status(400).json({
                message: "Name, email and address are required"
            });
        }

        // 2. Validate name
        if (name.length < 20 || name.length > 60) {
            return res.status(400).json({
                message: "Name must be between 20 and 60 characters"
            });
        }

        // 3. Validate address
        if (address.length > 400) {
            return res.status(400).json({
                message: "Address must not exceed 400 characters"
            });
        }

        // 4. Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Invalid email format"
            });
        }

        // 5. Check duplicate store email
        const [existingStores] = await db.query(
            "SELECT id FROM stores WHERE email = ?",
            [email]
        );

        if (existingStores.length > 0) {
            return res.status(409).json({
                message: "Store email already exists"
            });
        }

        // 6. If owner_id is provided, verify OWNER
        if (owner_id) {
            const [owners] = await db.query(
                "SELECT id FROM users WHERE id = ? AND role = 'OWNER'",
                [owner_id]
            );

            if (owners.length === 0) {
                return res.status(400).json({
                    message: "Invalid store owner"
                });
            }
        }

        // 7. Create store
        const [result] = await db.query(
            `INSERT INTO stores
            (name, email, address, owner_id)
            VALUES (?, ?, ?, ?)`,
            [
                name,
                email,
                address,
                owner_id || null
            ]
        );

        res.status(201).json({
            message: "Store created successfully",
            storeId: result.insertId
        });

    } catch (error) {
        console.error("Create store error:", error);

        res.status(500).json({
            message: "Failed to create store"
        });
    }
};

const assignStoreOwner = async (req, res) => {
    try {
        const storeId = req.params.id;
        const { owner_id } = req.body;

        // Check owner_id
        if (!owner_id) {
            return res.status(400).json({
                message: "owner_id is required"
            });
        }

        // Check whether user exists and is OWNER
        const [owners] = await db.query(
            `SELECT id, name, email
             FROM users
             WHERE id = ? AND role = 'OWNER'`,
            [owner_id]
        );

        if (owners.length === 0) {
            return res.status(400).json({
                message: "Invalid store owner"
            });
        }

        // Check whether store exists
        const [stores] = await db.query(
            "SELECT id, name FROM stores WHERE id = ?",
            [storeId]
        );

        if (stores.length === 0) {
            return res.status(404).json({
                message: "Store not found"
            });
        }

        // Check whether owner already owns another store
        const [existingStore] = await db.query(
            "SELECT id, name FROM stores WHERE owner_id = ? AND id != ?",
            [owner_id, storeId]
        );

        if (existingStore.length > 0) {
            return res.status(409).json({
                message: "This owner is already assigned to another store"
            });
        }

        // Assign owner
        await db.query(
            "UPDATE stores SET owner_id = ? WHERE id = ?",
            [owner_id, storeId]
        );

        res.status(200).json({
            message: "Store owner assigned successfully",
            storeId: Number(storeId),
            owner: owners[0]
        });

    } catch (error) {
        console.error("Assign owner error:", error);

        res.status(500).json({
            message: "Failed to assign store owner"
        });
    }
};

const getStores = async (req, res) => {
    try {
        const {
            name = "",
            email = "",
            address = "",
            sortBy = "name",
            order = "ASC"
        } = req.query;

        const allowedSortColumns = {
            name: "s.name",
            email: "s.email",
            address: "s.address",
            rating: "average_rating"
        };

        const sortColumn =
            allowedSortColumns[sortBy] || "s.name";

        const sortOrder =
            order.toUpperCase() === "DESC"
                ? "DESC"
                : "ASC";

        const [stores] = await db.query(
            `SELECT
                s.id,
                s.name,
                s.email,
                s.address,
                COALESCE(
                    AVG(r.rating),
                    0
                ) AS average_rating

             FROM stores s

             LEFT JOIN ratings r
                ON s.id = r.store_id

             WHERE
                s.name LIKE ?
                AND s.email LIKE ?
                AND s.address LIKE ?

             GROUP BY
                s.id,
                s.name,
                s.email,
                s.address

             ORDER BY
                ${sortColumn} ${sortOrder}`,
            [
                `%${name}%`,
                `%${email}%`,
                `%${address}%`
            ]
        );

        res.status(200).json({
            stores
        });

    } catch (error) {
        console.error("Get stores error:", error);

        res.status(500).json({
            message: "Failed to fetch stores"
        });
    }
};

const getUsers = async (req, res) => {
    try {
        const {
            name = "",
            email = "",
            address = "",
            role = "",
            sortBy = "name",
            order = "ASC"
        } = req.query;

        const allowedRoles = [
            "USER",
            "ADMIN",
            "OWNER"
        ];

        if (role && !allowedRoles.includes(role)) {
            return res.status(400).json({
                message:
                    "Role must be USER, ADMIN or OWNER"
            });
        }

        const allowedSortColumns = {
            name: "name",
            email: "email",
            address: "address",
            role: "role"
        };

        const sortColumn =
            allowedSortColumns[sortBy] || "name";

        const sortOrder =
            order.toUpperCase() === "DESC"
                ? "DESC"
                : "ASC";

        let sql = `
            SELECT
                id,
                name,
                email,
                address,
                role,
                created_at
            FROM users
            WHERE 1 = 1
        `;

        const params = [];

        if (name) {
            sql += " AND name LIKE ?";
            params.push(`%${name}%`);
        }

        if (email) {
            sql += " AND email LIKE ?";
            params.push(`%${email}%`);
        }

        if (address) {
            sql += " AND address LIKE ?";
            params.push(`%${address}%`);
        }

        if (role) {
            sql += " AND role = ?";
            params.push(role);
        }

        sql += `
            ORDER BY ${sortColumn} ${sortOrder}
        `;

        const [users] = await db.query(
            sql,
            params
        );

        res.status(200).json({
            users
        });

    } catch (error) {
        console.error("Get users error:", error);

        res.status(500).json({
            message: "Failed to fetch users"
        });
    }
};

const getUserDetails = async (req, res) => {
    try {
        const userId = req.params.id;

        // Get user
        const [users] = await db.query(
            `SELECT
                id,
                name,
                email,
                address,
                role,
                created_at
             FROM users
             WHERE id = ?`,
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const user = users[0];

        // Get ratings submitted by this user
        const [ratings] = await db.query(
            `SELECT
                r.id,
                r.rating,
                r.created_at,
                r.updated_at,
                s.id AS store_id,
                s.name AS store_name,
                s.email AS store_email
             FROM ratings r
             INNER JOIN stores s
                ON r.store_id = s.id
             WHERE r.user_id = ?
             ORDER BY r.created_at DESC`,
            [userId]
        );

        res.status(200).json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                address: user.address,
                role: user.role,
                created_at: user.created_at
            },
            ratings
        });

    } catch (error) {
        console.error("Get user details error:", error);

        res.status(500).json({
            message: "Failed to fetch user details"
        });
    }
};

module.exports = {
    getDashboard,
    createUser,
    createStore,
    assignStoreOwner,
    getStores,
    getUsers,
    getUserDetails
};