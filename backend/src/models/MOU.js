const mongoose = require("mongoose");

const MOUSchema = new mongoose.Schema({
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
  organization: {
    type: String,
    required: [true, "Please provide the organization name"],
  },
  council: {
    type: String,
    required: [true, "Please specify the proposing council"],
  },
  proposer: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  startDate: {
    type: Date,
    required: [true, "Please add a start date"],
  },
  endDate: {
    type: Date,
    required: [true, "Please add an end date"],
  },
  benefits: {
    type: String,
    required: [true, "Please outline the benefits"],
  },
  termsAndConditions: {
    type: String,
    required: [true, "Please detail the terms and conditions"],
  },
  documentURL: {
    type: String,
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
  rejectionReason: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("MOU", MOUSchema);
