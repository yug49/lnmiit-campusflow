const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const connectDB = require("./config/db");
const { setStorageMode } = require("./utils/modelAdapter");

// Load env vars
dotenv.config();

// Connect to database
connectDB()
  .then((isConnected) => {
    // Set storage mode based on MongoDB connection result
    setStorageMode(!isConnected);

    if (!isConnected) {
      console.log("Using local JSON storage for data persistence");
    }
  })
  .catch(() => {
    console.log(
      "Error connecting to MongoDB, falling back to local JSON storage"
    );
    setStorageMode(true);
  });

// Route files
const authRoutes = require("./routes/authRoutes");
const rolePermissionRoutes = require("./routes/rolePermissionRoutes");
const userRoutes = require("./routes/userRoutes");
const facultyRoutes = require("./routes/facultyRoutes");
const eventRoutes = require("./routes/eventRoutes");
const mouRoutes = require("./routes/mouRoutes");
const noDuesRoutes = require("./routes/noDuesRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// File upload
app.use(
  fileUpload({
    createParentPath: true,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// Enable CORS
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001",
    ], // Allow frontend and direct browser access
    credentials: true, // Allow cookies
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allow all necessary HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allow these headers
  })
);

// Mount routers
app.use("/api/auth", authRoutes);
app.use("/api/role-permissions", rolePermissionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/mous", mouRoutes);
app.use("/api/nodues", noDuesRoutes);
app.use("/api/admin", adminRoutes);

// Basic route for testing
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
  });
});

// Test endpoint specifically for connectivity testing
app.get("/api/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend API is accessible from frontend",
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
