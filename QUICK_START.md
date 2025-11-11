# 🚀 Quick Start Guide - Privy Integration

## Prerequisites
- Node.js (v16 or higher)
- MongoDB database
- Privy account (free at https://dashboard.privy.io)

## 1. Get Privy Credentials (5 minutes)

1. Go to https://dashboard.privy.io
2. Click "Create App" or sign in to existing account
3. Note your **App ID** from the dashboard
4. (Optional) Create a **Client ID** in Settings > App Clients
5. Go to **Login Methods** and enable "Google"
6. Add **Allowed Domains**:
   - Development: `http://localhost:3000`
   - Production: Your production domain

## 2. Set Up Environment Variables

### Frontend (create `.env` in root folder)
```bash
REACT_APP_PRIVY_APP_ID=clxxxxx...  # Your Privy App ID
REACT_APP_PRIVY_CLIENT_ID=client_xxx...  # Optional
REACT_APP_API_BASE_URL=http://localhost:5001
```

### Backend (create `backend/.env`)
```bash
PORT=5001
NODE_ENV=development
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRE=30d
```

## 3. Install Dependencies

```bash
# Frontend
npm install --legacy-peer-deps

# Backend
cd backend
npm install
```

## 4. Create First Admin User

Connect to your MongoDB (via MongoDB Compass, Atlas UI, or mongosh) and run:

```javascript
db.users.insertOne({
  name: "Admin User",
  email: "your-google-account@gmail.com",  // IMPORTANT: Use your actual Google email
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
  votingAuthorized: false,
  createdAt: new Date(),
  updatedAt: new Date()
});
```

## 5. Start the Application

```bash
# Option 1: Run both frontend and backend together
npm run dev

# Option 2: Run separately in different terminals

# Terminal 1 - Frontend
npm start

# Terminal 2 - Backend  
cd backend
npm run dev
```

## 6. First Login

1. Open http://localhost:3000
2. Click on "Admin" role
3. Click "Sign in with Google"
4. Sign in with the Google account you used in Step 4
5. You should be redirected to the Admin Dashboard

## 7. Add More Users

1. In Admin Dashboard, click "User Management"
2. Click "Add User"
3. Fill in:
   - **Name**: User's full name
   - **Email**: Their Google account email
   - **Role**: student, faculty, council, or admin
4. Click "Create"
5. They can now log in with their Google account!

## Troubleshooting

### ❌ "User not authorized"
- Make sure the user's email exists in the database
- Email in database must match their Google account email EXACTLY

### ❌ Privy modal doesn't open
- Check that `REACT_APP_PRIVY_APP_ID` is set correctly
- Check browser console for errors
- Make sure you're using the correct App ID from Privy dashboard

### ❌ "Authentication failed"
- Check MongoDB connection in backend/.env
- Check backend logs for errors
- Verify JWT_SECRET is set

### ❌ Backend won't start
- Make sure MongoDB URI is correct
- Check if port 5001 is already in use
- Run `cd backend && npm install` again

## Next Steps

- ✅ Read `PRIVY_SETUP.md` for detailed configuration
- ✅ Read `PRIVY_INTEGRATION_SUMMARY.md` for technical details
- ✅ Add more users via User Management
- ✅ Configure Privy for production deployment

## Need Help?

- 📚 Privy Docs: https://docs.privy.io
- 💬 Privy Discord: https://discord.gg/privy
- 🎯 Privy Dashboard: https://dashboard.privy.io

---

**That's it! You're ready to go! 🎉**
