const User = require("../models/User");
const { ApiError } = require("../utils/errorHandler");
const { storeFile, deleteFile } = require("../utils/fileStorage");
const path = require("path");

// Get user profile
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return next(new ApiError(404, "User not found"));
    }

    // Create a copy of the user object that we can modify
    const userResponse = user.toObject();

    // Filter profile photo based on current role
    // If the photo doesn't belong to the current role, don't return it
    if (
      userResponse.profilePhoto &&
      userResponse.profilePhoto.rolePrefix &&
      userResponse.profilePhoto.rolePrefix !== user.role
    ) {
      // Clear profile photo if it doesn't match user's current role
      userResponse.profilePhoto = {
        url: "",
        path: "",
        publicId: "",
        rolePrefix: user.role,
      };
    }

    res.status(200).json({
      success: true,
      data: userResponse,
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// Update user profile
exports.updateUserProfile = async (req, res, next) => {
  try {
    const {
      name,
      contactNumber,
      department,
      designation,
      rollNumber,
      yearOfJoining,
      yearOfGraduation,
      program,
      employeeId,
      position,
      address,
    } = req.body;

    // Find user by ID (from auth middleware)
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new ApiError(404, "User not found"));
    }

    // Update fields if they exist in request body
    if (name) user.name = name;
    if (contactNumber) user.contactNumber = contactNumber;
    if (department) user.department = department;
    if (designation) user.designation = designation;

    // Update role-specific fields based on user role
    if (user.role === "student") {
      if (rollNumber) user.rollNumber = rollNumber;
      if (yearOfJoining) user.yearOfJoining = yearOfJoining;
      if (yearOfGraduation) user.yearOfGraduation = yearOfGraduation;
      if (program) user.program = program;
    }

    if (user.role === "faculty") {
      if (employeeId) user.employeeId = employeeId;
    }

    if (user.role === "council") {
      if (position) user.position = position;
    }

    // Update address if provided
    if (address) {
      user.address = {
        ...user.address,
        ...address,
      };
    }

    // Save the updated user
    const updatedUser = await user.save();

    // Return updated user without password
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        contactNumber: updatedUser.contactNumber,
        department: updatedUser.department,
        designation: updatedUser.designation,
        rollNumber: updatedUser.rollNumber,
        yearOfJoining: updatedUser.yearOfJoining,
        yearOfGraduation: updatedUser.yearOfGraduation,
        program: updatedUser.program,
        employeeId: updatedUser.employeeId,
        position: updatedUser.position,
        address: updatedUser.address,
        profilePhoto: updatedUser.profilePhoto,
        digitalSignature: updatedUser.digitalSignature,
        permissions: updatedUser.permissions,
      },
    });
  } catch (error) {
    next(new ApiError(500, `Failed to update profile: ${error.message}`));
  }
};

// Upload profile photo
exports.uploadProfilePhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ApiError(400, "Please upload a file"));
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new ApiError(404, "User not found"));
    }

    // Delete previous profile photo if exists
    if (
      user.profilePhoto &&
      (user.profilePhoto.path || user.profilePhoto.publicId)
    ) {
      await deleteFile(user.profilePhoto);
    }

    // Add role prefix to storage path to separate photos by role
    const rolePrefix = user.role || "user";

    // Store new profile photo using our unified storage utility with role prefix
    const result = await storeFile(
      req.file.path,
      `${rolePrefix}_${user._id.toString()}`,
      "profile"
    );

    // Update user with new profile photo data
    user.profilePhoto = {
      url: result.url,
      path: result.path || "",
      publicId: result.publicId || "",
      rolePrefix: rolePrefix, // Store the role prefix for reference
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile photo uploaded successfully",
      data: {
        profilePhoto: user.profilePhoto,
      },
    });
  } catch (error) {
    next(new ApiError(500, `Failed to upload profile photo: ${error.message}`));
  }
};

// Upload digital signature
exports.uploadDigitalSignature = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ApiError(400, "Please upload a file"));
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new ApiError(404, "User not found"));
    }

    // Delete previous digital signature if exists
    if (
      user.digitalSignature &&
      (user.digitalSignature.path || user.digitalSignature.publicId)
    ) {
      await deleteFile(user.digitalSignature);
    }

    // Store new digital signature using our unified storage utility
    const result = await storeFile(
      req.file.path,
      user._id.toString(),
      "signature"
    );

    // Update user with new digital signature data
    user.digitalSignature = {
      url: result.url,
      path: result.path || "",
      publicId: result.publicId || "",
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: "Digital signature uploaded successfully",
      data: {
        digitalSignature: user.digitalSignature,
      },
    });
  } catch (error) {
    next(
      new ApiError(500, `Failed to upload digital signature: ${error.message}`)
    );
  }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// Get user by ID
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return next(new ApiError(404, "User not found"));
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ApiError(404, "User not found"));
    }

    // Delete profile photo and digital signature if they exist
    if (
      user.profilePhoto &&
      (user.profilePhoto.path || user.profilePhoto.publicId)
    ) {
      await deleteFile(user.profilePhoto);
    }

    if (
      user.digitalSignature &&
      (user.digitalSignature.path || user.digitalSignature.publicId)
    ) {
      await deleteFile(user.digitalSignature);
    }

    // Using deleteOne() instead of deprecated remove()
    await User.deleteOne({ _id: user._id });

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(new ApiError(500, `Failed to delete user: ${error.message}`));
  }
};
