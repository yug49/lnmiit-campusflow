const User = require("../models/User");
const RolePermission = require("../models/RolePermission");
const apiResponse = require("../utils/apiResponse");

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    return apiResponse.success(res, {
      count: users.length,
      users,
    });
  } catch (error) {
    return apiResponse.error(res, error.message);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return apiResponse.notFound(res, "User not found");
    }

    return apiResponse.success(res, user);
  } catch (error) {
    return apiResponse.error(res, error.message);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const { name, email, roles } = req.body;

    let user = await User.findById(req.params.id);

    if (!user) {
      return apiResponse.notFound(res, "User not found");
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (roles) {
      // Validate roles
      const validRoles = [
        "student",
        "faculty",
        "faculty_mentor",
        "council_member",
        "admin",
      ];
      const invalidRoles = roles.filter((role) => !validRoles.includes(role));

      if (invalidRoles.length > 0) {
        return apiResponse.badRequest(
          res,
          `Invalid roles: ${invalidRoles.join(", ")}`
        );
      }

      user.roles = roles;
    }

    await user.save();

    return apiResponse.success(res, user);
  } catch (error) {
    return apiResponse.error(res, error.message);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return apiResponse.notFound(res, "User not found");
    }

    // Prevent deleting self
    if (user._id.toString() === req.user.id) {
      return apiResponse.badRequest(res, "Cannot delete own account");
    }

    await user.deleteOne();

    return apiResponse.success(res, { message: "User removed" });
  } catch (error) {
    return apiResponse.error(res, error.message);
  }
};

// @desc    Get user permissions
// @route   GET /api/users/:id/permissions
// @access  Private/Admin
exports.getUserPermissions = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return apiResponse.notFound(res, "User not found");
    }

    // Get permissions for user roles
    const rolePermissions = await RolePermission.find({
      role: { $in: user.roles },
    });

    // Extract all permissions
    const permissions = [
      ...new Set(rolePermissions.flatMap((rp) => rp.permissions)),
    ];

    return apiResponse.success(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
      },
      permissions,
    });
  } catch (error) {
    return apiResponse.error(res, error.message);
  }
};
