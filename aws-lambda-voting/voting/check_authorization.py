import json
import boto3
import os
from datetime import datetime

dynamodb = boto3.resource('dynamodb', region_name='ap-south-1')
sessions_table = dynamodb.Table(os.environ['SESSIONS_TABLE'])
votes_table = dynamodb.Table(os.environ['VOTES_TABLE'])

def lambda_handler(event, context):
    """
    GET /voting/check-authorization
    Check if current user is authorized to vote
    """
    
    # Get user from authorizer
    authorizer = event['requestContext']['authorizer']
    user_id = authorizer['userId']
    
    try:
        # Check if already voted
        existing_vote = votes_table.get_item(Key={'voterId': user_id})
        
        if 'Item' in existing_vote:
            return response(200, {
                'success': True,
                'authorized': False,
                'alreadyVoted': True,
                'message': 'You have already cast your vote'
            })
        
        # Find active voting session
        now = datetime.utcnow().isoformat() + 'Z'
        
        session_response = sessions_table.query(
            KeyConditionExpression='studentId = :sid',
            FilterExpression='active = :a AND expiresAt > :now',
            ExpressionAttributeValues={
                ':sid': user_id,
                ':a': 'true',
                ':now': now
            }
        )
        
        sessions = session_response.get('Items', [])
        
        if not sessions:
            return response(200, {
                'success': True,
                'authorized': False,
                'message': 'You are not authorized to vote at this time'
            })
        
        # Return first active session
        session = sessions[0]
        
        return response(200, {
            'success': True,
            'authorized': True,
            'session': {
                'expiresAt': session['expiresAt']
            }
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