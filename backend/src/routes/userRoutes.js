const express = require("express");
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserPermissions,
} = require("../controllers/userController");

const router = express.Router();

// Import middleware
const { protect, authorize } = require("../middleware/auth");

// All routes require authentication
router.use(protect);
// All routes require admin role
router.use(authorize("admin"));

router.route("/").get(getUsers);

router.route("/:id").get(getUserById).put(updateUser).delete(deleteUser);

router.route("/:id/permissions").get(getUserPermissions);

module.exports = router;
