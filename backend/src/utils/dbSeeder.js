const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");
const RolePermission = require("../models/RolePermission");
const connectDB = require("../config/db");

// Load env variables
dotenv.config();

// Connect to database
connectDB();

// Define role permissions
const rolePermissions = [
  {
    role: "admin",
    permissions: [
      "manage_users",
      "manage_roles",
      "approve_events",
      "approve_mou",
      "approve_no_dues",
      "manage_candidature",
      "manage_voting",
      "view_all",
    ],
    description: "Administration with full access to all features",
  },
  {
    role: "student",
    permissions: [
      "view_events",
      "view_mou",
      "submit_no_dues",
      "submit_candidature",
      "cast_vote",
    ],
    description: "Regular student with basic access to campus services",
  },
  {
    role: "council_member",
    permissions: ["create_events", "view_events", "create_mou", "view_mou"],
    description: "Council member with event and MOU creation capabilities",
  },
  {
    role: "faculty",
    permissions: ["access_faculty_no_dues"],
    description: "Regular faculty with access to faculty no dues form",
  },
  {
    role: "faculty_mentor",
    permissions: ["access_faculty_no_dues", "approve_events", "approve_mou"],
    description: "Faculty mentor with event and MOU approval capabilities",
  },
  {
    role: "head_of_department",
    permissions: ["access_faculty_no_dues", "approve_no_dues"],
    description: "Head of Department with no dues approval capabilities",
  },
];

// User credentials as provided
const users = [
  // Admin
  {
    name: "Admin User",
    email: "admin@lnmiit.ac.in",
    password: "admin",
    roles: ["admin"],
  },

  // Regular Students
  {
    name: "Student 22UCS233",
    email: "22ucs233@lnmiit.ac.in",
    password: "22ucs233",
    roles: ["student"],
  },
  {
    name: "Student 22UCS218",
    email: "22ucs218@lnmiit.ac.in",
    password: "22ucs218",
    roles: ["student"],
  },
  {
    name: "Student 22UCS039",
    email: "22ucs039@lnmiit.ac.in",
    password: "22ucs039",
    roles: ["student"],
  },

  // Council Members
  {
    name: "General Secretary Science",
    email: "gsec.science@lnmiit.ac.in",
    password: "gsec",
    roles: ["student", "council_member"],
  },
  {
    name: "General Secretary Sports",
    email: "gsec.sports@lnmiit.ac.in",
    password: "gsec",
    roles: ["student", "council_member"],
  },
  {
    name: "General Secretary Cultural",
    email: "gsec.cultural@lnmiit.ac.in",
    password: "gsec",
    roles: ["student", "council_member"],
  },
  {
    name: "Festival Coordinator",
    email: "22uec097@lnmiit.ac.in",
    password: "fc",
    roles: ["student", "council_member"],
  },

  // Faculty
  {
    name: "Regular Faculty",
    email: "regularfaculty@lnmiit.ac.in",
    password: "rf",
    roles: ["faculty"],
    department: "CSE",
  },
  {
    name: "Faculty Mentor",
    email: "facultymentor@lnmiit.ac.in",
    password: "fm",
    roles: ["faculty", "faculty_mentor"],
    department: "CSE",
  },
  {
    name: "Head of Department",
    email: "headofdepartment@lnmiit.ac.in",
    password: "hod",
    roles: ["faculty", "head_of_department"],
    department: "CSE",
  },
];

// Seed database
const seedDatabase = async () => {
  try {
    // Clear existing data
    console.log("Clearing existing data...");
    await User.deleteMany();
    await RolePermission.deleteMany();
    console.log("Data cleared successfully");

    // Create role permissions
    await RolePermission.insertMany(rolePermissions);
    console.log("Role permissions created successfully");

    // Create users
    for (const userData of users) {
      await User.create(userData);
      console.log(`User created: ${userData.name} (${userData.email})`);
    }

    console.log("Database seeding completed!");
    process.exit();
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

// Run the seeder
seedDatabase();
