import json
import boto3
import base64
from datetime import datetime
from decimal import Decimal

dynamodb = boto3.resource('dynamodb', region_name='ap-south-1')
s3_client = boto3.client('s3', region_name='ap-south-1')

TABLE_NAME = 'CampusFlow-MOUs'
BUCKET_NAME = 'campusflow-mou-documents'

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

def lambda_handler(event, context):
    """
    Approve an MOU (by Faculty or Admin)
    Expected body:
    {
        "mouId": "uuid",
        "approverRole": "FACULTY" or "ADMIN",
        "approverName": "Name",
        "approverEmail": "email@lnmiit.ac.in",
        "signature": "base64_encoded_signature_image",
        "comments": "Optional comments"
    }
    """
    # Handle OPTIONS preflight request
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'OPTIONS,POST'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        # Parse request body
        body_content = event.get('body', '{}')
        
        # Handle case where body might be base64 encoded or already a dict
        if isinstance(body_content, dict):
            body = body_content
        elif body_content is None or body_content == '':
            body = {}
        else:
            # Try to decode from base64 first (API Gateway sometimes base64 encodes the body)
            try:
                decoded_body = base64.b64decode(body_content).decode('utf-8')
                body = json.loads(decoded_body)
            except Exception:
                # If base64 decode fails, try parsing as regular JSON
                try:
                    body = json.loads(body_content)
                except json.JSONDecodeError as json_err:
                    return {
                        'statusCode': 400,
                        'headers': {
                            'Access-Control-Allow-Origin': '*',
                            'Content-Type': 'application/json'
                        },
                        'body': json.dumps({'error': f'Invalid request body format: {str(json_err)}'}),
                        'isBase64Encoded': False
                    }
        
        # Validate required fields
        required_fields = ['mouId', 'approverRole', 'approverName', 'approverEmail', 'signature']
        for field in required_fields:
            if field not in body:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json'},
                    'body': json.dumps({'error': f'Missing required field: {field}'}),
                    'isBase64Encoded': False
                }
        
        mou_id = body['mouId']
        approver_role = body['approverRole']
        timestamp = datetime.utcnow().isoformat()
        
        # Fetch MOU from DynamoDB
        table = dynamodb.Table(TABLE_NAME)
        response = table.get_item(Key={'mouId': mou_id})
        
        if 'Item' not in response:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'MOU not found'}),
                'isBase64Encoded': False
            }
        
        mou = response['Item']
        current_status = mou.get('status')
        
        # Validate approval workflow
        if approver_role == 'FACULTY':
            if current_status != 'PENDING_FACULTY':
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'MOU is not pending faculty approval'}),
                    'isBase64Encoded': False
                }
            new_status = 'PENDING_ADMIN'
            signature_key = f"signatures/{mou_id}/faculty_signature.png"
        
        elif approver_role == 'ADMIN':
            if current_status != 'PENDING_ADMIN':
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'MOU is not pending admin approval'}),
                    'isBase64Encoded': False
                }
            new_status = 'APPROVED'
            signature_key = f"signatures/{mou_id}/admin_signature.png"
        
        else:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Invalid approver role'}),
                'isBase64Encoded': False
            }
        
        # Upload signature to S3
        signature_data = base64.b64decode(body['signature'])
        s3_client.put_object(
            Bucket=BUCKET_NAME,
            Key=signature_key,
            Body=signature_data,
            ContentType='image/png',
            ServerSideEncryption='AES256'
        )
        
        # Prepare approval record
        approval_record = {
            'approverRole': approver_role,
            'approverName': body['approverName'],
            'approverEmail': body['approverEmail'],
            'signatureKey': signature_key,
            'approvedAt': timestamp,
            'comments': body.get('comments', '')
        }
        
        # Update approval chain
        approval_chain = mou.get('approvalChain', [])
        approval_chain.append(approval_record)
        
        # Update DynamoDB
        update_expression = 'SET #status = :status, approvalChain = :chain, updatedAt = :updated'
        expression_values = {
            ':status': new_status,
            ':chain': approval_chain,
            ':updated': timestamp
        }
        expression_names = {'#status': 'status'}
        
        # Add signature key to item
        if approver_role == 'FACULTY':
            update_expression += ', facultySignatureKey = :sigKey'
            expression_values[':sigKey'] = signature_key
        elif approver_role == 'ADMIN':
            update_expression += ', adminSignatureKey = :sigKey'
            expression_values[':sigKey'] = signature_key
        
        table.update_item(
            Key={'mouId': mou_id},
            UpdateExpression=update_expression,
            ExpressionAttributeNames=expression_names,
            ExpressionAttributeValues=expression_values
        )
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': f'MOU approved by {approver_role}',
                'mouId': mou_id,
                'newStatus': new_status
            }, cls=DecimalEncoder),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Failed to approve MOU: {str(e)}'}),
            'isBase64Encoded': False
        }
