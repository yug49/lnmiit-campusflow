# Phase 3: API Gateway Configuration Guide

## Overview
Connect your 7 Lambda functions to HTTP endpoints that your frontend can call.

---

## 🔴 STEP 1: CREATE REST API 🔴

1. Go to **API Gateway Console**: https://ap-south-1.console.aws.amazon.com/apigateway/main/apis?region=ap-south-1

2. Click **"Create API"**

3. Find **"REST API"** (NOT REST API Private) and click **"Build"**

4. Configure:
   - **Protocol**: REST
   - **Create new API**: New API
   - **API name**: `CampusFlow-MOU-API`
   - **Description**: `MOU Management System API`
   - **Endpoint Type**: Regional
   
5. Click **"Create API"**

---

## 🔴 STEP 2: CREATE /mou RESOURCE 🔴

1. In the API you just created, click **"Actions"** dropdown → **"Create Resource"**

2. Configure:
   - **Resource Name**: `mou`
   - **Resource Path**: `mou`
   - ✅ Check **"Enable API Gateway CORS"**
   
3. Click **"Create Resource"**

---

## 🔴 STEP 3: CREATE POST /mou (Submit MOU) 🔴

### 3.1: Create Method
1. Click on `/mou` resource
2. Click **"Actions"** → **"Create Method"**
3. Select **POST** from dropdown
4. Click the ✓ checkmark

### 3.2: Setup Integration
1. **Integration type**: Lambda Function
2. ✅ Check **"Use Lambda Proxy integration"**
3. **Lambda Region**: `ap-south-1`
4. **Lambda Function**: `BTP_submit_mou` (should autocomplete)
5. Click **"Save"**
6. Click **"OK"** on the permission popup

---

## 🔴 STEP 4: CREATE GET /mou (Get All MOUs) 🔴

### 4.1: Create Method
1. Click on `/mou` resource again
2. Click **"Actions"** → **"Create Method"**
3. Select **GET** from dropdown
4. Click the ✓ checkmark

### 4.2: Setup Integration
1. **Integration type**: Lambda Function
2. ✅ Check **"Use Lambda Proxy integration"**
3. **Lambda Region**: `ap-south-1`
4. **Lambda Function**: `BTP_get_all_mous`
5. Click **"Save"**
6. Click **"OK"** on the permission popup

---

## 🔴 STEP 5: CREATE /mou/{mouId} RESOURCE 🔴

### 5.1: Create Resource
1. Click on `/mou` resource
2. Click **"Actions"** → **"Create Resource"**
3. Configure:
   - **Resource Name**: `mouId`
   - **Resource Path**: `{mouId}` (must have curly braces!)
   - ✅ Check **"Enable API Gateway CORS"**
4. Click **"Create Resource"**

---

## 🔴 STEP 6: CREATE GET /mou/{mouId} (Get MOU Details) 🔴

### 6.1: Create Method
1. Click on `/mou/{mouId}` resource
2. Click **"Actions"** → **"Create Method"**
3. Select **GET** from dropdown
4. Click the ✓ checkmark

### 6.2: Setup Integration
1. **Integration type**: Lambda Function
2. ✅ Check **"Use Lambda Proxy integration"**
3. **Lambda Region**: `ap-south-1`
4. **Lambda Function**: `BTP_get_mou_details`
5. Click **"Save"**
6. Click **"OK"**

---

## 🔴 STEP 7: CREATE DELETE /mou/{mouId} (Delete MOU) 🔴

### 7.1: Create Method
1. Click on `/mou/{mouId}` resource
2. Click **"Actions"** → **"Create Method"**
3. Select **DELETE** from dropdown
4. Click the ✓ checkmark

### 7.2: Setup Integration
1. **Integration type**: Lambda Function
2. ✅ Check **"Use Lambda Proxy integration"**
3. **Lambda Region**: `ap-south-1`
4. **Lambda Function**: `BTP_delete_mou`
5. Click **"Save"**
6. Click **"OK"**

---

## 🔴 STEP 8: CREATE /mou/approve RESOURCE 🔴

### 8.1: Create Resource
1. Click on `/mou` resource (NOT /mou/{mouId})
2. Click **"Actions"** → **"Create Resource"**
3. Configure:
   - **Resource Name**: `approve`
   - **Resource Path**: `approve`
   - ✅ Check **"Enable API Gateway CORS"**
4. Click **"Create Resource"**

### 8.2: Create POST Method
1. Click on `/mou/approve` resource
2. Click **"Actions"** → **"Create Method"**
3. Select **POST** from dropdown
4. Click the ✓ checkmark

### 8.3: Setup Integration
1. **Integration type**: Lambda Function
2. ✅ Check **"Use Lambda Proxy integration"**
3. **Lambda Region**: `ap-south-1`
4. **Lambda Function**: `BTP_approve_mou`
5. Click **"Save"**
6. Click **"OK"**

---

## 🔴 STEP 9: CREATE /mou/reject RESOURCE 🔴

### 9.1: Create Resource
1. Click on `/mou` resource
2. Click **"Actions"** → **"Create Resource"**
3. Configure:
   - **Resource Name**: `reject`
   - **Resource Path**: `reject`
   - ✅ Check **"Enable API Gateway CORS"**
4. Click **"Create Resource"**

