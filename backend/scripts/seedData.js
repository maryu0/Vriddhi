const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("../models/User");
const { Treatment } = require("../models/Disease");

const seedUsers = [
  {
    name: "Rajesh Kumar",
    email: "rajesh.farmer@example.com",
    password: "password123",
    phone: "+91-9876543210",
    farmDetails: {
      farmName: "Green Valley Farm",
      location: {
        address: "Village Rampur",
        city: "Meerut",
        state: "Uttar Pradesh",
        country: "India",
        zipCode: "250001",
        coordinates: {
          latitude: 28.9845,
          longitude: 77.7064,
        },
      },
      farmSize: { value: 5, unit: "acres" },
      cropTypes: [
        {
          name: "Wheat",
          variety: "HD-2967",
          plantingDate: new Date("2024-11-15"),
          expectedHarvestDate: new Date("2025-04-15"),
          area: 3,
        },
        {
          name: "Rice",
          variety: "Basmati",
          plantingDate: new Date("2024-06-15"),
          expectedHarvestDate: new Date("2024-11-15"),
          area: 2,
        },
      ],
      soilType: "Loamy",
      irrigationType: "Drip",
    },
    stats: {
      totalQueries: 15,
      diseasesDetected: 3,
      treatmentsApplied: 2,
      successfulHarvests: 1,
    },
  },
  {
    name: "Priya Sharma",
    email: "priya.organic@example.com",
    password: "password123",
    phone: "+91-9876543211",
    farmDetails: {
      farmName: "Organic Paradise",
      location: {
        city: "Pune",
        state: "Maharashtra",
        country: "India",
      },
      farmSize: { value: 8, unit: "acres" },
      cropTypes: [
        {
          name: "Tomato",
          variety: "Hybrid",
          area: 4,
        },
        {
          name: "Onion",
          variety: "Red Onion",
          area: 4,
        },
      ],
      soilType: "Clay",
      irrigationType: "Sprinkler",
    },
  },
];

const seedTreatments = [
  {
    diseaseName: "Leaf Blight",
    cropType: "Wheat",
    severity: "High",
    treatment: {
      type: "Chemical",
      method: "Copper fungicide spray",
      description:
        "Apply copper-based fungicide spray every 7-10 days during early morning or evening hours",
      dosage: "2-3ml per liter of water",
      frequency: "Every 7-10 days",
      duration: "3-4 weeks",
      precautions: [
        "Wear protective equipment",
        "Do not spray during windy conditions",
        "Avoid spraying during flowering stage",
      ],
    },
    effectiveness: {
      percentage: 92,
      conditions: [
        "Early detection",
        "Proper application",
        "Favorable weather",
      ],
    },
    cost: {
      amount: 450,
      currency: "INR",
      unit: "per acre",
      breakdown: [
        { item: "Copper fungicide", cost: 300, unit: "per bottle" },
        { item: "Application cost", cost: 150, unit: "per acre" },
      ],
    },
    applicationGuidelines: {
      bestTime: "Early morning (6-8 AM) or evening (5-7 PM)",
      weatherConditions: "Avoid rainy or windy weather",
      equipmentNeeded: ["Knapsack sprayer", "Protective gear", "Measuring cup"],
      safetyMeasures: [
        "Wear gloves and mask",
        "Keep away from children",
        "Wash hands thoroughly after use",
      ],
    },
    successRate: 87,
    timesToApplied: 0,
    recommendedBy: "Agricultural Research Institute",
  },
  {
    diseaseName: "Root Rot",
    cropType: "Tomato",
    severity: "Medium",
    treatment: {
      type: "Biological",
      method: "Trichoderma application with drainage improvement",
      description:
        "Apply Trichoderma-based bio-fungicide to soil and improve field drainage",
      dosage: "5-10g per plant",
      frequency: "Weekly for 3 weeks",
      duration: "2-3 weeks",
      precautions: [
        "Ensure proper soil moisture",
        "Avoid overwatering",
        "Apply during cool hours",
      ],
    },
    effectiveness: {
      percentage: 87,
      conditions: [
        "Good drainage",
        "Proper soil management",
        "Early application",
      ],
    },
    cost: {
      amount: 320,
      currency: "INR",
      unit: "per acre",
    },
    applicationGuidelines: {
      bestTime: "Early morning or late evening",
      weatherConditions: "Moderate temperature and humidity",
      equipmentNeeded: ["Broadcasting equipment", "Watering can"],
      safetyMeasures: ["Store in cool dry place", "Use within expiry date"],
    },
    successRate: 82,
    timesToApplied: 0,
    recommendedBy: "Organic Farming Institute",
  },
  {
    diseaseName: "Powdery Mildew",
    cropType: "Wheat",
    severity: "Low",
    treatment: {
      type: "Biological",
      method: "Neem oil spray",
      description:
        "Regular neem oil application to prevent and control powdery mildew",
      dosage: "5ml per liter of water",
      frequency: "Twice weekly",
      duration: "2 weeks",
      precautions: [
        "Test on small area first",
        "Do not apply in bright sunlight",
        "Mix fresh solution each time",
      ],
    },
    effectiveness: {
      percentage: 89,
      conditions: ["Regular application", "Proper dilution", "Good coverage"],
    },
    cost: {
      amount: 180,
      currency: "INR",
      unit: "per acre",
    },
    applicationGuidelines: {
      bestTime: "Evening hours after 4 PM",
      weatherConditions: "Avoid direct sunlight and rain",
      equipmentNeeded: ["Hand sprayer", "Measuring cup"],
      safetyMeasures: ["Organic and safe for beneficial insects"],
    },
    successRate: 85,
    timesToApplied: 0,
    recommendedBy: "Organic Certification Board",
  },
];

// Seed function
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/vriddhi"
    );
    console.log("Connected to MongoDB for seeding...");

    // Clear existing data
    await User.deleteMany({});
    await Treatment.deleteMany({});
    console.log("Cleared existing data...");

    // Hash passwords for users
    for (let user of seedUsers) {
      const salt = await bcrypt.genSalt(12);
      user.password = await bcrypt.hash(user.password, salt);
    }

    // Insert seed data
    const createdUsers = await User.insertMany(seedUsers);
    const createdTreatments = await Treatment.insertMany(seedTreatments);

    console.log(`Created ${createdUsers.length} users`);
    console.log(`Created ${createdTreatments.length} treatments`);

    console.log("Database seeded successfully!");
    console.log("Sample login credentials:");
    console.log("Email: rajesh.farmer@example.com");
    console.log("Password: password123");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, seedUsers, seedTreatments };
