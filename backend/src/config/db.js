const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// Path to local JSON data files
const DATA_DIR = path.join(__dirname, "..", "..", "data");

// Create data directory if it doesn't exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// JSON file paths
const JSON_FILES = {
  users: path.join(DATA_DIR, "users.json"),
  events: path.join(DATA_DIR, "events.json"),
  mous: path.join(DATA_DIR, "mous.json"),
  noDues: path.join(DATA_DIR, "noDues.json"),
  rolePermissions: path.join(DATA_DIR, "rolePermissions.json"),
};

// Initialize JSON files if they don't exist
const initJsonFiles = () => {
  Object.keys(JSON_FILES).forEach((key) => {
    if (!fs.existsSync(JSON_FILES[key])) {
      fs.writeFileSync(JSON_FILES[key], JSON.stringify([]), "utf8");
    }
  });
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    // Check if MONGO_URI is defined
    if (!process.env.MONGO_URI) {
      throw new Error(
        "MongoDB connection URI is not defined in environment variables"
      );
    }

    // Connect to MongoDB (removed deprecated options)
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.log("Falling back to local JSON storage");

    // Initialize local JSON storage as fallback
    initJsonFiles();

    return false;
  }
};

module.exports = connectDB;
