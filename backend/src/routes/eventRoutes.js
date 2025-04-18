const express = require("express");
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  updateEventApproval,
} = require("../controllers/eventController");

const router = express.Router();

// Import middleware
const { protect, authorize } = require("../middleware/auth");

// All routes require authentication
router.use(protect);

// Basic event routes
router
  .route("/")
  .get(getEvents)
  .post(authorize("council_member", "admin"), createEvent);

router
  .route("/:id")
  .get(getEvent)
  .put(authorize("council_member", "admin"), updateEvent)
  .delete(authorize("council_member", "admin"), deleteEvent);

// Event approval routes - only accessible by faculty mentors and admins
router
  .route("/:id/approval")
  .put(authorize("faculty_mentor", "admin"), updateEventApproval);

module.exports = router;
