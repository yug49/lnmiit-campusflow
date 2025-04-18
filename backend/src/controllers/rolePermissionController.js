const RolePermission = require("../models/RolePermission");
const User = require("../models/User");

// @desc    Get all role permissions
// @route   GET /api/role-permissions
// @access  Private/Admin
exports.getRolePermissions = async (req, res) => {
  try {
    const rolePermissions = await RolePermission.find();

    res.status(200).json({
      success: true,
      count: rolePermissions.length,
      data: rolePermissions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create role permission
// @route   POST /api/role-permissions
// @access  Private/Admin
exports.createRolePermission = async (req, res) => {
  try {
    const { role, permissions, description } = req.body;

    // Check if role permission already exists
    const rolePermissionExists = await RolePermission.findOne({ role });

    if (rolePermissionExists) {
      return res.status(400).json({
        success: false,
        message: "Role permission already exists",
      });
    }

    const rolePermission = await RolePermission.create({
      role,
      permissions,
      description,
    });

    res.status(201).json({
      success: true,
      data: rolePermission,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update role permission
// @route   PUT /api/role-permissions/:id
// @access  Private/Admin
exports.updateRolePermission = async (req, res) => {
  try {
    let rolePermission = await RolePermission.findById(req.params.id);

    if (!rolePermission) {
      return res.status(404).json({
        success: false,
        message: "Role permission not found",
      });
    }

    rolePermission = await RolePermission.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      data: rolePermission,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete role permission
// @route   DELETE /api/role-permissions/:id
// @access  Private/Admin
exports.deleteRolePermission = async (req, res) => {
  try {
    const rolePermission = await RolePermission.findById(req.params.id);

    if (!rolePermission) {
      return res.status(404).json({
        success: false,
        message: "Role permission not found",
      });
    }

    await rolePermission.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Assign role to user
// @route   POST /api/role-permissions/assign-role
// @access  Private/Admin
exports.assignRoleToUser = async (req, res) => {
  try {
    const { userId, roles } = req.body;

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

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
      return res.status(400).json({
        success: false,
        message: `Invalid roles: ${invalidRoles.join(", ")}`,
      });
    }

    // Update user roles
    user.roles = roles;
    await user.save();

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
