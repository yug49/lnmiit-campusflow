# CampusFlow MOU Lambda Functions

This directory contains all AWS Lambda functions for the MOU (Memorandum of Understanding) approval system.

## Lambda Functions

1. **submit_mou.py** - Submit new MOU with documents and signatures
2. **get_all_mous.py** - Retrieve all MOUs (with optional status filtering)
3. **get_mou_details.py** - Get detailed information about a specific MOU
4. **approve_mou.py** - Approve an MOU (Faculty or Admin)
5. **reject_mou.py** - Reject an MOU with reason
6. **get_my_mous.py** - Get MOUs submitted by a specific user
7. **delete_mou.py** - Delete an MOU (only if pending or rejected)

## Creating Deployment Packages

Run the PowerShell script to create all deployment packages:

```powershell
cd aws-lambda-mou
.\create-lambdas.ps1
```

This will create a `deployment-packages` folder with 7 zip files ready for upload to AWS Lambda.

## Manual Deployment Steps

### Step 1: Create Lambda Functions in AWS Console

For each function, go to [AWS Lambda Console](https://ap-south-1.console.aws.amazon.com/lambda):

1. Click **"Create function"**
2. Choose **"Author from scratch"**
3. Configure:
   - **Function name**: Use exact names below
   - **Runtime**: Python 3.11
   - **Architecture**: x86_64
   - **Execution role**: Use existing role → `CampusFlow-MOU-Lambda-Role`

4. Click **"Create function"**

**Lambda Function Names to Create:**
- `CampusFlow-SubmitMOU`
- `CampusFlow-GetAllMOUs`
- `CampusFlow-GetMOUDetails`
- `CampusFlow-ApproveMOU`
- `CampusFlow-RejectMOU`
- `CampusFlow-GetMyMOUs`
- `CampusFlow-DeleteMOU`

### Step 2: Upload Code for Each Function

For each Lambda function:

1. Click on the function name
2. Go to **"Code"** tab
3. Click **"Upload from"** → **".zip file"**
4. Click **"Upload"** and select the corresponding zip file from `deployment-packages` folder
5. Click **"Save"**

**Mapping:**
- `CampusFlow-SubmitMOU` → upload `submit_mou.zip`
- `CampusFlow-GetAllMOUs` → upload `get_all_mous.zip`
- `CampusFlow-GetMOUDetails` → upload `get_mou_details.zip`
- `CampusFlow-ApproveMOU` → upload `approve_mou.zip`
- `CampusFlow-RejectMOU` → upload `reject_mou.zip`
- `CampusFlow-GetMyMOUs` → upload `get_my_mous.zip`
- `CampusFlow-DeleteMOU` → upload `delete_mou.zip`

### Step 3: Configure Each Lambda

For each function, go to **"Configuration"** tab:

#### General Configuration:
- **Timeout**: 30 seconds
- **Memory**: 256 MB

#### Environment Variables (if needed):
- `TABLE_NAME`: `CampusFlow-MOUs`
- `BUCKET_NAME`: `campusflow-mou-documents`
- `REGION`: `ap-south-1`

(Note: These are hardcoded in the functions, but you can make them environment variables for easier configuration)

### Step 4: Test Lambda Functions

Create test events for each function:

#### Test Event for submit_mou:
```json
{
  "body": "{\"title\":\"Test MOU\",\"organization\":\"Test Org\",\"description\":\"Test\",\"amount\":10000,\"mouDocument\":\"base64_test_data\",\"mouDocumentName\":\"test.pdf\",\"submittedBy\":\"user123\",\"submittedByName\":\"Test User\",\"submittedByEmail\":\"test@lnmiit.ac.in\"}"
}
```

#### Test Event for get_all_mous:
```json
{
  "queryStringParameters": {
    "status": "PENDING_FACULTY"
  }
}
```

#### Test Event for get_mou_details:
```json
{
  "pathParameters": {
    "mouId": "your-mou-id-here"
  }
}
```

## API Endpoints (After API Gateway Setup)

After setting up API Gateway in Phase 3, these endpoints will be available:

- `POST /mou` → submit_mou
- `GET /mou` → get_all_mous
- `GET /mou/{mouId}` → get_mou_details
- `POST /mou/approve` → approve_mou
- `POST /mou/reject` → reject_mou
- `GET /mou/my` → get_my_mous
- `DELETE /mou/{mouId}` → delete_mou

## Security Notes

- All functions use IAM role: `CampusFlow-MOU-Lambda-Role`
- S3 files are encrypted with AES256
- Presigned URLs expire after 1 hour
- CORS is enabled for frontend access

## Troubleshooting

If Lambda function fails:
1. Check CloudWatch Logs for error details
2. Verify IAM role has correct permissions
3. Ensure DynamoDB table and S3 bucket exist
4. Check boto3 region configuration
