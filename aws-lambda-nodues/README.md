# CampusFlow No-Dues Lambda Functions

This directory contains all AWS Lambda functions for the No-Dues system (Student and Faculty).

## Lambda Functions

### Student No-Dues Functions (9 total)
1. **submit_student_nodues.py** - Submit new no-dues request
2. **get_my_nodues_status.py** - Get student's own no-dues status
3. **get_pending_nodues.py** - Get pending approvals for faculty/admin
4. **get_all_nodues.py** - Get all no-dues records with optional filters
5. **get_nodues_by_id.py** - Get specific no-dues by ID
6. **sign_nodues.py** - Sign/approve no-dues (faculty/admin)
7. **reject_nodues.py** - Reject no-dues with reason
8. **get_approval_flow.py** - Get approval flow configuration
9. **delete_nodues.py** - Delete no-dues (pending/rejected only)

## Creating Deployment Packages

Run the PowerShell script to create all deployment packages:

```powershell
cd aws-lambda-nodues
.\create-lambdas.ps1
```

This will create a `deployment-packages` folder with 9 zip files ready for upload to AWS Lambda.

## Manual Deployment Steps

### Step 1: Create Lambda Functions in AWS Console

For each function, go to [AWS Lambda Console](https://ap-south-1.console.aws.amazon.com/lambda):

1. Click **"Create function"**
2. Choose **"Author from scratch"**
3. Configure:
   - **Function name**: Use exact names from table below
   - **Runtime**: Python 3.11
   - **Architecture**: x86_64
   - **Execution role**: Use existing role → `CampusFlow-MOU-Lambda-Role`

4. Click **"Create function"**

**Lambda Function Names to Create:**
| Function Name | Purpose | Upload File |
|--------------|---------|-------------|
| `BTP-SubmitStudentNoDues` | Submit no-dues | submit_student_nodues.zip |
| `BTP-GetMyNoDuesStatus` | Get student's status | get_my_nodues_status.zip |
| `BTP-GetPendingNoDues` | Get pending approvals | get_pending_nodues.zip |
| `BTP-GetAllNoDues` | Get all records | get_all_nodues.zip |
| `BTP-GetNoDuesById` | Get by ID | get_nodues_by_id.zip |
| `BTP-SignNoDues` | Sign/approve | sign_nodues.zip |
| `BTP-RejectNoDues` | Reject | reject_nodues.zip |
| `BTP-GetApprovalFlow` | Get approval flow | get_approval_flow.zip |
| `BTP-DeleteNoDues` | Delete request | delete_nodues.zip |

### Step 2: Upload Code for Each Function

For each Lambda function:

1. Click on the function name
2. Go to **"Code"** tab
3. Click **"Upload from"** → **".zip file"**
4. Click **"Upload"** and select the corresponding zip file from `deployment-packages` folder
5. Click **"Save"**

### Step 3: Configure Each Lambda

For each function, go to **"Configuration"** tab:

#### General Configuration:
- **Timeout**: 30 seconds
- **Memory**: 512 MB

#### Environment Variables:
All functions use these (hardcoded in Python, but you can add as env vars if you want):
- `TABLE_NAME`: `BTP-StudentNoDues`
- `BUCKET_NAME`: `btp-nodues-docs`
- `REGION`: `ap-south-1`

### Step 4: Test Lambda Functions

Create test events for each function:

#### Test Event for submit_student_nodues:
```json
{
  "httpMethod": "POST",
  "body": "{\"studentInfo\":{\"name\":\"Test Student\",\"email\":\"test@lnmiit.ac.in\",\"rollNumber\":\"22UCS001\",\"branch\":\"CSE\",\"semester\":\"8\"},\"bankDetails\":{\"accountHolderName\":\"Test\",\"accountNumber\":\"1234567890\",\"ifscCode\":\"SBIN0001234\"},\"donation\":{\"amount\":0},\"approvalFlow\":[{\"email\":\"hod@lnmiit.ac.in\",\"department\":\"HOD\",\"order\":1}],\"initialSignature\":\"test_sig\",\"walletAddress\":\"0x123\",\"documentHash\":\"hash123\"}",
  "headers": {
    "Authorization": "Bearer test_token"
  }
}
```

#### Test Event for get_my_nodues_status:
```json
{
  "httpMethod": "GET",
  "queryStringParameters": {
    "studentEmail": "test@lnmiit.ac.in"
  }
}
```

#### Test Event for get_pending_nodues:
```json
{
  "httpMethod": "GET",
  "queryStringParameters": {
    "approverEmail": "hod@lnmiit.ac.in"
  }
}
```

#### Test Event for get_nodues_by_id:
```json
{
  "httpMethod": "GET",
  "pathParameters": {
    "id": "your-nodues-id-here"
  }
}
```

#### Test Event for sign_nodues:
```json
{
  "httpMethod": "POST",
  "pathParameters": {
    "id": "your-nodues-id-here"
  },
  "body": "{\"signature\":\"test_signature\",\"walletAddress\":\"0x456\",\"signerName\":\"Faculty Name\",\"signerEmail\":\"hod@lnmiit.ac.in\"}"
}
```

## Faculty No-Dues

To create Faculty No-Dues functions:
1. Copy all the Python files
2. Change `TABLE_NAME = 'BTP-StudentNoDues'` to `TABLE_NAME = 'BTP-FacultyNoDues'`
3. Rename files (e.g., `submit_faculty_nodues.py`)
4. Run the script again with updated function names

## API Gateway Integration

After creating Lambda functions, you need to create API Gateway endpoints. This will be covered in the next step.

## Environment Variables Reference

| Variable | Value | Description |
|----------|-------|-------------|
| TABLE_NAME | BTP-StudentNoDues | DynamoDB table name |
| BUCKET_NAME | btp-nodues-docs | S3 bucket name |
| REGION | ap-south-1 | AWS region |

## Troubleshooting

### Lambda returns timeout error
- Increase timeout to 30 seconds in Configuration → General configuration

### DynamoDB access denied
- Verify IAM role has `AmazonDynamoDBFullAccess` policy attached

### S3 access denied
- Verify IAM role has `AmazonS3FullAccess` policy attached

### Cannot find item with index
- Verify GSI (Global Secondary Index) exists on DynamoDB table
- Check index names: `StudentEmailIndex`, `StatusIndex`, `ApproverEmailIndex`

## Next Steps

After deploying Lambda functions:
1. Create API Gateway REST API
2. Connect Lambda functions to API endpoints
3. Deploy API to production
4. Update frontend to use new API URLs
