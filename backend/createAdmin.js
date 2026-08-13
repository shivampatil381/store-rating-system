require("dotenv").config();

const db = require("./config/db");
const bcrypt = require("bcryptjs");

const createAdmin = async () => {
    try {
        const name = "System Administrator Account";
        const email = "admin@gmail.com";
        const address = "Admin Office";
        const password = "Admin@123";

        // Check if admin already exists
        const [existingUsers] = await db.query(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (existingUsers.length > 0) {
            console.log("Admin already exists.");
            process.exit();
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert admin
        await db.query(
            `INSERT INTO users
            (name, email, password, address, role)
            VALUES (?, ?, ?, ?, ?)`,
            [
                name,
                email,
                hashedPassword,
                address,
                "ADMIN"
            ]
        );

        console.log("Admin created successfully.");

        process.exit();

    } catch (error) {
        console.error("Error creating admin:", error);
        process.exit(1);
    }
};

createAdmin();