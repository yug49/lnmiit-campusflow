const express = require("express");
const {
  getFacultyDashboard,
  getFacultyMentors,
  getHeadsOfDepartments,
  assignFacultyRole,
  removeFacultyRole,
} = require("../controllers/facultyController");

const router = express.Router();

// Import middleware
const { protect, authorize } = require("../middleware/auth");

// All routes require authentication
router.use(protect);

// Faculty dashboard - only accessible by faculty
router.get("/dashboard", authorize("faculty"), getFacultyDashboard);

// Faculty role management - only accessible by admin
router.get("/mentors", authorize("admin"), getFacultyMentors);
router.get("/hods", authorize("admin"), getHeadsOfDepartments);
router.post("/assign-role", authorize("admin"), assignFacultyRole);
router.post("/remove-role", authorize("admin"), removeFacultyRole);

module.exports = router;
