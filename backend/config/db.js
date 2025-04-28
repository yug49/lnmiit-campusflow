const mongoose = require("mongoose");
const config = require("./config");
const { MongoClient, ServerApiVersion } = require("mongodb");

// Optimize mongoose for serverless environment
let cachedConnection = null;

/**
 * Connect to MongoDB database with connection pooling for serverless functions
 * @returns {Promise} Mongoose connection promise
 */
const connectDB = async () => {
  // If we have a cached connection, use it
  if (cachedConnection) {
    console.log("Using cached database connection");
    return cachedConnection;
  }

  try {
    console.log('[MongoDB] Attempting to connect with URI:', 
      config.mongoURI.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, 'mongodb+srv://******:******@'));

    // MongoDB connection options optimized for serverless and Atlas
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
      serverSelectionTimeoutMS: 8000, // Shorter timeout for serverless
      socketTimeoutMS: 30000,
      connectTimeoutMS: 8000,
      maxPoolSize: 10, // Limit pool size for serverless function
    };

    // Connect to MongoDB with optimized options for Atlas
    const conn = await mongoose.connect(config.mongoURI, options);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database name: ${conn.connection.db.databaseName}`);

    // Cache the connection
    cachedConnection = conn;

    // Handle connection events
    mongoose.connection.on("connected", () => {
      console.log("Mongoose connected to MongoDB Atlas");
    });

    mongoose.connection.on("error", (err) => {
      console.error(`Mongoose connection error: ${err}`);
      cachedConnection = null;
    });

    mongoose.connection.on("disconnected", () => {
      console.log("Mongoose disconnected from MongoDB Atlas");
      cachedConnection = null;
    });

    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB Atlas: ${error.message}`);
    if (error.stack) {
      console.error(`Stack trace: ${error.stack}`);
    }

    // Don't exit process in production, as this would terminate the serverless function
    if (process.env.NODE_ENV !== "production") {
      process.exit(1);
    }

    throw error;
  }
};

module.exports = connectDB;
