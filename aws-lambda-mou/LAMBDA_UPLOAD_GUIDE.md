# Phase 2: AWS Lambda Functions Upload Guide

## ✅ Files Created

All Lambda functions are ready in `aws-lambda-mou/deployment-packages/`:
- ✅ submit_mou.zip
- ✅ get_all_mous.zip
- ✅ get_mou_details.zip
- ✅ approve_mou.zip
- ✅ reject_mou.zip
- ✅ get_my_mous.zip
- ✅ delete_mou.zip

---

## 📋 Step-by-Step AWS Lambda Creation

### 🔴 IMPORTANT: CREATE EXACTLY 7 LAMBDA FUNCTIONS WITH THESE NAMES 🔴

Go to: **https://ap-south-1.console.aws.amazon.com/lambda/home?region=ap-south-1#/functions**

---

## Function 1: Submit MOU

### Step 1: Create Function
1. Click **"Create function"** button
2. Select **"Author from scratch"**
3. Configure:
   - **Function name**: `CampusFlow-SubmitMOU`
   - **Runtime**: `Python 3.11`
   - **Architecture**: `x86_64`
   - **Permissions**: 
     - Expand "Change default execution role"
     - Select **"Use an existing role"**
     - Choose: `CampusFlow-MOU-Lambda-Role`
4. Click **"Create function"**

### Step 2: Upload Code
1. In the function page, go to **"Code"** tab
2. Click **"Upload from"** → **".zip file"**
3. Click **"Upload"** button
4. Select file: `deployment-packages/submit_mou.zip`
5. Click **"Save"**

### Step 3: Configure Settings
1. Go to **"Configuration"** tab → **"General configuration"**
2. Click **"Edit"**
3. Set:
   - **Timeout**: `30` seconds
   - **Memory**: `256` MB
4. Click **"Save"**

### ✅ Function 1 Complete!

---

## Function 2: Get All MOUs

Repeat the same process:

### Step 1: Create Function
- **Function name**: `CampusFlow-GetAllMOUs`
- **Runtime**: `Python 3.11`
- **Role**: `CampusFlow-MOU-Lambda-Role`

### Step 2: Upload Code
- Upload file: `deployment-packages/get_all_mous.zip`

### Step 3: Configure
- **Timeout**: `30` seconds
- **Memory**: `256` MB

---

## Function 3: Get MOU Details

### Step 1: Create Function
- **Function name**: `CampusFlow-GetMOUDetails`
- **Runtime**: `Python 3.11`
- **Role**: `CampusFlow-MOU-Lambda-Role`

### Step 2: Upload Code
- Upload file: `deployment-packages/get_mou_details.zip`

### Step 3: Configure
- **Timeout**: `30` seconds
- **Memory**: `256` MB

---

## Function 4: Approve MOU

### Step 1: Create Function
- **Function name**: `CampusFlow-ApproveMOU`
- **Runtime**: `Python 3.11`
- **Role**: `CampusFlow-MOU-Lambda-Role`

### Step 2: Upload Code
- Upload file: `deployment-packages/approve_mou.zip`

### Step 3: Configure
- **Timeout**: `30` seconds
- **Memory**: `256` MB

---

## Function 5: Reject MOU

### Step 1: Create Function
- **Function name**: `CampusFlow-RejectMOU`
- **Runtime**: `Python 3.11`
- **Role**: `CampusFlow-MOU-Lambda-Role`

### Step 2: Upload Code
- Upload file: `deployment-packages/reject_mou.zip`

### Step 3: Configure
- **Timeout**: `30` seconds
- **Memory**: `256` MB

---

## Function 6: Get My MOUs

### Step 1: Create Function
- **Function name**: `CampusFlow-GetMyMOUs`
- **Runtime**: `Python 3.11`
- **Role**: `CampusFlow-MOU-Lambda-Role`

### Step 2: Upload Code
- Upload file: `deployment-packages/get_my_mous.zip`

### Step 3: Configure
- **Timeout**: `30` seconds
- **Memory**: `256` MB

---

## Function 7: Delete MOU

### Step 1: Create Function
- **Function name**: `CampusFlow-DeleteMOU`
- **Runtime**: `Python 3.11`
- **Role**: `CampusFlow-MOU-Lambda-Role`

### Step 2: Upload Code
- Upload file: `deployment-packages/delete_mou.zip`

### Step 3: Configure
- **Timeout**: `30` seconds
- **Memory**: `256` MB

---

## ✅ Verification Checklist

After creating all 7 functions, verify:

- [ ] All functions have **Python 3.11** runtime
- [ ] All functions use **CampusFlow-MOU-Lambda-Role** execution role
- [ ] All functions have **30 seconds** timeout
- [ ] All functions have **256 MB** memory
- [ ] All functions show "Last modified" date (confirms upload worked)

---

## 🔴 IMPORTANT NOTES 🔴

1. **Region**: ALL functions MUST be in `ap-south-1` (Mumbai) region
2. **Handler**: Should automatically be set to `lambda_function.lambda_handler` (DO NOT CHANGE)
3. **IAM Role ARN**: Should show `arn:aws:iam::604216967884:role/CampusFlow-MOU-Lambda-Role`

---

## 🧪 Optional: Test a Function

To test if upload worked:

1. Click on `CampusFlow-GetAllMOUs` function
2. Go to **"Test"** tab
3. Click **"Create new event"**
4. Event name: `TestEvent`
5. Event JSON: `{}`
6. Click **"Save"**
7. Click **"Test"** button
8. Check response - should return `{"mous": [], "count": 0}` (empty list is OK, no errors means it works!)

---

## 📝 Quick Copy-Paste Checklist

```
✅ CampusFlow-SubmitMOU      → submit_mou.zip
✅ CampusFlow-GetAllMOUs     → get_all_mous.zip
✅ CampusFlow-GetMOUDetails  → get_mou_details.zip
✅ CampusFlow-ApproveMOU     → approve_mou.zip
✅ CampusFlow-RejectMOU      → reject_mou.zip
✅ CampusFlow-GetMyMOUs      → get_my_mous.zip
✅ CampusFlow-DeleteMOU      → delete_mou.zip
```

---

## Next Step

After completing all 7 Lambda functions:
👉 **Proceed to Phase 3: API Gateway Configuration**

This will connect your Lambda functions to HTTP endpoints that your frontend can call.
