const jwt = require("jsonwebtoken");
const config = require("../config/config");
const User = require("../models/User");
const { ApiError } = require("../utils/errorHandler");

/**
 * Authentication middleware to verify JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.authenticateToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return next(new ApiError(401, "Access denied. No token provided"));
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);

    // Find user with the id from the token, include permissions
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return next(new ApiError(401, "Invalid token: User not found"));
    }

    // Add user object to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new ApiError(401, "Invalid token"));
    }
    if (error.name === "TokenExpiredError") {
      return next(new ApiError(401, "Token expired"));
    }
    next(new ApiError(401, "Failed to authenticate token"));
  }
};

/**
 * Role-based authorization middleware
 * @param {Array} roles - Array of authorized roles
 * @returns {Function} Middleware function
 */
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    try {
      // Check if user exists (should be set by authenticateToken)
      if (!req.user) {
        return next(new ApiError(401, "Authentication required"));
      }

      // Check if user role is allowed
      if (!roles.includes(req.user.role)) {
        return next(
          new ApiError(
            403,
            `Access denied: Role '${req.user.role}' is not authorized to access this resource`
          )
        );
      }

      // User has authorized role, proceed
      next();
    } catch (error) {
      next(new ApiError(500, "Authorization check failed"));
    }
  };
};

/**
 * Check specific permission for a functionality
 * @param {String} feature - Feature name (e.g., 'noDues', 'events')
 * @param {String} action - Action name (e.g., 'submit', 'approve')
 * @returns {Function} Middleware function
 */
exports.checkPermission = (feature, action) => {
  return (req, res, next) => {
    try {
      // Check if user exists and has permissions
      if (!req.user || !req.user.permissions) {
        return next(new ApiError(401, "Authentication required"));
      }

      // For simple boolean permissions
      if (typeof action === "undefined") {
        if (!req.user.permissions[feature]) {
          return next(
            new ApiError(
              403,
              `You don't have permission to access this feature`
            )
          );
        }
      }
      // For nested permissions (e.g., noDues.submit)
      else if (
        !req.user.permissions[feature] ||
        !req.user.permissions[feature][action]
      ) {
        return next(
          new ApiError(
            403,
            `You don't have permission to ${action} this ${feature}`
          )
        );
      }

      // User has the required permission, proceed
      next();
    } catch (error) {
      next(new ApiError(500, "Permission check failed"));
    }
  };
};

// Keep backward compatibility with previous name
exports.authorizeRole = exports.authorizeRoles;
