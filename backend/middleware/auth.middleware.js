const config = require("../config/config");
const User = require("../models/User");
const { ApiError } = require("../utils/errorHandler");
const { PrivyClient } = require("@privy-io/server-auth");

// Initialize Privy client for server-side token verification
const privy = new PrivyClient(
    process.env.PRIVY_APP_ID,
    process.env.PRIVY_APP_SECRET
);

/**
 * Authentication middleware to verify Privy token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.authenticatePrivyToken = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

        if (!token) {
            return next(new ApiError(401, "Access denied. No token provided"));
        }

        // Verify Privy token
        const verifiedClaims = await privy.verifyAuthToken(token);

        // Get user email from verified token
        const userId = verifiedClaims.userId;

        // Add verified user ID to request
        req.privyUserId = userId;
        req.verifiedToken = verifiedClaims;

        next();
    } catch (error) {
        console.error("Privy token verification error:", error);
        return next(new ApiError(401, "Invalid or expired token"));
    }
};

/**
 * Combined authentication middleware that verifies Privy token AND loads user from database
 * This is used for protected routes that need user information
 */
exports.authenticateToken = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

        if (!token) {
            return next(new ApiError(401, "Access denied. No token provided"));
        }

        // Verify Privy token
        const verifiedClaims = await privy.verifyAuthToken(token);

        // Get user ID from Privy
        const privyUserId = verifiedClaims.userId;

        // Extract email from Privy user data (Privy stores email in the token claims)
        // The email might be in different fields depending on login method
        let userEmail = null;

        // Try to get email from verified claims
        if (verifiedClaims.email) {
            userEmail = verifiedClaims.email;
        }

        // If no email in claims, we need to get the user from Privy API
        if (!userEmail) {
            try {
                const privyUser = await privy.getUser(privyUserId);
                // Get email from linked accounts
                if (privyUser.google && privyUser.google.email) {
                    userEmail = privyUser.google.email;
                } else if (privyUser.email && privyUser.email.address) {
                    userEmail = privyUser.email.address;
                }
            } catch (privyError) {
                console.error("Error getting user from Privy:", privyError);
                return next(new ApiError(401, "Could not verify user email"));
            }
        }

        if (!userEmail) {
            return next(
                new ApiError(401, "No email associated with this account")
            );
        }

        // Find user in our database by email
        const user = await User.findOne({
            email: userEmail.toLowerCase(),
        }).select("-password");

        if (!user) {
            return next(new ApiError(401, "User not found or not authorized"));
        }

        // Add user object to request
        req.user = user;
        req.privyUserId = privyUserId;
        req.verifiedToken = verifiedClaims;

        next();
    } catch (error) {
        console.error("Authentication error:", error);
        if (error.message && error.message.includes("expired")) {
            return next(new ApiError(401, "Token expired"));
        }
        return next(new ApiError(401, "Invalid or expired token"));
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
            // Check if user exists (should be set by previous middleware)
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
