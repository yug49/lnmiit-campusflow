const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const config = require("../config/config");
const connectDB = require("../config/db");
const User = require("../models/User");

// Initial users data
const users = [
  // Regular Students - all should have all student functionalities
  {
    email: "22ucs233@lnmiit.ac.in",
    password: "student",
    name: "Student 233",
    role: "student",
    permissions: {
      noDues: { submit: true, approve: false },
      events: { submit: true, approve: false },
      mou: { submit: true, approve: false },
      voting: { submit: true, approve: false, vote: true },
      facultyNoDues: false,
    },
  },
  {
    email: "22ucs218@lnmiit.ac.in",
    password: "student",
    name: "Student 218",
    role: "student",
    permissions: {
      noDues: { submit: true, approve: false },
      events: { submit: true, approve: false },
      mou: { submit: true, approve: false },
      voting: { submit: true, approve: false, vote: true },
      facultyNoDues: false,
    },
  },
  {
    email: "22ucs039@lnmiit.ac.in",
    password: "student",
    name: "Student 039",
    role: "student",
    permissions: {
      noDues: { submit: true, approve: false },
      events: { submit: true, approve: false },
      mou: { submit: true, approve: false },
      voting: { submit: true, approve: false, vote: true },
      facultyNoDues: false,
    },
  },

  // Council Members - all should have all council functionalities
  {
    email: "gsec@lnmiit.ac.in",
    password: "gsec",
    name: "General Secretary",
    role: "council",
    permissions: {
      noDues: { submit: true, approve: true },
      events: { submit: true, approve: true },
      mou: { submit: true, approve: true },
      voting: { submit: true, approve: true, vote: true },
      facultyNoDues: false,
    },
  },
  {
    email: "fc@lnmiit.ac.in",
    password: "fc",
    name: "Finance Council",
    role: "council",
    permissions: {
      noDues: { submit: true, approve: true },
      events: { submit: true, approve: true },
      mou: { submit: true, approve: true },
      voting: { submit: true, approve: true, vote: true },
      facultyNoDues: false,
    },
  },

  // Faculty - with specific permissions based on role
  {
    email: "departmentHead@lnmiit.ac.in",
    password: "faculty",
    name: "Department Head",
    role: "faculty",
    permissions: {
      noDues: { submit: false, approve: true },
      events: { submit: false, approve: false },
      mou: { submit: false, approve: false },
      voting: { submit: false, approve: false, vote: false },
      facultyNoDues: true,
    },
  },
  {
    email: "facultyHead@lnmiit.ac.in",
    password: "faculty",
    name: "Faculty Head",
    role: "faculty",
    permissions: {
      noDues: { submit: false, approve: false },
      events: { submit: false, approve: true },
      mou: { submit: false, approve: true },
      voting: { submit: false, approve: false, vote: false },
      facultyNoDues: true,
    },
  },
  {
    email: "faculty@lnmiit.ac.in",
    password: "faculty",
    name: "Regular Faculty",
    role: "faculty",
    permissions: {
      noDues: { submit: false, approve: false },
      events: { submit: false, approve: false },
      mou: { submit: false, approve: false },
      voting: { submit: false, approve: false, vote: false },
      facultyNoDues: true,
    },
  },

  // Admin - has all functionalities
  {
    email: "admin@lnmiit.ac.in",
    password: "admin",
    name: "Admin User",
    role: "admin",
    permissions: {
      noDues: { submit: true, approve: true },
      events: { submit: true, approve: true },
      mou: { submit: true, approve: true },
      voting: { submit: true, approve: true, vote: true },
      facultyNoDues: true,
    },
  },
];

// Function to insert users
const seedUsers = async () => {
  try {
    // Connect to the database
    await connectDB();
    console.log("Connected to database...");

    // Delete existing users (optional, comment out if you want to keep existing users)
    await User.deleteMany({});
    console.log("Deleted existing users...");

    // Hash passwords and create users
    const userPromises = users.map(async (user) => {
      // We don't need to manually hash passwords as it's handled by the User model's pre-save middleware
      return await User.create(user);
    });

    // Wait for all users to be created
    const createdUsers = await Promise.all(userPromises);
    console.log("Created users:");
    createdUsers.forEach((user) => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    console.log("\nUser seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding users:", error);
    process.exit(1);
  }
};

// Run the seed function
seedUsers();
