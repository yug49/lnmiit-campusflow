require("dotenv").config();

// MongoDB Atlas connection string with password
const MONGO_ATLAS_URI = "mongodb+srv://agarwalyug1976:yugLNMIITCampusConnect@lnmiit-campusconnect.246sest.mongodb.net/lnmiit-campusflow?retryWrites=true&w=majority&appName=LNMIIT-CampusConnect";
const LOCAL_MONGO_URI = "mongodb://localhost:27017/lnmiit-campusflow";

// Debug the environment variables
console.log(`[Config] NODE_ENV = "${process.env.NODE_ENV}"`);

// Determine which connection string to use based on environment
const getMongoURI = () => {
  // Directly check if NODE_ENV is exactly the string 'production'
  if (process.env.NODE_ENV === 'production') {
    console.log('[Config] Using production MongoDB Atlas URI');
    // In production, force the use of Atlas URI
    return MONGO_ATLAS_URI;
  } 
  // In development, use local DB
  console.log('[Config] Using development local MongoDB URI');
  return LOCAL_MONGO_URI;
};

// Get the MongoDB URI right away
const mongoURI = getMongoURI();
console.log(`[Config] Selected MongoDB URI: ${mongoURI.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, 'mongodb+srv://******:******@')}`);

module.exports = {
  port: process.env.PORT || 5001,
  mongoURI: mongoURI, // Use the URI determined above
  jwtSecret: process.env.JWT_SECRET || "your_jwt_secret_key",
  jwtExpire: process.env.JWT_EXPIRE || "1d",
  nodeEnv: process.env.NODE_ENV || "development",
  // Add Vercel-specific config
  baseUrl:
    process.env.NODE_ENV === 'production'
      ? `https://${
          process.env.VERCEL_URL ||
          process.env.FRONTEND_URL ||
          "your-app-url.vercel.app"
        }`
      : "http://localhost:3000",
  apiUrl:
    process.env.NODE_ENV === 'production'
      ? `https://${process.env.VERCEL_URL || "your-app-url.vercel.app"}/api`
      : "http://localhost:5001/api",
  // For file storage - in production, you should use a cloud storage solution
  uploadDir:
    process.env.NODE_ENV === 'production'
      ? "/tmp/uploads" // Vercel uses /tmp for temporary files
      : require("path").join(__dirname, "..", "uploads"),
};
