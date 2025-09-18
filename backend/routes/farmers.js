const express = require("express");
const { body, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const User = require("../models/User");
const logger = require("../utils/logger");

const router = express.Router();

// @route   GET /api/farmers/profile
// @desc    Get farmer profile
// @access  Private
router.get("/profile", auth, async (req, res) => {
  try {
    const farmer = await User.findById(req.user.userId);
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer profile not found",
      });
    }

    res.json({
      success: true,
      message: "Profile fetched successfully",
      data: farmer.getPublicProfile(),
    });
  } catch (error) {
    logger.error("Get farmer profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @route   PUT /api/farmers/farm-details
// @desc    Update farm details
// @access  Private
router.put(
  "/farm-details",
  auth,
  [
    body("farmName").optional().trim().isLength({ max: 100 }),
    body("farmSize.value").optional().isNumeric().isFloat({ min: 0 }),
    body("soilType")
      .optional()
      .isIn(["Clay", "Sandy", "Loamy", "Silt", "Peaty", "Chalky", "Other"]),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const farmer = await User.findByIdAndUpdate(
        req.user.userId,
        { $set: { farmDetails: req.body } },
        { new: true, runValidators: true }
      );

      res.json({
        success: true,
        message: "Farm details updated successfully",
        data: farmer.farmDetails,
      });
    } catch (error) {
      logger.error("Update farm details error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update farm details",
      });
    }
  }
);

module.exports = router;
