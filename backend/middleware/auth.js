// middleware/auth.js - JWT Authentication Middleware
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const logger = require("../utils/logger");

const JWT_SECRET =
  process.env.JWT_SECRET || "vriddhi-super-secret-key-change-in-production";

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message:
          "Access denied. No token provided. Your crops need proper credentials!",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Access denied. User not found or inactive.",
      });
    }

    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Time to refresh your farming session!",
      });
    }

    logger.error("Auth middleware error:", error);
    res.status(401).json({
      success: false,
      message: `Invalid token. Your authentication seeds didn't sprout properly.`,
    });
  }
};

module.exports = auth;
