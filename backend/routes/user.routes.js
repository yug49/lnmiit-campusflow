const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const {
  authenticateToken,
  authorizeRoles,
  checkPermission,
} = require("../middleware/auth.middleware");
const { upload } = require("../config/fileUpload");

// Create uploads directory if it doesn't exist
const fs = require("fs");
const path = require("path");
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Protected user routes - require authentication
router.get("/profile", authenticateToken, userController.getUserProfile);
router.put("/profile", authenticateToken, userController.updateUserProfile);
router.post(
  "/profile/photo",
  authenticateToken,
  upload.single("profilePhoto"),
  userController.uploadProfilePhoto
);
router.post(
  "/profile/signature",
  authenticateToken,
  upload.single("digitalSignature"),
  userController.uploadDigitalSignature
);

// Get all students - accessible to admins
router.get(
  "/students",
  authenticateToken,
  authorizeRoles("admin"),
  userController.getAllStudents
);

// Search users - accessible to admins
router.get(
  "/search",
  authenticateToken,
  authorizeRoles("admin"),
  userController.searchUsers
);

// Admin-only routes - require both authentication and admin role
router.get(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  userController.getAllUsers
);
router.get("/:id", authenticateToken, userController.getUserById);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  userController.deleteUser
);

module.exports = router;
