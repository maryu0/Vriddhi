// routes/treatments.js - Treatment Management Routes
const express = require("express");
const { body, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const { Treatment, DiseaseDetection } = require("../models/Disease");
const logger = require("../utils/logger");

const router = express.Router();

// @route   GET /api/treatments/recommendations
// @desc    Get treatment recommendations
// @access  Private
router.get("/recommendations", auth, async (req, res) => {
  try {
    const { disease, crop, severity, limit = 5 } = req.query;

    const query = { isActive: true };
    if (disease) query.diseaseName = { $regex: disease, $options: "i" };
    if (crop) query.cropType = { $regex: crop, $options: "i" };
    if (severity) query.severity = severity;

    const treatments = await Treatment.find(query)
      .sort({ "effectiveness.percentage": -1, successRate: -1 })
      .limit(parseInt(limit));

    if (treatments.length === 0) {
      // Return default recommendations
      const defaultTreatments = [
        {
          _id: "default-1",
          diseaseName: disease || "General Disease",
          treatment: {
            type: "Integrated",
            method: "Combined Approach",
            description:
              "Use integrated pest management combining cultural, biological, and chemical methods",
            duration: "2-3 weeks",
          },
          effectiveness: { percentage: 80 },
          cost: { amount: 500, currency: "INR", unit: "per acre" },
        },
      ];

      return res.json({
        success: true,
        message: "Default treatment recommendations provided",
        data: defaultTreatments,
      });
    }

    res.json({
      success: true,
      message: "Treatment recommendations fetched successfully",
      data: treatments,
    });
  } catch (error) {
    logger.error("Get treatment recommendations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch treatment recommendations",
    });
  }
});

// @route   POST /api/treatments/apply
// @desc    Apply treatment to disease detection
// @access  Private
router.post(
  "/apply",
  auth,
  [
    body("detectionId").isMongoId().withMessage("Valid detection ID required"),
    body("treatmentId").isMongoId().withMessage("Valid treatment ID required"),
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

      const { detectionId, treatmentId } = req.body;

      const detection = await DiseaseDetection.findOneAndUpdate(
        { _id: detectionId, farmer: req.user.userId },
        {
          treatmentApplied: treatmentId,
          status: "Treated",
          treatmentResult: "Pending",
        },
        { new: true }
      ).populate("treatmentApplied");

      if (!detection) {
        return res.status(404).json({
          success: false,
          message: "Disease detection not found",
        });
      }

      // Update treatment usage statistics
      await Treatment.findByIdAndUpdate(treatmentId, {
        $inc: { timesToApplied: 1 },
      });

      res.json({
        success: true,
        message:
          "Treatment applied successfully! Monitor your crops and update the results.",
        data: detection,
      });
    } catch (error) {
      logger.error("Apply treatment error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to apply treatment",
      });
    }
  }
);

module.exports = router;
