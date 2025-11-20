import json
import boto3
import os
from datetime import datetime
from botocore.exceptions import ClientError

dynamodb = boto3.client('dynamodb', region_name='ap-south-1')
resource = boto3.resource('dynamodb', region_name='ap-south-1')

VOTES_TABLE = os.environ['VOTES_TABLE']
SESSIONS_TABLE = os.environ['SESSIONS_TABLE']
CANDIDATES_TABLE = os.environ['CANDIDATES_TABLE']

def lambda_handler(event, context):
    """
    POST /voting/cast-vote
    Cast vote with double-vote prevention using DynamoDB transactions
    
    Body: {
        "votes": {
            "President": "cand_abc123",
            "Vice President": "cand_def456"
        }
    }
    """
    
    # Get user from authorizer
    authorizer = event['requestContext']['authorizer']
    voter_id = authorizer['userId']
    
    # Parse request body
    try:
        body = json.loads(event['body'])
    except:
        return response(400, {'error': 'Invalid JSON'})
    
    votes = body.get('votes')
    
    if not votes or not isinstance(votes, dict):
        return response(400, {
            'success': False,
            'message': 'Invalid votes format'
        })
    
    try:
        # Check if already voted (additional safety check)
        existing_vote = check_if_voted(voter_id)
        if existing_vote:
            return response(400, {
                'success': False,
                'message': 'You have already cast your vote'
            })
        
        # Check for active voting authorization
        session = check_active_session(voter_id)
        if not session:
            return response(401, {
                'success': False,
                'message': 'Your voting authorization has expired or is not active'
            })
        
        # Validate all candidates
        for position, candidate_id in votes.items():
            if not validate_candidate(candidate_id, position):
                return response(400, {
                    'success': False,
                    'message': f'Invalid candidate selection for position: {position}'
                })
        
        # Use DynamoDB transaction to atomically:
        # 1. Put vote (with condition: voter must not exist)
        # 2. Update session to inactive
        
        timestamp = datetime.utcnow().isoformat() + 'Z'
        
        # Convert votes dict to DynamoDB Map format
        votes_map = {k: {'S': v} for k, v in votes.items()}
        
        transact_items = [
            {
                'Put': {
                    'TableName': VOTES_TABLE,
                    'Item': {
                        'voterId': {'S': voter_id},
                        'votes': {'M': votes_map},
                        'sessionId': {'S': session['sessionId']},
                        'votedAt': {'S': timestamp}
                    },
                    'ConditionExpression': 'attribute_not_exists(voterId)'
                }
            },
            {
                'Update': {
                    'TableName': SESSIONS_TABLE,
                    'Key': {
                        'studentId': {'S': session['studentId']},
                        'sessionId': {'S': session['sessionId']}
                    },
                    'UpdateExpression': 'SET active = :a',
                    'ExpressionAttributeValues': {
                        ':a': {'S': 'false'}
                    }
                }
            }
        ]
        
        # Execute transaction
        dynamodb.transact_write_items(TransactItems=transact_items)
        
        return response(201, {
            'success': True,
            'message': 'Your vote has been recorded successfully'
        })
        
    except ClientError as e:
        error_code = e.response['Error']['Code']
        
        if error_code == 'TransactionCanceledException':
            # This happens if condition fails (voter already exists)
            return response(400, {
                'success': False,
                'message': 'You have already cast your vote'
            })
        else:
            print(f"DynamoDB Error: {str(e)}")
            return response(500, {'error': 'Internal server error'})
            
    except Exception as e:
        print(f"Error: {str(e)}")
        return response(500, {'error': 'Internal server error'})


def check_if_voted(voter_id):
    """Check if voter has already cast vote"""
    votes_table = resource.Table(VOTES_TABLE)
    try:
        result = votes_table.get_item(Key={'voterId': voter_id})
        return result.get('Item')
    except:
        return None


def check_active_session(student_id):
    """Check if student has active, non-expired session"""
    sessions_table = resource.Table(SESSIONS_TABLE)
    now = datetime.utcnow().isoformat() + 'Z'
    
    try:
        response = sessions_table.query(
            KeyConditionExpression='studentId = :sid',
            FilterExpression='active = :a AND expiresAt > :now',
            ExpressionAttributeValues={
                ':sid': student_id,
                ':a': 'true',
                ':now': now
            }
        )
        
        sessions = response.get('Items', [])
        return sessions[0] if sessions else None
        
    except Exception as e:
        print(f"Session check error: {str(e)}")
        return None


def validate_candidate(candidate_id, position):
    """Validate that candidate exists and is approved for position"""
    candidates_table = resource.Table(CANDIDATES_TABLE)
    
    try:
        result = candidates_table.get_item(Key={'candidateId': candidate_id})
        candidate = result.get('Item')
        
        if not candidate:
            return False
        
        if candidate.get('status') != 'Approved':
            return False
        
        if candidate.get('position') != position:
            return False
        
        return True
        
    except Exception as e:
        print(f"Candidate validation error: {str(e)}")
        return False


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