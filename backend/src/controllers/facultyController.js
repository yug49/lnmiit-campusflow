const User = require("../models/User");
const RolePermission = require("../models/RolePermission");
const apiResponse = require("../utils/apiResponse");

// @desc    Get faculty dashboard data based on roles
// @route   GET /api/faculty/dashboard
// @access  Private/Faculty
exports.getFacultyDashboard = async (req, res) => {
  try {
    // Verify user is faculty
    if (!req.userRoles.includes("faculty")) {
      return apiResponse.forbidden(res, "Not authorized as faculty");
    }

    // Get user details with roles
    const user = await User.findById(req.user.id).select("-password");

    // Determine available functionalities based on roles
    const functionalities = [];

    // Basic faculty functionality
    functionalities.push("faculty_no_dues_form");

    // Faculty mentor functionality
    if (req.userRoles.includes("faculty_mentor")) {
      functionalities.push("event_approvals");
      functionalities.push("mou_approvals");
    }

    // HOD functionality
    if (req.userRoles.includes("head_of_department")) {
      functionalities.push("no_dues_approval");
    }

    return apiResponse.success(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
        roles: user.roles,
      },
      functionalities,
    });
  } catch (error) {
    return apiResponse.error(res, error.message);
  }
};

// @desc    Get faculty mentors
// @route   GET /api/faculty/mentors
// @access  Private/Admin
exports.getFacultyMentors = async (req, res) => {
  try {
    const mentors = await User.find({
      roles: { $in: ["faculty_mentor"] },
    }).select("-password");

    return apiResponse.success(res, {
      count: mentors.length,
      mentors,
    });
  } catch (error) {
    return apiResponse.error(res, error.message);
  }
};

// @desc    Get heads of departments
// @route   GET /api/faculty/hods
// @access  Private/Admin
exports.getHeadsOfDepartments = async (req, res) => {
  try {
    const hods = await User.find({
      roles: { $in: ["head_of_department"] },
    }).select("-password");

    return apiResponse.success(res, {
      count: hods.length,
      hods,
    });
  } catch (error) {
    return apiResponse.error(res, error.message);
  }
};

// @desc    Assign faculty role (mentor or HOD)
// @route   POST /api/faculty/assign-role
// @access  Private/Admin
exports.assignFacultyRole = async (req, res) => {
  try {
    const { userId, role, department } = req.body;

    // Validate role
    if (!["faculty_mentor", "head_of_department"].includes(role)) {
      return apiResponse.badRequest(res, "Invalid faculty role");
    }

    // Find faculty user
    const user = await User.findById(userId);

    if (!user) {
      return apiResponse.notFound(res, "User not found");
    }

    // Verify user is a faculty
    if (!user.roles.includes("faculty")) {
      return apiResponse.badRequest(res, "User is not a faculty member");
    }

    // Check if already has the role
    if (user.roles.includes(role)) {
      return apiResponse.badRequest(
        res,
        `User is already a ${role.replace("_", " ")}`
      );
    }

    // Add the role and update department if provided
    user.roles.push(role);
    if (department) {
      user.department = department;
    }

    await user.save();

    return apiResponse.success(res, {
      message: `Successfully assigned ${role.replace("_", " ")} role`,
      user,
    });
  } catch (error) {
    return apiResponse.error(res, error.message);
  }
};

// @desc    Remove faculty role (mentor or HOD)
// @route   POST /api/faculty/remove-role
// @access  Private/Admin
exports.removeFacultyRole = async (req, res) => {
  try {
    const { userId, role } = req.body;

    // Validate role
    if (!["faculty_mentor", "head_of_department"].includes(role)) {
      return apiResponse.badRequest(res, "Invalid faculty role");
    }

    // Find faculty user
    const user = await User.findById(userId);

    if (!user) {
      return apiResponse.notFound(res, "User not found");
    }

    // Check if has the role
    if (!user.roles.includes(role)) {
      return apiResponse.badRequest(
        res,
        `User is not a ${role.replace("_", " ")}`
      );
    }

    // Remove the role
    user.roles = user.roles.filter((r) => r !== role);

    await user.save();

    return apiResponse.success(res, {
      message: `Successfully removed ${role.replace("_", " ")} role`,
      user,
    });
  } catch (error) {
    return apiResponse.error(res, error.message);
  }
};
