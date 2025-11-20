import json
import boto3
import os
from collections import defaultdict

dynamodb = boto3.resource('dynamodb', region_name='ap-south-1')
table = dynamodb.Table(os.environ['CANDIDATES_TABLE'])

def lambda_handler(event, context):
    """
    GET /voting/approved-candidates
    Get approved candidates grouped by position
    """
    
    try:
        # Query using status-position-index GSI
        response = table.query(
            IndexName='status-position-index',
            KeyConditionExpression='#status = :s',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={':s': 'Approved'}
        )
        
        candidates = response.get('Items', [])
        
        # Group by position
        candidates_by_position = defaultdict(list)
        
        for candidate in candidates:
            position = candidate['position']
            candidates_by_position[position].append({
                'id': candidate['candidateId'],
                'userId': candidate['userId'],
                'batch': candidate['batch'],
                'statement': candidate['statement'],
                'experience': candidate['experience'],
                'achievements': candidate.get('achievements', '')
            })
        
        return {
            'statusCode': 200,
            'headers': cors_headers(),
            'body': json.dumps({
                'success': True,
                'candidates': dict(candidates_by_position)
            })
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': cors_headers(),
            'body': json.dumps({'error': 'Internal server error'})
        }


def cors_headers():
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    }