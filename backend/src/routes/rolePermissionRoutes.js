const express = require("express");
const {
  getRolePermissions,
  createRolePermission,
  updateRolePermission,
  deleteRolePermission,
  assignRoleToUser,
} = require("../controllers/rolePermissionController");

const router = express.Router();

// Import middleware
const { protect, authorize } = require("../middleware/auth");

// Apply protection to all routes
router.use(protect);
// Apply admin authorization to all routes
router.use(authorize("admin"));

router.route("/").get(getRolePermissions).post(createRolePermission);

router.route("/:id").put(updateRolePermission).delete(deleteRolePermission);

router.post("/assign-role", assignRoleToUser);

module.exports = router;
