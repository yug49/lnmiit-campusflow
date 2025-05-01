const mongoose = require("mongoose");

const VotingSessionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  authorizedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure only one active session per student
VotingSessionSchema.index(
  { student: 1, active: 1 },
  {
    unique: true,
    partialFilterExpression: { active: true },
  }
);

module.exports = mongoose.model("VotingSession", VotingSessionSchema);
