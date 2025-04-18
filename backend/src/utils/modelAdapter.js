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

// Global variable to track if we're using MongoDB or local JSON
let usingLocalStorage = false;

// Function to set storage mode
const setStorageMode = (useLocal) => {
  usingLocalStorage = useLocal;
};

// Read data from local JSON file
const readJsonData = (type) => {
  if (!JSON_FILES[type]) {
    throw new Error(`Invalid data type: ${type}`);
  }

  try {
    if (!fs.existsSync(JSON_FILES[type])) {
      fs.writeFileSync(JSON_FILES[type], JSON.stringify([]), "utf8");
      return [];
    }

    const data = fs.readFileSync(JSON_FILES[type], "utf8");
    return JSON.parse(data || "[]");
  } catch (error) {
    console.error(`Error reading ${type} data:`, error);
    return [];
  }
};

// Write data to local JSON file
const writeJsonData = (type, data) => {
  if (!JSON_FILES[type]) {
    throw new Error(`Invalid data type: ${type}`);
  }

  try {
    fs.writeFileSync(JSON_FILES[type], JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error(`Error writing ${type} data:`, error);
    return false;
  }
};

// Model adapter for User
const UserAdapter = {
  // Find a user by ID
  findById: async (id) => {
    if (!usingLocalStorage) {
      const User = require("../models/User");
      return await User.findById(id);
    }

    const users = readJsonData("users");
    return users.find((user) => user._id === id);
  },

  // Find a user by email
  findOne: async (query) => {
    if (!usingLocalStorage) {
      const User = require("../models/User");
      return await User.findOne(query);
    }

    const users = readJsonData("users");

    // Handle the case where we want to include the password
    let selectPassword = false;
    if (query.select && query.select === "+password") {
      selectPassword = true;
      delete query.select;
    }

    // Find a user that matches all fields in the query
    let user = users.find((user) => {
      for (const key in query) {
        if (user[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });

    // If no user found, return null
    if (!user) {
      return null;
    }

    // If user found and we're selecting password, add matchPassword method
    if (user && selectPassword) {
      const bcrypt = require("bcryptjs");
      const userPassword = user.password;

      user = {
        ...user,
        matchPassword: async function (enteredPassword) {
          try {
            return await bcrypt.compare(enteredPassword, userPassword);
          } catch (error) {
            console.error("Password comparison error:", error);
            return false;
          }
        },
        getSignedJwtToken: function () {
          const jwt = require("jsonwebtoken");
          return jwt.sign(
            {
              id: this._id,
              roles: this.roles,
              department: this.department,
            },
            process.env.JWT_SECRET,
            {
              expiresIn: process.env.JWT_EXPIRE,
            }
          );
        },
      };
      return user;
    }

    // If user found and we're not selecting password, remove it from the returned object
    if (user && !selectPassword) {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }

    return user;
  },

  // Create a new user
  create: async (userData) => {
    if (!usingLocalStorage) {
      const User = require("../models/User");
      return await User.create(userData);
    }

    const users = readJsonData("users");
    const bcrypt = require("bcryptjs");

    // Generate an ID if not provided
    if (!userData._id) {
      userData._id =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
    }

    // Hash the password if provided
    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
    }

    // Add createdAt if not provided
    if (!userData.createdAt) {
      userData.createdAt = new Date();
    }

    // Add user to the array
    users.push(userData);
    writeJsonData("users", users);

    // Return the user without password
    const { password, ...userWithoutPassword } = userData;
    return {
      ...userWithoutPassword,
      // Implement the getSignedJwtToken method
      getSignedJwtToken: function () {
        const jwt = require("jsonwebtoken");
        return jwt.sign(
          {
            id: this._id,
            roles: this.roles,
            department: this.department,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: process.env.JWT_EXPIRE,
          }
        );
      },
      // Implement the matchPassword method
      matchPassword: async function (enteredPassword) {
        return await bcrypt.compare(enteredPassword, userData.password);
      },
    };
  },
};

// Model adapter for Role Permission
const RolePermissionAdapter = {
  find: async (query) => {
    if (!usingLocalStorage) {
      const RolePermission = require("../models/RolePermission");
      return await RolePermission.find(query);
    }

    const rolePermissions = readJsonData("rolePermissions");

    // Handle query with $in operator for role
    if (query.role && query.role.$in) {
      const roles = query.role.$in;
      return rolePermissions.filter((rp) => roles.includes(rp.role));
    }

    // Handle simple queries
    return rolePermissions.filter((rp) => {
      for (const key in query) {
        if (rp[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });
  },
};

// Model adapter for Event
const EventAdapter = {
  find: async (query) => {
    if (!usingLocalStorage) {
      const Event = require("../models/Event");
      return await Event.find(query);
    }

    const events = readJsonData("events");

    // Return all events if no query is provided
    if (!query || Object.keys(query).length === 0) {
      return events;
    }

    // Filter events based on query
    return events.filter((event) => {
      for (const key in query) {
        if (event[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });
  },

  findById: async (id) => {
    if (!usingLocalStorage) {
      const Event = require("../models/Event");
      return await Event.findById(id);
    }

    const events = readJsonData("events");
    return events.find((event) => event._id === id);
  },

  create: async (eventData) => {
    if (!usingLocalStorage) {
      const Event = require("../models/Event");
      return await Event.create(eventData);
    }

    const events = readJsonData("events");

    // Generate an ID if not provided
    if (!eventData._id) {
      eventData._id =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
    }

    // Add createdAt if not provided
    if (!eventData.createdAt) {
      eventData.createdAt = new Date();
    }

    // Add event to the array
    events.push(eventData);
    writeJsonData("events", events);

    return eventData;
  },
};

// Export the adapters
module.exports = {
  setStorageMode,
  UserAdapter,
  RolePermissionAdapter,
  EventAdapter,
};
