const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  batch: {
    type: String,
    required: true,
  },
  statement: {
    type: String,
    required: true,
  },
  experience: {
    type: String,
    required: true,
  },
  achievements: {
    type: String,
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected", "Reverted"],
    default: "Pending",
  },
  remark: {
    type: String,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Prevent duplicate applications for the same position
candidateSchema.index({ user: 1, position: 1 }, { unique: true });

module.exports = mongoose.model("Candidate", candidateSchema);
