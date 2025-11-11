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
        next(
            new ApiError(
                500,
                `Failed to upload profile photo: ${error.message}`
            )
        );
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
            new ApiError(
                500,
                `Failed to upload digital signature: ${error.message}`
            )
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

// Create new user (Admin only - for Privy authentication)
// Note: This pre-authorizes a user in MongoDB. The user will still need to login
// with their Google account via Privy for the first time. Privy will handle
// creating their authentication account automatically on first login.
exports.createUser = async (req, res, next) => {
    try {
        const { name, email, role, permissions } = req.body;

        // Validate required fields
        if (!name || !email || !role) {
            return next(
                new ApiError(400, "Name, email, and role are required")
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return next(
                new ApiError(400, "Please provide a valid email address")
            );
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return next(
                new ApiError(400, "User with this email already exists")
            );
        }

        // Set default permissions based on role
        let defaultPermissions = {};
        switch (role) {
            case "student":
                defaultPermissions = {
                    noDues: { submit: true, approve: false },
                    events: { submit: false, approve: false },
                    mou: { submit: false, approve: false },
                    voting: { submit: true, approve: false, vote: true },
                    facultyNoDues: false,
                };
                break;
            case "faculty":
                defaultPermissions = {
                    noDues: { submit: true, approve: true },
                    events: { submit: false, approve: true },
                    mou: { submit: false, approve: true },
                    voting: { submit: false, approve: false, vote: false },
                    facultyNoDues: true,
                };
                break;
            case "council":
                defaultPermissions = {
                    noDues: { submit: false, approve: false },
                    events: { submit: true, approve: false },
                    mou: { submit: true, approve: false },
                    voting: { submit: true, approve: false, vote: true },
                    facultyNoDues: false,
                };
                break;
            case "admin":
                defaultPermissions = {
                    noDues: { submit: true, approve: true },
                    events: { submit: true, approve: true },
                    mou: { submit: true, approve: true },
                    voting: { submit: true, approve: true, vote: true },
                    facultyNoDues: true,
                };
                break;
            default:
                defaultPermissions = {};
        }

        // Create user without password (Privy authentication)
        // User will be auto-created in Privy when they login with Google OAuth
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            role,
            permissions: permissions || defaultPermissions,
            // No password field - authentication handled by Privy
        });

        res.status(201).json({
            success: true,
            message: `User pre-authorized successfully. ${name} can now login with ${email} via Google authentication.`,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                permissions: user.permissions,
            },
        });
    } catch (error) {
        next(new ApiError(500, `Failed to create user: ${error.message}`));
    }
};

// Update user (Admin only)
exports.updateUser = async (req, res, next) => {
    try {
        const { name, role, permissions } = req.body;
        const userId = req.params.id;

        const user = await User.findById(userId);
        if (!user) {
            return next(new ApiError(404, "User not found"));
        }

        // Update allowed fields
        if (name) user.name = name;
        if (role) user.role = role;
        if (permissions) user.permissions = permissions;

        await user.save();

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                permissions: user.permissions,
            },
        });
    } catch (error) {
        next(new ApiError(500, `Failed to update user: ${error.message}`));
    }
};

// Get all students
exports.getAllStudents = async (req, res, next) => {
    try {
        const students = await User.find({ role: "student" })
            .select(
                "name email rollNumber profilePhoto votingAuthorized votingExpires"
            )
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            students,
        });
    } catch (error) {
        next(new ApiError(500, error.message));
    }
};

// Search users by query
exports.searchUsers = async (req, res, next) => {
    try {
        const { q, role } = req.query;

        if (!q) {
            return next(new ApiError(400, "Search query is required"));
        }

        const query = {
            $or: [
                { name: { $regex: q, $options: "i" } },
                { email: { $regex: q, $options: "i" } },
            ],
        };

        // Add role filter if provided
        if (role) {
            query.role = role;
        }

        // Add rollNumber search for students
        if (role === "student") {
            query.$or.push({ rollNumber: { $regex: q, $options: "i" } });
        }

        const users = await User.find(query)
            .select(
                "name email role rollNumber profilePhoto votingAuthorized votingExpires"
            )
            .sort({ name: 1 })
            .limit(20);

        res.status(200).json({
            success: true,
            users,
        });
    } catch (error) {
        next(new ApiError(500, error.message));
    }
};
