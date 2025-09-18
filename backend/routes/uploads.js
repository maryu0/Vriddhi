// routes/uploads.js - File Upload Routes
const express = require("express");
const path = require("path");
const fs = require("fs");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const logger = require("../utils/logger");

const router = express.Router();

// @route   POST /api/uploads/avatar
// @desc    Upload user avatar
// @access  Private
router.post("/avatar", auth, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const User = require("../models/User");
    app.use("/uploads", express.static("uploads"));

    await User.findByIdAndUpdate(req.user.userId, { avatar: avatarUrl });

    res.json({
      success: true,
      message: "Avatar uploaded successfully",
      data: {
        filename: req.file.filename,
        url: avatarUrl,
        size: req.file.size,
      },
    });
  } catch (error) {
    logger.error("Avatar upload error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload avatar",
    });
  }
});

// @route   DELETE /api/uploads/:filename
// @desc    Delete uploaded file
// @access  Private
router.delete("/:filename", auth, async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join("uploads/images", filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);

      res.json({
        success: true,
        message: "File deleted successfully",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "File not found",
      });
    }
  } catch (error) {
    logger.error("Delete file error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete file",
    });
  }
});

module.exports = router;
