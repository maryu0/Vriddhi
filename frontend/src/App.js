import React, { useState } from "react";
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
} from "recharts";
import "./index.css";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: "bot",
      message:
        "Hello! I'm your agricultural assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);

  // Predefined quick questions
  const quickQuestions = [
    {
      id: 1,
      icon: "🌧️",
      text: "Should I water my crops today?",
      category: "Irrigation",
    },
    {
      id: 2,
      icon: "🦠",
      text: "Help me identify a plant disease",
      category: "Disease",
    },
    {
      id: 3,
      icon: "🌾",
      text: "When should I harvest my wheat?",
      category: "Harvest",
    },
    {
      id: 4,
      icon: "💊",
      text: "Best fertilizer for my crops?",
      category: "Fertilizer",
    },
    {
      id: 5,
      icon: "📊",
      text: "Show me disease trends",
      category: "Analytics",
    },
    {
      id: 6,
      icon: "🌡️",
      text: "What's the weather forecast?",
      category: "Weather",
    },
  ];

  // Disease trend data
  const weeklyTrendData = [
    { week: "Week 1", diseases: 12, treated: 10, prevented: 2 },
    { week: "Week 2", diseases: 8, treated: 7, prevented: 3 },
    { week: "Week 3", diseases: 15, treated: 12, prevented: 1 },
    { week: "Week 4", diseases: 6, treated: 6, prevented: 4 },
    { week: "Week 5", diseases: 10, treated: 8, prevented: 5 },
    { week: "Week 6", diseases: 4, treated: 4, prevented: 6 },
    { week: "Week 7", diseases: 7, treated: 6, prevented: 7 },
  ];

  const diseaseTypeData = [
    { name: "Leaf Blight", cases: 25, color: "#ef4444" },
    { name: "Root Rot", cases: 18, color: "#f97316" },
    { name: "Powdery Mildew", cases: 15, color: "#eab308" },
    { name: "Rust", cases: 12, color: "#22c55e" },
    { name: "Others", cases: 8, color: "#3b82f6" },
  ];

  const monthlyData = [
    { month: "Jan", diseases: 45, recovery: 38 },
    { month: "Feb", diseases: 32, recovery: 29 },
    { month: "Mar", diseases: 28, recovery: 25 },
    { month: "Apr", diseases: 40, recovery: 35 },
    { month: "May", diseases: 35, recovery: 32 },
    { month: "Jun", diseases: 22, recovery: 20 },
  ];

  // Treatment recommendations data
  const treatmentRecommendations = [
    {
      id: 1,
      disease: "Leaf Blight",
      severity: "High",
      treatment: "Apply copper fungicide spray every 7-10 days",
      duration: "3-4 weeks",
      cost: "$45/acre",
      effectiveness: "92%",
    },
    {
      id: 2,
      disease: "Root Rot",
      severity: "Medium",
      treatment: "Improve drainage and apply biological fungicide",
      duration: "2-3 weeks",
      cost: "$32/acre",
      effectiveness: "87%",
    },
    {
      id: 3,
      disease: "Powdery Mildew",
      severity: "Low",
      treatment: "Neem oil spray twice weekly",
      duration: "2 weeks",
      cost: "$18/acre",
      effectiveness: "89%",
    },
    {
      id: 4,
      disease: "Rust",
      severity: "Medium",
      treatment: "Systemic fungicide application",
      duration: "3 weeks",
      cost: "$38/acre",
      effectiveness: "94%",
    },
  ];

  // Dummy chatbot responses
  const getBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase();

    if (
      message.includes("disease") ||
      message.includes("sick") ||
      message.includes("problem")
    ) {
      return "I can help you identify crop diseases! Please upload a photo of the affected plant leaves, and I'll analyze it for common diseases like blight, rust, or mildew. Based on recent data, leaf blight is the most common issue in your area.";
    }

    if (message.includes("water") || message.includes("irrigation")) {
      return "Based on current weather data, I recommend watering your crops every 3 days. With 65% rain chance this week, you might want to reduce irrigation frequency. Your soil moisture levels look optimal.";
    }

    if (message.includes("fertilizer") || message.includes("nutrients")) {
      return "For wheat crops, I suggest using nitrogen-rich fertilizers during the vegetative stage. Your soil analysis shows good phosphorus levels but could benefit from additional potassium.";
    }

    if (message.includes("weather") || message.includes("rain")) {
      return "Current weather shows 65% chance of rain and low drought risk (15%). Perfect conditions for most crops with 78% optimal growing conditions! Temperature is ideal for wheat growth.";
    }

    if (message.includes("harvest") || message.includes("ready")) {
      return "Your wheat crop will be ready for harvest in approximately 3 months. Based on growth monitoring, expect 15-20% higher yield than last season. I'll send notifications when it's optimal time.";
    }

    if (message.includes("trend") || message.includes("statistics")) {
      return "Disease trends show a 30% decrease this month! Leaf blight cases are down, but watch for root rot in wet areas. Check the Disease Trends section for detailed analytics.";
    }

    if (message.includes("treatment") || message.includes("cure")) {
      return "For current disease cases, copper fungicide shows 92% effectiveness for leaf blight. Biological treatments work well for root rot. Check Treatment Recommendations for detailed plans.";
    }

    if (message.includes("help") || message.includes("what can you do")) {
      return "I can help you with:\n• Disease identification from photos\n• Irrigation scheduling based on weather\n• Fertilizer recommendations\n• Weather-based farming advice\n• Harvest timing predictions\n• Treatment effectiveness analysis\n• Disease trend monitoring";
    }

    // Default responses
    const defaultResponses = [
      "That's an interesting question! Could you provide more details about your crops or the specific issue you're facing?",
      "I'm here to help with your agricultural needs. Are you dealing with any plant diseases, irrigation concerns, or growth issues?",
      "Let me assist you with that. Can you tell me more about your farming situation? What type of crops and what challenges are you experiencing?",
      "I'd be happy to help! What specific agricultural challenge can I help you solve today?",
    ];

    return defaultResponses[
      Math.floor(Math.random() * defaultResponses.length)
    ];
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMsg = {
      id: chatMessages.length + 1,
      type: "user",
      message: inputMessage,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    const currentMessage = inputMessage;
    setInputMessage("");
    setIsTyping(true);

    // Simulate bot typing delay
    setTimeout(() => {
      const botResponse = {
        id: chatMessages.length + 2,
        type: "bot",
        message: getBotResponse(currentMessage),
        timestamp: new Date(),
      };

      setChatMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
    setShowQuickActions(false);
    // Auto-send after a short delay
    setTimeout(() => {
      if (question.trim()) {
        const userMsg = {
          id: chatMessages.length + 1,
          type: "user",
          message: question,
          timestamp: new Date(),
        };

        setChatMessages((prev) => [...prev, userMsg]);
        setInputMessage("");
        setIsTyping(true);

        setTimeout(() => {
          const botResponse = {
            id: chatMessages.length + 2,
            type: "bot",
            message: getBotResponse(question),
            timestamp: new Date(),
          };

          setChatMessages((prev) => [...prev, botResponse]);
          setIsTyping(false);
        }, 1000 + Math.random() * 1000);
      }
    }, 100);
  };

  const sidebarItems = [
    {
      icon: Home,
      label: "Home",
      active: activeSection === "home",
      section: "home",
    },
    {
      icon: User,
      label: "User Profile",
      active: activeSection === "profile",
      section: "profile",
    },
    {
      icon: MessageCircle,
      label: "Chatbot",
      active: activeSection === "chatbot",
      section: "chatbot",
    },
    {
      icon: TrendingUp,
      label: "Disease Trends",
      active: activeSection === "trends",
      section: "trends",
    },
    {
      icon: Stethoscope,
      label: "Treatment Recommendations",
      active: activeSection === "treatments",
      section: "treatments",
    },
    {
      icon: Settings,
      label: "Settings",
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
              {/* Main Chat Area */}
              <div className="chat-main">
                {/* Enhanced Chat Header */}
                <div className="chat-header">
                  <div className="chat-header-content">
                    <div className="chat-header-left">
                      <div className="chat-avatar-large">
                        <span className="chat-emoji">🤖</span>
                      </div>
                      <div>
                        <h3 className="chat-title">AgriBot Assistant</h3>
                        <p className="chat-subtitle">
                          Your smart farming companion • Always ready to help
                        </p>
                      </div>
                    </div>
                    <div className="chat-status">
                      <div className="status-dot"></div>
                      <span className="status-text">Online</span>
                    </div>
                  </div>
                </div>

                {/* Messages Container */}
                <div className="chat-messages">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`message-wrapper ${
                        msg.type === "user" ? "user" : "bot"
                      }`}
                    >
                      <div className={`message-container ${msg.type}`}>
                        {/* Avatar */}
                        <div className={`message-avatar ${msg.type}`}>
                          <span className="avatar-emoji">
                            {msg.type === "user" ? "👨‍🌾" : "🤖"}
                          </span>
                        </div>

                        {/* Message Bubble */}
                        <div className={`message-bubble ${msg.type}`}>
                          <p className="message-text">{msg.message}</p>
                          <p className={`message-time ${msg.type}`}>
                            {msg.timestamp.toLocaleTimeString([], {
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
                              AgriBot is thinking...
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
                    <h4 className="quick-actions-title">Quick Questions:</h4>
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

                {/* Enhanced Input Area */}
                <div className="chat-input-container">
                  <div className="chat-input-wrapper">
                    <div className="input-field-container">
                      <textarea
                        rows={1}
                        value={inputMessage}
                        onChange={(e) => {
                          setInputMessage(e.target.value);
                          // Auto-resize textarea
                          e.target.style.height = "auto";
                          e.target.style.height =
                            Math.min(e.target.scrollHeight, 120) + "px";
                        }}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask about diseases, weather, irrigation, fertilizers..."
                        className="chat-input"
                      />
                      <div className="input-hint">
                        <span>Press Enter</span>
                      </div>
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isTyping}
                      className="send-btn"
                    >
                      <Send size={18} />
                      <span>Send</span>
                    </button>
                  </div>

                  {/* Input Hints */}
                  <div className="input-hints">
                    <span className="hint-label">Try asking:</span>
                    {[
                      "Disease help",
                      "Weather update",
                      "Irrigation advice",
                    ].map((hint, idx) => (
                      <button
                        key={idx}
                        onClick={() => setInputMessage(hint)}
                        className="hint-btn"
                      >
                        {hint}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar with Quick Actions and Stats */}
              <div className="chat-sidebar">
                {/* Chat Statistics */}
                <div className="stats-card">
                  <h4 className="stats-title">
                    <span className="stats-icon">📊</span>
                    Chat Statistics
                  </h4>
                  <div className="stats-list">
                    <div className="stat-item">
                      <span className="stat-label">Messages Today</span>
                      <span className="stat-value green">
                        {chatMessages.length}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Avg Response Time</span>
                      <span className="stat-value blue">1.2s</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Accuracy Rate</span>
                      <span className="stat-value green">94%</span>
                    </div>
                  </div>
                </div>

                {/* Popular Topics */}
                <div className="stats-card">
                  <h4 className="stats-title">
                    <span className="stats-icon">🔥</span>
                    Popular Topics
                  </h4>
                  <div className="topics-list">
                    {[
                      {
                        topic: "Disease Identification",
                        count: "156 questions",
                        icon: "🦠",
                      },
                      {
                        topic: "Irrigation Planning",
                        count: "124 questions",
                        icon: "💧",
                      },
                      {
                        topic: "Harvest Timing",
                        count: "89 questions",
                        icon: "🌾",
                      },
                      {
                        topic: "Fertilizer Advice",
                        count: "76 questions",
                        icon: "💊",
                      },
                    ].map((item, idx) => (
                      <div key={idx} className="topic-item">
                        <span className="topic-icon">{item.icon}</span>
                        <div className="topic-content">
                          <p className="topic-name">{item.topic}</p>
                          <p className="topic-count">{item.count}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Insights */}
                <div className="insights-card">
                  <h4 className="stats-title">
                    <span className="stats-icon">💡</span>
                    AI Insights
                  </h4>
                  <div className="insights-list">
                    <div className="insight-item green">
                      <p className="insight-title">Optimal Planting Window</p>
                      <p className="insight-text">
                        Next 2 weeks perfect for winter wheat planting
                      </p>
                    </div>
                    <div className="insight-item blue">
                      <p className="insight-title">Weather Alert</p>
                      <p className="insight-text">
                        Heavy rain expected this weekend - adjust irrigation
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "trends":
        return (
          <div className="trends-container">
            {/* Header */}
            <div className="trends-header">
              <h2 className="trends-title">Disease Trends Analysis</h2>
              <p className="trends-subtitle">
                Monitor disease patterns and prevention effectiveness
              </p>
            </div>

            {/* Summary Cards */}
            <div className="summary-cards">
              <div className="summary-card">
                <div className="card-content">
                  <div>
                    <p className="card-label">Total Cases</p>
                    <p className="card-value red">78</p>
                  </div>
                  <AlertTriangle className="card-icon red" size={24} />
                </div>
              </div>
              <div className="summary-card">
                <div className="card-content">
                  <div>
                    <p className="card-label">Treated</p>
                    <p className="card-value green">65</p>
                  </div>
                  <TrendingUp className="card-icon green" size={24} />
                </div>
              </div>
              <div className="summary-card">
                <div className="card-content">
                  <div>
                    <p className="card-label">Prevention Success</p>
                    <p className="card-value blue">28</p>
                  </div>
                  <TrendingUp className="card-icon blue" size={24} />
                </div>
              </div>
              <div className="summary-card">
                <div className="card-content">
                  <div>
                    <p className="card-label">Recovery Rate</p>
                    <p className="card-value green">83%</p>
                  </div>
                  <TrendingUp className="card-icon green" size={24} />
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="charts-grid">
              {/* Weekly Trends */}
              <div className="chart-card">
                <h3 className="chart-title">Weekly Disease Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weeklyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="diseases"
                      stroke="#ef4444"
                      name="New Cases"
                    />
                    <Line
                      type="monotone"
                      dataKey="treated"
                      stroke="#22c55e"
                      name="Treated"
                    />
                    <Line
                      type="monotone"
                      dataKey="prevented"
                      stroke="#3b82f6"
                      name="Prevented"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Disease Types */}
              <div className="chart-card">
                <h3 className="chart-title">Disease Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={diseaseTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="cases"
                    >
                      {diseaseTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Monthly Comparison */}
              <div className="chart-card full-width">
                <h3 className="chart-title">
                  Monthly Disease vs Recovery Comparison
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="diseases"
                      fill="#ef4444"
                      name="Disease Cases"
                    />
                    <Bar dataKey="recovery" fill="#22c55e" name="Recoveries" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );

      case "treatments":
        return (
          <div className="treatments-container">
            <div className="treatments-header">
              <h2 className="treatments-title">Treatment Recommendations</h2>
              <p className="treatments-subtitle">
                Personalized treatment plans based on disease analysis
              </p>
            </div>

            <div className="treatments-grid">
              {treatmentRecommendations.map((treatment) => (
                <div key={treatment.id} className="treatment-card">
                  <div className="treatment-header">
                    <div>
                      <h3 className="treatment-disease">{treatment.disease}</h3>
                      <span
                        className={`severity-badge ${treatment.severity.toLowerCase()}`}
                      >
                        {treatment.severity} Severity
                      </span>
                    </div>
                    <div className="effectiveness-badge">
                      <div className="effectiveness-label">Effectiveness</div>
                      <div className="effectiveness-value">
                        {treatment.effectiveness}
                      </div>
                    </div>
                  </div>

                  <div className="treatment-details">
                    <div className="detail-item">
                      <div className="detail-label">Treatment</div>
                      <div className="detail-value">{treatment.treatment}</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">Duration</div>
                      <div className="detail-value">{treatment.duration}</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">Cost</div>
                      <div className="detail-value">{treatment.cost}</div>
                    </div>
                  </div>

                  <div className="treatment-actions">
                    <button className="btn-apply">Apply Treatment</button>
                    <button className="btn-details">View Details</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="home-container">
            {/* Left Side - Main Content */}
            <div className="home-main">
              {/* Stats Cards */}
              <div className="stats-grid">
                {/* Weather Card */}
                <div className="stat-card">
                  <div className="stat-header">
                    <div className="stat-icon-container blue">
                      <CloudRain className="stat-icon-small" size={16} />
                    </div>
                    <span className="stat-title">Weather</span>
                  </div>
                  <div className="stat-items">
                    <div className="stat-row">
                      <span className="stat-label-small">Rain Chances</span>
                      <span className="stat-value-small blue">65%</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label-small">Drought Risk</span>
                      <span className="stat-value-small orange">15%</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label-small">Optimal</span>
                      <span className="stat-value-small green">78%</span>
                    </div>
                  </div>
                </div>

                {/* Crop Health Card */}
                <div className="stat-card">
                  <div className="stat-header">
                    <div className="stat-icon-container green">
                      <TrendingUp className="stat-icon-small" size={16} />
                    </div>
                    <span className="stat-title">Crop Health</span>
                  </div>
                  <div className="stat-items">
                    <div className="stat-row">
                      <span className="stat-label-small">Overall Health</span>
                      <span className="stat-value-small green">87%</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label-small">Healthy Plants</span>
                      <span className="stat-value-small green">92%</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label-small">Growth Rate</span>
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
                    <span className="stat-title">Disease Detection</span>
                  </div>
                  <div className="stat-items">
                    <div className="stat-row">
                      <span className="stat-label-small">Total Detected</span>
                      <span className="stat-value-small red">23</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label-small">This Week</span>
                      <span className="stat-value-small orange">7</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label-small">Resolved</span>
                      <span className="stat-value-small green">18</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Land Map */}
              <div className="map-card">
                <h3 className="map-title">Manage your fields</h3>
                <div className="map-container">
                  <div className="map-field field-1"></div>
                  <div className="map-field field-2"></div>
                  <div className="map-field field-3"></div>
                  <div className="map-field field-4"></div>

                  <div className="map-marker marker-1"></div>
                  <div className="map-marker marker-2"></div>
                  <div className="map-marker marker-3"></div>

                  <div className="map-overlay">
                    <span className="map-label">Field Overview - 45 acres</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Wheat Details Sidebar */}
            <div className="wheat-sidebar">
              <div className="wheat-card">
                <div className="wheat-header">
                  <div className="wheat-icon">
                    <div className="wheat-emoji">🌾</div>
                  </div>
                  <h3 className="wheat-title">Wheat</h3>
                </div>

                <div className="wheat-content">
                  <p className="wheat-description">
                    For this plant, you should water 3 times a month every ten
                    days and set the ambient temperature to degrees Celsius.
                    Your products will be ready in the third month.
                  </p>

                  <div className="wheat-details">
                    <div className="wheat-detail">
                      <span className="detail-label">Planting Season</span>
                      <span className="detail-value">Winter</span>
                    </div>
                    <div className="wheat-detail">
                      <span className="detail-label">Harvest Time</span>
                      <span className="detail-value">3 months</span>
                    </div>
                    <div className="wheat-detail">
                      <span className="detail-label">Water Frequency</span>
                      <span className="detail-value">3x/month</span>
                    </div>
                  </div>

                  <button className="wheat-btn">Plan Details</button>
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
                <h1 className="header-title">Your agricultural assistant</h1>
                <p className="header-subtitle">
                  Managing your crops made simple and smart
                </p>
              </div>
            </div>
            <div className="header-right">
              <div className="sync-info">
                <span className="sync-label">Last sync:</span>
                <span className="sync-time">2 min ago</span>
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
