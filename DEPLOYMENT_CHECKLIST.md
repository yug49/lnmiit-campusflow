# 🚀 Vercel Deployment Checklist

## ✅ Pre-Deployment Verification

### Files & Configuration
- [x] `vercel.json` - Vercel configuration file
- [x] `.vercelignore` - Ignore unnecessary files
- [x] `deploy-vercel.sh` - Automated deployment script
- [x] `VERCEL_DEPLOYMENT_GUIDE.md` - Complete deployment guide
- [x] `VERCEL_ENV_VARIABLES.md` - Environment variables reference
- [x] `backend/api/index.js` - All routes properly imported
- [x] `backend/api/server.js` - Serverless function handler
- [x] `package.json` - Build scripts configured
- [x] Production build tested locally

### Services Configuration
- [x] **MongoDB Atlas**: Connection string ready
  - Database: `lnmiit-campusflow`
  - Cluster: `LNMIIT-CampusConnect`
  - Whitelist: `0.0.0.0/0` for Vercel

- [x] **Cloudinary**: Credentials ready
  - Cloud: `dt2snuuut`
  - API configured for file uploads

- [x] **Privy**: Authentication configured
  - App ID: `cmhts45j400ajjv0cecqu7mb4`
  - Ready for OAuth

### Code Quality
- [x] All ESLint warnings fixed
- [x] Production build completes successfully
- [x] No console errors in build
- [x] All routes tested and working

---

## 📝 Deployment Steps

### Option 1: Using Deployment Script (Easiest)
```bash
./deploy-vercel.sh
```

### Option 2: Using Vercel Dashboard
1. [ ] Push code to GitHub
2. [ ] Go to https://vercel.com/new
3. [ ] Import repository
4. [ ] Add environment variables (see VERCEL_ENV_VARIABLES.md)
5. [ ] Deploy!

### Option 3: Using Vercel CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

---

## 🔐 Environment Variables to Add in Vercel

Copy from `VERCEL_ENV_VARIABLES.md` and add in Vercel Dashboard:

### Backend (11 variables)
- [ ] `NODE_ENV`
- [ ] `PORT`
- [ ] `MONGO_URI`
- [ ] `JWT_SECRET`
- [ ] `JWT_EXPIRE`
- [ ] `PRIVY_APP_ID`
- [ ] `PRIVY_APP_SECRET`
- [ ] `CLOUDINARY_CLOUD_NAME`
- [ ] `CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`

### Frontend (2 variables)
- [ ] `REACT_APP_PRIVY_APP_ID`
- [ ] `REACT_APP_API_BASE_URL` (update after first deploy!)

---

## 🔄 Post-Deployment Steps

1. [ ] Copy your Vercel URL (e.g., `https://lnmiit-campusflow.vercel.app`)

2. [ ] **Update Environment Variable**
   - Go to Vercel → Project → Settings → Environment Variables
   - Update `REACT_APP_API_BASE_URL` to your Vercel URL
   - Redeploy

3. [ ] **Update Privy Dashboard**
   - Go to https://dashboard.privy.io
   - Navigate to your app
   - Add to Allowed Origins: `https://your-project.vercel.app`
   - Add to Redirect URIs: `https://your-project.vercel.app`

4. [ ] **Verify MongoDB Atlas**
   - Network Access whitelist includes `0.0.0.0/0`
   - Database user has read/write permissions

5. [ ] **Test Your Deployment**
   - [ ] Visit your Vercel URL
   - [ ] Test health endpoint: `https://your-url.vercel.app/api/health`
   - [ ] Test login functionality
   - [ ] Test file upload (should use Cloudinary)
   - [ ] Test QR code generation
   - [ ] Test all major features

---

## 🧪 Testing Endpoints

```bash
# Replace YOUR_URL with your actual Vercel URL

# Health Check
curl https://YOUR_URL.vercel.app/api/health

# Auth Test (should return 401)
curl https://YOUR_URL.vercel.app/api/users/profile
```

---

## 📊 Monitoring

### Vercel Dashboard
- [ ] Check deployment logs
- [ ] Monitor function execution
- [ ] Review analytics
- [ ] Set up custom domain (optional)

### Error Tracking
- [ ] Check function logs for errors
- [ ] Monitor API response times
- [ ] Track user authentication issues

---

## 🐛 Troubleshooting

### Build Fails
- Check Node.js version (should be >=16.x)
- Review build logs in Vercel dashboard
- Verify all dependencies in package.json

### API Returns 500
- Check serverless function logs
- Verify environment variables are set
- Test MongoDB connection string

### CORS Errors
- Verify Privy allowed origins
- Check backend CORS configuration
- Ensure API URL is correctly set

### Authentication Fails
- Verify Privy App ID matches
- Check Privy dashboard configuration
- Ensure redirect URIs include Vercel URL

---

## ✅ Deployment Complete!

Once all items are checked:
- ✅ Your app is live on Vercel
- ✅ Automatic deployments configured
- ✅ Production-ready and scalable
- ✅ Monitored and logged

**Next Steps:**
- Share your URL with stakeholders
- Set up custom domain (optional)
- Configure analytics
- Set up error monitoring (Sentry, etc.)

---

**Last Updated:** November 20, 2025  
**Status:** ✅ Production Ready
