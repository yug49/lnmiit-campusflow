# Authentication Architecture - LNMIIT CampusFlow

## Overview

This application uses a **dual-system architecture** for user management:

```
┌─────────────────────────────────────────────────────────────┐
│                     User Login Flow                         │
└─────────────────────────────────────────────────────────────┘

1. User clicks "Login with Google"
   ↓
2. Privy handles Google OAuth authentication
   ↓
3. Privy verifies Google account (auto-creates Privy user record)
   ↓
4. Backend checks MongoDB for user email
   ↓
5. If found: User gets role from MongoDB
   If not found: Login rejected (not authorized)
   ↓
6. User redirected to appropriate dashboard
```

## System Components

### 1. Privy (Authentication Layer)

**Purpose:** Verify user identity via Google OAuth

**Responsibilities:**
- Handle Google OAuth flow
- Verify Google account ownership
- Generate and manage JWT access tokens
- Maintain user sessions
- **Auto-create user records on first login**

**What Privy DOES NOT do:**
- ❌ Store user roles
- ❌ Store permissions
- ❌ Store profile data
- ❌ Determine dashboard access

**Privy User Creation:**
- Happens **automatically** when user logs in with Google
- No manual intervention needed
- No API calls required from your backend

### 2. MongoDB (Authorization Layer)

**Purpose:** Store user data, roles, and permissions

**Responsibilities:**
- Store user profiles (name, email, contact, etc.)
- Define user roles (student, faculty, council, admin)
- Manage permissions
- Determine dashboard access
- **Pre-authorize users before first login**

**MongoDB User Creation:**
- Happens **manually** via Admin Dashboard
- Admin enters: name, email, role
- User is "pre-authorized" to access system
- User can then login with matching Google email

## User Creation Workflow

### Scenario 1: Adding a New User (Admin Workflow)

**Step 1: Admin pre-authorizes user**
```javascript
// Admin Dashboard → User Management → Add User
{
  name: "Jane Smith",
  email: "jane.smith@lnmiit.ac.in",  // Must match Google email
  role: "student",
  permissions: { /* auto-generated based on role */ }
}
```

**What happens:**
- ✅ User added to MongoDB
- ✅ Role and permissions assigned
- ⏳ User can now login
- ❌ User NOT yet in Privy (this is normal!)

**Step 2: User logs in for first time**
```
Portal → Login with Google → jane.smith@lnmiit.ac.in
```

**What happens:**
- ✅ Google authenticates user
- ✅ Privy auto-creates user record
- ✅ Backend finds user in MongoDB
- ✅ User gets role from MongoDB
- ✅ Redirected to Student Dashboard

**Step 3: After first login**
- ✅ User exists in BOTH Privy and MongoDB
- ✅ Can login anytime
- ✅ Role and permissions from MongoDB

### Scenario 2: User Tries to Login (Not Pre-Authorized)

**Attempt:**
```
Portal → Login with Google → unauthorized@example.com
```

**What happens:**
- ✅ Google authenticates user
- ✅ Privy auto-creates auth record
- ❌ Backend doesn't find user in MongoDB
- ❌ Login rejected with message: "Not authorized"
- ℹ️ User must be added by admin first

## API Flow

### Login Sequence

```javascript
// 1. Frontend: User clicks login
await privy.login();

// 2. Privy: Google OAuth (automatic)
// - User authenticates with Google
// - Privy creates user record (automatic)
// - Returns access token

// 3. Frontend: Get Privy token
const privyToken = await privy.getAccessToken();

// 4. Backend: Verify token and get user
// Request: GET /api/auth/user/:email
// Headers: { Authorization: Bearer <privyToken> }

// 5. Backend: Check MongoDB
const user = await User.findOne({ email });

// 6. Response:
if (user) {
  return {
    success: true,
    user: {
      id: user._id,
      role: user.role,
      permissions: user.permissions
    }
  };
} else {
  return {
    success: false,
    message: "Not authorized"
  };
}

// 7. Frontend: Redirect based on role
navigate(`/${user.role}/dashboard`);
```

## Database Schemas

