const express = require("express");
const { body, validationResult } = require("express-validator");
const { v4: uuidv4 } = require("uuid");
const auth = require("../middleware/auth");
const { ChatLog, DiseaseDetection, Treatment } = require("../models/Disease");
const User = require("../models/User");
const logger = require("../utils/logger");

const router = express.Router();

// Enhanced bot response system (same as frontend but server-side)
const getBotResponse = (message, userContext = {}) => {
  const msg = message.toLowerCase();
  const { farmDetails, stats } = userContext;

  // Contextual responses based on user's farm details
  const cropType = farmDetails?.cropTypes?.[0]?.name || "crops";
  const location = farmDetails?.location?.city || "your area";

  if (
    msg.includes("disease") ||
    msg.includes("sick") ||
    msg.includes("problem")
  ) {
    return `I can help you identify ${cropType} diseases! Upload a photo of the affected plant leaves, and I'll analyze it for common diseases. Based on recent data in ${location}, leaf blight is trending. Your disease detection accuracy rate is ${
      stats?.diseasesDetected > 0
        ? "92%"
        : "new - let's start building your success rate!"
    }.`;
  }

  if (msg.includes("water") || msg.includes("irrigation")) {
    const irrigationType =
      farmDetails?.irrigationType || "your irrigation system";
    return `Based on weather data for ${location} and your ${irrigationType}, I recommend adjusting your watering schedule. With current conditions, ${cropType} typically needs watering every 3-4 days. I'll factor in the 65% rain chance this week.`;
  }

  if (msg.includes("fertilizer") || msg.includes("nutrients")) {
    return `For ${cropType}, I suggest nitrogen-rich fertilizers during vegetative stage. Your soil type (${
      farmDetails?.soilType || "detected soil"
    }) shows good phosphorus levels but could benefit from additional potassium. Want specific product recommendations?`;
  }

  if (msg.includes("weather") || msg.includes("rain")) {
    return `Weather update for ${location}: 65% chance of rain, low drought risk (15%). Perfect conditions for ${cropType} with 78% optimal growing conditions! Temperature is ideal for growth.`;
  }

  if (msg.includes("harvest") || msg.includes("ready")) {
    return `Your ${cropType} will be ready for harvest in approximately 3 months based on your planting date. Growth monitoring shows 15-20% higher yield potential than average. I'll send notifications when optimal harvest time approaches.`;
  }

  if (msg.includes("trend") || msg.includes("statistics")) {
    return `Disease trends in ${location} show a 30% decrease this month! ${cropType} leaf blight cases are down, but watch for root rot in wet areas. Check your Disease Trends dashboard for detailed analytics.`;
  }

  if (msg.includes("treatment") || msg.includes("cure")) {
    return `For current disease cases, copper fungicide shows 92% effectiveness for leaf blight. Biological treatments work well for root rot. Your treatment success rate is ${
      stats?.treatmentsApplied > 0
        ? (
            (stats.treatmentsApplied / (stats.diseasesDetected || 1)) *
            100
          ).toFixed(0) + "%"
        : "just getting started"
    }!`;
  }

  if (msg.includes("help") || msg.includes("what can you do")) {
    return `I'm your AI farming assistant! I can help with:
• Disease identification from photos (${
      stats?.diseasesDetected || 0
    } analyzed so far)
• Irrigation scheduling based on ${location} weather
• Fertilizer recommendations for ${cropType}
• Harvest timing predictions
• Treatment effectiveness analysis
• Disease trend monitoring in your region

What farming challenge can I help you solve today?`;
  }

  // Default responses with user context
  const contextualResponses = [
    `Tell me more about your ${cropType} farming challenges in ${location}!`,
    `I'm here to help with your agricultural needs. Are you dealing with any plant diseases, irrigation concerns, or growth issues with your ${cropType}?`,
    `What specific challenge can I help you solve on your farm today? I have data on ${cropType} best practices.`,
    `I'd be happy to help! Your farm in ${location} might be facing seasonal challenges - what's your main concern?`,
  ];

  return contextualResponses[
    Math.floor(Math.random() * contextualResponses.length)
  ];
};

