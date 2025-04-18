const express = require("express");
const {
  getAllNoDuesForms,
  getNoDuesForm,
  createNoDuesForm,
  getMyNoDuesForms,
  updateNoDuesItemApproval,
} = require("../controllers/noDuesController");

const router = express.Router();

// Import middleware
const { protect, authorize } = require("../middleware/auth");

// All routes require authentication
router.use(protect);

// My no dues routes
router.get("/my", getMyNoDuesForms);

// Create no dues form route
router.post("/", createNoDuesForm);

// Admin/HOD routes for managing no dues
router.get("/", authorize("head_of_department", "admin"), getAllNoDuesForms);

// General no dues routes
router.get("/:id", getNoDuesForm);

// No dues item approval route - only accessible by HODs and admins
router.put(
  "/:id/items/:itemId",
  authorize("head_of_department", "admin"),
  updateNoDuesItemApproval
);

module.exports = router;
