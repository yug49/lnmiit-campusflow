const mongoose = require("mongoose");

const VoteSchema = new mongoose.Schema({
  voter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  votes: {
    // Store votes for each position
    // Key: position, Value: candidate ID
    type: Map,
    of: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
    },
  },
  votedAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure a user can only vote once
VoteSchema.index({ voter: 1 }, { unique: true });

module.exports = mongoose.model("Vote", VoteSchema);
