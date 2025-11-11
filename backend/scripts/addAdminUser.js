const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config({ path: "../.env" });

const addAdminUser = async () => {
    try {
        // Connect to MongoDB
        const mongoUri =
            process.env.MONGO_URI ||
            "mongodb://localhost:27017/lnmiit-campusflow";
        console.log("Connecting to MongoDB...");
        await mongoose.connect(mongoUri);
        console.log("Connected to MongoDB");

        // Check if user already exists
        const existingUser = await User.findOne({
            email: "agarwal.yug1976@gmail.com",
        });

        if (existingUser) {
            console.log("User already exists. Updating to admin role...");
            existingUser.role = "admin";
            existingUser.permissions = {
                manageUsers: true,
                approveCandidatures: true,
                approveVoters: true,
                viewResults: true,
                approveNoDues: true,
                approveMOUs: true,
                approveEvents: true,
                approveInvoices: true,
            };
            await existingUser.save();
            console.log("✅ User updated to admin successfully!");
        } else {
            console.log("Creating new admin user...");
            const newAdmin = await User.create({
                name: "Yug Agarwal",
                email: "agarwal.yug1976@gmail.com",
                role: "admin",
                permissions: {
                    manageUsers: true,
                    approveCandidatures: true,
                    approveVoters: true,
                    viewResults: true,
                    approveNoDues: true,
                    approveMOUs: true,
                    approveEvents: true,
                    approveInvoices: true,
                },
            });
            console.log("✅ Admin user created successfully!");
            console.log("User ID:", newAdmin._id);
        }

        // Show the user
        const adminUser = await User.findOne({
            email: "agarwal.yug1976@gmail.com",
        });
        console.log("\n📋 Admin User Details:");
        console.log("Name:", adminUser.name);
        console.log("Email:", adminUser.email);
        console.log("Role:", adminUser.role);
        console.log("Permissions:", adminUser.permissions);

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
};

addAdminUser();
