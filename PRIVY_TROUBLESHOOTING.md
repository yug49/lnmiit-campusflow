# Privy Integration Troubleshooting

## Error: "Login with Google not allowed" (403 Forbidden)

### Symptoms
```
POST https://auth.privy.io/api/v1/oauth/init 403 (Forbidden)
Uncaught (in promise) n: Login with Google not allowed
```

### Solution Checklist

#### ✅ Step 1: Enable Google OAuth in Privy Dashboard
1. Go to [Privy Dashboard](https://dashboard.privy.io)
2. Select your app: **Your App Name**
3. Navigate to **Settings** → **Login Methods**
4. Find **Google** in the list
5. Click **Enable** or toggle it ON
6. Click **Save** or **Update**

#### ✅ Step 2: Add Allowed Domains
1. In Privy Dashboard, go to **Settings** → **Basics**
2. Find **Allowed domains** or **Redirect URIs** section
3. Add these domains (one per line):
   ```
   http://localhost:3001
   http://localhost:3000
   ```
4. For production, add:
   ```
   https://your-production-domain.com
   https://your-production-domain.vercel.app
   ```
5. Click **Save**

#### ✅ Step 3: Verify App ID
1. In Privy Dashboard, check your **App ID**
2. Compare with your `.env` file:
   ```env
   REACT_APP_PRIVY_APP_ID=cmhts45j400ajjv0cecqu7mb4
   ```
3. They should match exactly

#### ✅ Step 4: Restart Development Server
After making changes in Privy Dashboard:
```bash
# Stop the server (Ctrl+C)
# Start again
npm start
```

#### ✅ Step 5: Clear Browser Cache
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select **Empty Cache and Hard Reload**
4. Try logging in again

---

## Other Common Errors

### Error: MetaMask Ethereum Provider Conflict

**Symptoms:**
```
MetaMask encountered an error setting the global Ethereum provider
Cannot set property ethereum of #<Window> which has only a getter
```

**Cause:** MetaMask extension conflicts with Privy's wallet provider

**Solution:** This is a warning and can be ignored. It doesn't affect Privy authentication.

**Optional Fix:**
- Disable MetaMask extension while developing, OR
- Use a different browser profile without MetaMask

---

### Error: `supportedChains` must contain at least one chain

**Symptoms:**
```
Uncaught Error: `supportedChains` must contain at least one chain
```

**Cause:** Privy requires at least one blockchain network to be configured

**Solution:** Already fixed in `PrivyProviderWrapper.js`:
```javascript
import { mainnet, sepolia } from 'viem/chains';

// In config:
supportedChains: [mainnet, sepolia],
defaultChain: mainnet,
```

---

### Error: WebSocket Connection Failed

**Symptoms:**
```
WebSocket connection to 'ws://localhost:3001/ws' failed
```

**Cause:** React DevTools or Hot Module Replacement trying to connect

**Solution:** This is normal and can be ignored. It's just the development server trying to establish hot reload.

---

## Verification Steps

After configuring Privy Dashboard, verify:

1. **Privy Dashboard Checklist:**
   - [ ] App created
   - [ ] Google OAuth enabled
   - [ ] Allowed domains added (localhost:3001, localhost:3000)
   - [ ] App ID matches .env file

2. **Environment Variables Checklist:**
   - [ ] `.env` file exists in root directory
   - [ ] `REACT_APP_PRIVY_APP_ID` is set
   - [ ] App ID matches Privy Dashboard

3. **Test Login:**
   - [ ] Navigate to http://localhost:3001
   - [ ] Click "Admin" role
   - [ ] Click "Sign in with Google"
   - [ ] Privy modal should open
   - [ ] Google login should work

---

## Still Having Issues?

### Check Console for Specific Errors
1. Open Browser DevTools (F12)
2. Go to **Console** tab
3. Look for error messages
4. Check **Network** tab for failed requests

### Verify Privy Status
1. Check [Privy Status Page](https://status.privy.io)
2. Ensure all services are operational

### Contact Support
- **Privy Docs:** https://docs.privy.io
- **Privy Discord:** https://discord.gg/privy
- **Privy Support:** support@privy.io

---

## Quick Reference

### Your Current Configuration

**App ID:** `cmhts45j400ajjv0cecqu7mb4`

**Allowed Domains (should be set in Privy):**
- http://localhost:3001
- http://localhost:3000
- Your production domain (when deploying)

**Enabled Login Methods:**
- ✅ Google OAuth

**Supported Chains:**
- Ethereum Mainnet
- Sepolia Testnet

---

**Last Updated:** November 2025
