require("dotenv").config();

module.exports = {
  port: process.env.PORT || 5001, // Changed from 5000 to 5001
  mongoURI:
    process.env.MONGO_URI || "mongodb://localhost:27017/lnmiit-campusflow",
  jwtSecret: process.env.JWT_SECRET || "your_jwt_secret_key",
  jwtExpire: process.env.JWT_EXPIRE || "1d",
  nodeEnv: process.env.NODE_ENV || "development",
};
