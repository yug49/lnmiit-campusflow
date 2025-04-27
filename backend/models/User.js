const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "faculty", "admin", "council"],
      required: true,
    },
    // Additional user details
    contactNumber: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    designation: {
      type: String,
      trim: true,
    },
    // Student-specific fields
    rollNumber: {
      type: String,
      trim: true,
    },
    yearOfJoining: {
      type: Number,
    },
    yearOfGraduation: {
      type: Number,
    },
    program: {
      type: String,
      trim: true,
    },
    // Faculty-specific fields
    employeeId: {
      type: String,
      trim: true,
    },
    // Council-specific fields
    position: {
      type: String,
      trim: true,
    },
    // File uploads
    profilePhoto: {
      url: {
        type: String,
        default: "",
      },
      publicId: {
        type: String,
        default: "",
      },
    },
    digitalSignature: {
      url: {
        type: String,
        default: "",
      },
      publicId: {
        type: String,
        default: "",
      },
    },
    // Address details
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      zipCode: { type: String, trim: true },
      country: { type: String, trim: true, default: "India" },
    },
    // Permissions for different functionalities
    permissions: {
      noDues: {
        submit: { type: Boolean, default: false },
        approve: { type: Boolean, default: false },
      },
      events: {
        submit: { type: Boolean, default: false },
        approve: { type: Boolean, default: false },
      },
      mou: {
        submit: { type: Boolean, default: false },
        approve: { type: Boolean, default: false },
      },
      voting: {
        submit: { type: Boolean, default: false },
        approve: { type: Boolean, default: false },
        vote: { type: Boolean, default: false },
      },
      facultyNoDues: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

// Password hashing middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Password comparison method
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error(error);
  }
};

const User = mongoose.model("User", userSchema);

module.exports = User;
