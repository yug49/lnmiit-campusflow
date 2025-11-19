const express = require("express");
const router = express.Router();
const {
    submitStudentNoDues,
    getMyNoDuesStatus,
    getPendingNoDues,
    getAllNoDues,
    signNoDues,
    rejectNoDues,
    getNoDuesById,
    getApprovalFlowConfig,
    deleteMyNoDues,
} = require("../controllers/studentNoDues.controller");
const {
    authenticateToken,
    authorizeRoles,
} = require("../middleware/auth.middleware");

// Student routes
router.post("/submit", authenticateToken, submitStudentNoDues);
router.get("/my-status", authenticateToken, getMyNoDuesStatus);
router.get("/flow-config", authenticateToken, getApprovalFlowConfig);
router.delete("/my-nodues", authenticateToken, deleteMyNoDues); // Development only

// Faculty/Admin routes
router.get(
    "/pending",
    authenticateToken,
    authorizeRoles("faculty", "admin"),
    getPendingNoDues
);
router.get(
    "/all",
    authenticateToken,
    authorizeRoles("faculty", "admin"),
    getAllNoDues
);
router.get(
    "/:id",
    authenticateToken,
    authorizeRoles("faculty", "admin", "student"),
    getNoDuesById
);

// Signature routes
router.post(
    "/:id/sign",
    authenticateToken,
    authorizeRoles("faculty", "admin"),
    signNoDues
);
router.post(
    "/:id/reject",
    authenticateToken,
    authorizeRoles("faculty", "admin"),
    rejectNoDues
);

module.exports = router;
