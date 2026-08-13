const express = require("express");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
    getDashboard,
    createUser,
    createStore,
    assignStoreOwner,
    getStores,
    getUsers,
    getUserDetails
} = require("../controllers/adminController");

const router = express.Router();

router.get(
    "/dashboard",
    authenticate,
    authorize("ADMIN"),
    getDashboard
);

router.get(
    "/users",
    authenticate,
    authorize("ADMIN"),
    getUsers
);

router.get(
    "/users/:id",
    authenticate,
    authorize("ADMIN"),
    getUserDetails
);

router.post(
    "/users",
    authenticate,
    authorize("ADMIN"),
    createUser
);

router.post(
    "/stores",
    authenticate,
    authorize("ADMIN"),
    createStore
);

router.put(
    "/stores/:id/owner",
    authenticate,
    authorize("ADMIN"),
    assignStoreOwner
);

router.get(
    "/stores",
    authenticate,
    authorize("ADMIN"),
    getStores
);

module.exports = router;