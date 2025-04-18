const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please add a title"],
    trim: true,
    maxlength: [100, "Title cannot be more than 100 characters"],
  },
  description: {
    type: String,
    required: [true, "Please add a description"],
  },
  organizer: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  council: {
    type: String,
    required: [true, "Please specify the organizing council"],
  },
  venue: {
    type: String,
    required: [true, "Please add a venue"],
  },
  startDate: {
    type: Date,
    required: [true, "Please add a start date and time"],
  },
  endDate: {
    type: Date,
    required: [true, "Please add an end date and time"],
  },
  budget: {
    type: Number,
    required: [true, "Please add an estimated budget"],
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "completed"],
    default: "pending",
  },
  approvedBy: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  approvalDate: {
    type: Date,
  },
  rejectionReason: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Event", EventSchema);
