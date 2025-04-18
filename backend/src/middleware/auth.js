const jwt = require("jsonwebtoken");
const { UserAdapter, RolePermissionAdapter } = require("../utils/modelAdapter");

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.token) {
    // Set token from cookie
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Set user in req object
    req.user = await UserAdapter.findById(decoded.id);

    // Set user roles
    req.userRoles = decoded.roles || [];

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user has any of the required roles
    const hasRole = req.userRoles.some((userRole) => roles.includes(userRole));

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.userRoles.join(
          ", "
        )} is not authorized to access this route`,
      });
    }
    next();
  };
};

// Check if user has specific permissions
exports.hasPermission = (permission) => {
  return async (req, res, next) => {
    try {
      // Get permissions for all user roles
      const rolePermissions = await RolePermissionAdapter.find({
        role: { $in: req.userRoles },
      });

      // Extract all permissions from user roles
      const userPermissions = rolePermissions.flatMap((rp) => rp.permissions);

      // Check if user has the required permission
      if (!userPermissions.includes(permission)) {
        return res.status(403).json({
          success: false,
          message: `Permission denied: ${permission} is required`,
        });
      }

      next();
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Error checking permissions",
      });
    }
  };
};
