const express = require("express");
const router = express.Router();
const {
    verifyDocument,
} = require("../controllers/documentVerification.controller");

// Public route - no authentication required for verification
router.get("/verify/:signatureHash", verifyDocument);

module.exports = router;
