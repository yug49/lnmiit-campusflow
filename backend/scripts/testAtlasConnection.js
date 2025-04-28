// Test script to verify MongoDB Atlas connection
const mongoose = require("mongoose");
const { MongoClient, ServerApiVersion } = require("mongodb");
const config = require("../config/config");

// Connection URI from config
const uri = config.mongoURI;

// Function to test mongoose connection (used by your application)
async function testMongooseConnection() {
  try {
    console.log("Testing Mongoose connection to MongoDB Atlas...");

    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    };

    const connection = await mongoose.connect(uri, options);
    console.log("✅ Mongoose connection successful!");
    console.log(
      `Connected to database: ${connection.connection.db.databaseName}`
    );
    console.log(`Host: ${connection.connection.host}`);

    // Get a list of collections
    const collections = await connection.connection.db
      .listCollections()
      .toArray();
    console.log("\nAvailable collections:");
    collections.forEach((collection) => {
      console.log(`- ${collection.name}`);
    });

    return connection;
  } catch (error) {
    console.error("❌ Mongoose connection failed:", error.message);
    throw error;
  }
}

// Function to test direct MongoDB driver connection
async function testMongoClientConnection() {
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  try {
    console.log("\nTesting MongoDB native driver connection...");
    await client.connect();

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("✅ MongoDB native driver connection successful!");
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    return client;
  } catch (error) {
    console.error("❌ MongoDB native driver connection failed:", error.message);
    throw error;
  }
}

// Run both tests
async function runTests() {
  console.log("🔍 MONGODB ATLAS CONNECTION TEST");
  console.log("================================");
  console.log(
    `Using connection string: ${uri.replace(
      /mongodb\+srv:\/\/([^:]+):([^@]+)@/,
      "mongodb+srv://******:******@"
    )}`
  );

  try {
    // Test mongoose connection
    const mongooseConnection = await testMongooseConnection();

    // Test MongoDB client connection
    const mongoClientConnection = await testMongoClientConnection();

    // Close connections
    console.log("\nClosing connections...");
    if (mongooseConnection) await mongoose.disconnect();
    if (mongoClientConnection) await mongoClientConnection.close();

    console.log(
      "\n✅ ALL CONNECTION TESTS PASSED! Your MongoDB Atlas connection is working correctly."
    );
  } catch (error) {
    console.error("\n❌ CONNECTION TEST FAILED!");
    console.error(
      "Please check your MongoDB Atlas connection string and network settings."
    );
    console.error("Error details:", error);
    process.exit(1);
  }
}

// Run the tests
runTests();
