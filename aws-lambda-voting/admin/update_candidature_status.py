import json
import boto3
import os
from datetime import datetime

dynamodb = boto3.resource('dynamodb', region_name='ap-south-1')
table = dynamodb.Table(os.environ['CANDIDATES_TABLE'])

def lambda_handler(event, context):
    """
    PUT /voting/candidature/{id}
    Admin: Update candidature status (Approve/Reject/Revert)
    """
    
    # Get user from authorizer
    authorizer = event['requestContext']['authorizer']
    role = authorizer['role']
    
    # Check if user is admin
    if role != 'admin':
        return response(403, {
            'success': False,
            'message': 'Access denied'
        })
    
    # Get candidate ID from path
    candidate_id = event['pathParameters']['id']
    
    # Parse request body
    try:
        body = json.loads(event['body'])
    except:
        return response(400, {'error': 'Invalid JSON'})
    
    status = body.get('status')
    remark = body.get('remark', '')
    
    # Validate status
    valid_statuses = ['Approved', 'Rejected', 'Reverted']
    if status not in valid_statuses:
        return response(400, {
            'success': False,
            'message': 'Invalid status. Must be: Approved, Rejected, or Reverted'
        })
    
    try:
        timestamp = datetime.utcnow().isoformat() + 'Z'
        
        # Update the candidature
        result = table.update_item(
            Key={'candidateId': candidate_id},
            UpdateExpression='SET #status = :s, remark = :r, updatedAt = :u',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={
                ':s': status,
                ':r': remark,
                ':u': timestamp
            },
            ReturnValues='ALL_NEW'
        )
        
        return response(200, {
            'success': True,
            'message': 'Candidature status updated successfully',
            'candidate': result['Attributes']
        })
        
    except dynamodb.meta.client.exceptions.ResourceNotFoundException:
        return response(404, {
            'success': False,
            'message': 'Candidature not found'
        })
    except Exception as e:
        print(f"Error: {str(e)}")
        return response(500, {'error': 'Internal server error'})


def response(status_code, body):
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        'body': json.dumps(body)
    }