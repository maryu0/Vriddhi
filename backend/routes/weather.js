// routes/weather.js - Weather Information Routes
const express = require("express");
const axios = require("axios");
const auth = require("../middleware/auth");
const User = require("../models/User");
const logger = require("../utils/logger");

const router = express.Router();

// @route   GET /api/weather/current
// @desc    Get current weather for user location
// @access  Private
router.get("/current", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const location = user.farmDetails?.location;
    if (!location?.city) {
      return res.json({
        success: true,
        message: "Weather data with default location",
        data: {
          location: "Default Location",
          temperature: 28,
          humidity: 65,
          rainfall: 15,
          windSpeed: 12,
          forecast: {
            rainChance: 65,
            droughtRisk: 15,
            optimalConditions: 78,
          },
          recommendations: [
            "Good conditions for most crops",
            "Consider adjusting irrigation schedule",
            "Monitor for potential rain this week",
          ],
        },
      });
    }

    // Mock weather data (replace with actual weather API)
    const mockWeatherData = {
      location: `${location.city}, ${location.state || "India"}`,
      temperature: Math.floor(Math.random() * 15) + 20, // 20-35°C
      humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
      rainfall: Math.floor(Math.random() * 30), // 0-30mm
      windSpeed: Math.floor(Math.random() * 20) + 5, // 5-25 km/h
      forecast: {
        rainChance: Math.floor(Math.random() * 100),
        droughtRisk: Math.floor(Math.random() * 50),
        optimalConditions: Math.floor(Math.random() * 40) + 60, // 60-100%
      },
      recommendations: [
        "Monitor soil moisture levels",
        "Perfect weather for outdoor farming activities",
        "Consider pest monitoring in current conditions",
      ],
    };

    res.json({
      success: true,
      message: "Weather data fetched successfully",
      data: mockWeatherData,
    });
  } catch (error) {
    logger.error("Get weather error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch weather data",
    });
  }
});

// @route   GET /api/weather/forecast/:days
// @desc    Get weather forecast
// @access  Private
router.get("/forecast/:days", auth, async (req, res) => {
  try {
    const { days } = req.params;
    const numDays = Math.min(parseInt(days) || 7, 14); // Max 14 days

    const forecast = Array.from({ length: numDays }, (_, i) => ({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      temperature: {
        min: Math.floor(Math.random() * 10) + 18,
        max: Math.floor(Math.random() * 15) + 25,
      },
      humidity: Math.floor(Math.random() * 40) + 40,
      rainChance: Math.floor(Math.random() * 100),
      conditions: ["Sunny", "Partly Cloudy", "Cloudy", "Rainy"][
        Math.floor(Math.random() * 4)
      ],
    }));

    res.json({
      success: true,
      message: `${numDays}-day forecast fetched successfully`,
      data: { forecast },
    });
  } catch (error) {
    logger.error("Get weather forecast error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch weather forecast",
    });
  }
});

module.exports = router;
