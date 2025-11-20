import json
import boto3
import os
from datetime import datetime
import uuid

dynamodb = boto3.resource('dynamodb', region_name='ap-south-1')
table = dynamodb.Table(os.environ['CANDIDATES_TABLE'])

def lambda_handler(event, context):
    """
    POST /voting/candidature
    Submit candidature application
    """
    
    # Get user from authorizer
    authorizer = event['requestContext']['authorizer']
    user_id = authorizer['userId']
    
    # Parse request body
    try:
        body = json.loads(event['body'])
    except:
        return response(400, {'error': 'Invalid JSON'})
    
    # Validate required fields
    required_fields = ['position', 'batch', 'statement', 'experience']
    for field in required_fields:
        if field not in body:
            return response(400, {'error': f'Missing field: {field}'})
    
    position = body['position']
    batch = body['batch']
    statement = body['statement']
    experience = body['experience']
    achievements = body.get('achievements', '')
    
    try:
        # Check if user already applied for this position
        existing = check_existing_candidature(user_id, position)
        
        if existing:
            # If rejected or reverted, allow resubmission
            if existing['status'] in ['Rejected', 'Reverted']:
                # Update existing application
                return update_candidature(
                    existing['candidateId'],
                    batch, statement, experience, achievements
                )
            else:
                return response(400, {
                    'success': False,
                    'message': 'You have already applied for this position'
                })
        
        # Create new candidature
        candidate_id = f"cand_{uuid.uuid4().hex[:12]}"
        timestamp = datetime.utcnow().isoformat() + 'Z'
        
        item = {
            'candidateId': candidate_id,
            'userId': user_id,
            'position': position,
            'batch': batch,
            'statement': statement,
            'experience': experience,
            'achievements': achievements,
            'status': 'Pending',
            'remark': '',
            'submittedAt': timestamp,
            'updatedAt': timestamp
        }
        
        table.put_item(Item=item)
        
        return response(201, {
            'success': True,
            'message': 'Candidature application submitted successfully',
            'candidate': item
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return response(500, {'error': 'Internal server error'})


def check_existing_candidature(user_id, position):
    """Check if user has existing application for position"""
    
    # Query using userId-index GSI
    response = table.query(
        IndexName='userId-index',
        KeyConditionExpression='userId = :uid',
        ExpressionAttributeValues={':uid': user_id}
    )
    
    # Find matching position
    for item in response.get('Items', []):
        if item['position'] == position:
            return item
    
    return None


def update_candidature(candidate_id, batch, statement, experience, achievements):
    """Update existing candidature (resubmission)"""
    
    timestamp = datetime.utcnow().isoformat() + 'Z'
    
    table.update_item(
        Key={'candidateId': candidate_id},
        UpdateExpression='SET batch = :b, statement = :s, experience = :e, '
                        'achievements = :a, #status = :st, remark = :r, updatedAt = :u',
        ExpressionAttributeNames={'#status': 'status'},
        ExpressionAttributeValues={
            ':b': batch,
            ':s': statement,
            ':e': experience,
            ':a': achievements,
            ':st': 'Pending',
            ':r': '',
            ':u': timestamp
        }
    )
    
    return response(200, {
        'success': True,
        'message': 'Candidature application resubmitted successfully'
    })


def response(status_code, body):
    """Helper function to format API Gateway response"""
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