// Debug script to check environment variables and MongoDB connection
console.log('-------- ENV DEBUG INFO --------');
console.log(`Node environment directly: "${process.env.NODE_ENV}"`);

// Import config after logging direct env
const config = require('../config/config');

console.log('\n--- CONFIG VALUES ---');
console.log(`Config nodeEnv: "${config.nodeEnv}"`);
console.log(`MongoDB URI: ${config.mongoURI}`);

// Check if Atlas URI is being selected correctly
const MONGO_ATLAS_URI = "mongodb+srv://agarwalyug1976:yugLNMIITCampusConnect@lnmiit-campusconnect.246sest.mongodb.net/lnmiit-campusflow?retryWrites=true&w=majority&appName=LNMIIT-CampusConnect";
console.log(`\nIs using Atlas URI: ${config.mongoURI === MONGO_ATLAS_URI}`);

// Check dotenv loading
console.log('\n--- DOTENV INFO ---');
console.log('dotenv path:', require('dotenv').config().path || 'No .env file loaded');

// Check the getMongoURI function directly
console.log('\n--- TESTING getMongoURI() DIRECTLY ---');
const getMongoURITest = () => {
  if (process.env.NODE_ENV === 'production') {
    console.log('Production environment detected in function');
    return process.env.MONGO_URI || MONGO_ATLAS_URI;
  } else {
    console.log(`Non-production environment detected in function: "${process.env.NODE_ENV}"`);
    return process.env.MONGO_URI || "mongodb://localhost:27017/lnmiit-campusflow";
  }
};

console.log(`Result of direct call: ${getMongoURITest()}`);