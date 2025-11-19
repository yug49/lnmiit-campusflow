const express = require("express");
const router = express.Router();
const eventPermissionController = require("../controllers/eventPermission.controller");
const {
    authenticateToken,
    authorizeRoles,
} = require("../middleware/auth.middleware");
const { upload } = require("../config/fileUpload");

// Alias for compatibility
const protect = authenticateToken;
const authorize = authorizeRoles;

// Council routes
router.post(
    "/submit",
    protect,
    authorize("council", "admin"),
    upload.single("document"),
    eventPermissionController.submitEventPermission
);

router.get(
    "/my-submissions",
    protect,
    authorize("council", "admin"),
    eventPermissionController.getMySubmittedPermissions
);

// Faculty and Admin routes
router.get(
    "/pending",
    protect,
    authorize("faculty", "admin"),
    eventPermissionController.getPendingPermissions
);

router.get(
    "/all",
    protect,
    authorize("faculty", "admin"),
    eventPermissionController.getAllPermissions
);

router.get("/:id", protect, eventPermissionController.getPermissionById);

router.post(
    "/:id/sign",
    protect,
    authorize("faculty", "admin"),
    eventPermissionController.signPermission
);

router.post(
    "/:id/reject",
    protect,
    authorize("faculty", "admin"),
    eventPermissionController.rejectPermission
);

router.get(
    "/:permissionId/verify/:signatureIndex",
    protect,
    eventPermissionController.verifySignature
);

module.exports = router;
