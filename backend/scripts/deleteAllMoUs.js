require("dotenv").config();
const mongoose = require("mongoose");
const MoU = require("../models/MoU");

const deleteAllMoUs = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        console.log("Deleting all MoUs from database...");
        const result = await MoU.deleteMany({});
        console.log(`✅ Successfully deleted ${result.deletedCount} MoU(s)`);

        await mongoose.connection.close();
        console.log("Database connection closed");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error deleting MoUs:", error);
        process.exit(1);
    }
};

deleteAllMoUs();
