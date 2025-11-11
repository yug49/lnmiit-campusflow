# ⚠️ IMPORTANT: Privy Credentials Security

## ✅ Correct Configuration

### Frontend (`.env` in root folder)
```env
# PUBLIC - Safe to expose
REACT_APP_PRIVY_APP_ID=cmhts45j400ajjv0cecqu7mb4

# OPTIONAL - Only if using app clients
# REACT_APP_PRIVY_CLIENT_ID=your-client-id
```

### Backend (`backend/.env`)
```env
# PUBLIC
PRIVY_APP_ID=cmhts45j400ajjv0cecqu7mb4

# 🔒 SECRET - NEVER expose this!
PRIVY_APP_SECRET=omJtcySDzfEerp3NYTJGbikvEN6...
```

## 🔑 Credential Types

| Credential | Type | Location | Public? | Purpose |
|------------|------|----------|---------|---------|
| **App ID** | Public | Frontend & Backend | ✅ Yes | Identifies your app |
| **App Secret** | Secret | Backend only | ❌ NO! | Verifies tokens server-side |
| **Client ID** | Public | Frontend (optional) | ✅ Yes | Multi-environment support |

## 📍 Where to Find in Privy Dashboard

1. **App ID**: 
   - Dashboard home > Your app name
   - Format: `clxxxxx...`

2. **App Secret**:
   - Settings > API Keys > "App secret"
   - ⚠️ Treat like a password!

3. **Client ID** (optional):
   - Settings > App Clients > Create client
   - Format: `client_xxxxx...`

## 🚨 Security Checklist

- [x] ✅ App Secret moved from frontend to backend `.env`
- [ ] ✅ Add `.env` to `.gitignore` (should already be there)
- [ ] ✅ Never commit secrets to git
- [ ] ✅ Use environment variables in production (Vercel, Netlify, etc.)
- [ ] ✅ Rotate App Secret if accidentally exposed

## 📝 Summary

**What you had before** (❌ WRONG):
```env
# Frontend .env - WRONG!
REACT_APP_PRIVY_SECRET=omJtcySDz...  # ❌ Secret exposed in frontend!
```

**What you have now** (✅ CORRECT):
```env
# Frontend .env - CORRECT
REACT_APP_PRIVY_APP_ID=cmhts45j...  # ✅ Public, safe to expose

# Backend .env - CORRECT  
PRIVY_APP_SECRET=omJtcySDz...  # ✅ Secret, kept server-side only
```

## 🔄 If You Need to Rotate Secret

If you accidentally exposed your App Secret:

1. Go to Privy Dashboard
2. Settings > API Keys
3. Click "Rotate app secret"
4. Update `backend/.env` with new secret
5. Restart your backend server

---

**Your configuration is now secure! ✅**
