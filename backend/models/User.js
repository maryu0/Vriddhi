const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    // Basic Info
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't include password in queries by default
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s-()]{10,15}$/, "Please enter a valid phone number"],
    },
    avatar: {
      type: String,
      default: null,
    },

    // Farm Details
    farmDetails: {
      farmName: {
        type: String,
        trim: true,
        maxlength: [100, "Farm name cannot exceed 100 characters"],
      },
      location: {
        address: String,
        city: String,
        state: String,
        country: { type: String, default: "India" },
        zipCode: String,
        coordinates: {
          latitude: Number,
          longitude: Number,
        },
      },
      farmSize: {
        value: Number,
        unit: { type: String, enum: ["acres", "hectares"], default: "acres" },
      },
      cropTypes: [
        {
          name: String,
          variety: String,
          plantingDate: Date,
          expectedHarvestDate: Date,
          area: Number,
        },
      ],
      soilType: {
        type: String,
        enum: ["Clay", "Sandy", "Loamy", "Silt", "Peaty", "Chalky", "Other"],
      },
      irrigationType: {
        type: String,
        enum: ["Drip", "Sprinkler", "Flood", "Manual", "Rain-fed", "Other"],
      },
    },

    // User Preferences
    preferences: {
      language: { type: String, default: "en" },
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        push: { type: Boolean, default: true },
      },
      units: {
        temperature: {
          type: String,
          enum: ["celsius", "fahrenheit"],
          default: "celsius",
        },
        measurement: {
          type: String,
          enum: ["metric", "imperial"],
          default: "metric",
        },
      },
    },

    // System Fields
    role: {
      type: String,
      enum: ["farmer", "advisor", "admin"],
      default: "farmer",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },

    // Statistics
    stats: {
      totalQueries: { type: Number, default: 0 },
      diseasesDetected: { type: Number, default: 0 },
      treatmentsApplied: { type: Number, default: 0 },
      successfulHarvests: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
UserSchema.index({ email: 1 });
UserSchema.index({ "farmDetails.location.city": 1 });
UserSchema.index({ "farmDetails.cropTypes.name": 1 });
UserSchema.index({ createdAt: -1 });

// Virtual for farm age
UserSchema.virtual("farmAge").get(function () {
  if (this.createdAt) {
    const diffTime = Math.abs(new Date() - this.createdAt);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  return 0;
});

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update lastLogin on successful authentication
UserSchema.methods.updateLastLogin = function () {
  this.lastLogin = new Date();
  return this.save({ validateBeforeSave: false });
};

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error("Password comparison failed");
  }
};

// Get public profile (without sensitive data)
UserSchema.methods.getPublicProfile = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

// Static method to find farmers by crop type
UserSchema.statics.findByCropType = function (cropType) {
  return this.find({
    "farmDetails.cropTypes.name": { $regex: cropType, $options: "i" },
    isActive: true,
  });
};

// Static method to get farmers in a region
UserSchema.statics.findByRegion = function (city, state) {
  const query = { isActive: true };
  if (city)
    query["farmDetails.location.city"] = { $regex: city, $options: "i" };
  if (state)
    query["farmDetails.location.state"] = { $regex: state, $options: "i" };
  return this.find(query);
};

module.exports = mongoose.model("User", UserSchema);
