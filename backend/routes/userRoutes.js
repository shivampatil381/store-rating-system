const express = require("express");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
    getStores,
    submitRating,
    updatePassword,
    getStoresById
} = require("../controllers/userController");

const router = express.Router();

router.get(
    "/stores",
    authenticate,
    authorize("USER"),
    getStores
);

router.get(
    "/stores/:storeId",
    authenticate,
    authorize("USER"),
    getStoresById
);

router.post(
    "/rating",
    authenticate,
    authorize("USER"),
    submitRating
);

router.put(
    "/password",
    authenticate,
    authorize("USER"),
    updatePassword
);

module.exports = router;