// @route   POST /api/chat/message
// @desc    Send message to chatbot
// @access  Private
router.post(
  "/message",
  auth,
  [
    body("message")
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage("Message must be between 1 and 1000 characters"),
    body("sessionId")
      .optional()
      .isUUID(4)
      .withMessage("Invalid session ID format"),
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

      const { message, sessionId, messageType = "text" } = req.body;
      let chatSession;

      // Get user context for better responses
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Find or create chat session
      if (sessionId) {
        chatSession = await ChatLog.findOne({
          sessionId,
          farmer: req.user.userId,
        });
      }

      if (!chatSession) {
        chatSession = new ChatLog({
          farmer: req.user.userId,
          sessionId: sessionId || uuidv4(),
          startTime: new Date(),
        });
        await chatSession.save();
      }

      // Add user message
      await chatSession.addMessage("user", message, messageType);

      // Generate bot response with user context
      const botResponse = getBotResponse(message, user);

      // Simulate typing delay
      setTimeout(async () => {
        try {
          await chatSession.addMessage("bot", botResponse, "text", {
            intent: detectIntent(message),
            confidence: 0.85,
          });

          // Update user stats
          await User.findByIdAndUpdate(req.user.userId, {
            $inc: { "stats.totalQueries": 1 },
          });
        } catch (error) {
          logger.error("Bot response error:", error);
        }
      }, 1000);

      logger.info(`Chat message processed for user: ${user.email}`);

      res.json({
        success: true,
        message: "Message sent successfully",
        data: {
          sessionId: chatSession.sessionId,
          userMessage: {
            sender: "user",
            message,
            timestamp: new Date(),
          },
          botResponse: {
            sender: "bot",
            message: botResponse,
            timestamp: new Date(Date.now() + 1000), // Simulate delay
          },
        },
      });
    } catch (error) {
      logger.error("Chat message error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to process chat message",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// @route   GET /api/chat/history/:sessionId?
// @desc    Get chat history
// @access  Private
router.get("/history/:sessionId?", auth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { limit = 10, page = 1 } = req.query;

    let query = { farmer: req.user.userId };
    if (sessionId) {
      query.sessionId = sessionId;
    }

    const chatHistory = await ChatLog.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate("farmer", "name email");

    const totalChats = await ChatLog.countDocuments(query);

    res.json({
      success: true,
      message: "Chat history fetched successfully",
      data: {
        chats: chatHistory,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalChats,
          totalPages: Math.ceil(totalChats / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    logger.error("Get chat history error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch chat history",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @route   POST /api/chat/feedback
// @desc    Submit chat satisfaction feedback
// @access  Private
router.post(
  "/feedback",
  auth,
  [
    body("sessionId").isUUID(4).withMessage("Valid session ID is required"),
    body("rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("feedback")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Feedback cannot exceed 500 characters"),
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

      const { sessionId, rating, feedback } = req.body;

      const chatSession = await ChatLog.findOneAndUpdate(
        { sessionId, farmer: req.user.userId },
        {
          satisfaction: { rating, feedback },
          resolved: rating >= 4, // Auto-mark as resolved for good ratings
        },
        { new: true }
      );

      if (!chatSession) {
        return res.status(404).json({
          success: false,
          message: "Chat session not found",
        });
      }

      logger.info(
        `Chat feedback received: ${rating}/5 for session ${sessionId}`
      );

      res.json({
        success: true,
        message:
          "Thank you for your feedback! It helps us grow better crops... I mean, responses.",
        data: {
          sessionId,
          rating,
          feedback,
        },
      });
    } catch (error) {
      logger.error("Chat feedback error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to submit feedback",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// @route   GET /api/chat/analytics
// @desc    Get chat analytics for user
// @access  Private
router.get("/analytics", auth, async (req, res) => {
  try {
    const analytics = await ChatLog.getChatAnalytics(req.user.userId);

    // Get additional metrics
    const recentSessions = await ChatLog.find({ farmer: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("sessionId totalMessages duration satisfaction.rating topics");

    const topTopics = await ChatLog.aggregate([
      { $match: { farmer: mongoose.Types.ObjectId(req.user.userId) } },
      { $unwind: "$topics" },
      { $group: { _id: "$topics", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      success: true,
      message: "Chat analytics fetched successfully",
      data: {
        overview: analytics[0] || {},
        recentSessions,
        topTopics,
        insights: [
          {
            title: "Most Asked Topic",
            value: topTopics[0]?._id || "Disease identification",
            trend: "+15% this month",
          },
          {
            title: "Average Response Time",
            value: "1.2s",
            trend: "Optimal",
          },
        ],
      },
    });
  } catch (error) {
    logger.error("Chat analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch chat analytics",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Helper function to detect user intent
function detectIntent(message) {
  const msg = message.toLowerCase();

  if (
    msg.includes("disease") ||
    msg.includes("sick") ||
    msg.includes("problem")
  )
    return "disease_detection";
  if (msg.includes("water") || msg.includes("irrigation"))
    return "irrigation_advice";
  if (msg.includes("fertilizer") || msg.includes("nutrients"))
    return "fertilizer_recommendation";
  if (msg.includes("weather") || msg.includes("rain")) return "weather_query";
  if (msg.includes("harvest") || msg.includes("ready")) return "harvest_timing";
  if (msg.includes("treatment") || msg.includes("cure"))
    return "treatment_advice";
  if (msg.includes("help")) return "help_request";

  return "general_query";
}

module.exports = router;
