const express = require("express");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
    getStores,
    submitRating,
    updateRating,
    updatePassword
} = require("../controllers/userController");

const router = express.Router();

router.get(
    "/stores",
    authenticate,
    authorize("USER"),
    getStores
);

router.post(
    "/ratings",
    authenticate,
    authorize("USER"),
    submitRating
);

router.put(
    "/ratings/:storeId",
    authenticate,
    authorize("USER"),
    updateRating
);

router.put(
    "/password",
    authenticate,
    authorize("USER"),
    updatePassword
);

module.exports = router;