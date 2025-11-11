const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const {
    authenticatePrivyToken,
    authenticateToken,
} = require("../middleware/auth.middleware");

// Simplified authentication routes
router.get(
    "/user/:email",
    authenticatePrivyToken,
    authController.getUserByEmail
);

// Sync wallet address (requires full authentication with user object)
router.post(
    "/sync-wallet",
    authenticateToken,
    authController.syncWalletAddress
);

module.exports = router;
