const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { authenticatePrivyToken } = require("../middleware/auth.middleware");

// Simplified authentication routes
router.get(
    "/user/:email",
    authenticatePrivyToken,
    authController.getUserByEmail
);

module.exports = router;
