const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoice.controller");
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
    invoiceController.submitInvoice
);

router.get(
    "/my-submissions",
    protect,
    authorize("council", "admin"),
    invoiceController.getMySubmittedInvoices
);

router.get(
    "/approved-events",
    protect,
    authorize("council", "admin"),
    invoiceController.getApprovedEvents
);

// Faculty and Admin routes
router.get(
    "/pending",
    protect,
    authorize("faculty", "admin"),
    invoiceController.getPendingInvoices
);

router.get(
    "/all",
    protect,
    authorize("faculty", "admin"),
    invoiceController.getAllInvoices
);

router.get(
    "/:id",
    protect,
    authorize("council", "faculty", "admin"),
    invoiceController.getInvoiceById
);

router.post(
    "/:id/sign",
    protect,
    authorize("faculty", "admin"),
    invoiceController.signInvoice
);

router.post(
    "/:id/reject",
    protect,
    authorize("faculty", "admin"),
    invoiceController.rejectInvoice
);

module.exports = router;
