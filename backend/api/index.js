const express = require("express");
const cors = require("cors");
const config = require("../config/config");
const connectDB = require("../config/db");
const { errorHandler } = require("../utils/errorHandler");
const path = require("path");

// Initialize express app
const app = express();

// Configure CORS based on environment
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? [process.env.VERCEL_URL, process.env.FRONTEND_URL].filter(Boolean)
    : ["http://localhost:3000"];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes("*")) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the uploads directory - needs cloud storage for production
if (process.env.NODE_ENV !== "production") {
  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
}

// Connect to MongoDB
connectDB().catch((err) => console.error("Database connection error:", err));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "API is running" });
});

// Import routes
const authRoutes = require("../routes/auth.routes");
const userRoutes = require("../routes/user.routes");
// const noDuesRoutes = require('../routes/noDues.routes');
// const eventRoutes = require('../routes/event.routes');
// const mouRoutes = require('../routes/mou.routes');
// const votingRoutes = require('../routes/voting.routes');

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
// app.use('/api/nodues', noDuesRoutes);
// app.use('/api/events', eventRoutes);
// app.use('/api/mou', mouRoutes);
// app.use('/api/voting', votingRoutes);

// Global error handler
app.use(errorHandler);

module.exports = app;
