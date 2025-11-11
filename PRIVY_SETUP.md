# Privy Integration Setup Guide

## Overview
This application now uses **Privy** for authentication instead of traditional email/password login. Privy provides:
- **Google OAuth authentication** as the primary login method
- **Embedded Ethereum wallets** for future blockchain features
- **Industry-level security** and authentication
- **Private key management** for wallet operations

## Prerequisites
1. Create a Privy account at [https://dashboard.privy.io](https://dashboard.privy.io)
2. Create a new Privy application
3. Get your **App ID** and optionally a **Client ID**

## Setup Steps

### 1. Configure Privy Dashboard
1. Go to [Privy Dashboard](https://dashboard.privy.io)
2. Create a new app or select your existing app
3. Navigate to **Settings** > **Login Methods**
4. Enable **Google OAuth** as a login method
5. Configure **Embedded Wallets** (Ethereum) if needed for blockchain features
6. Add your allowed domains:
   - For development: `http://localhost:3000`
   - For production: Your production domain

### 2. Update Environment Variables

#### Frontend (.env in root directory)
```env
# Privy Configuration
REACT_APP_PRIVY_APP_ID=your-privy-app-id-here
REACT_APP_PRIVY_CLIENT_ID=your-privy-client-id-here  # Optional

# API Configuration
REACT_APP_API_BASE_URL=http://localhost:5001
```

#### Backend (backend/.env)
```env
# MongoDB Configuration
MONGODB_URI=your-mongodb-connection-string

# JWT Configuration (still used for backend sessions)
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=30d

# Other existing configurations...
```

### 3. Admin User Creation
Since user registration is now admin-controlled, you need to create the first admin user directly in MongoDB:

```javascript
// Connect to your MongoDB and run this in MongoDB shell or Compass:
db.users.insertOne({
  name: "Admin User",
  email: "admin@example.com",  // This must be a valid Google account email
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

**Important**: The email must match the Google account the admin will use to log in.

### 4. Installation

Install dependencies:
```bash
# Frontend
npm install --legacy-peer-deps

# Backend
cd backend
npm install
```

### 5. Running the Application

```bash
# Development mode (runs both frontend and backend)
npm run dev

# Or run separately:
# Terminal 1 - Frontend
npm start

# Terminal 2 - Backend
npm run server
```

## How Authentication Works

### User Flow:
1. **Admin creates users** via the Admin Dashboard > User Management
2. Admin adds user's **Google account email** and assigns a role (student/faculty/council/admin)
3. User visits the login page and selects their role
4. User clicks "Sign in with Google"
5. **Privy modal opens** for Google OAuth authentication
6. After Google login, the backend **verifies the email** exists in the database
7. Backend generates a **session token** and returns user data
8. User is redirected to their role-specific dashboard

### Technical Flow:
```
Frontend (Login.js)
    ↓
Privy Google OAuth
    ↓
Get Google Email + Privy Token
    ↓
POST /api/auth/privy-verify
    ↓
Backend verifies email exists
    ↓
Generate JWT session token
    ↓
Return user data + token
    ↓
Store in localStorage
    ↓
Redirect to dashboard
```

## User Management (Admin Only)

Admins can manage users via the **Admin Dashboard > User Management**:

### Add New User:
1. Click "Add User" button
2. Enter:
   - **Name**: Full name of the user
   - **Email**: Their Google account email (REQUIRED for login)
   - **Role**: student, faculty, council, or admin
3. Click "Create"
4. User can now log in with their Google account

### Edit User:
- Update name, role, or permissions
- Email cannot be changed (use delete + recreate if needed)

### Delete User:
- Removes user from the system
- They will no longer be able to log in

## Security Features

1. **No password storage**: Passwords are never stored in the database
2. **Google OAuth**: Industry-standard authentication
3. **Privy security**: Private keys managed securely by Privy
4. **Email verification**: Only pre-approved emails can access the system
5. **Role-based access**: Users can only access features for their role
6. **Session tokens**: Backend generates secure JWT tokens for API access

## Troubleshooting

### "User not authorized" Error
- **Cause**: Email not found in database
- **Solution**: Admin must add the user via User Management first

### Privy Modal Not Opening
- **Cause**: Missing or invalid Privy App ID
- **Solution**: Check `REACT_APP_PRIVY_APP_ID` in `.env` file

### "Authentication failed" Error
- **Cause**: Backend cannot verify Privy token or generate session
- **Solution**: Check backend logs and ensure MongoDB is connected

### Users Can't See Their Dashboard
- **Cause**: Role mismatch or missing authentication token
- **Solution**: Ensure user is logging in through the correct role path (e.g., `/login/admin`)

## Migration from Old Auth System

If you have existing users with passwords:

1. **Create a migration script** to update existing users:
```javascript
// Remove password requirement
db.users.updateMany(
  {},
  { $unset: { password: "" } }
);
```

2. **Notify all users** that they must now log in with Google
3. **Ensure their email in the database matches their Google account**

## Additional Resources

- [Privy Documentation](https://docs.privy.io)
- [Privy Dashboard](https://dashboard.privy.io)
- [Google OAuth Setup Guide](https://docs.privy.io/guide/react/recipes/login-methods/google)

## Support

For issues related to:
- **Privy authentication**: Check [Privy Docs](https://docs.privy.io) or [Privy Discord](https://discord.gg/privy)
- **Application-specific issues**: Contact your development team
