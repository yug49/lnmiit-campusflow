const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

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

// Hash password for user data
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// User credentials as provided
const seedUsers = async () => {
  const users = [
    // Admin
    {
      _id: generateId(),
      name: "Admin User",
      email: "admin@lnmiit.ac.in",
      password: await hashPassword("admin"),
      roles: ["admin"],
      createdAt: new Date(),
    },

    // Regular Students
    {
      _id: generateId(),
      name: "Student 22UCS233",
      email: "22ucs233@lnmiit.ac.in",
      password: await hashPassword("22ucs233"),
      roles: ["student"],
      createdAt: new Date(),
    },
    {
      _id: generateId(),
      name: "Student 22UCS218",
      email: "22ucs218@lnmiit.ac.in",
      password: await hashPassword("22ucs218"),
      roles: ["student"],
      createdAt: new Date(),
    },
    {
      _id: generateId(),
      name: "Student 22UCS039",
      email: "22ucs039@lnmiit.ac.in",
      password: await hashPassword("22ucs039"),
      roles: ["student"],
      createdAt: new Date(),
    },

    // Council Members
    {
      _id: generateId(),
      name: "General Secretary Science",
      email: "gsec.science@lnmiit.ac.in",
      password: await hashPassword("gsec"),
      roles: ["student", "council_member"],
      createdAt: new Date(),
    },
    {
      _id: generateId(),
      name: "General Secretary Sports",
      email: "gsec.sports@lnmiit.ac.in",
      password: await hashPassword("gsec"),
      roles: ["student", "council_member"],
      createdAt: new Date(),
    },
    {
      _id: generateId(),
      name: "General Secretary Cultural",
      email: "gsec.cultural@lnmiit.ac.in",
      password: await hashPassword("gsec"),
      roles: ["student", "council_member"],
      createdAt: new Date(),
    },
    {
      _id: generateId(),
      name: "Festival Coordinator",
      email: "22uec097@lnmiit.ac.in",
      password: await hashPassword("fc"),
      roles: ["student", "council_member"],
      createdAt: new Date(),
    },

    // Faculty
    {
      _id: generateId(),
      name: "Regular Faculty",
      email: "regularfaculty@lnmiit.ac.in",
      password: await hashPassword("rf"),
      roles: ["faculty"],
      department: "CSE",
      createdAt: new Date(),
    },
    {
      _id: generateId(),
      name: "Faculty Mentor",
      email: "facultymentor@lnmiit.ac.in",
      password: await hashPassword("fm"),
      roles: ["faculty", "faculty_mentor"],
      department: "CSE",
      createdAt: new Date(),
    },
    {
      _id: generateId(),
      name: "Head of Department",
      email: "headofdepartment@lnmiit.ac.in",
      password: await hashPassword("hod"),
      roles: ["faculty", "head_of_department"],
      department: "CSE",
      createdAt: new Date(),
    },
  ];

  return users;
};

// Generate a MongoDB-like ID
function generateId() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

// Seed database
const seedLocalData = async () => {
  try {
    console.log("Creating local JSON data files...");

    // Seed role permissions
    fs.writeFileSync(
      JSON_FILES.rolePermissions,
      JSON.stringify(
        rolePermissions.map((rp) => ({
          _id: generateId(),
          ...rp,
        }))
      ),
      "utf8"
    );
    console.log("Role permissions created successfully");

    // Seed users
    const users = await seedUsers();
    fs.writeFileSync(JSON_FILES.users, JSON.stringify(users), "utf8");
    console.log("Users created successfully");

    // Initialize empty collections for other data types
    fs.writeFileSync(JSON_FILES.events, JSON.stringify([]), "utf8");
    fs.writeFileSync(JSON_FILES.mous, JSON.stringify([]), "utf8");
    fs.writeFileSync(JSON_FILES.noDues, JSON.stringify([]), "utf8");

    console.log("Local data seeding completed!");
  } catch (error) {
    console.error("Error seeding local data:", error);
    process.exit(1);
  }
};

// Run the seeder
seedLocalData();