### 9.2: Create POST Method
1. Click on `/mou/reject` resource
2. Click **"Actions"** → **"Create Method"**
3. Select **POST** from dropdown
4. Click the ✓ checkmark

### 9.3: Setup Integration
1. **Integration type**: Lambda Function
2. ✅ Check **"Use Lambda Proxy integration"**
3. **Lambda Region**: `ap-south-1`
4. **Lambda Function**: `BTP_reject_mou`
5. Click **"Save"**
6. Click **"OK"**

---

## 🔴 STEP 10: CREATE /mou/my RESOURCE 🔴

### 10.1: Create Resource
1. Click on `/mou` resource
2. Click **"Actions"** → **"Create Resource"**
3. Configure:
   - **Resource Name**: `my`
   - **Resource Path**: `my`
   - ✅ Check **"Enable API Gateway CORS"**
4. Click **"Create Resource"**

### 10.2: Create GET Method
1. Click on `/mou/my` resource
2. Click **"Actions"** → **"Create Method"**
3. Select **GET** from dropdown
4. Click the ✓ checkmark

### 10.3: Setup Integration
1. **Integration type**: Lambda Function
2. ✅ Check **"Use Lambda Proxy integration"**
3. **Lambda Region**: `ap-south-1`
4. **Lambda Function**: `BTP_get_my_mous`
5. Click **"Save"**
6. Click **"OK"**

---

## 🔴 STEP 11: ENABLE CORS FOR ALL RESOURCES 🔴

For **EACH** resource (`/mou`, `/mou/{mouId}`, `/mou/approve`, `/mou/reject`, `/mou/my`):

1. Click on the resource
2. Click **"Actions"** → **"Enable CORS"**
3. Keep default settings:
   - Access-Control-Allow-Methods: `DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT`
   - Access-Control-Allow-Headers: `Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token`
   - Access-Control-Allow-Origin: `'*'`
4. Click **"Enable CORS and replace existing CORS headers"**
5. Click **"Yes, replace existing values"**

---

## 🔴 STEP 12: DEPLOY API 🔴

### 12.1: Create Deployment
1. Click **"Actions"** → **"Deploy API"**
2. Configure:
   - **Deployment stage**: [New Stage]
   - **Stage name**: `prod`
   - **Stage description**: `Production deployment`
   - **Deployment description**: `Initial MOU API deployment`
3. Click **"Deploy"**

### 12.2: Get Invoke URL
1. After deployment, you'll see **"Invoke URL"** at the top
2. **COPY THIS URL** - it looks like: `https://xxxxxxxxxx.execute-api.ap-south-1.amazonaws.com/prod`

# 🔴 SAVE THIS URL - YOU NEED IT FOR FRONTEND! 🔴

---

## 🔴 STEP 13: ENABLE BINARY MEDIA TYPES 🔴

(Required for file uploads/downloads)

1. Click on your API name in the left sidebar (top level)
2. Click **"Settings"** in the left menu
3. Scroll to **"Binary Media Types"**
4. Click **"Add Binary Media Type"**
5. Add these types one by one:
   - `application/pdf`
   - `image/png`
   - `image/jpeg`
   - `multipart/form-data`
   - `*/*`
6. Click **"Save Changes"**

### 13.2: Redeploy API
1. Click **"Resources"** in left menu
2. Click **"Actions"** → **"Deploy API"**
3. Select **Deployment stage**: `prod`
4. Click **"Deploy"**

---

## ✅ VERIFICATION CHECKLIST

Your API structure should look like this:

```
CampusFlow-MOU-API
└── /
    └── /mou
        ├── POST    → BTP_submit_mou
        ├── GET     → BTP_get_all_mous
        ├── /approve
        │   └── POST → BTP_approve_mou
        ├── /reject
        │   └── POST → BTP_reject_mou
        ├── /my
        │   └── GET  → BTP_get_my_mous
        └── /{mouId}
            ├── GET    → BTP_get_mou_details
            └── DELETE → BTP_delete_mou
```

---

## 🧪 TEST YOUR API

### Test GET /mou (should return empty list)

```bash
curl https://YOUR_INVOKE_URL/prod/mou
```

Expected response:
```json
{"mous": [], "count": 0}
```

---

## 📝 YOUR API ENDPOINTS

After deployment, your endpoints will be:

```
POST   https://YOUR_INVOKE_URL/prod/mou           → Submit MOU
GET    https://YOUR_INVOKE_URL/prod/mou           → Get all MOUs
GET    https://YOUR_INVOKE_URL/prod/mou/{mouId}   → Get MOU details
DELETE https://YOUR_INVOKE_URL/prod/mou/{mouId}   → Delete MOU
POST   https://YOUR_INVOKE_URL/prod/mou/approve   → Approve MOU
POST   https://YOUR_INVOKE_URL/prod/mou/reject    → Reject MOU
GET    https://YOUR_INVOKE_URL/prod/mou/my        → Get my MOUs
```

---

## 🔴 IMPORTANT: SAVE YOUR INVOKE URL 🔴

You'll need this URL for Phase 4 (Frontend Integration).

**Example**: `https://abc123xyz.execute-api.ap-south-1.amazonaws.com/prod`

---

## Next Step

After completing API Gateway setup:
👉 **Proceed to Phase 4: Frontend Integration**
