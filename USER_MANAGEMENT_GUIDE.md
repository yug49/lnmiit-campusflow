# User Management Guide - LNMIIT CampusFlow

## How User Authentication Works

This application uses **Privy** for authentication and **MongoDB** for user data/roles.

### Two-Part System:

1. **Privy (Authentication)**
   - Handles Google OAuth login
   - Verifies user identity
   - Manages sessions
   - **Automatically creates users on first login** ✅

2. **MongoDB (Authorization)**
   - Stores user roles (student, faculty, council, admin)
   - Stores permissions and profile data
   - Determines dashboard access

## Adding New Users - Admin Workflow

### Step 1: Pre-Authorize User in Admin Dashboard
1. Login as admin
2. Navigate to "User Management"
3. Click "Add User"
4. Enter:
   - Name: User's full name
   - Email: **Must be their Google email** (Gmail or Google Workspace)
   - Role: Select appropriate role
5. Click "Create"

**What happens:** User is added to MongoDB database with assigned role

### Step 2: User Logs In for First Time
1. User visits the portal
2. Clicks "Login with Google"
3. Authenticates with their Google account
4. **Privy automatically creates authentication record** (no manual action needed!)
5. Backend checks MongoDB for their email
6. User is redirected to appropriate dashboard based on role

## Important Notes

### ✅ DO:
- Add users to the system via Admin Dashboard **before** they login
- Use the exact Google email they will use to login
- Verify the email is correct (typos will prevent login)

### ❌ DON'T:
- Try to manually add users to Privy dashboard (not needed!)
- Expect users to appear in Privy before their first login
- Worry if Privy dashboard shows fewer users than MongoDB

## Checking User Status

### In MongoDB (Your Database):
- Shows ALL pre-authorized users
- Check: Admin Dashboard → User Management
- This is your source of truth for roles

### In Privy Dashboard:
- Shows only users who have **logged in at least once**
- New users won't appear until after first login
- This is normal and expected behavior!

## Troubleshooting

### User can't login:
1. Check if email exists in MongoDB (Admin Dashboard → User Management)
2. Verify exact email match (case-insensitive)
3. Confirm user is using Google account to login
4. Check browser console for error messages

### User has wrong role:
1. Update role in Admin Dashboard → User Management
2. User must logout and login again to see changes

### User missing from Privy dashboard:
- **This is normal if they haven't logged in yet!**
- Privy only shows users after first authentication
- MongoDB is the authoritative source for user management

## Example Flow

**Scenario:** Adding a new student

1. **Admin action:**
   ```
   Admin Dashboard → User Management → Add User
   Name: John Doe
   Email: john.doe@lnmiit.ac.in
   Role: student
   ```

2. **MongoDB status:**
   - ✅ User exists
   - ✅ Role: student
   - ✅ Pre-authorized

3. **Privy status:**
   - ❌ User doesn't exist yet (normal!)

4. **John's first login:**
   - Visits portal → Clicks "Login with Google"
   - Google authenticates john.doe@lnmiit.ac.in
   - Privy creates auth record automatically
   - Backend finds John in MongoDB
   - John redirected to Student Dashboard

5. **Privy status after login:**
   - ✅ User exists
   - ✅ Connected to Google account

## Summary

**The system is working correctly!** When you add users via admin dashboard:
- ✅ They ARE added to MongoDB (your database)
- ✅ They CAN login immediately
- ⏳ They will appear in Privy AFTER first login

You don't need to do anything in Privy dashboard - it's fully automated! 🎉
