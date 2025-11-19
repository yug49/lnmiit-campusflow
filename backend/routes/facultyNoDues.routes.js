const express = require("express");
const router = express.Router();
const {
    authenticateToken,
    authorizeRoles,
} = require("../middleware/auth.middleware");
const {
    submitFacultyNoDues,
    getMyNoDuesStatus,
    getPendingNoDues,
    getAllNoDues,
    signNoDues,
    rejectNoDues,
    getNoDuesById,
    getApprovalFlowConfig,
    deleteMyNoDues,
} = require("../controllers/facultyNoDues.controller");

// Faculty routes
router.post("/submit", authenticateToken, submitFacultyNoDues);
router.get("/my-status", authenticateToken, getMyNoDuesStatus);
router.delete("/my-nodues", authenticateToken, deleteMyNoDues); // Development only

// Approver routes (faculty and admin)
router.get(
    "/pending",
    authenticateToken,
    authorizeRoles("faculty", "admin"),
    getPendingNoDues
);
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

// Admin routes
router.get("/all", authenticateToken, authorizeRoles("admin"), getAllNoDues);
router.get(
    "/:id",
    authenticateToken,
    authorizeRoles("faculty", "admin"),
    getNoDuesById
);

// Config routes
router.get("/flow-config", authenticateToken, getApprovalFlowConfig);

module.exports = router;
