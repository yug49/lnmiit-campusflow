require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://agarwalyug1976:yugLNMIITCampusConnect@lnmiit-campusconnect.246sest.mongodb.net/lnmiit-campusflow?retryWrites=true&w=majority&appName=LNMIIT-CampusConnect";

const users = [
    {
        name: "Admin User",
        email: "22ucs039@lnmiit.ac.in",
        role: "admin",
        permissions: [],
        votingEligible: false,
        metadata: {},
        profilePhoto: {
            url: "",
            path: "",
            publicId: "",
            rolePrefix: ""
        },
        digitalSignature: {
            url: "",
            path: "",
            publicId: ""
        },
        address: {
            street: "",
            city: "",
            state: "",
            zipCode: "",
            country: ""
        },
        votingAuthorized: false
    },
    {
        name: "Student User",
        email: "22ucs233@lnmiit.ac.in",
        role: "student",
        permissions: [],
        votingEligible: false,
        metadata: {},
        profilePhoto: {
            url: "",
            path: "",
            publicId: "",
            rolePrefix: ""
        },
        digitalSignature: {
            url: "",
            path: "",
            publicId: ""
        },
        address: {
            street: "",
            city: "",
            state: "",
            zipCode: "",
            country: ""
        },
        votingAuthorized: false,
        rollNumber: "22UCS233",
        branch: "CSE",
        semester: "8"
    },
    {
        name: "Faculty Member",
        email: "22ucs218@lnmiit.ac.in",
        role: "faculty",
        permissions: [],
        votingEligible: false,
        metadata: {},
        profilePhoto: {
            url: "",
            path: "",
            publicId: "",
            rolePrefix: ""
        },
        digitalSignature: {
            url: "",
            path: "",
            publicId: ""
        },
        address: {
            street: "",
            city: "",
            state: "",
            zipCode: "",
            country: ""
        },
        votingAuthorized: false,
        department: "Computer Science"
    }
];

async function addUsers() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB successfully');

        for (const userData of users) {
            // Check if user already exists
            const existingUser = await User.findOne({ email: userData.email });
            
            if (existingUser) {
                console.log(`User ${userData.email} already exists with role: ${existingUser.role}`);
                // Update role if different
                if (existingUser.role !== userData.role) {
                    existingUser.role = userData.role;
                    await existingUser.save();
                    console.log(`✅ Updated ${userData.email} role to: ${userData.role}`);
                }
            } else {
                // Create new user
                const newUser = new User(userData);
                await newUser.save();
                console.log(`✅ Created new user: ${userData.email} with role: ${userData.role}`);
            }
        }

        console.log('\n✅ All users processed successfully!');
        console.log('\nUsers can now login with their Google accounts:');
        console.log('- 22ucs039@lnmiit.ac.in (Admin)');
        console.log('- 22ucs233@lnmiit.ac.in (Student)');
        console.log('- 22ucs218@lnmiit.ac.in (Faculty)');

        await mongoose.connection.close();
        console.log('\nDatabase connection closed.');
        process.exit(0);
    } catch (error) {
        console.error('Error adding users:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

addUsers();
