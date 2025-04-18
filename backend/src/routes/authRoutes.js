const express = require("express");
const {
  register,
  login,
  logout,
  getMe,
  getMyPermissions,
} = require("../controllers/authController");

const router = express.Router();

// Import middleware
const { protect } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/me", protect, getMe);
router.get("/permissions", protect, getMyPermissions);

module.exports = router;
