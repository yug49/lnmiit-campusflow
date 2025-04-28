require("dotenv").config();

module.exports = {
  port: process.env.PORT || 5001,
  mongoURI:
    process.env.MONGO_URI || "mongodb://localhost:27017/lnmiit-campusflow",
  jwtSecret: process.env.JWT_SECRET || "your_jwt_secret_key",
  jwtExpire: process.env.JWT_EXPIRE || "1d",
  nodeEnv: process.env.NODE_ENV || "development",
  // Add Vercel-specific config
  baseUrl:
    process.env.NODE_ENV === "production"
      ? `https://${
          process.env.VERCEL_URL ||
          process.env.FRONTEND_URL ||
          "your-app-url.vercel.app"
        }`
      : "http://localhost:3000",
  apiUrl:
    process.env.NODE_ENV === "production"
      ? `https://${process.env.VERCEL_URL || "your-app-url.vercel.app"}/api`
      : "http://localhost:5001/api",
  // For file storage - in production, you should use a cloud storage solution
  uploadDir:
    process.env.NODE_ENV === "production"
      ? "/tmp/uploads" // Vercel uses /tmp for temporary files
      : require("path").join(__dirname, "..", "uploads"),
};
