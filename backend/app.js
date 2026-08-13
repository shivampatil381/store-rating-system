const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const authenticate = require("./middleware/authMiddleware");
const authorize = require("./middleware/roleMiddleware");
const adminRoutes = require("./routes/adminRoutes");
const ownerRoutes = require("./routes/ownerRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/owner", ownerRoutes);
app.use("/api/user", userRoutes);

app.get("/", (req, res) => {
    res.json({
        msg: "API is running"
    });
});

app.get("/api/health", (req, res) => {
    res.json({
        message: "Backend is running"
    });
});

// app.get("/api/test-protected", authenticate, (req, res) => {
//     res.json({
//         message: "You accessed a protected route",
//         user: req.user
//     });
// });

// app.get(
//     "/api/test-admin",
//     authenticate,
//     authorize("ADMIN"),
//     (req, res) => {
//         res.json({
//             message: "Welcome Admin",
//             user: req.user
//         });
//     }
// );

// app.get(
//     "/api/test-user",
//     authenticate,
//     authorize("USER"),
//     (req, res) => {
//         res.json({
//             message: "Welcome User",
//             user: req.user
//         });
//     }
// );

// app.get(
//     "/api/test-owner",
//     authenticate,
//     authorize("OWNER"),
//     (req, res) => {
//         res.json({
//             message: "Welcome Store Owner",
//             user: req.user
//         });
//     }
// );

module.exports = app;