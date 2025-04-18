const express = require("express");
const {
  bulkUploadUsers,
  getCsvTemplate,
  batchUpdateUsers,
  annualPromotion,
  getUserStats,
} = require("../controllers/adminController");

const router = express.Router();

// Import middleware
const { protect, authorize } = require("../middleware/auth");

// All routes require authentication and admin role
router.use(protect);
router.use(authorize("admin"));

// User management routes
router.post("/users/bulk-upload", bulkUploadUsers);
router.get("/users/csv-template", getCsvTemplate);
router.post("/users/batch-update", batchUpdateUsers);
router.post("/users/annual-promotion", annualPromotion);
router.get("/users/stats", getUserStats);

module.exports = router;
