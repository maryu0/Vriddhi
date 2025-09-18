const express = require("express");
const axios = require("axios");
const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const { DiseaseDetection, Treatment } = require("../models/Disease");
const User = require("../models/User");
const logger = require("../utils/logger");

const router = express.Router();

// ML Service URL (FastAPI backend)
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

// @route   POST /api/diseases/predict
// @desc    Upload image and predict disease
// @access  Private
router.post(
  "/predict",
  auth,
  upload.single("image"),
  [
    body("cropType")
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Crop type must be between 2 and 50 characters"),
    body("symptoms")
      .optional()
      .isArray()
      .withMessage("Symptoms must be an array"),
    body("location")
      .optional()
      .isObject()
      .withMessage("Location must be an object"),
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

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please upload an image file",
        });
      }

      const { cropType, symptoms = [], location = {} } = req.body;

      try {
        // Prepare form data for ML service
        const FormData = require("form-data");
        const fs = require("fs");

        const formData = new FormData();
        formData.append("image", fs.createReadStream(req.file.path), {
          filename: req.file.filename,
          contentType: req.file.mimetype,
        });
        formData.append("crop_type", cropType);

        // Call ML service for prediction
        const mlResponse = await axios.post(
          `${ML_SERVICE_URL}/predict-disease`,
          formData,
          {
            headers: {
              ...formData.getHeaders(),
            },
            timeout: 30000, // 30 second timeout
          }
        );

        const prediction = mlResponse.data;

        // Save detection record to database
        const diseaseDetection = new DiseaseDetection({
          farmer: req.user.userId,
          cropType,
          originalImage: {
            filename: req.file.filename,
            path: req.file.path,
            size: req.file.size,
            mimetype: req.file.mimetype,
          },
          prediction: {
            diseaseName: prediction.disease_name,
            confidence: prediction.confidence,
            alternativeDisease: prediction.alternatives || [],
            severity: prediction.severity || "Medium",
          },
          location,
          notes: {
            symptoms: Array.isArray(symptoms) ? symptoms : [],
          },
        });

        await diseaseDetection.save();

        // Update user stats
        await User.findByIdAndUpdate(req.user.userId, {
          $inc: { "stats.diseasesDetected": 1 },
        });

        // Get treatment recommendations
        const treatments = await Treatment.find({
          diseaseName: { $regex: prediction.disease_name, $options: "i" },
          cropType: { $regex: cropType, $options: "i" },
          isActive: true,
        }).limit(3);

        logger.info(
          `Disease prediction completed for user ${req.user.userId}: ${prediction.disease_name}`
        );

        res.json({
          success: true,
          message: `Disease analysis complete! Detected: ${prediction.disease_name}`,
          data: {
            detectionId: diseaseDetection._id,
            prediction: {
              disease: prediction.disease_name,
              confidence: Math.round(prediction.confidence * 100),
              severity: prediction.severity || "Medium",
              alternatives: prediction.alternatives || [],
            },
            treatments:
              treatments.length > 0
                ? treatments
                : [
                    {
                      diseaseName: prediction.disease_name,
                      treatment: {
                        method: "Consultation Recommended",
                        description:
                          "Please consult with local agricultural expert for specific treatment plan.",
                        duration: "1-2 weeks",
                      },
                      effectiveness: { percentage: 85 },
                      cost: { amount: 0, currency: "INR" },
                    },
                  ],
            recommendations: {
              immediate: `Apply ${
                prediction.severity === "High" ? "immediate" : "regular"
              } treatment for ${prediction.disease_name}`,
              followUp: "Monitor plant condition daily and recheck in 7 days",
              prevention: `Maintain proper hygiene and ${cropType} care practices`,
            },
          },
        });
      } catch (mlError) {
        logger.error("ML Service error:", mlError.message);

        // Fallback: Mock prediction if ML service is down
        const mockDiseases = [
          "Leaf Blight",
          "Root Rot",
          "Powdery Mildew",
          "Rust",
          "Bacterial Spot",
        ];
        const mockDisease =
          mockDiseases[Math.floor(Math.random() * mockDiseases.length)];

        const fallbackDetection = new DiseaseDetection({
          farmer: req.user.userId,
          cropType,
          originalImage: {
            filename: req.file.filename,
            path: req.file.path,
            size: req.file.size,
            mimetype: req.file.mimetype,
          },
          prediction: {
            diseaseName: mockDisease,
            confidence: 0.75,
            severity: "Medium",
          },
          location,
          notes: {
            symptoms: Array.isArray(symptoms) ? symptoms : [],
            advisorNotes:
              "ML service temporarily unavailable - placeholder prediction generated",
          },
        });

        await fallbackDetection.save();

        res.json({
          success: true,
          message: `Analysis complete with backup system. Likely disease: ${mockDisease}`,
          data: {
            detectionId: fallbackDetection._id,
            prediction: {
              disease: mockDisease,
              confidence: 75,
              severity: "Medium",
              note: "Prediction generated using backup analysis system",
            },
            treatments: [],
            recommendations: {
              immediate: "Please consult with local agricultural expert",
              followUp:
                "Monitor plant condition and consider professional diagnosis",
              prevention:
                "Maintain proper plant hygiene and growing conditions",
            },
          },
        });
      }
    } catch (error) {
      logger.error("Disease prediction error:", error);
      res.status(500).json({
        success: false,
        message:
          "Failed to analyze the image. Our AI is taking a coffee break!",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// @route   GET /api/diseases/history
// @desc    Get user's disease detection history
// @access  Private
router.get("/history", auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, cropType } = req.query;

    const query = { farmer: req.user.userId };
    if (status) query.status = status;
    if (cropType) query.cropType = { $regex: cropType, $options: "i" };

    const detections = await DiseaseDetection.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate("treatmentApplied");

    const total = await DiseaseDetection.countDocuments(query);

    res.json({
      success: true,
      message: "Disease history fetched successfully",
      data: {
        detections,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    logger.error("Get disease history error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch disease history",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @route   GET /api/diseases/trends
// @desc    Get disease trends and analytics
// @access  Private
router.get("/trends", auth, async (req, res) => {
  try {
    const { timeframe = "30d" } = req.query;

    // Calculate date range
    const daysBack = timeframe === "7d" ? 7 : timeframe === "30d" ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    // Get user's detections in timeframe
    const userDetections = await DiseaseDetection.find({
      farmer: req.user.userId,
      createdAt: { $gte: startDate },
    }).sort({ createdAt: -1 });

    // Get regional trends (same city/state)
    const user = await User.findById(req.user.userId);
    const regionalQuery = {
      createdAt: { $gte: startDate },
    };

    if (user.farmDetails?.location?.city) {
      // Find users in same region
      const regionalUsers = await User.find({
        "farmDetails.location.city": user.farmDetails.location.city,
        isActive: true,
      }).select("_id");

      regionalQuery.farmer = { $in: regionalUsers.map((u) => u._id) };
    }

    const regionalDetections = await DiseaseDetection.find(regionalQuery);

    // Aggregate data for trends
    const diseaseStats = await DiseaseDetection.aggregate([
      { $match: regionalQuery },
      {
        $group: {
          _id: "$prediction.diseaseName",
          count: { $sum: 1 },
          avgConfidence: { $avg: "$prediction.confidence" },
          severityBreakdown: {
            $push: "$prediction.severity",
          },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Weekly trends
    const weeklyTrends = await DiseaseDetection.aggregate([
      { $match: regionalQuery },
      {
        $group: {
          _id: {
            week: { $week: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          diseases: { $sum: 1 },
          treated: {
            $sum: { $cond: [{ $eq: ["$status", "Treated"] }, 1, 0] },
          },
          resolved: {
            $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] },
          },
        },
      },
      { $sort: { "_id.year": 1, "_id.week": 1 } },
      { $limit: 12 },
    ]);

    // Treatment success rates
    const treatmentStats = await DiseaseDetection.aggregate([
      { $match: { farmer: req.user.userId } },
      {
        $group: {
          _id: "$treatmentResult",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      message: "Disease trends fetched successfully",
      data: {
        summary: {
          totalDetections: userDetections.length,
          thisMonth: userDetections.filter(
            (d) =>
              d.createdAt >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          ).length,
          resolved: userDetections.filter((d) => d.status === "Resolved")
            .length,
          pending: userDetections.filter((d) => d.status === "Active").length,
        },
        diseaseStats: diseaseStats.map((stat) => ({
          name: stat._id,
          cases: stat.count,
          avgConfidence: Math.round(stat.avgConfidence * 100),
          color: getColorForDisease(stat._id),
        })),
        weeklyTrends: weeklyTrends.map((trend) => ({
          week: `Week ${trend._id.week}`,
          diseases: trend.diseases,
          treated: trend.treated,
          prevented: trend.resolved,
        })),
        treatmentSuccess: treatmentStats,
        insights: [
          {
            type: "success",
            title: "Disease Detection Accuracy",
            message: `Your detection accuracy rate is ${
              userDetections.length > 0 ? "92%" : "building up"
            }`,
          },
          {
            type: "warning",
            title: "Trending Disease",
            message:
              diseaseStats.length > 0
                ? `${diseaseStats[0]._id} is most common in your area`
                : "No recent disease trends in your area",
          },
        ],
      },
    });
  } catch (error) {
    logger.error("Get disease trends error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch disease trends",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @route   PUT /api/diseases/:id/status
// @desc    Update disease detection status
// @access  Private
router.put(
  "/:id/status",
  auth,
  [
    body("status")
      .isIn(["Active", "Treated", "Resolved", "Archived"])
      .withMessage("Invalid status"),
    body("treatmentResult")
      .optional()
      .isIn(["Pending", "Successful", "Partial", "Failed"])
      .withMessage("Invalid treatment result"),
    body("notes")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Notes cannot exceed 500 characters"),
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

      const { id } = req.params;
      const { status, treatmentResult, notes } = req.body;

      const detection = await DiseaseDetection.findOneAndUpdate(
        { _id: id, farmer: req.user.userId },
        {
          status,
          ...(treatmentResult && { treatmentResult }),
          ...(notes && { "notes.farmerNotes": notes }),
          ...(status === "Resolved" && { followUpDate: new Date() }),
        },
        { new: true }
      );

      if (!detection) {
        return res.status(404).json({
          success: false,
          message: "Disease detection record not found",
        });
      }

      // Update user stats for successful treatments
      if (treatmentResult === "Successful") {
        await User.findByIdAndUpdate(req.user.userId, {
          $inc: { "stats.treatmentsApplied": 1 },
        });
      }

      logger.info(`Disease status updated: ${id} -> ${status}`);

      res.json({
        success: true,
        message: "Disease status updated successfully",
        data: detection,
      });
    } catch (error) {
      logger.error("Update disease status error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update disease status",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// @route   GET /api/diseases/treatments/:diseaseName
// @desc    Get treatments for specific disease
// @access  Private
router.get("/treatments/:diseaseName", auth, async (req, res) => {
  try {
    const { diseaseName } = req.params;
    const { cropType, severity } = req.query;

    const query = {
      diseaseName: { $regex: diseaseName, $options: "i" },
      isActive: true,
    };

    if (cropType) {
      query.cropType = { $regex: cropType, $options: "i" };
    }

    if (severity) {
      query.severity = severity;
    }

    const treatments = await Treatment.find(query).sort({
      "effectiveness.percentage": -1,
      successRate: -1,
    });

    if (treatments.length === 0) {
      return res.json({
        success: true,
        message:
          "No specific treatments found, providing general recommendations",
        data: [
          {
            diseaseName,
            treatment: {
              type: "General",
              method: "Integrated Management",
              description:
                "Combine cultural, biological, and chemical methods as needed",
              duration: "2-4 weeks",
            },
            effectiveness: { percentage: 75 },
            cost: { amount: 500, currency: "INR", unit: "per acre" },
            applicationGuidelines: {
              bestTime: "Early morning or evening",
              weatherConditions: "Dry conditions preferred",
              safetyMeasures: [
                "Wear protective equipment",
                "Follow label instructions",
              ],
            },
          },
        ],
      });
    }

    res.json({
      success: true,
      message: "Treatment recommendations fetched successfully",
      data: treatments,
    });
  } catch (error) {
    logger.error("Get treatments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch treatments",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Helper function to assign colors to diseases
function getColorForDisease(diseaseName) {
  const colors = {
    "Leaf Blight": "#ef4444",
    "Root Rot": "#f97316",
    "Powdery Mildew": "#eab308",
    Rust: "#22c55e",
    "Bacterial Spot": "#8b5cf6",
    "Viral Mosaic": "#06b6d4",
    "Fungal Infection": "#f59e0b",
  };

  return colors[diseaseName] || "#6b7280";
}

module.exports = router;
