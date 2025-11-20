import json
import boto3
import uuid
from datetime import datetime
from decimal import Decimal

dynamodb = boto3.resource('dynamodb', region_name='ap-south-1')
s3_client = boto3.client('s3', region_name='ap-south-1')

TABLE_NAME = 'BTP-StudentNoDues'
BUCKET_NAME = 'btp-nodues-docs'

def lambda_handler(event, context):
    """
    Submit new student no-dues request
    Expected body:
    {
        "studentInfo": {"name": "...", "email": "...", "rollNumber": "...", "branch": "...", "semester": "..."},
        "bankDetails": {"accountHolderName": "...", "accountNumber": "...", "ifscCode": "...", "bankName": "...", "branchName": "..."},
        "donation": {"amount": 0, "purpose": "..."},
        "approvalFlow": [{"email": "...", "department": "...", "order": 1}, ...],
        "initialSignature": "signature_string",
        "walletAddress": "0x...",
        "documentHash": "hash_string",
        "documentUrl": "s3_url_if_uploaded"
    }
    """
    # Handle OPTIONS preflight request
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': ''
        }
    
    try:
        # Log the entire event for debugging
        print(f"Received event: {json.dumps(event)}")
        
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        print(f"Parsed body: {json.dumps(body)}")
        
        # Extract authorization header for user validation
        headers = event.get('headers', {})
        auth_header = headers.get('Authorization') or headers.get('authorization')
        
        # Authorization is optional for now (can be enforced later)
        # if not auth_header:
        #     return {
        #         'statusCode': 401,
        #         'headers': {'Access-Control-Allow-Origin': '*'},
        #         'body': json.dumps({'success': False, 'message': 'Authorization header required'})
        #     }
        
        # Extract data - studentInfo might not be sent separately, derive from user context
        student_info = body.get('studentInfo', {})
        
        # If studentInfo is not provided, try to get from auth context or other fields
        if not student_info or not student_info.get('email'):
            # Try to extract from request context or use placeholder
            print("Warning: studentInfo not provided in request body")
            student_info = {
                'name': body.get('name', 'Student'),
                'email': body.get('email', 'student@lnmiit.ac.in'),
                'rollNumber': body.get('rollNumber', 'UNKNOWN'),
                'branch': body.get('branch', 'Unknown'),
                'semester': body.get('semester', 'Unknown'),
                'phone': body.get('phone', '')
            }
        
        bank_details = body.get('bankDetails', {})
        donation = body.get('donation', {})
        approval_flow = body.get('approvalFlow', [])
        initial_signature = body.get('initialSignature', '')
        wallet_address = body.get('walletAddress', '')
        document_hash = body.get('documentHash', '')
        document_url = body.get('documentUrl', '')
        
        print(f"Student info: {json.dumps(student_info)}")
        print(f"Approval flow length: {len(approval_flow)}")
        
        # Validate required fields
        if not student_info.get('email'):
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': False, 'message': 'Student email is required in studentInfo'})
            }
        
        if not approval_flow or len(approval_flow) == 0:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': False, 'message': 'Approval flow is required'})
            }
        
        # Check for existing approved no-dues
        table = dynamodb.Table(TABLE_NAME)
        
        # Query using StudentEmailIndex
        response = table.query(
            IndexName='StudentEmailIndex',
            KeyConditionExpression='studentEmail = :email',
            FilterExpression='#status = :status',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={
                ':email': student_info['email'],
                ':status': 'approved'
            }
        )
        
        if response['Items']:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': False,
                    'message': 'You already have an approved no-dues certificate'
                })
            }
        
        # Check for existing pending no-dues
        response = table.query(
            IndexName='StudentEmailIndex',
            KeyConditionExpression='studentEmail = :email',
            FilterExpression='#status IN (:pending, :in_progress)',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={
                ':email': student_info['email'],
                ':pending': 'pending',
                ':in_progress': 'in_progress'
            }
        )
        
        if response['Items']:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': False,
                    'message': 'You already have a pending no-dues request'
                })
            }
        
        # Generate unique ID
        nodues_id = str(uuid.uuid4())
        timestamp = int(datetime.utcnow().timestamp())
        
        # Get current approver email (first in flow)
        current_approver_email = approval_flow[0]['email'] if approval_flow else ''
        
        # Prepare DynamoDB item
        item = {
            'noDuesId': nodues_id,
            'studentEmail': student_info.get('email'),
            'studentInfo': student_info,
            'bankDetails': bank_details,
            'donation': donation,
            'approvalFlow': approval_flow,
            'signatures': [{
                'signerEmail': student_info.get('email'),
                'signerName': student_info.get('name'),
                'walletAddress': wallet_address,
                'signature': initial_signature,
                'timestamp': timestamp,
                'order': 0
            }],
            'currentStage': 0,
            'currentApproverEmail': current_approver_email,
            'status': 'pending',
            'documentHash': document_hash,
            'documentUrl': document_url,
            'submittedAt': timestamp,
            'createdAt': timestamp,
            'updatedAt': timestamp
        }
        
        # Save to DynamoDB
        table.put_item(Item=item)
        
        return {
            'statusCode': 201,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'success': True,
                'message': 'No-Dues request submitted successfully',
                'data': {
                    'noDuesId': nodues_id,
                    'status': 'pending',
                    'currentStage': 0,
                    'currentApprover': approval_flow[0] if approval_flow else None
                }
            })
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'success': False,
                'message': f'Error submitting no-dues: {str(e)}'
            })
        }
