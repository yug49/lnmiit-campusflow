const express = require("express");
const router = express.Router();
const mouController = require("../controllers/mou.controller");
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
    mouController.submitMoU
);

router.get(
    "/my-submissions",
    protect,
    authorize("council", "admin"),
    mouController.getMySubmittedMoUs
);

// Faculty and Admin routes
router.get(
    "/pending",
    protect,
    authorize("faculty", "admin"),
    mouController.getPendingMoUs
);

router.get(
    "/all",
    protect,
    authorize("faculty", "admin"),
    mouController.getAllMoUs
);

router.get("/:id", protect, mouController.getMoUById);

router.post(
    "/:id/sign",
    protect,
    authorize("faculty", "admin"),
    mouController.signMoU
);

router.post(
    "/:id/reject",
    protect,
    authorize("faculty", "admin"),
    mouController.rejectMoU
);

router.get(
    "/:mouId/verify/:signatureIndex",
    protect,
    mouController.verifySignature
);

module.exports = router;
