import json
import boto3
import os
from datetime import datetime, timedelta
import uuid

dynamodb = boto3.resource('dynamodb', region_name='ap-south-1')
sessions_table = dynamodb.Table(os.environ['SESSIONS_TABLE'])
votes_table = dynamodb.Table(os.environ['VOTES_TABLE'])

def lambda_handler(event, context):
    """
    POST /voting/authorize-voter
    Admin: Authorize a voter (create 5-minute voting session)
    """
    
    # Get user from authorizer
    authorizer = event['requestContext']['authorizer']
    role = authorizer['role']
    admin_id = authorizer['userId']
    
    # Check if user is admin
    if role != 'admin':
        return response(403, {
            'success': False,
            'message': 'Access denied'
        })
    
    # Parse request body
    try:
        body = json.loads(event['body'])
    except:
        return response(400, {'error': 'Invalid JSON'})
    
    student_id = body.get('studentId')
    
    if not student_id:
        return response(400, {'error': 'studentId is required'})
    
    try:
        # Check if student has already voted
        existing_vote = check_if_voted(student_id)
        
        if existing_vote:
            return response(400, {
                'success': False,
                'message': 'Student has already voted'
            })
        
        # Deactivate any existing active sessions for this student
        deactivate_existing_sessions(student_id)
        
        # Create new voting session (expires in 5 minutes)
        session_id = f"sess_{uuid.uuid4().hex[:12]}"
        now = datetime.utcnow()
        expires_at = now + timedelta(minutes=5)
        
        session_item = {
            'studentId': student_id,
            'sessionId': session_id,
            'authorizedBy': admin_id,
            'active': 'true',  # Stored as string for GSI
            'expiresAt': expires_at.isoformat() + 'Z',
            'createdAt': now.isoformat() + 'Z'
        }
        
        sessions_table.put_item(Item=session_item)
        
        return response(200, {
            'success': True,
            'message': 'Student authorized for voting',
            'session': session_item
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return response(500, {'error': 'Internal server error'})


def check_if_voted(voter_id):
    """Check if voter has already cast vote"""
    try:
        result = votes_table.get_item(Key={'voterId': voter_id})
        return result.get('Item')
    except:
        return None


def deactivate_existing_sessions(student_id):
    """Deactivate all active sessions for student"""
    try:
        # Query all sessions for this student
        response = sessions_table.query(
            KeyConditionExpression='studentId = :sid',
            ExpressionAttributeValues={':sid': student_id}
        )
        
        # Update each active session
        for item in response.get('Items', []):
            if item.get('active') == 'true':
                sessions_table.update_item(
                    Key={
                        'studentId': student_id,
                        'sessionId': item['sessionId']
                    },
                    UpdateExpression='SET active = :a',
                    ExpressionAttributeValues={':a': 'false'}
                )
    except Exception as e:
        print(f"Error deactivating sessions: {str(e)}")


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