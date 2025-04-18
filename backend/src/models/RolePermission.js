const mongoose = require("mongoose");

const RolePermissionSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    enum: [
      "student",
      "faculty",
      "faculty_mentor",
      "head_of_department",
      "council_member",
      "admin",
    ],
    unique: true,
  },
  permissions: {
    type: [String],
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model("RolePermission", RolePermissionSchema);
