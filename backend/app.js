const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/auth");
const farmerRoutes = require("./routes/farmers");
const chatRoutes = require("./routes/chat");
const diseaseRoutes = require("./routes/diseases");
const weatherRoutes = require("./routes/weather");
const treatmentRoutes = require("./routes/treatments");
const uploadRoutes = require("./routes/uploads");

// Import middleware
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests from this IP, please try again later." },
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(limiter);
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static files
app.use("/uploads", express.static("uploads"));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Vriddhi Backend is running smoothly!",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/farmers", farmerRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/diseases", diseaseRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/treatments", treatmentRoutes);
app.use("/api/uploads", uploadRoutes);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `The requested endpoint ${req.method} ${req.originalUrl} does not exist.`,
    availableEndpoints: [
      "GET /api/health",
      "POST /api/auth/register",
      "POST /api/auth/login",
      "GET /api/farmers/profile",
      "POST /api/chat/message",
      "GET /api/diseases/trends",
      "POST /api/diseases/predict",
      "GET /api/weather/current",
      "GET /api/treatments/recommendations",
    ],
  });
});

// Error handling middleware
app.use(errorHandler);

// Updated CORS configuration to allow multiple origins
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      process.env.FRONTEND_URL || "http://localhost:3000"
    ],
    credentials: true,
  })
);


module.exports = app;
