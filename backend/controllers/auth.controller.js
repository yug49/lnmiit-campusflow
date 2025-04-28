const User = require("../models/User");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const { ApiError } = require("../utils/errorHandler");

// Helper function to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: config.jwtExpire,
  });
};

// Register a new user
exports.register = async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new ApiError(400, "User already exists with this email"));
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      name,
      role,
    });

    // Generate token for the new user
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      },
    });
  } catch (error) {
    next(new ApiError(500, `Registration failed: ${error.message}`));
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Debug log for troubleshooting
    console.log(`Login attempt for email: ${email}`);

    // Validate request
    if (!email || !password) {
      return next(new ApiError(400, "Please provide email and password"));
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`User not found for email: ${email}`);
      return next(new ApiError(401, "Invalid credentials"));
    }

    console.log(`User found for email: ${email}, checking password`);
    
    // Check if password matches
    try {
      const isPasswordMatch = await user.comparePassword(password);
      if (!isPasswordMatch) {
        console.log(`Invalid password for email: ${email}`);
        return next(new ApiError(401, "Invalid credentials"));
      }
    } catch (passwordError) {
      console.error(`Password comparison error: ${passwordError.message}`);
      return next(new ApiError(500, `Authentication error: ${passwordError.message}`));
    }

    // Generate token
    console.log(`Password match successful, generating token for user: ${user._id}`);
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      },
    });
  } catch (error) {
    console.error(`Login error details: ${error.message}`);
    if (error.stack) {
      console.error(`Stack trace: ${error.stack}`);
    }
    next(new ApiError(500, `Login failed: ${error.message}`));
  }
};

// Logout user
exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

// Verify JWT token
exports.verifyToken = async (req, res) => {
  // If middleware passes, token is valid and user is attached to req
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      permissions: req.user.permissions,
    },
  });
};

// Forgot password
exports.forgotPassword = async (req, res, next) => {
  try {
    // This function will be implemented later
    res.status(200).json({ message: "Forgot password endpoint" });
  } catch (error) {
    next(new ApiError(500, `Forgot password failed: ${error.message}`));
  }
};

// Reset password
exports.resetPassword = async (req, res, next) => {
  try {
    // This function will be implemented later
    res.status(200).json({ message: "Reset password endpoint" });
  } catch (error) {
    next(new ApiError(500, `Reset password failed: ${error.message}`));
  }
};
