import json
import boto3
from datetime import datetime
from decimal import Decimal

dynamodb = boto3.resource('dynamodb', region_name='ap-south-1')

TABLE_NAME = 'CampusFlow-MOUs'

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

def lambda_handler(event, context):
    """
    Reject an MOU (by Faculty or Admin)
    Expected body:
    {
        "mouId": "uuid",
        "rejectorRole": "FACULTY" or "ADMIN",
        "rejectorName": "Name",
        "rejectorEmail": "email@lnmiit.ac.in",
        "reason": "Rejection reason"
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
            import base64
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
        required_fields = ['mouId', 'rejectorRole', 'rejectorName', 'rejectorEmail', 'reason']
        for field in required_fields:
            if field not in body:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json'},
                    'body': json.dumps({'error': f'Missing required field: {field}'}),
                    'isBase64Encoded': False
                }
        
        mou_id = body['mouId']
        rejector_role = body['rejectorRole']
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
        
        # Validate rejection workflow
        if rejector_role == 'FACULTY':
            if current_status != 'PENDING_FACULTY':
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'MOU is not pending faculty approval'}),
                    'isBase64Encoded': False
                }
        
        elif rejector_role == 'ADMIN':
            if current_status != 'PENDING_ADMIN':
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'MOU is not pending admin approval'}),
                    'isBase64Encoded': False
                }
        
        else:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Invalid rejector role'}),
                'isBase64Encoded': False
            }
        
        # Prepare rejection record
        rejection_record = {
            'rejectorRole': rejector_role,
            'rejectorName': body['rejectorName'],
            'rejectorEmail': body['rejectorEmail'],
            'reason': body['reason'],
            'rejectedAt': timestamp
        }
        
        # Update DynamoDB
        table.update_item(
            Key={'mouId': mou_id},
            UpdateExpression='SET #status = :status, rejectionInfo = :rejection, updatedAt = :updated',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={
                ':status': 'REJECTED',
                ':rejection': rejection_record,
                ':updated': timestamp
            }
        )
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': f'MOU rejected by {rejector_role}',
                'mouId': mou_id,
                'status': 'REJECTED'
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
            'body': json.dumps({'error': f'Failed to reject MOU: {str(e)}'}),
            'isBase64Encoded': False
        }
