# 🚀 Simplified Authentication Guide

## Overview

CampusFlow now uses **100% Privy-based authentication** - no more traditional email/password or backend JWT tokens! Everything is streamlined for simplicity and security.

## 🎯 How It Works

### For Users

1. **Single Login Page**: Visit `/` and click "Sign in with Google"
2. **Auto Role Detection**: The system automatically detects your role from the database
3. **Instant Dashboard**: You're redirected to your appropriate dashboard (Student, Faculty, Council, or Admin)

### For Administrators

- **User Management**: Add/remove users through the Admin Dashboard → User Management
- **No Passwords**: Users are identified by their Google email only
- **Role-Based Access**: Each user has a role that determines which dashboard they access

## 🔐 Technical Architecture

### What Changed

**BEFORE** (Complex):
```
User → Privy Login → Backend Verification → JWT Token → Dual Tokens → Dashboard
```

**NOW** (Simple):
```
User → Privy Login → Email Lookup → Privy Token Only → Dashboard
```

### Authentication Flow

1. **Frontend**: User clicks "Sign in with Google"
2. **Privy**: Handles Google OAuth and creates secure session
3. **Backend**: Checks if user's email exists in MongoDB
4. **Response**: Returns user role and profile data
5. **Navigation**: Auto-redirect to role-specific dashboard

### Token Management

- **Frontend**: Uses Privy's `getAccessToken()` for API calls
- **Backend**: Verifies Privy tokens using `@privy-io/server-auth`
- **Storage**: Only Privy token stored (no backend JWT needed)

## 📋 User Roles

The system supports **4 roles**, all accessing through the same login page:

| Role | Dashboard | Icon | Color |
|------|-----------|------|-------|
| **Student** | `/student/dashboard` | 🎓 | Green |
| **Faculty** | `/faculty/dashboard` | 👨‍🏫 | Blue |
| **Council** | `/council/dashboard` | 👥 | Orange |
| **Admin** | `/admin/dashboard` | 🔒 | Red |

## 🔧 Setup Instructions

### 1. Configure Privy Dashboard

1. Go to [Privy Dashboard](https://dashboard.privy.io/)
2. Navigate to **Settings → Login Methods**
3. Enable **Google OAuth**
4. Add allowed domains:
   - `http://localhost:3000` (frontend dev)
   - `http://localhost:3001` (frontend dev alternate)
   - Your production domain

### 2. Environment Variables

**Frontend** (`.env`):
```bash
REACT_APP_PRIVY_APP_ID=your_privy_app_id_here
```

**Backend** (`backend/.env`):
```bash
PRIVY_APP_ID=your_privy_app_id_here
PRIVY_APP_SECRET=your_privy_app_secret_here
```

### 3. Create First Admin User

```bash
# Connect to MongoDB
mongosh "your_mongodb_connection_string"

# Use your database
use campusflow

# Create admin user
db.users.insertOne({
  name: "Admin User",
  email: "admin@lnmiit.ac.in",  // Use your Google email
  role: "admin",
  permissions: {
    manageUsers: true,
    approveCandidatures: true,
    approveVoters: true,
    viewResults: true
  },
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### 4. Install Dependencies

```bash
# Frontend
npm install @privy-io/react-auth viem --legacy-peer-deps

# Backend
cd backend
npm install @privy-io/server-auth
```

### 5. Start the Application

```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend
npm start
```

## 👥 Adding More Users

### Via Admin Dashboard

1. Login as admin
2. Go to **User Management**
3. Click **+ Add User**
4. Fill in:
   - **Name**: Full name
   - **Email**: Their Google email (must match their Google account)
   - **Role**: student/faculty/council/admin
5. User can now login with that Google account

### Via MongoDB (Manual)

```javascript
db.users.insertOne({
  name: "John Student",
  email: "john@lnmiit.ac.in",
  role: "student",
  permissions: {
    submitNoDues: true,
    submitCandidature: true,
    castVote: true
  },
  createdAt: new Date(),
  updatedAt: new Date()
})
```

## 🔒 Security Features

✅ **Google OAuth**: Secure authentication via Google
✅ **Privy Embedded Wallets**: Blockchain wallets for future features
✅ **Token Verification**: Backend verifies every Privy token
✅ **Email-Based Authorization**: Only authorized emails can access
✅ **Role-Based Access Control**: Each role has specific permissions
✅ **No Password Storage**: No password vulnerabilities

## 🎨 Login Page UI

The landing page displays:

- **LNMIIT Logo**: Institutional branding
- **Welcome Message**: "Welcome to CampusFlow"
- **Role Indicators**: 4 colored chips showing all available roles
- **Single Login Button**: "Sign in with Google"
- **Auto-Detection Notice**: "Your role will be automatically detected"

## 🐛 Troubleshooting

### "Login with Google not allowed" Error

**Solution**: Enable Google OAuth in Privy Dashboard (Settings → Login Methods)

### "Your email is not authorized" Error

**Solution**: Admin needs to add your email to the database via User Management

### User can login but sees wrong dashboard

**Solution**: Check user's role in database - it should match their intended access level

### "Invalid or expired token" Error

**Solution**: 
1. Clear browser localStorage
2. Re-login with Google
3. Check that backend has correct `PRIVY_APP_SECRET`

## 📱 API Endpoints (Backend)

### Auth
- `GET /api/auth/user/:email` - Get user by email (role lookup)

### Users
- `GET /api/users/all` - Get all users (admin only)
- `POST /api/users/create` - Create user (admin only)
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

All other endpoints (voting, events, MOU, etc.) use the same Privy token authentication.

## 🚀 Benefits of This Architecture

1. **Simpler Code**: Removed ~500 lines of JWT authentication code
2. **Better Security**: Privy handles OAuth securely
3. **Single Source of Truth**: Only Privy tokens (no dual-token confusion)
4. **Easier Maintenance**: No password reset flows, no token refresh logic
5. **Future-Ready**: Embedded wallets ready for blockchain features
6. **Better UX**: One click login, auto role detection

## 📞 Support

If you encounter issues:

1. Check Privy Dashboard configuration
2. Verify environment variables
3. Check browser console for errors
4. Check backend logs for authentication errors
5. Ensure your email is in the database with correct role

## 🎉 You're All Set!

Users can now simply:
1. Go to the homepage
2. Click "Sign in with Google"
3. Get automatically redirected to their dashboard

No role selection, no password input, no complexity! 🎯
