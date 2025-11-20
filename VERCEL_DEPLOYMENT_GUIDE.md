# Vercel Deployment Guide for LNMIIT CampusFlow

## ✅ Project is Vercel-Ready!

Your project has been configured for seamless deployment on Vercel. Follow these steps to deploy.

---

## 📋 Pre-Deployment Checklist

### 1. **MongoDB Atlas Setup** (Required)
- ✅ Already configured: `mongodb+srv://agarwalyug1976:yugLNMIITCampusConnect@lnmiit-campusconnect.246sest.mongodb.net/lnmiit-campusflow`
- Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0) for Vercel

### 2. **Cloudinary Setup** (Required for file uploads)
- ✅ Already configured:
  - Cloud Name: `dt2snuuut`
  - API Key: `758333313938249`
  - API Secret: Available in backend/.env

### 3. **Privy Configuration** (Required for authentication)
- ✅ Already configured:
  - App ID: `cmhts45j400ajjv0cecqu7mb4`
  - App Secret: Available in backend/.env

---

## 🚀 Deployment Steps

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Install Vercel CLI** (optional, for local testing)
   ```bash
   npm i -g vercel
   ```

2. **Push Your Code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

3. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "**Add New Project**"
   - Import your `lnmiit-campusflow` repository
   - Vercel will auto-detect the configuration from `vercel.json`

4. **Configure Environment Variables**
   
   In the Vercel dashboard, add these environment variables:

   **Backend Environment Variables:**
   ```
   NODE_ENV=production
   PORT=5001
   MONGO_URI=mongodb+srv://agarwalyug1976:yugLNMIITCampusConnect@lnmiit-campusconnect.246sest.mongodb.net/lnmiit-campusflow?retryWrites=true&w=majority&appName=LNMIIT-CampusConnect
   JWT_SECRET=lnmiit-campus-connect-jwt-secret-key-2025
   JWT_EXPIRE=24h
   PRIVY_APP_ID=cmhts45j400ajjv0cecqu7mb4
   PRIVY_APP_SECRET=omJtcySDzfEerp3NYTJGbikvEN6Do7RBSbXwapLRJRUkQHJEu6nb7aE1dSuJQdgiefxJkV3VTSY4XdwTUtmC83y
   CLOUDINARY_CLOUD_NAME=dt2snuuut
   CLOUDINARY_API_KEY=758333313938249
   CLOUDINARY_API_SECRET=s_v8LrKNE0zXieuW39toF7eYbhw
   ```

   **Frontend Environment Variables:**
   ```
   REACT_APP_PRIVY_APP_ID=cmhts45j400ajjv0cecqu7mb4
   REACT_APP_API_BASE_URL=https://your-project-name.vercel.app
   ```
   
   ⚠️ **IMPORTANT:** Replace `your-project-name` with your actual Vercel project URL after first deployment.

5. **Deploy**
   - Click "**Deploy**"
   - Wait 2-3 minutes for the build to complete
   - Your app will be live at `https://your-project-name.vercel.app`

6. **Update API URL** (After First Deployment)
   - Go to your project settings on Vercel
   - Navigate to "Environment Variables"
   - Update `REACT_APP_API_BASE_URL` to your actual Vercel URL
   - Redeploy the project

---

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd /Users/shubhtastic/Documents/lnmiit-campusflow
   vercel
   ```

4. **Follow the prompts:**
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N** (first time) or **Y** (subsequent deploys)
   - What's your project's name? `lnmiit-campusflow`
   - In which directory is your code located? `./`
   - Want to override the settings? **N**

5. **Add Environment Variables**
   ```bash
   # Add each variable using:
   vercel env add VARIABLE_NAME
   # Or add all at once via the dashboard
   ```

6. **Deploy to Production**
   ```bash
   vercel --prod
   ```

---

## 🔧 Configuration Files Explained

### `vercel.json`
- **builds**: Defines how to build your frontend (React) and backend (Node.js API)
- **routes**: Routes API calls to backend, serves static frontend files
- **env**: Production environment configuration

### `.vercelignore`
- Excludes unnecessary files from deployment (tests, local uploads, dev dependencies)

### `package.json`
- **vercel-build**: Custom build script that builds React app and installs backend dependencies
- **postinstall**: Ensures backend dependencies are installed

---

## 🌐 Post-Deployment

### Update Privy Dashboard
1. Go to [Privy Dashboard](https://dashboard.privy.io)
2. Navigate to your app settings
3. Add your Vercel URL to:
   - **Allowed origins**: `https://your-project-name.vercel.app`
   - **Redirect URIs**: `https://your-project-name.vercel.app`

### Update MongoDB Atlas
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Navigate to Network Access
3. Ensure `0.0.0.0/0` is whitelisted (for Vercel's dynamic IPs)

### Test Your Deployment
- Visit `https://your-project-name.vercel.app`
- Test login functionality
- Test API endpoints at `https://your-project-name.vercel.app/api/health`

---

## 🔄 Continuous Deployment

Once connected to GitHub:
- Every push to `main` branch triggers automatic deployment
- Pull requests create preview deployments
- View deployment logs in Vercel dashboard

---

## 📊 Monitoring & Logs

### View Logs
1. Go to Vercel Dashboard
2. Select your project
3. Click "Deployments"
4. Click on any deployment to view logs

### Function Logs (Backend API)
- Go to "Functions" tab in your project
- Click on `backend/api/server.js`
- View real-time logs and metrics

---

## ⚠️ Important Notes

1. **File Uploads**: Uses Cloudinary for production (local uploads don't work on Vercel)
2. **Environment Variables**: Never commit `.env` files to Git
3. **Cold Starts**: First API request might be slow (serverless function cold start)
4. **Build Time**: Typically 2-3 minutes per deployment
5. **Free Tier Limits**:
   - 100GB bandwidth per month
   - 100 hours of serverless function execution
   - Sufficient for development/testing

---

## 🐛 Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node version compatibility (>=16.x)

### API Not Working
- Check serverless function logs
- Verify environment variables are set correctly
- Test `/api/health` endpoint

### CORS Issues
- Update backend CORS configuration to include your Vercel URL
- Check Privy dashboard allowed origins

### Database Connection Issues
- Verify MongoDB Atlas connection string
- Check network access whitelist includes `0.0.0.0/0`
- Test connection string locally first

---

## 🎉 Success!

Your app is now live on Vercel! 

**Next Steps:**
1. Share your app URL: `https://your-project-name.vercel.app`
2. Set up custom domain (optional)
3. Monitor usage and performance
4. Set up error tracking (Sentry, LogRocket, etc.)

---

## 📞 Support

- Vercel Docs: https://vercel.com/docs
- Vercel Community: https://github.com/vercel/vercel/discussions
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com
- Privy Docs: https://docs.privy.io

---

**Deployment Date:** November 20, 2025  
**Project:** LNMIIT CampusFlow  
**Stack:** React + Node.js + MongoDB + Cloudinary + Privy
