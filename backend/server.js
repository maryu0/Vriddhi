const mongoose = require("mongoose");
const app = require("./app");
const logger = require("./utils/logger");
require("dotenv").config();

const PORT = process.env.PORT || 5000;

// Database connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/vriddhi", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    logger.info("Connected to MongoDB successfully!");
    console.log("🌱 Database connected: MongoDB is ready for farming data!");
  })
  .catch((error) => {
    logger.error("MongoDB connection error:", error);
    console.error("🚨 Database connection failed:", error.message);
    process.exit(1);
  });

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  mongoose.connection.close(() => {
    logger.info("MongoDB connection closed.");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully");
  mongoose.connection.close(() => {
    logger.info("MongoDB connection closed.");
    process.exit(0);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Vriddhi Backend Server is running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  logger.info(`Server started on port ${PORT}`);
});