### MongoDB User Schema
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,              // Must match Google email
  role: String,               // student|faculty|council|admin
  permissions: {
    noDues: { submit, approve },
    events: { submit, approve },
    // ... other permissions
  },
  profilePhoto: Object,
  // ... other profile fields
  createdAt: Date,
  updatedAt: Date
}
```

### Privy User Record (Auto-Created)
```javascript
{
  id: String,                 // Privy user ID
  email: {
    address: String           // Google email
  },
  google: {
    email: String,
    subject: String           // Google user ID
  },
  createdAt: Number,
  // ... Privy metadata
}
```

## Key Points

### ✅ Correct Understanding:

1. **Two separate databases:**
   - Privy database (managed by Privy)
   - MongoDB database (managed by you)

2. **Privy handles authentication:**
   - "Is this really the Google account owner?"
   - Auto-creates users on first login

3. **MongoDB handles authorization:**
   - "What role does this user have?"
   - "What can they access?"
   - Pre-authorized before first login

4. **User creation:**
   - MongoDB: Manual via Admin Dashboard (pre-authorize)
   - Privy: Automatic on first login (no action needed)

### ❌ Common Misconceptions:

1. ❌ "Users must be added to Privy manually"
   - NO - Privy auto-creates users on first login

2. ❌ "MongoDB and Privy should have same user list"
   - NO - MongoDB may have more (pre-authorized but haven't logged in yet)

3. ❌ "Need to call Privy API to create users"
   - NO - Privy handles this automatically

4. ❌ "Users in MongoDB should also be in Privy"
   - NOT YET - Only after their first login

## Verification

### How to verify system is working:

**Test 1: Check MongoDB**
```bash
# In Admin Dashboard → User Management
# You should see: All users added by admin
```

**Test 2: Check Privy Dashboard**
```
https://dashboard.privy.io/apps/your-app-id/users
# You should see: Only users who have logged in at least once
# This will be LESS than MongoDB count (normal!)
```

**Test 3: Add new user**
```
1. Admin adds: test@example.com with role "student"
2. Check MongoDB: ✅ User exists
3. Check Privy: ❌ User doesn't exist (expected!)
4. User logs in with test@example.com
5. Check Privy: ✅ User now exists
6. User sees Student Dashboard
```

## Troubleshooting

### User can't login

**Check 1: Is user in MongoDB?**
```
Admin Dashboard → User Management → Search for email
```
- If NO: Add user via Admin Dashboard
- If YES: Continue to Check 2

**Check 2: Does email match exactly?**
```
MongoDB email: john.doe@lnmiit.ac.in
Google email:  john.doe@lnmiit.ac.in  ✅ Match
Google email:  johndoe@lnmiit.ac.in   ❌ No match
```
- Email comparison is case-insensitive
- Must be exact match otherwise

**Check 3: Is user using Google to login?**
- User must click "Login with Google"
- Must use the same email registered in MongoDB
- Email/password login not supported

### User has wrong role

**Solution:**
```
1. Admin Dashboard → User Management
2. Find user → Click Edit
3. Change role
4. User must logout and login again
```

### Privy dashboard shows fewer users

**This is normal!**
- Privy only shows users who have logged in
- MongoDB shows all pre-authorized users
- MongoDB count >= Privy count (always)

## Summary

### What you SHOULD do:
✅ Add users via Admin Dashboard (pre-authorize)
✅ Use exact Google email addresses
✅ Verify MongoDB has correct user records
✅ Let Privy handle authentication automatically

### What you SHOULD NOT do:
❌ Try to manually create users in Privy
❌ Worry if Privy shows fewer users than MongoDB
❌ Call Privy API to create user accounts
❌ Expect users in Privy before first login

## Architecture Benefits

1. **Separation of Concerns**
   - Authentication (Privy): "Who are you?"
   - Authorization (MongoDB): "What can you do?"

2. **Simplified Management**
   - Admin only manages one system (MongoDB)
   - Privy handles complex OAuth flows

3. **Security**
   - No passwords to manage
   - Google's OAuth security
   - JWT-based sessions

4. **Flexibility**
   - Easy to change user roles
   - Complex permission structures possible
   - Independent of auth provider
