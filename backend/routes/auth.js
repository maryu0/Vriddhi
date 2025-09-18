const express = require("express");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const auth = require("../middleware/auth");
const logger = require("../utils/logger");

const router = express.Router();

// JWT Secret
const JWT_SECRET =
  process.env.JWT_SECRET || "vriddhi-super-secret-key-change-in-production";
const JWT_EXPIRE = process.env.JWT_EXPIRE || "7d";

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

// @route   POST /api/auth/register
// @desc    Register a new farmer
// @access  Public
router.post(
  "/register",
  [
    // Validation middleware
    body("name")
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Name must be between 2 and 100 characters"),
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long")
      .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
      .withMessage("Password must contain at least one letter and one number"),
    body("phone")
      .optional()
      .isMobilePhone()
      .withMessage("Please provide a valid phone number"),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { name, email, password, phone, farmDetails } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message:
            "A farmer with this email already exists. Ready to harvest some data instead?",
        });
      }

      // Create new user
      const userData = {
        name,
        email,
        password,
        ...(phone && { phone }),
        ...(farmDetails && { farmDetails }),
      };

      const user = new User(userData);
      await user.save();

      // Generate token
      const token = generateToken(user._id);

      // Update user login info
      await user.updateLastLogin();

      logger.info(`New farmer registered: ${email}`);

      res.status(201).json({
        success: true,
        message: "Welcome to Vriddhi! Your farming journey starts now.",
        data: {
          token,
          user: user.getPublicProfile(),
        },
      });
    } catch (error) {
      logger.error("Registration error:", error);
      res.status(500).json({
        success: false,
        message: "Registration failed. Our servers are having a bad crop day.",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login farmer
// @access  Public
router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { email, password } = req.body;

      // Find user and include password for comparison
      const user = await User.findOne({ email }).select("+password");
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid credentials. Even crops need the right conditions to grow!",
        });
      }

      // Check password
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials. Your password seems to have wilted!",
        });
      }

      // Generate token
      const token = generateToken(user._id);

      // Update last login
      await user.updateLastLogin();

      logger.info(`User logged in: ${email}`);

      res.json({
        success: true,
        message: "Login successful! Welcome back to your digital farm.",
        data: {
          token,
          user: user.getPublicProfile(),
        },
      });
    } catch (error) {
      logger.error("Login error:", error);
      res.status(500).json({
        success: false,
        message:
          "Login failed. Our authentication servers are taking a quick water break.",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: "User not found or inactive",
      });
    }

    res.json({
      success: true,
      message: "Profile fetched successfully",
      data: {
        user: user.getPublicProfile(),
      },
    });
  } catch (error) {
    logger.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put(
  "/profile",
  auth,
  [
    body("name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Name must be between 2 and 100 characters"),
    body("phone")
      .optional()
      .isMobilePhone()
      .withMessage("Please provide a valid phone number"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const allowedFields = ["name", "phone", "farmDetails", "preferences"];
      const updates = {};

      // Filter allowed fields
      Object.keys(req.body).forEach((key) => {
        if (allowedFields.includes(key)) {
          updates[key] = req.body[key];
        }
      });

      const user = await User.findByIdAndUpdate(req.user.userId, updates, {
        new: true,
        runValidators: true,
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      logger.info(`Profile updated for user: ${user.email}`);

      res.json({
        success: true,
        message:
          "Profile updated successfully! Your farming data is now fresh as morning dew.",
        data: {
          user: user.getPublicProfile(),
        },
      });
    } catch (error) {
      logger.error("Profile update error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update profile",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post(
  "/change-password",
  auth,
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters long")
      .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
      .withMessage(
        "New password must contain at least one letter and one number"
      ),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { currentPassword, newPassword } = req.body;

      // Get user with password
      const user = await User.findById(req.user.userId).select("+password");
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Verify current password
      const isValidPassword = await user.comparePassword(currentPassword);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      logger.info(`Password changed for user: ${user.email}`);

      res.json({
        success: true,
        message:
          "Password changed successfully! Your account is now more secure than a locked barn.",
      });
    } catch (error) {
      logger.error("Change password error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to change password",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post("/logout", auth, async (req, res) => {
  try {
    // In a JWT-based system, logout is typically handled client-side
    // by removing the token. However, we can log the logout event.

    const user = await User.findById(req.user.userId);
    if (user) {
      logger.info(`User logged out: ${user.email}`);
    }

    res.json({
      success: true,
      message: "Logged out successfully! Time to tend to your real crops now!",
    });
  } catch (error) {
    logger.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Logout failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @route   GET /api/auth/stats
// @desc    Get user statistics
// @access  Private
router.get("/stats", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get additional stats from related models
    const { ChatLog, DiseaseDetection } = require("../models/Disease");

    const [chatStats, recentDiseases] = await Promise.all([
      ChatLog.getChatAnalytics(user._id),
      DiseaseDetection.find({ farmer: user._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("prediction.diseaseName prediction.severity status createdAt"),
    ]);

    const stats = {
      profile: user.stats,
      chat: chatStats[0] || {
        totalSessions: 0,
        totalMessages: 0,
        avgDuration: 0,
        avgSatisfaction: 0,
        resolvedSessions: 0,
      },
      recentDiseases,
      farmAge: user.farmAge,
      memberSince: user.createdAt,
    };

    res.json({
      success: true,
      message: "Statistics fetched successfully",
      data: stats,
    });
  } catch (error) {
    logger.error("Get stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = router;
