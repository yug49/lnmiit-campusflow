# Environment Variables for Vercel Deployment

## Copy these to Vercel Dashboard → Settings → Environment Variables

### Backend Variables (Production)

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

### Frontend Variables (Production)

```
REACT_APP_PRIVY_APP_ID=cmhts45j400ajjv0cecqu7mb4
REACT_APP_API_BASE_URL=https://YOUR-PROJECT-NAME.vercel.app
```

⚠️ **Replace `YOUR-PROJECT-NAME` with your actual Vercel project URL after first deployment!**

---

## Quick Steps to Add in Vercel:

1. Go to your project on Vercel
2. Click **Settings** → **Environment Variables**
3. For each variable:
   - Enter **Name** (e.g., `MONGO_URI`)
   - Enter **Value** (copy from above)
   - Select environment: **Production** (and optionally Preview/Development)
   - Click **Save**

4. After adding all variables, **redeploy** your project

---

## Security Notes:

- ✅ Never commit these to Git
- ✅ Keep PRIVY_APP_SECRET secure
- ✅ Rotate JWT_SECRET periodically
- ✅ Use different secrets for dev/production
