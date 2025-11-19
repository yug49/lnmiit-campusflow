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
                walletAddress: user.walletAddress,
            },
        });
    } catch (error) {
        console.error(`Get user by email error: ${error.message}`);
        next(new ApiError(500, `Failed to get user: ${error.message}`));
    }
};

/**
 * Sync Privy embedded wallet address to database
 * This is called when user logs in to store/update their wallet address
 */
exports.syncWalletAddress = async (req, res, next) => {
    try {
        const { walletAddress } = req.body;

        console.log(`Syncing wallet address for user: ${req.user.email}`);
        console.log(`New wallet address: ${walletAddress}`);

        // Validate wallet address
        if (!walletAddress) {
            return next(new ApiError(400, "Wallet address is required"));
        }

        // Validate Ethereum address format (basic validation)
        if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
            return next(
                new ApiError(400, "Invalid Ethereum wallet address format")
            );
        }

        const oldWalletAddress = req.user.walletAddress;

        // Update user's wallet address
        req.user.walletAddress = walletAddress.toLowerCase();
        await req.user.save();

        const message = oldWalletAddress
            ? `Wallet address updated from ${oldWalletAddress} to ${walletAddress.toLowerCase()}`
            : `Wallet address synced: ${walletAddress.toLowerCase()}`;

        console.log(message);

        res.status(200).json({
            success: true,
            message: message,
            walletAddress: req.user.walletAddress,
        });
    } catch (error) {
        console.error(`Sync wallet address error: ${error.message}`);
        next(
            new ApiError(500, `Failed to sync wallet address: ${error.message}`)
        );
    }
};
