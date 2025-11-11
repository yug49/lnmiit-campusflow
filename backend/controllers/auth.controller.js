const User = require("../models/User");
const { ApiError } = require("../utils/errorHandler");

// Get user by email (for Privy authentication)
exports.getUserByEmail = async (req, res, next) => {
    try {
        const { email } = req.params;

        console.log(`Get user by email: ${email}`);

        // Validate email
        if (!email) {
            return next(new ApiError(400, "Email is required"));
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() }).select(
            "-password"
        );

        if (!user) {
            console.log(`User not found for email: ${email}`);
            return res.status(200).json({
                success: false,
                message:
                    "User not authorized. Please contact your administrator for access.",
            });
        }

        console.log(`User found: ${user.name} with role: ${user.role}`);

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                permissions: user.permissions,
                profilePhoto: user.profilePhoto,
                digitalSignature: user.digitalSignature,
            },
        });
    } catch (error) {
        console.error(`Get user by email error: ${error.message}`);
        next(new ApiError(500, `Failed to get user: ${error.message}`));
    }
};
