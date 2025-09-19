import React, { useState, useEffect, useRef } from "react";
import Map, {
  Marker,
  Popup,
  Source,
  Layer,
  NavigationControl,
  GeolocateControl,
} from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  Home,
  User,
  MessageCircle,
  Settings,
  Stethoscope,
  Menu,
  X,
  Cloud,
  CloudRain,
  Sun,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Send,
  Upload,
  LogOut,
  MapPin,
  Layers,
  Satellite,
  CheckCircle,
  Shield,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import "./index.css";

// API Configuration
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const MAPBOX_TOKEN =
  process.env.REACT_APP_MAPBOX_TOKEN ||
  "pk.eyJ1IjoiYmliZWtndXB0YSIsImEiOiJjbWZxbGNqcXcwcHBrMmlyMnRiN3QwazRmIn0.Bgk2LdcxNFiOOyOIJcUohA";

// Check if Mapbox token is available
const isMapboxAvailable = Boolean(MAPBOX_TOKEN && MAPBOX_TOKEN !== "undefined");

// Translation object
const translations = {
  english: {
    // Header
    welcome: "Welcome back",
    subtitle: "Managing your crops made simple and smart",
    lastSync: "Last sync:",
    justNow: "Just now",

    // Sidebar
    home: "Home",
    diseaseDetection: "Disease Detection",
    chatbot: "Chatbot",
    diseaseTrends: "Disease Trends",
    treatments: "Treatments",
    profile: "Profile",
    settings: "Settings",

    // Weather
    weather: "Weather",
    temperature: "Temperature",
    humidity: "Humidity",
    rainChance: "Rain Chance",

    // Disease Detection
    cropHealth: "Crop Health",
    overallHealth: "Overall Health",
    growthRate: "Growth Rate",
    totalDetected: "Total Detected",
    thisWeek: "This Week",

    // Chatbot
    agribotAssistant: "AgriBot Assistant",
    smartFarmingCompanion:
      "Your smart farming companion • Always ready to help",
    online: "Online",
    typeMessage: "Type your message...",

    // Treatments
    treatmentRecommendations: "Treatment Recommendations",
    aiPoweredPlans:
      "AI-powered personalized treatment plans based on disease analysis",
    activeTreatments: "Active Treatments",
    avgEffectiveness: "Avg. Effectiveness",
    allTreatments: "All Treatments",
    highPriority: "High Priority",
    preventive: "Preventive",
    activeTreatment: "Active Treatment",

    // Profile
    userProfile: "User Profile",
    logout: "Logout",
    personalInformation: "Personal Information",
    name: "Name",
    email: "Email",
    phone: "Phone",
    notProvided: "Not provided",
    farmInformation: "Farm Information",
    farmName: "Farm Name",
    location: "Location",
    farmSize: "Farm Size",
    soilType: "Soil Type",
    notSpecified: "Not specified",

    // Settings
    settingsTitle: "Settings",
    settingsSubtitle: "Customize your Vriddhi experience",
    language: "Language",
    selectLanguage: "Select Language",
    theme: "Theme",
    themeDescription: "Choose your preferred theme",
    lightMode: "Light Mode",
    darkMode: "Dark Mode",
    saveSettings: "Save Settings",
    settingsSaved: "Settings saved successfully!",

    // Common
    apply: "Apply",
    cancel: "Cancel",
    save: "Save",
    edit: "Edit",
    delete: "Delete",
    view: "View",
    loading: "Loading...",
    error: "Error",
    success: "Success",

    // Stat Cards and Topics
    popularTopics: "Popular Topics",
    diseaseIdentification: "Disease Identification",
    irrigationPlanning: "Irrigation Planning",
    harvestTiming: "Harvest Timing",
    fertilizerAdvice: "Fertilizer Advice",
    questions: "questions",

    // Wheat Card
    currentCrop: "Current Crop",
    cultivationInProgress:
      "cultivation in progress. Monitor growth and follow recommended care practices.",
    variety: "Variety",
    plantingSeason: "Planting Season",
    harvestTime: "Harvest Time",
    winter: "Winter",
    months: "months",
    viewDetails: "View Details",

    // Additional UI elements
    uploadPlantPhoto: "Upload Plant Photo",
    diseaseDetectionPhoto: "Take a clear photo of affected leaves or plants",
    quickQuestions: "Quick Questions:",
    agribotThinking: "AgriBot is thinking...",
    askAbout: "Ask about diseases, weather, irrigation, fertilizers...",
    pressEnter: "Press Enter",
    send: "Send",
    tryAsking: "Try asking:",
    diseaseHelp: "Disease help",
    weatherUpdate: "Weather update",
    irrigationAdvice: "Irrigation advice",

    // Topic questions
    helpIdentifyDisease: "Help me identify a plant disease",
    bestIrrigationSchedule: "What's the best irrigation schedule?",
    whenHarvestCrops: "When should I harvest my crops?",
    whatFertilizerUse: "What fertilizer should I use?",
  },
  hindi: {
    // Header
    welcome: "वापसी पर स्वागत",
    subtitle: "आपकी फसलों का प्रबंधन सरल और स्मार्ट बनाया गया",
    lastSync: "अंतिम सिंक:",
    justNow: "अभी",

    // Sidebar
    home: "होम",
    diseaseDetection: "रोग की पहचान",
    chatbot: "चैटबॉट",
    diseaseTrends: "रोग के रुझान",
    treatments: "उपचार",
    profile: "प्रोफ़ाइल",
    settings: "सेटिंग्स",

    // Weather
    weather: "मौसम",
    temperature: "तापमान",
    humidity: "नमी",
    rainChance: "बारिश की संभावना",

    // Disease Detection
    cropHealth: "फसल का स्वास्थ्य",
    overallHealth: "समग्र स्वास्थ्य",
    growthRate: "वृद्धि दर",
    totalDetected: "कुल पता लगाया गया",
    thisWeek: "इस सप्ताह",

    // Chatbot
    agribotAssistant: "कृषि सहायक",
    smartFarmingCompanion: "आपका स्मार्ट कृषि साथी • हमेशा मदद के लिए तैयार",
    online: "ऑनलाइन",
    typeMessage: "अपना संदेश टाइप करें...",

    // Treatments
    treatmentRecommendations: "उपचार की सिफारिशें",
    aiPoweredPlans:
      "रोग विश्लेषण के आधार पर AI-संचालित व्यक्तिगत उपचार योजनाएं",
    activeTreatments: "सक्रिय उपचार",
    avgEffectiveness: "औसत प्रभावशीलता",
    allTreatments: "सभी उपचार",
    highPriority: "उच्च प्राथमिकता",
    preventive: "निवारक",
    activeTreatment: "सक्रिय उपचार",

    // Profile
    userProfile: "उपयोगकर्ता प्रोफ़ाइल",
    logout: "लॉगआउट",
    personalInformation: "व्यक्तिगत जानकारी",
    name: "नाम",
    email: "ईमेल",
    phone: "फोन",
    notProvided: "प्रदान नहीं किया गया",
    farmInformation: "खेत की जानकारी",
    farmName: "खेत का नाम",
    location: "स्थान",
    farmSize: "खेत का आकार",
    soilType: "मिट्टी का प्रकार",
    notSpecified: "निर्दिष्ट नहीं",

    // Settings
    settingsTitle: "सेटिंग्स",
    settingsSubtitle: "अपने वृद्धि अनुभव को अनुकूलित करें",
    language: "भाषा",
    selectLanguage: "भाषा चुनें",
    theme: "थीम",
    themeDescription: "अपनी पसंदीदा थीम चुनें",
    lightMode: "लाइट मोड",
    darkMode: "डार्क मोड",
    saveSettings: "सेटिंग्स सेव करें",
    settingsSaved: "सेटिंग्स सफलतापूर्वक सेव हो गईं!",

    // Common
    apply: "लागू करें",
    cancel: "रद्द करें",
    save: "सेव करें",
    edit: "संपादित करें",
    delete: "हटाएं",
    view: "देखें",
    loading: "लोड हो रहा है...",
    error: "त्रुटि",
    success: "सफलता",

    // Stat Cards and Topics
    popularTopics: "लोकप्रिय विषय",
    diseaseIdentification: "रोग की पहचान",
    irrigationPlanning: "सिंचाई की योजना",
    harvestTiming: "फसल की समय सीमा",
    fertilizerAdvice: "उर्वरक की सलाह",
    questions: "प्रश्न",

    // Wheat Card
    currentCrop: "वर्तमान फसल",
    cultivationInProgress:
      "की खेती प्रगति में है। वृद्धि की निगरानी करें और अनुशंसित देखभाल प्रथाओं का पालन करें।",
    variety: "किस्म",
    plantingSeason: "बुआई का मौसम",
    harvestTime: "फसल का समय",
    winter: "सर्दी",
    months: "महीने",
    viewDetails: "विवरण देखें",

    // Additional UI elements
    uploadPlantPhoto: "पौधे की फोटो अपलोड करें",
    diseaseDetectionPhoto: "प्रभावित पत्तियों या पौधों की स्पष्ट तस्वीर लें",
    quickQuestions: "त्वरित प्रश्न:",
    agribotThinking: "कृषि सहायक सोच रहा है...",
    askAbout: "रोग, मौसम, सिंचाई, उर्वरक के बारे में पूछें...",
    pressEnter: "एंटर दबाएं",
    send: "भेजें",
    tryAsking: "पूछने की कोशिश करें:",
    diseaseHelp: "रोग सहायता",
    weatherUpdate: "मौसम अपडेट",
    irrigationAdvice: "सिंचाई सलाह",

    // Topic questions
    helpIdentifyDisease: "मुझे पौधे की बीमारी पहचानने में मदद करें",
    bestIrrigationSchedule: "सबसे अच्छा सिंचाई कार्यक्रम क्या है?",
    whenHarvestCrops: "मुझे अपनी फसल कब काटनी चाहिए?",
    whatFertilizerUse: "मुझे कौन सा उर्वरक उपयोग करना चाहिए?",
  },
};

