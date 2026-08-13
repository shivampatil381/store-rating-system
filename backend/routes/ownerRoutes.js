const express = require("express");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
    getDashboard,
    getRatings,
    updatePassword
} = require("../controllers/ownerController");

const router = express.Router();

router.get(
    "/dashboard",
    authenticate,
    authorize("OWNER"),
    getDashboard
);

router.get(
    "/ratings",
    authenticate,
    authorize("OWNER"),
    getRatings
);

router.put(
    "/password",
    authenticate,
    authorize("OWNER"),
    updatePassword
);

module.exports = router;