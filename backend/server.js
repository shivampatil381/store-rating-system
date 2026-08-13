// const app = require("./app");

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//     console.log(`Server is running on  http://localhost:${PORT}`);
// });

const app = require("./app");
const db = require("./config/db");

const PORT = process.env.PORT || 5000;

db.query("SELECT 1")
    .then(() => {
        console.log("MySQL connected successfully");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MySQL connection failed:", error);
    });