// ...existing API helper functions...
const api = {
  // Auth endpoints
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return await response.json();
  },

  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return await response.json();
  },

  // Chat endpoints
  sendMessage: async (message, sessionId, token) => {
    const response = await fetch(`${API_BASE_URL}/chat/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message, sessionId }),
    });
    return await response.json();
  },

  getChatHistory: async (token, page = 1) => {
    const response = await fetch(`${API_BASE_URL}/chat/history?page=${page}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await response.json();
  },

  // Disease endpoints
  predictDisease: async (formData, token) => {
    const response = await fetch(`${API_BASE_URL}/diseases/predict`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    return await response.json();
  },

  getDiseaseHistory: async (token, page = 1) => {
    const response = await fetch(
      `${API_BASE_URL}/diseases/history?page=${page}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return await response.json();
  },

  getDiseaseTrends: async (token, timeframe = "30d") => {
    const response = await fetch(
      `${API_BASE_URL}/diseases/trends?timeframe=${timeframe}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return await response.json();
  },

  // Weather endpoints
  getCurrentWeather: async (token) => {
    const response = await fetch(`${API_BASE_URL}/weather/current`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await response.json();
  },

  // Treatment endpoints
  getTreatmentRecommendations: async (token, disease, crop) => {
    const params = new URLSearchParams();
    if (disease) params.append("disease", disease);
    if (crop) params.append("crop", crop);

    const response = await fetch(
      `${API_BASE_URL}/treatments/recommendations?${params}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return await response.json();
  },

  // User endpoints
  getUserProfile: async (token) => {
    const response = await fetch(`${API_BASE_URL}/farmers/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await response.json();
  },

  getUserStats: async (token) => {
    const response = await fetch(`${API_BASE_URL}/auth/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await response.json();
  },
};

// Login Component (same as before)
const LoginForm = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    farmName: "",
    location: "",
    farmSize: "",
    cropType: "",
    soilType: "",
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Frontend validation for registration
    if (isRegistering) {
      if (!formData.name || formData.name.trim().length < 2) {
        setError("Name must be at least 2 characters long");
        setLoading(false);
        return;
      }
      if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
        setError("Please enter a valid email address");
        setLoading(false);
        return;
      }
      if (!formData.password || formData.password.length < 6) {
        setError("Password must be at least 6 characters long");
        setLoading(false);
        return;
      }
      if (!/^(?=.*[A-Za-z])(?=.*\d)/.test(formData.password)) {
        setError("Password must contain at least one letter and one number");
        setLoading(false);
        return;
      }
      if (!formData.location || formData.location.trim().length < 3) {
        setError("Please enter your farm location (City, State)");
        setLoading(false);
        return;
      }
      if (!formData.farmSize || parseFloat(formData.farmSize) <= 0) {
        setError("Please enter a valid farm size");
        setLoading(false);
        return;
      }
      if (!formData.cropType) {
        setError("Please select a crop type");
        setLoading(false);
        return;
      }
      if (!formData.soilType) {
        setError("Please select a soil type");
        setLoading(false);
        return;
      }
    }

    try {
      let result;
      if (isRegistering) {
        // Geocode location for registration
        let coordinates = { latitude: 0, longitude: 0 };
        if (formData.location) {
          try {
            const geocodeResponse = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
                formData.location
              )}.json?access_token=${MAPBOX_TOKEN}&country=IN&types=place,locality`
            );
            const geocodeData = await geocodeResponse.json();

            if (geocodeData.features && geocodeData.features.length > 0) {
              const [lng, lat] = geocodeData.features[0].center;
              coordinates = { longitude: lng, latitude: lat };
            }
          } catch (geocodeError) {
            console.error("Geocoding failed:", geocodeError);
            // Continue with registration even if geocoding fails
          }
        }

        // Parse location into city and state
        const locationParts = formData.location
          ? formData.location.split(",").map((part) => part.trim())
          : ["", ""];
        const city = locationParts[0] || "";
        const state = locationParts[1] || "";

        // Prepare registration data
        const registrationData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          farmDetails: {
            farmName: formData.farmName || `${formData.name}'s Farm`,
            location: {
              city: city,
              state: state,
              coordinates: coordinates,
            },
            farmSize: {
              value: parseFloat(formData.farmSize) || 1,
              unit: "acres",
            },
            soilType: formData.soilType || "Loamy",
            cropTypes: [
              {
                name: (formData.cropType || "wheat").toLowerCase(),
                variety: "HD-2967",
                plantingDate: new Date(),
                expectedHarvestDate: new Date(
                  Date.now() + 90 * 24 * 60 * 60 * 1000
                ),
                area: parseFloat(formData.farmSize) || 1,
              },
            ],
          },
        };

        console.log(
          "Registration data being sent:",
          JSON.stringify(registrationData, null, 2)
        );
        result = await api.register(registrationData);
      } else {
        result = await api.login(formData.email, formData.password);
      }

      if (result.success) {
        localStorage.setItem("vriddhi_token", result.data.token);
        localStorage.setItem("vriddhi_user", JSON.stringify(result.data.user));
        onLogin(result.data.token, result.data.user);
      } else {
        console.error("Registration/Login failed:", result);
        setError(result.message || "Authentication failed");

        // Show validation errors if they exist
        if (result.errors && Array.isArray(result.errors)) {
          const errorMessages = result.errors.map((err) => err.msg).join(", ");
          setError(`Validation errors: ${errorMessages}`);
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError(`Network error: ${err.message || "Please try again."}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🌾 Vriddhi</h1>
          <h2>{isRegistering ? "Create Account" : "Welcome Back"}</h2>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          {isRegistering && (
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          )}

          <input
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />

          <input
            type="password"
            placeholder={
              isRegistering
                ? "Password (min 6 chars, include letter & number)"
                : "Password"
            }
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
          />

          {isRegistering && (
            <>
              <input
                type="tel"
                placeholder="Phone Number"
                value={formData.phone || ""}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Farm Name (optional)"
                value={formData.farmName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, farmName: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Farm Location (City, State) *"
                value={formData.location || ""}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                required
              />
              <input
                type="number"
                placeholder="Farm Size (acres) *"
                value={formData.farmSize || ""}
                onChange={(e) =>
                  setFormData({ ...formData, farmSize: e.target.value })
                }
                min="0.1"
                step="0.1"
                required
              />
              <select
                value={formData.cropType || ""}
                onChange={(e) =>
                  setFormData({ ...formData, cropType: e.target.value })
                }
                className="form-select"
                required
              >
                <option value="">Select Primary Crop *</option>
                <option value="wheat">Wheat</option>
                <option value="rice">Rice</option>
                <option value="corn">Corn</option>
                <option value="barley">Barley</option>
                <option value="sugarcane">Sugarcane</option>
                <option value="cotton">Cotton</option>
                <option value="soybean">Soybean</option>
              </select>
              <select
                value={formData.soilType || ""}
                onChange={(e) =>
                  setFormData({ ...formData, soilType: e.target.value })
                }
                className="form-select"
                required
              >
                <option value="">Select Soil Type *</option>
                <option value="Clay">Clay Soil</option>
                <option value="Sandy">Sandy Soil</option>
                <option value="Loamy">Loamy Soil</option>
                <option value="Silt">Silt Soil</option>
                <option value="Chalky">Chalky Soil</option>
                <option value="Peaty">Peaty Soil</option>
                <option value="Other">Other</option>
              </select>
            </>
          )}

          <button type="submit" disabled={loading} className="login-btn">
            {loading
              ? "Please wait..."
              : isRegistering
              ? "Create Account"
              : "Sign In"}
          </button>
        </form>

        <div className="login-footer">
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setFormData({
                email: "",
                password: "",
                name: "",
                phone: "",
                farmName: "",
                location: "",
                farmSize: "",
                cropType: "",
                soilType: "",
              });
              setError("");
            }}
            className="toggle-auth"
          >
            {isRegistering
              ? "Already have an account? Sign In"
              : "New to Vriddhi? Create Account"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Farm Map Component
const FarmMap = ({ user, diseaseData, weatherData }) => {
  // All hooks must be declared first, before any conditional logic
  const [viewState, setViewState] = useState({
    longitude: 77.209, // Default to Delhi
    latitude: 28.6139,
    zoom: 10,
  });
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [mapStyle, setMapStyle] = useState(
    "mapbox://styles/mapbox/satellite-streets-v12"
  );
  const mapRef = useRef();

  // Geocoding function to get coordinates from location name
  const geocodeLocation = async (locationString) => {
    if (!locationString) return null;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          locationString
        )}.json?access_token=${MAPBOX_TOKEN}&country=IN&types=place,locality`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        return { longitude: lng, latitude: lat };
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    }
    return null;
  };

  // Update map location based on user's farm location
  useEffect(() => {
    const updateMapLocation = async () => {
      if (user?.farmDetails?.location?.city) {
        const locationString = user.farmDetails.location.state
          ? `${user.farmDetails.location.city}, ${user.farmDetails.location.state}, India`
          : `${user.farmDetails.location.city}, India`;

        const coordinates = await geocodeLocation(locationString);

        if (coordinates) {
          setViewState((prev) => ({
            ...prev,
            longitude: coordinates.longitude,
            latitude: coordinates.latitude,
            zoom: 12,
          }));
        }
      }
    };

    updateMapLocation();
  }, [user]);

  // Get user location if available
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setViewState((prev) => ({
            ...prev,
            longitude: position.coords.longitude,
            latitude: position.coords.latitude,
            zoom: 12,
          }));
        },
        (error) => {
          console.error("Geolocation error:", error);
        }
      );
    }
  }, []);

  // Check if Mapbox is available before rendering
  if (!isMapboxAvailable) {
    return (
      <div className="map-fallback">
        <div className="map-fallback-content">
          <h3>🗺️ Map Currently Unavailable</h3>
          <p>
            Mapbox service is temporarily unavailable. Your farm data is still
            being processed in the background.
          </p>
          <div className="fallback-info">
            <div className="info-item">
              <span className="info-icon">📍</span>
              <span>
                Location: {user?.farmDetails?.location?.city || "Not specified"}
              </span>
            </div>
            <div className="info-item">
              <span className="info-icon">🌾</span>
              <span>
                Farm Size:{" "}
                {user?.farmDetails?.farmSize?.value || "Not specified"}{" "}
                {user?.farmDetails?.farmSize?.unit || ""}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get user's farm coordinates for markers
  const getUserFarmCoordinates = () => {
    if (
      user?.farmDetails?.location?.coordinates?.latitude &&
      user?.farmDetails?.location?.coordinates?.longitude
    ) {
      return [
        user.farmDetails.location.coordinates.longitude,
        user.farmDetails.location.coordinates.latitude,
      ];
    }
    // Use current viewState if coordinates not saved
    return [viewState.longitude, viewState.latitude];
  };

  // Sample farm locations and disease data
  const farmLocations = [
    {
      id: 1,
      name: user?.farmDetails?.farmName || "Main Farm",
      coordinates: getUserFarmCoordinates(),
      size: user?.farmDetails?.farmSize?.value || 5,
      crop: user?.farmDetails?.cropTypes?.[0]?.name || "Wheat",
      health: 87,
      diseases: 2,
      lastInspection: "2024-01-15",
      location: user?.farmDetails?.location?.city || "Farm Location",
    },
    {
      id: 2,
      name: "North Field",
      coordinates: [77.218, 28.62],
      size: 3,
      crop: "Rice",
      health: 92,
      diseases: 0,
      lastInspection: "2024-01-14",
    },
    {
      id: 3,
      name: "South Field",
      coordinates: [77.2, 28.608],
      size: 4,
      crop: "Corn",
      health: 78,
      diseases: 1,
      lastInspection: "2024-01-13",
    },
  ];

  // Disease markers
  const diseaseMarkers = [
    {
      id: 1,
      coordinates: [77.21, 28.615],
      disease: "Leaf Rust",
      severity: "Medium",
      detectedDate: "2024-01-15",
    },
    {
      id: 2,
      coordinates: [77.205, 28.612],
      disease: "Brown Spot",
      severity: "Low",
      detectedDate: "2024-01-14",
    },
  ];

  // Weather stations
  const weatherStations = [
    {
      id: 1,
      coordinates: [77.22, 28.625],
      temperature: weatherData?.temperature || 25,
      humidity: weatherData?.humidity || 65,
      rainfall: 0,
    },
  ];

  // GeoJSON for farm boundaries
  const farmBoundaries = {
    type: "FeatureCollection",
    features: farmLocations.map((farm) => ({
      type: "Feature",
      properties: {
        id: farm.id,
        name: farm.name,
        health: farm.health,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [farm.coordinates[0] - 0.005, farm.coordinates[1] - 0.005],
            [farm.coordinates[0] + 0.005, farm.coordinates[1] - 0.005],
            [farm.coordinates[0] + 0.005, farm.coordinates[1] + 0.005],
            [farm.coordinates[0] - 0.005, farm.coordinates[1] + 0.005],
            [farm.coordinates[0] - 0.005, farm.coordinates[1] - 0.005],
          ],
        ],
      },
    })),
  };

  // Layer style for farm boundaries
  const farmBoundaryLayer = {
    id: "farm-boundaries",
    type: "fill",
    paint: {
      "fill-color": [
        "case",
        [">", ["get", "health"], 85],
        "#10b981", // Green for healthy
        [">", ["get", "health"], 75],
        "#f59e0b", // Yellow for moderate
        "#ef4444", // Red for unhealthy
      ],
      "fill-opacity": 0.3,
    },
  };

  const farmBoundaryOutlineLayer = {
    id: "farm-boundaries-outline",
    type: "line",
    paint: {
      "line-color": "#ffffff",
      "line-width": 2,
    },
  };

  const getMarkerColor = (health) => {
    if (health > 85) return "#10b981"; // Green
    if (health > 75) return "#f59e0b"; // Yellow
    return "#ef4444"; // Red
  };

  const getDiseaseMarkerColor = (severity) => {
    switch (severity.toLowerCase()) {
      case "high":
        return "#ef4444";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#fbbf24";
      default:
        return "#6b7280";
    }
  };

  return (
    <div className="map-container">
      <div className="map-header">
        <h3 className="map-title">Farm Management Dashboard</h3>
        <div className="map-controls">
          <div className="map-style-selector">
            <button
              onClick={() =>
                setMapStyle("mapbox://styles/mapbox/satellite-streets-v12")
              }
              className={`style-btn ${
                mapStyle.includes("satellite") ? "active" : ""
              }`}
            >
              <Satellite size={16} />
              Satellite
            </button>
            <button
              onClick={() => setMapStyle("mapbox://styles/mapbox/streets-v12")}
              className={`style-btn ${
                mapStyle.includes("streets-v12") ? "active" : ""
              }`}
            >
              <Layers size={16} />
              Streets
            </button>
          </div>
        </div>
      </div>

      <div className="map-wrapper">
        <Map
          ref={mapRef}
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: "100%", height: "100%" }}
          mapStyle={mapStyle}
          attributionControl={false}
        >
          {/* Farm Boundaries */}
          <Source id="farm-boundaries" type="geojson" data={farmBoundaries}>
            <Layer {...farmBoundaryLayer} />
            <Layer {...farmBoundaryOutlineLayer} />
          </Source>

          {/* Farm Location Markers */}
          {farmLocations.map((farm) => (
            <Marker
              key={farm.id}
              longitude={farm.coordinates[0]}
              latitude={farm.coordinates[1]}
              anchor="bottom"
            >
              <div
                className="farm-marker"
                style={{ backgroundColor: getMarkerColor(farm.health) }}
                onClick={() => setSelectedMarker({ type: "farm", data: farm })}
              >
                <MapPin size={20} color="white" />
                <div className="marker-label">{farm.name}</div>
              </div>
            </Marker>
          ))}

          {/* Disease Markers */}
          {diseaseMarkers.map((disease) => (
            <Marker
              key={`disease-${disease.id}`}
              longitude={disease.coordinates[0]}
              latitude={disease.coordinates[1]}
              anchor="bottom"
            >
              <div
                className="disease-marker"
                style={{
                  backgroundColor: getDiseaseMarkerColor(disease.severity),
                }}
                onClick={() =>
                  setSelectedMarker({ type: "disease", data: disease })
                }
              >
                <AlertTriangle size={16} color="white" />
              </div>
            </Marker>
          ))}

          {/* Weather Station Markers */}
          {weatherStations.map((station) => (
            <Marker
              key={`weather-${station.id}`}
              longitude={station.coordinates[0]}
              latitude={station.coordinates[1]}
              anchor="bottom"
            >
              <div
                className="weather-marker"
                onClick={() =>
                  setSelectedMarker({ type: "weather", data: station })
                }
              >
                <Cloud size={16} color="#3b82f6" />
              </div>
            </Marker>
          ))}

          {/* Popup for selected marker */}
          {selectedMarker && (
            <Popup
              longitude={selectedMarker.data.coordinates[0]}
              latitude={selectedMarker.data.coordinates[1]}
              anchor="top"
              onClose={() => setSelectedMarker(null)}
              className="map-popup"
            >
              <div className="popup-content">
                {selectedMarker.type === "farm" && (
                  <>
                    <h4>{selectedMarker.data.name}</h4>
                    <div className="popup-details">
                      <div className="detail-row">
                        <span>Crop:</span>
                        <span>{selectedMarker.data.crop}</span>
                      </div>
                      <div className="detail-row">
                        <span>Size:</span>
                        <span>{selectedMarker.data.size} acres</span>
                      </div>
                      <div className="detail-row">
                        <span>Health:</span>
                        <span
                          className={`health-score ${
                            selectedMarker.data.health > 85
                              ? "good"
                              : selectedMarker.data.health > 75
                              ? "moderate"
                              : "poor"
                          }`}
                        >
                          {selectedMarker.data.health}%
                        </span>
                      </div>
                      <div className="detail-row">
                        <span>Diseases:</span>
                        <span>{selectedMarker.data.diseases}</span>
                      </div>
                      <div className="detail-row">
                        <span>Last Inspection:</span>
                        <span>{selectedMarker.data.lastInspection}</span>
                      </div>
                    </div>
                  </>
                )}

                {selectedMarker.type === "disease" && (
                  <>
                    <h4>Disease Alert</h4>
                    <div className="popup-details">
                      <div className="detail-row">
                        <span>Disease:</span>
                        <span>{selectedMarker.data.disease}</span>
                      </div>
                      <div className="detail-row">
                        <span>Severity:</span>
                        <span
                          className={`severity ${selectedMarker.data.severity.toLowerCase()}`}
                        >
                          {selectedMarker.data.severity}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span>Detected:</span>
                        <span>{selectedMarker.data.detectedDate}</span>
                      </div>
                    </div>
                    <button className="popup-btn">View Treatment</button>
                  </>
                )}

                {selectedMarker.type === "weather" && (
                  <>
                    <h4>Weather Station</h4>
                    <div className="popup-details">
                      <div className="detail-row">
                        <span>Temperature:</span>
                        <span>{selectedMarker.data.temperature}°C</span>
                      </div>
                      <div className="detail-row">
                        <span>Humidity:</span>
                        <span>{selectedMarker.data.humidity}%</span>
                      </div>
                      <div className="detail-row">
                        <span>Rainfall:</span>
                        <span>{selectedMarker.data.rainfall}mm</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Popup>
          )}
        </Map>

        {/* Map Legend */}
        <div className="map-legend">
          <h4>Legend</h4>
          <div className="legend-item">
            <div className="legend-marker farm-marker-legend good"></div>
            <span>Healthy Farm (&gt;85%)</span>
          </div>
          <div className="legend-item">
            <div className="legend-marker farm-marker-legend moderate"></div>
            <span>Moderate Health (75-85%)</span>
          </div>
          <div className="legend-item">
            <div className="legend-marker farm-marker-legend poor"></div>
            <span>Poor Health (&lt;75%)</span>
          </div>
          <div className="legend-item">
            <div className="legend-marker disease-marker-legend"></div>
            <span>Disease Alert</span>
          </div>
          <div className="legend-item">
            <div className="legend-marker weather-marker-legend"></div>
            <span>Weather Station</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [loading, setLoading] = useState(true);

  // Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  // Data state
  const [diseaseHistory, setDiseaseHistory] = useState([]);
  const [diseaseTrends, setDiseaseTrends] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [treatmentRecommendations, setTreatmentRecommendations] = useState([]);
  const [userStats, setUserStats] = useState(null);

  // Chat UI state
  const [showQuickActions, setShowQuickActions] = useState(true);

  // Settings state
  const [language, setLanguage] = useState(
    localStorage.getItem("vriddhi-language") || "english"
  );
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("vriddhi-theme") === "dark"
  );

  // Quick questions data
  const quickQuestions = [
    {
      id: 1,
      text: "How to identify wheat diseases?",
      category: "Disease Detection",
      icon: "🦠",
    },
    {
      id: 2,
      text: "What's the weather forecast?",
      category: "Weather",
      icon: "🌤️",
    },
    {
      id: 3,
      text: "Best irrigation schedule for my crops?",
      category: "Irrigation",
      icon: "💧",
    },
    {
      id: 4,
      text: "When should I harvest wheat?",
      category: "Harvest",
      icon: "🌾",
    },
    {
      id: 5,
      text: "Recommended fertilizers for this season?",
      category: "Fertilizers",
      icon: "💊",
    },
    {
      id: 6,
      text: "How to prevent pest attacks?",
      category: "Pest Control",
      icon: "🐛",
    },
  ];

  // Translation helper function
  const t = (key) => {
    return translations[language]?.[key] || translations.english[key] || key;
  };

  // Settings handlers
  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem("vriddhi-language", newLanguage);
  };

  const handleThemeToggle = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem("vriddhi-theme", newTheme ? "dark" : "light");

    // Apply theme to document body
    if (newTheme) {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }
  };

  // Apply theme on component mount
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }
  }, [isDarkMode]);

  // Initialize app
  useEffect(() => {
    const savedToken = localStorage.getItem("vriddhi_token");
    const savedUser = localStorage.getItem("vriddhi_user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      loadInitialData(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const loadInitialData = async (authToken) => {
    try {
      const [profileResult, statsResult, weatherResult] = await Promise.all([
        api.getUserProfile(authToken),
        api.getUserStats(authToken),
        api.getCurrentWeather(authToken),
      ]);

      if (profileResult.success) setUser(profileResult.data);
      if (statsResult.success) setUserStats(statsResult.data);
      if (weatherResult.success) setWeatherData(weatherResult.data);

      // Initialize chat
      setChatMessages([
        {
          id: 1,
          type: "bot",
          message:
            "Hello! I'm your agricultural assistant. How can I help you today?",
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Failed to load initial data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (authToken, userData) => {
    setToken(authToken);
    setUser(userData);
    loadInitialData(authToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("vriddhi_token");
    localStorage.removeItem("vriddhi_user");
    setToken(null);
    setUser(null);
    setChatMessages([]);
    setSessionId(null);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !token) return;

    const userMsg = {
      id: Date.now(),
      type: "user",
      message: inputMessage,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    const currentMessage = inputMessage;
    setInputMessage("");
    setIsTyping(true);

    // Hide quick actions after first message
    if (chatMessages.length <= 1) {
      setShowQuickActions(false);
    }

    try {
      const result = await api.sendMessage(currentMessage, sessionId, token);

      if (result.success) {
        if (!sessionId) setSessionId(result.data.sessionId);

        const botResponse = {
          id: Date.now() + 1,
          type: "bot",
          message: result.data.response,
          timestamp: new Date(),
        };

        setChatMessages((prev) => [...prev, botResponse]);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      const errorResponse = {
        id: Date.now() + 1,
        type: "bot",
        message: "Sorry, I'm having trouble connecting. Please try again.",
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle quick question selection
  const handleQuickQuestion = (questionText) => {
    setInputMessage(questionText);
    setShowQuickActions(false);

    // Auto-send the question after a short delay
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  // Load section-specific data
  useEffect(() => {
    if (!token) return;

    const loadSectionData = async () => {
      try {
        switch (activeSection) {
          case "trends":
            const trendsResult = await api.getDiseaseTrends(token);
            if (trendsResult.success) setDiseaseTrends(trendsResult.data);
            break;

          case "treatments":
            const treatmentsResult = await api.getTreatmentRecommendations(
              token
            );
            if (treatmentsResult.success)
              setTreatmentRecommendations(treatmentsResult.data);
            break;

          default:
            break;
        }
      } catch (error) {
        console.error(`Failed to load ${activeSection} data:`, error);
      }
    };

    loadSectionData();
  }, [activeSection, token]);

  // Disease image upload handler
  const handleDiseaseImageUpload = async (file, cropType) => {
    if (!file || !token) return;

    const formData = new FormData();
    formData.append("image", file);
    formData.append("cropType", cropType || "wheat");

    try {
      const result = await api.predictDisease(formData, token);

      if (result.success) {
        // Add disease detection result to chat
        const detectionMessage = {
          id: Date.now(),
          type: "bot",
          message: `Disease Analysis Complete!\n\nDisease: ${
            result.data.prediction.disease
          }\nConfidence: ${(result.data.prediction.confidence * 100).toFixed(
            1
          )}%\nSeverity: ${
            result.data.prediction.severity
          }\n\nRecommendations:\n${result.data.recommendations.immediate}`,
          timestamp: new Date(),
        };
        setChatMessages((prev) => [...prev, detectionMessage]);

        const historyResult = await api.getDiseaseHistory(token);
        if (historyResult.success)
          setDiseaseHistory(historyResult.data.detections);
      }

      return result;
    } catch (error) {
      console.error("Disease prediction failed:", error);
      return { success: false, message: "Failed to analyze image" };
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">🌾</div>
        <p>Loading your farm dashboard...</p>
      </div>
    );
  }

  if (!token || !user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  // Sidebar items
  const sidebarItems = [
    {
      icon: Home,
      label: t("home"),
      active: activeSection === "home",
      section: "home",
    },
    {
      icon: User,
      label: t("profile"),
      active: activeSection === "profile",
      section: "profile",
    },
    {
      icon: MessageCircle,
      label: t("chatbot"),
      active: activeSection === "chatbot",
      section: "chatbot",
    },
    {
      icon: TrendingUp,
      label: t("diseaseTrends"),
      active: activeSection === "trends",
      section: "trends",
    },
    {
      icon: Stethoscope,
      label: t("treatments"),
      active: activeSection === "treatments",
      section: "treatments",
    },
    {
      icon: Settings,
      label: t("settings"),
      active: activeSection === "settings",
      section: "settings",
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "chatbot":
        return (
          <div className="chat-container">
            <div className="chat-layout">
              <div className="chat-main">
                <div className="chat-header">
                  <div className="chat-header-content">
                    <div className="chat-header-left">
                      <div className="chat-avatar-large">
                        <span className="chat-emoji">🤖</span>
                      </div>
                      <div>
                        <h3 className="chat-title">{t("agribotAssistant")}</h3>
                        <p className="chat-subtitle">
                          {t("smartFarmingCompanion")}
                        </p>
                      </div>
                    </div>
                    <div className="chat-status">
                      <div className="status-dot"></div>
                      <span className="status-text">{t("online")}</span>
                    </div>
                  </div>
                </div>

                <div className="chat-messages">
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`message-wrapper ${message.type}`}
                    >
                      <div className={`message-container ${message.type}`}>
                        <div className={`message-avatar ${message.type}`}>
                          <span className="avatar-emoji">
                            {message.type === "user" ? "👨‍🌾" : "🤖"}
                          </span>
                        </div>
                        <div className={`message-bubble ${message.type}`}>
                          <div className="message-text">
                            {message.message.split("\n").map((line, index) => (
                              <React.Fragment key={index}>
                                {line}
                                {index <
                                  message.message.split("\n").length - 1 && (
                                  <br />
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                          <p className={`message-time ${message.type}`}>
                            {message.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="message-wrapper bot">
                      <div className="message-container bot">
                        <div className="message-avatar bot">
                          <span className="avatar-emoji">🤖</span>
                        </div>
                        <div className="typing-bubble">
                          <div className="typing-animation">
                            <div className="typing-dot"></div>
                            <div className="typing-dot"></div>
                            <div className="typing-dot"></div>
                            <span className="typing-text">
                              {t("agribotThinking")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                {showQuickActions && chatMessages.length === 1 && (
                  <div className="quick-actions-container">
                    <h4 className="quick-actions-title">
                      {t("quickQuestions")}
                    </h4>
                    <div className="quick-actions-grid">
                      {quickQuestions.map((question) => (
                        <button
                          key={question.id}
                          onClick={() => handleQuickQuestion(question.text)}
                          className="quick-action-btn"
                        >
                          <span className="quick-action-icon">
                            {question.icon}
                          </span>
                          <div>
                            <p className="quick-action-text">{question.text}</p>
                            <p className="quick-action-category">
                              {question.category}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="chat-input-container">
                  <div className="input-wrapper">
                    <div className="input-container">
                      <textarea
                        value={inputMessage}
                        onChange={(e) => {
                          setInputMessage(e.target.value);
                          e.target.style.height = "auto";
                          e.target.style.height =
                            Math.min(e.target.scrollHeight, 120) + "px";
                        }}
                        onKeyPress={handleKeyPress}
                        placeholder={t("askAbout")}
                        className="chat-input"
                      />
                      <div className="input-hint">
                        <span>{t("pressEnter")}</span>
                      </div>
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isTyping}
                      className="send-btn"
                    >
                      <Send size={18} />
                      <span>{t("send")}</span>
                    </button>
                  </div>

                  {/* Try Asking Section */}
                  <div className="input-hints">
                    <span className="hint-label">{t("tryAsking")}</span>
                    {[
                      t("diseaseHelp"),
                      t("weatherUpdate"),
                      t("irrigationAdvice"),
                    ].map((hint, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setInputMessage(hint);
                          // Auto-focus on input after setting the text
                          setTimeout(() => {
                            const inputElement =
                              document.querySelector(".chat-input");
                            if (inputElement) {
                              inputElement.focus();
                              inputElement.setSelectionRange(
                                hint.length,
                                hint.length
                              );
                            }
                          }, 0);
                        }}
                        className="hint-btn"
                      >
                        {hint}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Chat Sidebar - Updated */}
              <div className="chat-sidebar">
                {/* Popular Topics */}
                <div className="stats-card">
                  <h4 className="stats-title">
                    <span className="stats-icon">🔥</span>
                    {t("popularTopics")}
                  </h4>
                  <div className="topics-list">
                    {[
                      {
                        topic: t("diseaseIdentification"),
                        count: `156 ${t("questions")}`,
                        icon: "🦠",
                      },
                      {
                        topic: t("irrigationPlanning"),
                        count: `124 ${t("questions")}`,
                        icon: "💧",
                      },
                      {
                        topic: t("harvestTiming"),
                        count: `89 ${t("questions")}`,
                        icon: "🌾",
                      },
                      {
                        topic: t("fertilizerAdvice"),
                        count: `76 ${t("questions")}`,
                        icon: "💊",
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="topic-item"
                        onClick={() => {
                          // Handle topic click to populate input
                          const topicQuestions = {
                            [t("diseaseIdentification")]: t(
                              "helpIdentifyDisease"
                            ),
                            [t("irrigationPlanning")]: t(
                              "bestIrrigationSchedule"
                            ),
                            [t("harvestTiming")]: t("whenHarvestCrops"),
                            [t("fertilizerAdvice")]: t("whatFertilizerUse"),
                          };
                          const question = topicQuestions[item.topic];
                          if (question) {
                            setInputMessage(question);
                            setTimeout(() => {
                              const inputElement =
                                document.querySelector(".chat-input");
                              if (inputElement) {
                                inputElement.focus();
                              }
                            }, 0);
                          }
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <span className="topic-icon">{item.icon}</span>
                        <div className="topic-content">
                          <p className="topic-name">{item.topic}</p>
                          <p className="topic-count">{item.count}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Image Upload for Disease Detection */}
                <div className="stats-card">
                  <h4 className="stats-title">
                    <span className="stats-icon">📷</span>
                    {t("diseaseDetection")}
                  </h4>
                  <div className="upload-area">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          handleDiseaseImageUpload(file, "wheat");
                        }
                      }}
                      style={{ display: "none" }}
                      id="disease-upload"
                    />
                    <label htmlFor="disease-upload" className="upload-label">
                      <Upload size={20} />
                      <span>{t("uploadPlantPhoto")}</span>
                    </label>
                    <p className="upload-hint">{t("diseaseDetectionPhoto")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "trends":
        return (
          <div className="trends-container">
            <div className="trends-header">
              <h2 className="trends-title">Disease Trends Analysis</h2>
              <p className="trends-subtitle">
                Comprehensive disease statistics and trends analysis
              </p>
            </div>

            {/* Statistics Cards */}
            <div className="trends-stats-grid">
              <div className="trends-stat-card blue">
                <div className="trends-stat-icon">
                  <div className="trends-icon-circle blue">
                    <AlertTriangle size={24} />
                  </div>
                </div>
                <div className="trends-stat-content">
                  <div className="trends-stat-number">78</div>
                  <div className="trends-stat-label">Total Cases</div>
                </div>
              </div>

              <div className="trends-stat-card green">
                <div className="trends-stat-icon">
                  <div className="trends-icon-circle green">
                    <CheckCircle size={24} />
                  </div>
                </div>
                <div className="trends-stat-content">
                  <div className="trends-stat-number">65</div>
                  <div className="trends-stat-label">Treated</div>
                </div>
              </div>

              <div className="trends-stat-card orange">
                <div className="trends-stat-icon">
                  <div className="trends-icon-circle orange">
                    <Shield size={24} />
                  </div>
                </div>
                <div className="trends-stat-content">
                  <div className="trends-stat-number">28</div>
                  <div className="trends-stat-label">Prevention Success</div>
                </div>
              </div>

              <div className="trends-stat-card purple">
                <div className="trends-stat-icon">
                  <div className="trends-icon-circle purple">
                    <TrendingUp size={24} />
                  </div>
                </div>
                <div className="trends-stat-content">
                  <div className="trends-stat-number">83%</div>
                  <div className="trends-stat-label">Recovery Rate</div>
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="trends-charts-grid">
              {/* Weekly Disease Trends Chart */}
              <div className="trends-chart-card">
                <div className="trends-chart-header">
                  <h3 className="trends-chart-title">Weekly Disease Trends</h3>
                  <p className="trends-chart-subtitle">
                    Disease progression over 7 weeks
                  </p>
                </div>
                <div className="trends-chart-content">
                  <div style={{ width: "100%", height: 350 }}>
                    {(() => {
                      const weeklyData = [
                        {
                          week: "Week 1",
                          leafBlight: 12,
                          rootRot: 8,
                          rust: 5,
                          powderyMildew: 6,
                        },
                        {
                          week: "Week 2",
                          leafBlight: 15,
                          rootRot: 10,
                          rust: 7,
                          powderyMildew: 8,
                        },
                        {
                          week: "Week 3",
                          leafBlight: 18,
                          rootRot: 12,
                          rust: 6,
                          powderyMildew: 9,
                        },
                        {
                          week: "Week 4",
                          leafBlight: 22,
                          rootRot: 15,
                          rust: 8,
                          powderyMildew: 11,
                        },
                        {
                          week: "Week 5",
                          leafBlight: 19,
                          rootRot: 13,
                          rust: 9,
                          powderyMildew: 10,
                        },
                        {
                          week: "Week 6",
                          leafBlight: 16,
                          rootRot: 11,
                          rust: 7,
                          powderyMildew: 8,
                        },
                        {
                          week: "Week 7",
                          leafBlight: 14,
                          rootRot: 9,
                          rust: 6,
                          powderyMildew: 7,
                        },
                      ];

                      return (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={weeklyData}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#f0f0f0"
                            />
                            <XAxis dataKey="week" stroke="#666" fontSize={12} />
                            <YAxis stroke="#666" fontSize={12} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "white",
                                border: "1px solid #ddd",
                                borderRadius: "8px",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                              }}
                            />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="leafBlight"
                              stroke="#e74c3c"
                              strokeWidth={2}
                              name="Leaf Blight"
                            />
                            <Line
                              type="monotone"
                              dataKey="rootRot"
                              stroke="#f39c12"
                              strokeWidth={2}
                              name="Root Rot"
                            />
                            <Line
                              type="monotone"
                              dataKey="rust"
                              stroke="#9b59b6"
                              strokeWidth={2}
                              name="Rust"
                            />
                            <Line
                              type="monotone"
                              dataKey="powderyMildew"
                              stroke="#3498db"
                              strokeWidth={2}
                              name="Powdery Mildew"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Disease Distribution Pie Chart */}
              <div className="trends-chart-card">
                <div className="trends-chart-header">
                  <h3 className="trends-chart-title">Disease Distribution</h3>
                  <p className="trends-chart-subtitle">
                    Current disease breakdown
                  </p>
                </div>
                <div className="trends-chart-content">
                  <div style={{ width: "100%", height: 350 }}>
                    {(() => {
                      const distributionData = [
                        { name: "Leaf Blight", value: 32, color: "#e74c3c" },
                        { name: "Root Rot", value: 23, color: "#f39c12" },
                        { name: "Powdery Mildew", value: 19, color: "#3498db" },
                        { name: "Rust", value: 15, color: "#9b59b6" },
                        { name: "Others", value: 11, color: "#95a5a6" },
                      ];

                      return (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={distributionData}
                              cx="50%"
                              cy="50%"
                              outerRadius={100}
                              dataKey="value"
                              label={({ name, value }) => `${name}: ${value}%`}
                              labelLine={false}
                              fontSize={12}
                            >
                              {distributionData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={entry.color}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "white",
                                border: "1px solid #ddd",
                                borderRadius: "8px",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Monthly Comparison Bar Chart */}
              <div className="trends-chart-card full-width">
                <div className="trends-chart-header">
                  <h3 className="trends-chart-title">
                    Monthly Disease vs Recovery Comparison
                  </h3>
                  <p className="trends-chart-subtitle">
                    Disease cases and recovery rates over 6 months
                  </p>
                </div>
                <div className="trends-chart-content">
                  <div style={{ width: "100%", height: 350 }}>
                    {(() => {
                      const monthlyData = [
                        { month: "Jan", cases: 45, recovered: 38 },
                        { month: "Feb", cases: 52, recovered: 44 },
                        { month: "Mar", cases: 38, recovered: 35 },
                        { month: "Apr", cases: 61, recovered: 55 },
                        { month: "May", cases: 73, recovered: 68 },
                        { month: "Jun", cases: 48, recovered: 43 },
                      ];

                      return (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={monthlyData}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#f0f0f0"
                            />
                            <XAxis
                              dataKey="month"
                              stroke="#666"
                              fontSize={12}
                            />
                            <YAxis stroke="#666" fontSize={12} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "white",
                                border: "1px solid #ddd",
                                borderRadius: "8px",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                              }}
                            />
                            <Legend />
                            <Bar
                              dataKey="cases"
                              fill="#e74c3c"
                              name="Disease Cases"
                              radius={[4, 4, 0, 0]}
                            />
                            <Bar
                              dataKey="recovered"
                              fill="#27ae60"
                              name="Recovered"
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Analytics */}
            <div className="trends-analytics-grid">
              <div className="trends-analytics-card">
                <h4 className="trends-analytics-title">Key Insights</h4>
                <div className="trends-insights-list">
                  <div className="trends-insight-item">
                    <div className="trends-insight-icon success">↗</div>
                    <div className="trends-insight-content">
                      <div className="trends-insight-text">
                        Recovery rate improved by 15% this month
                      </div>
                      <div className="trends-insight-subtitle">
                        Prevention strategies showing effectiveness
                      </div>
                    </div>
                  </div>
                  <div className="trends-insight-item">
                    <div className="trends-insight-icon warning">⚠</div>
                    <div className="trends-insight-content">
                      <div className="trends-insight-text">
                        Leaf blight cases increased in humid conditions
                      </div>
                      <div className="trends-insight-subtitle">
                        Consider enhanced fungicide application
                      </div>
                    </div>
                  </div>
                  <div className="trends-insight-item">
                    <div className="trends-insight-icon info">ℹ</div>
                    <div className="trends-insight-content">
                      <div className="trends-insight-text">
                        Root rot most common in overwatered areas
                      </div>
                      <div className="trends-insight-subtitle">
                        Adjust irrigation schedules accordingly
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="trends-analytics-card">
                <h4 className="trends-analytics-title">Recommendations</h4>
                <div className="trends-recommendations-list">
                  <div className="trends-recommendation-item">
                    <div className="trends-recommendation-priority high">
                      High Priority
                    </div>
                    <div className="trends-recommendation-text">
                      Implement preventive fungicide spray for leaf blight
                    </div>
                  </div>
                  <div className="trends-recommendation-item">
                    <div className="trends-recommendation-priority medium">
                      Medium Priority
                    </div>
                    <div className="trends-recommendation-text">
                      Review irrigation schedule to prevent root rot
                    </div>
                  </div>
                  <div className="trends-recommendation-item">
                    <div className="trends-recommendation-priority low">
                      Low Priority
                    </div>
                    <div className="trends-recommendation-text">
                      Continue current rust prevention measures
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "treatments":
        // Mock treatment data for demonstration (replace with actual API data)
        const mockTreatments =
          treatmentRecommendations && treatmentRecommendations.length > 0
            ? treatmentRecommendations.map((treatment) => ({
                _id: treatment._id || Math.random(),
                diseaseName: treatment.diseaseName || "Unknown Disease",
                severity: treatment.severity || "Medium",
                effectiveness: treatment.effectiveness || { percentage: 0 },
                treatment: treatment.treatment || {
                  method: "Not specified",
                  duration: "Not specified",
                  description: "No description available",
                },
                cost: treatment.cost || {
                  currency: "₹",
                  amount: 0,
                  unit: "acre",
                },
                urgency: treatment.urgency || "scheduled",
                materials: treatment.materials || [],
                instructions: treatment.instructions || [],
              }))
            : [
                {
                  _id: 1,
                  diseaseName: "Leaf Blight",
                  severity: "High",
                  effectiveness: { percentage: 92 },
                  treatment: {
                    method: "Fungicide Spray",
                    duration: "7-10 days",
                    description:
                      "Apply copper-based fungicide spray in early morning or late evening. Ensure complete coverage of affected leaves and stems.",
                  },
                  cost: { currency: "₹", amount: 450, unit: "acre" },
                  urgency: "immediate",
                  materials: [
                    "Copper sulfate",
                    "Spreader sticker",
                    "Protective gear",
                  ],
                  instructions: [
                    "Mix 2g fungicide per liter of water",
                    "Spray during cool hours (early morning/evening)",
                    "Repeat application after 7 days if needed",
                    "Wear protective clothing during application",
                  ],
                },
                {
                  _id: 2,
                  diseaseName: "Root Rot",
                  severity: "Medium",
                  effectiveness: { percentage: 85 },
                  treatment: {
                    method: "Soil Treatment & Drainage",
                    duration: "2-3 weeks",
                    description:
                      "Improve soil drainage and apply biological fungicide to control root rot pathogens effectively.",
                  },
                  cost: { currency: "₹", amount: 320, unit: "acre" },
                  urgency: "moderate",
                  materials: [
                    "Bio-fungicide",
                    "Organic compost",
                    "Drainage materials",
                  ],
                  instructions: [
                    "Improve field drainage immediately",
                    "Apply bio-fungicide to soil",
                    "Add organic matter to improve soil structure",
                    "Monitor plant recovery progress",
                  ],
                },
                {
                  _id: 3,
                  diseaseName: "Powdery Mildew",
                  severity: "Low",
                  effectiveness: { percentage: 89 },
                  treatment: {
                    method: "Sulfur Dusting",
                    duration: "5-7 days",
                    description:
                      "Apply sulfur-based powder during dry conditions to control powdery mildew spores effectively.",
                  },
                  cost: { currency: "₹", amount: 280, unit: "acre" },
                  urgency: "scheduled",
                  materials: [
                    "Sulfur powder",
                    "Dusting equipment",
                    "Protective mask",
                  ],
                  instructions: [
                    "Apply during dry, calm weather",
                    "Dust evenly over affected plants",
                    "Avoid application during flowering",
                    "Reapply if rain occurs within 24 hours",
                  ],
                },
              ];

        return (
          <div className="treatments-container">
            <div className="treatments-header">
              <div className="treatments-header-content">
                <div>
                  <h2 className="treatments-title">
                    <span className="treatments-icon">🎯</span>
                    Treatment Recommendations
                  </h2>
                  <p className="treatments-subtitle">
                    AI-powered personalized treatment plans based on disease
                    analysis
                  </p>
                </div>
                <div className="treatments-stats">
                  <div className="treatments-stat-item">
                    <span className="stat-number">{mockTreatments.length}</span>
                    <span className="stat-label">Active Treatments</span>
                  </div>
                  <div className="treatments-stat-item">
                    <span className="stat-number">
                      {Math.round(
                        mockTreatments.reduce(
                          (acc, t) => acc + t.effectiveness.percentage,
                          0
                        ) / mockTreatments.length
                      )}
                      %
                    </span>
                    <span className="stat-label">Avg. Effectiveness</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter and Sort Options */}
            <div className="treatments-controls">
              <div className="treatments-filters">
                <button className="filter-btn active">
                  <span className="filter-icon">🔥</span>
                  All Treatments
                </button>
                <button className="filter-btn">
                  <span className="filter-icon">⚡</span>
                  High Priority
                </button>
                <button className="filter-btn">
                  <span className="filter-icon">🛡️</span>
                  Preventive
                </button>
                <button className="filter-btn">
                  <span className="filter-icon">💊</span>
                  Active Treatment
                </button>
              </div>
              <div className="treatments-sort">
                <select className="sort-dropdown">
                  <option value="effectiveness">Sort by Effectiveness</option>
                  <option value="urgency">Sort by Urgency</option>
                  <option value="cost">Sort by Cost</option>
                </select>
              </div>
            </div>

            <div className="treatments-grid">
              {mockTreatments.map((treatment) => (
                <div key={treatment._id} className="treatment-card">
                  <div className="treatment-card-header">
                    <div className="treatment-disease-info">
                      <div className="disease-icon">
                        {treatment.diseaseName === "Leaf Blight"
                          ? "🍃"
                          : treatment.diseaseName === "Root Rot"
                          ? "🌱"
                          : "🌾"}
                      </div>
                      <div>
                        <h3 className="treatment-disease-name">
                          {treatment.diseaseName || "Unknown Disease"}
                        </h3>
                        <span
                          className={`severity-badge ${
                            treatment.severity?.toLowerCase() || "low"
                          }`}
                        >
                          <span className="severity-dot"></span>
                          {treatment.severity || "Unknown"} Severity
                        </span>
                      </div>
                    </div>
                    <div className="urgency-indicator">
                      <span
                        className={`urgency-badge ${
                          treatment.urgency || "scheduled"
                        }`}
                      >
                        {treatment.urgency === "immediate"
                          ? "🚨"
                          : treatment.urgency === "moderate"
                          ? "⏰"
                          : "📅"}
                        {treatment.urgency
                          ? treatment.urgency.charAt(0).toUpperCase() +
                            treatment.urgency.slice(1)
                          : "Not specified"}
                      </span>
                    </div>
                  </div>

                  <div className="effectiveness-section">
                    <div className="effectiveness-circle">
                      <div className="effectiveness-percentage">
                        {treatment.effectiveness?.percentage}%
                      </div>
                      <div className="effectiveness-label">Success Rate</div>
                    </div>
                    <div className="treatment-method">
                      <h4 className="method-title">
                        {treatment.treatment?.method}
                      </h4>
                      <p className="method-duration">
                        <span className="duration-icon">⏱️</span>
                        {treatment.treatment?.duration}
                      </p>
                    </div>
                  </div>

                  <div className="treatment-description">
                    <p>{treatment.treatment?.description}</p>
                  </div>

                  <div className="treatment-details-grid">
                    <div className="detail-card">
                      <div className="detail-icon">💰</div>
                      <div className="detail-content">
                        <div className="detail-label">Cost Estimate</div>
                        <div className="detail-value">
                          {treatment.cost?.currency}
                          {treatment.cost?.amount}/{treatment.cost?.unit}
                        </div>
                      </div>
                    </div>
                    <div className="detail-card">
                      <div className="detail-icon">📦</div>
                      <div className="detail-content">
                        <div className="detail-label">Materials Needed</div>
                        <div className="detail-value">
                          {treatment.materials?.length || 0} items
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="materials-section">
                    <h5 className="materials-title">Required Materials:</h5>
                    <div className="materials-list">
                      {treatment.materials?.map((material, index) => (
                        <span key={index} className="material-tag">
                          {material}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="instructions-section">
                    <h5 className="instructions-title">
                      <span className="instructions-icon">📋</span>
                      Application Instructions:
                    </h5>
                    <ol className="instructions-list">
                      {treatment.instructions?.map((instruction, index) => (
                        <li key={index} className="instruction-item">
                          {instruction}
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="treatment-actions">
                    <button className="btn-primary">
                      <span className="btn-icon">✅</span>
                      Start Treatment
                    </button>
                    <button className="btn-secondary">
                      <span className="btn-icon">📋</span>
                      Add to Schedule
                    </button>
                    <button className="btn-outline">
                      <span className="btn-icon">📱</span>
                      Get Reminders
                    </button>
                  </div>

                  <div className="treatment-progress">
                    <div className="progress-header">
                      <span className="progress-label">Treatment Progress</span>
                      <span className="progress-percentage">0%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: "0%" }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions Panel */}
            <div className="treatments-quick-actions">
              <h3 className="quick-actions-title">
                <span className="quick-actions-icon">⚡</span>
                Quick Actions
              </h3>
              <div className="quick-actions-grid">
                <button className="quick-action-card">
                  <div className="quick-action-icon">📸</div>
                  <div className="quick-action-content">
                    <h4>Scan New Disease</h4>
                    <p>Upload image for instant diagnosis</p>
                  </div>
                </button>
                <button className="quick-action-card">
                  <div className="quick-action-icon">📊</div>
                  <div className="quick-action-content">
                    <h4>Treatment History</h4>
                    <p>View past treatment records</p>
                  </div>
                </button>
                <button className="quick-action-card">
                  <div className="quick-action-icon">🎯</div>
                  <div className="quick-action-content">
                    <h4>Preventive Care</h4>
                    <p>Get prevention recommendations</p>
                  </div>
                </button>
                <button className="quick-action-card">
                  <div className="quick-action-icon">📞</div>
                  <div className="quick-action-content">
                    <h4>Expert Consultation</h4>
                    <p>Connect with agriculture experts</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        );

      case "profile":
        return (
          <div className="profile-container">
            <div className="profile-header">
              <h2>User Profile</h2>
              <button onClick={handleLogout} className="logout-btn">
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>

            <div className="profile-content">
              <div className="profile-card">
                <h3>Personal Information</h3>
                <div className="profile-field">
                  <label>Name:</label>
                  <span>{user.name}</span>
                </div>
                <div className="profile-field">
                  <label>Email:</label>
                  <span>{user.email}</span>
                </div>
                <div className="profile-field">
                  <label>Phone:</label>
                  <span>{user.phone || "Not provided"}</span>
                </div>
              </div>

              {user.farmDetails && (
                <div className="profile-card">
                  <h3>Farm Information</h3>
                  <div className="profile-field">
                    <label>Farm Name:</label>
                    <span>{user.farmDetails.farmName || "Not provided"}</span>
                  </div>
                  <div className="profile-field">
                    <label>Location:</label>
                    <span>
                      {user.farmDetails.location?.city},{" "}
                      {user.farmDetails.location?.state}
                    </span>
                  </div>
                  <div className="profile-field">
                    <label>Farm Size:</label>
                    <span>
                      {user.farmDetails.farmSize?.value}{" "}
                      {user.farmDetails.farmSize?.unit}
                    </span>
                  </div>
                  <div className="profile-field">
                    <label>Soil Type:</label>
                    <span>{user.farmDetails.soilType || "Not specified"}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case "settings":
        return (
          <div className="settings-container">
            <div className="settings-header">
              <div className="settings-header-content">
                <div>
                  <h2 className="settings-title">
                    <span className="settings-icon">⚙️</span>
                    {t("settingsTitle")}
                  </h2>
                  <p className="settings-subtitle">{t("settingsSubtitle")}</p>
                </div>
              </div>
            </div>

            <div className="settings-content">
              {/* Language Settings */}
              <div className="settings-section">
                <div className="settings-section-header">
                  <h3 className="settings-section-title">
                    <span className="section-icon">🌐</span>
                    {t("language")}
                  </h3>
                  <p className="settings-section-description">
                    {t("selectLanguage")}
                  </p>
                </div>
                <div className="settings-section-content">
                  <div className="language-selector">
                    <select
                      value={language}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      className="language-dropdown"
                    >
                      <option value="english">English</option>
                      <option value="hindi">हिंदी (Hindi)</option>
                    </select>
                    <div className="language-preview">
                      <div className="preview-text">
                        <span className="preview-label">Preview:</span>
                        <span className="preview-sample">
                          {t("welcome")}, {user?.name || "User"}!
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Theme Settings */}
              <div className="settings-section">
                <div className="settings-section-header">
                  <h3 className="settings-section-title">
                    <span className="section-icon">🎨</span>
                    {t("theme")}
                  </h3>
                  <p className="settings-section-description">
                    {t("themeDescription")}
                  </p>
                </div>
                <div className="settings-section-content">
                  <div className="theme-selector">
                    <div className="theme-options">
                      <div
                        className={`theme-option ${
                          !isDarkMode ? "active" : ""
                        }`}
                      >
                        <div className="theme-preview light-preview">
                          <div className="preview-header"></div>
                          <div className="preview-content">
                            <div className="preview-card"></div>
                            <div className="preview-card"></div>
                          </div>
                        </div>
                        <div className="theme-option-info">
                          <h4>{t("lightMode")}</h4>
                          <p>Clean and bright interface</p>
                        </div>
                      </div>

                      <div
                        className={`theme-option ${isDarkMode ? "active" : ""}`}
                      >
                        <div className="theme-preview dark-preview">
                          <div className="preview-header"></div>
                          <div className="preview-content">
                            <div className="preview-card"></div>
                            <div className="preview-card"></div>
                          </div>
                        </div>
                        <div className="theme-option-info">
                          <h4>{t("darkMode")}</h4>
                          <p>Easy on the eyes for long sessions</p>
                        </div>
                      </div>
                    </div>

                    <div className="theme-toggle-container">
                      <label className="theme-toggle">
                        <input
                          type="checkbox"
                          checked={isDarkMode}
                          onChange={handleThemeToggle}
                        />
                        <span className="toggle-slider">
                          <span className="toggle-button">
                            {isDarkMode ? "🌙" : "☀️"}
                          </span>
                        </span>
                      </label>
                      <span className="toggle-label">
                        {isDarkMode ? t("darkMode") : t("lightMode")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Settings */}
              <div className="settings-section">
                <div className="settings-section-header">
                  <h3 className="settings-section-title">
                    <span className="section-icon">🔔</span>
                    Notifications
                  </h3>
                  <p className="settings-section-description">
                    Manage your notification preferences
                  </p>
                </div>
                <div className="settings-section-content">
                  <div className="notification-settings">
                    <div className="notification-item">
                      <div className="notification-info">
                        <h4>Disease Alerts</h4>
                        <p>Get notified about potential disease threats</p>
                      </div>
                      <label className="notification-toggle">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-slider small"></span>
                      </label>
                    </div>

                    <div className="notification-item">
                      <div className="notification-info">
                        <h4>Weather Updates</h4>
                        <p>Receive weather forecasts and warnings</p>
                      </div>
                      <label className="notification-toggle">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-slider small"></span>
                      </label>
                    </div>

                    <div className="notification-item">
                      <div className="notification-info">
                        <h4>Treatment Reminders</h4>
                        <p>Get reminded about scheduled treatments</p>
                      </div>
                      <label className="notification-toggle">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-slider small"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="settings-actions">
                <button className="settings-save-btn">
                  <span className="btn-icon">💾</span>
                  {t("saveSettings")}
                </button>
                <button className="settings-reset-btn">
                  <span className="btn-icon">🔄</span>
                  Reset to Default
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="home-container">
            <div className="home-main">
              {/* Stats Cards */}
              <div className="stats-grid">
                {/* Weather Card */}
                <div className="stat-card">
                  <div className="stat-header">
                    <div className="stat-icon-container blue">
                      <CloudRain className="stat-icon-small" size={16} />
                    </div>
                    <span className="stat-title">{t("weather")}</span>
                  </div>
                  <div className="stat-items">
                    <div className="stat-row">
                      <span className="stat-label-small">
                        {t("temperature")}
                      </span>
                      <span className="stat-value-small blue">
                        {weatherData?.temperature || 25}°C
                      </span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label-small">{t("humidity")}</span>
                      <span className="stat-value-small blue">
                        {weatherData?.humidity || 65}%
                      </span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label-small">
                        {t("rainChance")}
                      </span>
                      <span className="stat-value-small blue">
                        {weatherData?.forecast?.rainChance || 30}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Crop Health Card */}
                <div className="stat-card">
                  <div className="stat-header">
                    <div className="stat-icon-container green">
                      <TrendingUp className="stat-icon-small" size={16} />
                    </div>
                    <span className="stat-title">{t("cropHealth")}</span>
                  </div>
                  <div className="stat-items">
                    <div className="stat-row">
                      <span className="stat-label-small">
                        {t("overallHealth")}
                      </span>
                      <span className="stat-value-small green">87%</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label-small">
                        {t("growthRate")}
                      </span>
                      <span className="stat-value-small green">85%</span>
                    </div>
                  </div>
                </div>

                {/* Disease Detection Card */}
                <div className="stat-card">
                  <div className="stat-header">
                    <div className="stat-icon-container red">
                      <AlertTriangle className="stat-icon-small" size={16} />
                    </div>
                    <span className="stat-title">{t("diseaseDetection")}</span>
                  </div>
                  <div className="stat-items">
                    <div className="stat-row">
                      <span className="stat-label-small">
                        {t("totalDetected")}
                      </span>
                      <span className="stat-value-small red">
                        {userStats?.diseaseStats?.totalDetections || 0}
                      </span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label-small">{t("thisWeek")}</span>
                      <span className="stat-value-small orange">
                        {userStats?.diseaseStats?.thisWeek || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mapbox Farm Map */}
              <FarmMap
                user={user}
                diseaseData={diseaseHistory}
                weatherData={weatherData}
              />
            </div>

            {/* Sidebar */}
            <div className="wheat-sidebar">
              <div className="wheat-card">
                <div className="wheat-header">
                  <div className="wheat-icon">
                    <div className="wheat-emoji">🌾</div>
                  </div>
                  <h3 className="wheat-title">{t("currentCrop")}</h3>
                </div>
                <div className="wheat-content">
                  <p className="wheat-description">
                    {user.farmDetails?.cropTypes?.[0]?.name || "Wheat"}{" "}
                    {t("cultivationInProgress")}
                  </p>
                  <div className="wheat-details">
                    <div className="wheat-detail">
                      <span className="detail-label">{t("variety")}</span>
                      <span className="detail-value">
                        {user.farmDetails?.cropTypes?.[0]?.variety || "HD-2967"}
                      </span>
                    </div>
                    <div className="wheat-detail">
                      <span className="detail-label">
                        {t("plantingSeason")}
                      </span>
                      <span className="detail-value">{t("winter")}</span>
                    </div>
                    <div className="wheat-detail">
                      <span className="detail-label">{t("harvestTime")}</span>
                      <span className="detail-value">3 {t("months")}</span>
                    </div>
                  </div>
                  <button className="wheat-btn">{t("viewDetails")}</button>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="app">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">
              <span>V</span>
            </div>
            <span className="logo-text">Vriddhi</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="close-btn">
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {sidebarItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                setActiveSection(item.section);
                setSidebarOpen(false);
              }}
              className={`nav-item ${item.active ? "active" : ""}`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="header">
          <div className="header-content">
            <div className="header-left">
              <button onClick={() => setSidebarOpen(true)} className="menu-btn">
                <Menu size={20} />
              </button>
              <div>
                <h1 className="header-title">
                  {t("welcome")}, {user.name}!
                </h1>
                <p className="header-subtitle">{t("subtitle")}</p>
              </div>
            </div>
            <div className="header-right">
              <div className="sync-info">
                <span className="sync-label">{t("lastSync")}</span>
                <span className="sync-time">{t("justNow")}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="main-container">
          <div className="content-wrapper">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
};

function App() {
  return <Dashboard />;
}

export default App;
