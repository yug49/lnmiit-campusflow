const mongoose = require("mongoose");

const NoDuesSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  userType: {
    type: String,
    enum: ["student", "faculty"],
    required: true,
  },
  department: {
    type: String,
    required: function () {
      return this.userType === "faculty";
    },
  },
  batch: {
    type: String,
    required: function () {
      return this.userType === "student";
    },
  },
  items: [
    {
      category: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
      approvedBy: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
      approvalDate: {
        type: Date,
      },
      comments: {
        type: String,
      },
    },
  ],
  overallStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  submittedDate: {
    type: Date,
    default: Date.now,
  },
  completedDate: {
    type: Date,
  },
});

module.exports = mongoose.model("NoDues", NoDuesSchema);
