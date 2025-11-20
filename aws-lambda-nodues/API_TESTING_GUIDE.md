# API Testing Guide - Student No-Dues Endpoints

## Base URL
```
https://dfulsdkrxg.execute-api.ap-south-1.amazonaws.com/prod
```

---

## 1. Get Approval Flow Configuration
**No authentication required**

```bash
curl https://dfulsdkrxg.execute-api.ap-south-1.amazonaws.com/prod/student-nodues/flow-config
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {"email": "hod@lnmiit.ac.in", "department": "HOD", "order": 1},
    {"email": "dean@lnmiit.ac.in", "department": "Dean", "order": 2},
    {"email": "admin@lnmiit.ac.in", "department": "Administration", "order": 3}
  ]
}
```

---

## 2. Submit Student No-Dues
**Requires: Authorization token**

```bash
curl -X POST https://dfulsdkrxg.execute-api.ap-south-1.amazonaws.com/prod/student-nodues \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_PRIVY_TOKEN" \
-d '{
  "studentInfo": {
    "name": "Test Student",
    "email": "22ucs001@lnmiit.ac.in",
    "rollNumber": "22UCS001",
    "branch": "CSE",
    "semester": "8",
    "phone": "9876543210"
  },
  "bankDetails": {
    "accountHolderName": "Test Student",
    "accountNumber": "1234567890",
    "ifscCode": "SBIN0001234",
    "bankName": "State Bank of India",
    "branchName": "Jaipur"
  },
  "donation": {
    "amount": 0,
    "purpose": "None"
  },
  "approvalFlow": [
    {"email": "hod@lnmiit.ac.in", "department": "HOD", "order": 1},
    {"email": "dean@lnmiit.ac.in", "department": "Dean", "order": 2}
  ],
  "initialSignature": "student_signature_hash",
  "walletAddress": "0x1234567890abcdef",
  "documentHash": "sha256_hash_of_document"
}'
```

---

## 3. Get My No-Dues Status
**Requires: studentEmail query param**

```bash
curl "https://dfulsdkrxg.execute-api.ap-south-1.amazonaws.com/prod/student-nodues/my-status?studentEmail=22ucs001@lnmiit.ac.in" \
-H "Authorization: Bearer YOUR_PRIVY_TOKEN"
```

---

## 4. Get Pending No-Dues (Faculty/Admin)
**Requires: approverEmail query param**

```bash
curl "https://dfulsdkrxg.execute-api.ap-south-1.amazonaws.com/prod/student-nodues/pending?approverEmail=hod@lnmiit.ac.in" \
-H "Authorization: Bearer YOUR_PRIVY_TOKEN"
```

---

## 5. Get All No-Dues
**Optional: status query param**

```bash
# All no-dues
curl "https://dfulsdkrxg.execute-api.ap-south-1.amazonaws.com/prod/student-nodues/all" \
-H "Authorization: Bearer YOUR_PRIVY_TOKEN"

# Filter by status
curl "https://dfulsdkrxg.execute-api.ap-south-1.amazonaws.com/prod/student-nodues/all?status=pending" \
-H "Authorization: Bearer YOUR_PRIVY_TOKEN"
```

---

## 6. Get No-Dues by ID

```bash
curl "https://dfulsdkrxg.execute-api.ap-south-1.amazonaws.com/prod/student-nodues/YOUR_NODUES_ID" \
-H "Authorization: Bearer YOUR_PRIVY_TOKEN"
```

---

## 7. Sign/Approve No-Dues

```bash
curl -X POST "https://dfulsdkrxg.execute-api.ap-south-1.amazonaws.com/prod/student-nodues/YOUR_NODUES_ID/sign" \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_PRIVY_TOKEN" \
-d '{
  "signature": "faculty_signature_hash",
  "walletAddress": "0xabcdef1234567890",
  "signerName": "HOD Name",
  "signerEmail": "hod@lnmiit.ac.in"
}'
```

---

## 8. Reject No-Dues

```bash
curl -X POST "https://dfulsdkrxg.execute-api.ap-south-1.amazonaws.com/prod/student-nodues/YOUR_NODUES_ID/reject" \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_PRIVY_TOKEN" \
-d '{
  "reason": "Incomplete documentation",
  "rejectedBy": {
    "email": "hod@lnmiit.ac.in",
    "name": "HOD Name",
    "department": "HOD"
  }
}'
```

---

## 9. Delete No-Dues

```bash
curl -X DELETE "https://dfulsdkrxg.execute-api.ap-south-1.amazonaws.com/prod/student-nodues/YOUR_NODUES_ID?studentEmail=22ucs001@lnmiit.ac.in" \
-H "Authorization: Bearer YOUR_PRIVY_TOKEN"
```

---

## Testing from Browser Console

Open your React app and try these in the browser console:

```javascript
// Get approval flow
fetch('https://dfulsdkrxg.execute-api.ap-south-1.amazonaws.com/prod/student-nodues/flow-config')
  .then(r => r.json())
  .then(console.log);

// Get my status (after login)
const token = localStorage.getItem('privyToken');
const email = JSON.parse(localStorage.getItem('userData')).email;

fetch(`https://dfulsdkrxg.execute-api.ap-south-1.amazonaws.com/prod/student-nodues/my-status?studentEmail=${email}`, {
  headers: { 'Authorization': `Bearer ${token}` }
})
  .then(r => r.json())
  .then(console.log);
```

---

## Response Format

All responses follow this format:

**Success:**
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful"
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (missing parameters) |
| 401 | Unauthorized (invalid token) |
| 403 | Forbidden (not authorized for this action) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Common Query Parameters

| Parameter | Used In | Description |
|-----------|---------|-------------|
| `studentEmail` | my-status, delete | Student's email address |
| `approverEmail` | pending | Faculty/Admin email |
| `status` | all | Filter by status (pending, in_progress, approved, rejected) |

---

## Testing Checklist

- [ ] Test approval flow endpoint (public)
- [ ] Test submit no-dues with valid data
- [ ] Test get my status with studentEmail
- [ ] Test get pending with approverEmail
- [ ] Test sign no-dues
- [ ] Test reject no-dues
- [ ] Test delete no-dues
- [ ] Verify data in DynamoDB table
- [ ] Check CloudWatch logs for errors
- [ ] Test CORS from frontend

---

## Quick DynamoDB Check

1. Go to [DynamoDB Console](https://ap-south-1.console.aws.amazon.com/dynamodbv2/home?region=ap-south-1#tables)
2. Click `BTP-StudentNoDues`
3. Click "Explore table items"
4. View submitted records

---

## Quick Lambda Log Check

1. Go to [Lambda Console](https://ap-south-1.console.aws.amazon.com/lambda/home?region=ap-south-1#/functions)
2. Click any function (e.g., `BTP-SubmitStudentNoDues`)
3. Click "Monitor" tab
4. Click "View CloudWatch logs"
5. Check recent invocations
