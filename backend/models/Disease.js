const mongoose = require("mongoose");

// Disease Detection Model
const DiseaseDetectionSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cropType: {
      type: String,
      required: [true, "Crop type is required"],
      trim: true,
    },

    // Image Data
    originalImage: {
      filename: String,
      path: String,
      size: Number,
      mimetype: String,
    },
    processedImage: {
      filename: String,
      path: String,
    },

    // ML Prediction Results
    prediction: {
      diseaseName: {
        type: String,
        required: true,
      },
      confidence: {
        type: Number,
        required: true,
        min: 0,
        max: 1,
      },
      alternativeDisease: [
        {
          name: String,
          confidence: Number,
        },
      ],
      severity: {
        type: String,
        enum: ["Low", "Medium", "High", "Critical"],
        required: true,
      },
    },

    // Location & Environment
    location: {
      latitude: Number,
      longitude: Number,
      address: String,
      weather: {
        temperature: Number,
        humidity: Number,
        rainfall: Number,
        windSpeed: Number,
      },
    },

    // Treatment Info
    treatmentApplied: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Treatment",
      default: null,
    },
    treatmentResult: {
      type: String,
      enum: ["Pending", "Successful", "Partial", "Failed"],
      default: "Pending",
    },
    followUpDate: Date,

    // Additional Notes
    notes: {
      farmerNotes: String,
      advisorNotes: String,
      symptoms: [String],
    },

    // Status
    status: {
      type: String,
      enum: ["Active", "Treated", "Resolved", "Archived"],
      default: "Active",
    },
    isVerifiedByExpert: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Indexes
DiseaseDetectionSchema.index({ farmer: 1, createdAt: -1 });
DiseaseDetectionSchema.index({ "prediction.diseaseName": 1 });
DiseaseDetectionSchema.index({ cropType: 1 });
DiseaseDetectionSchema.index({ status: 1 });

// Virtual for age of detection
DiseaseDetectionSchema.virtual("detectionAge").get(function () {
  return Math.floor((new Date() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Treatment Recommendations Model
const TreatmentSchema = new mongoose.Schema(
  {
    diseaseName: {
      type: String,
      required: true,
      trim: true,
    },
    cropType: {
      type: String,
      required: true,
      trim: true,
    },
    severity: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      required: true,
    },

    // Treatment Details
    treatment: {
      type: {
        type: String,
        enum: ["Chemical", "Biological", "Cultural", "Integrated"],
        required: true,
      },
      method: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      dosage: String,
      frequency: String,
      duration: String,
      precautions: [String],
    },

    // Effectiveness & Cost
    effectiveness: {
      percentage: {
        type: Number,
        min: 0,
        max: 100,
        required: true,
      },
      conditions: [String],
    },
    cost: {
      amount: Number,
      currency: { type: String, default: "INR" },
      unit: String, // per acre, per hectare
      breakdown: [
        {
          item: String,
          cost: Number,
          unit: String,
        },
      ],
    },

    // Application Guidelines
    applicationGuidelines: {
      bestTime: String,
      weatherConditions: String,
      equipmentNeeded: [String],
      safetyMeasures: [String],
    },

    // Results Tracking
    successRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    timesToApplied: {
      type: Number,
      default: 0,
    },

    // Expert Info
    recommendedBy: {
      type: String,
      default: "AI System",
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Chat Log Model
const ChatLogSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Conversation Details
    sessionId: {
      type: String,
      required: true,
    },
    messages: [
      {
        sender: {
          type: String,
          enum: ["user", "bot"],
          required: true,
        },
        message: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        messageType: {
          type: String,
          enum: ["text", "image", "location", "file"],
          default: "text",
        },
        metadata: {
          intent: String, // disease_detection, weather_query, etc.
          entities: [String], // extracted entities from the message
          confidence: Number,
          relatedDiseaseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DiseaseDetection",
          },
        },
      },
    ],

    // Session Info
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: Date,
    duration: Number, // in minutes

    // Analytics
    totalMessages: {
      type: Number,
      default: 0,
    },
    satisfaction: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      feedback: String,
    },

    // Categorization
    topics: [String], // irrigation, disease, weather, etc.
    resolved: {
      type: Boolean,
      default: false,
    },
    needsHumanIntervention: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for ChatLog
ChatLogSchema.index({ farmer: 1, createdAt: -1 });
ChatLogSchema.index({ sessionId: 1 });
ChatLogSchema.index({ "messages.metadata.intent": 1 });

// Methods
ChatLogSchema.methods.addMessage = function (
  sender,
  message,
  messageType = "text",
  metadata = {}
) {
  this.messages.push({
    sender,
    message,
    messageType,
    metadata,
    timestamp: new Date(),
  });
  this.totalMessages = this.messages.length;
  return this.save();
};

ChatLogSchema.methods.endSession = function () {
  this.endTime = new Date();
  this.duration = Math.floor((this.endTime - this.startTime) / (1000 * 60));
  return this.save();
};

// Static method to get user's chat history
ChatLogSchema.statics.getUserHistory = function (farmerId, limit = 10) {
  return this.find({ farmer: farmerId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("farmer", "name email");
};

// Static method to get chat analytics
ChatLogSchema.statics.getChatAnalytics = function (farmerId) {
  return this.aggregate([
    { $match: { farmer: mongoose.Types.ObjectId(farmerId) } },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        totalMessages: { $sum: "$totalMessages" },
        avgDuration: { $avg: "$duration" },
        avgSatisfaction: { $avg: "$satisfaction.rating" },
        resolvedSessions: {
          $sum: { $cond: [{ $eq: ["$resolved", true] }, 1, 0] },
        },
      },
    },
  ]);
};

module.exports = {
  DiseaseDetection: mongoose.model("DiseaseDetection", DiseaseDetectionSchema),
  Treatment: mongoose.model("Treatment", TreatmentSchema),
  ChatLog: mongoose.model("ChatLog", ChatLogSchema),
};
