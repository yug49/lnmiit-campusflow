const express = require("express");
const {
  getMOUs,
  getMOU,
  createMOU,
  updateMOU,
  deleteMOU,
  updateMOUApproval,
} = require("../controllers/mouController");

const router = express.Router();

// Import middleware
const { protect, authorize } = require("../middleware/auth");

// All routes require authentication
router.use(protect);

// Basic MOU routes
router
  .route("/")
  .get(getMOUs)
  .post(authorize("council_member", "admin"), createMOU);

router
  .route("/:id")
  .get(getMOU)
  .put(authorize("council_member", "admin"), updateMOU)
  .delete(authorize("council_member", "admin"), deleteMOU);

// MOU approval routes - only accessible by faculty mentors and admins
router
  .route("/:id/approval")
  .put(authorize("faculty_mentor", "admin"), updateMOUApproval);

module.exports = router;
