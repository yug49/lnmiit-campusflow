import json
import boto3
import os
from collections import defaultdict
from datetime import datetime

dynamodb = boto3.resource('dynamodb', region_name='ap-south-1')
votes_table = dynamodb.Table(os.environ['VOTES_TABLE'])
candidates_table = dynamodb.Table(os.environ['CANDIDATES_TABLE'])

def lambda_handler(event, context):
    """
    GET /voting/results
    Admin: Get election results with vote counts
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
    
    try:
        # Get all votes
        votes_response = votes_table.scan()
        votes = votes_response.get('Items', [])
        total_votes = len(votes)
        
        # Get all approved candidates
        candidates_response = candidates_table.query(
            IndexName='status-position-index',
            KeyConditionExpression='#status = :s',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={':s': 'Approved'}
        )
        candidates = candidates_response.get('Items', [])
        
        # Initialize results structure
        results = defaultdict(lambda: {
            'position': '',
            'candidates': []
        })
        
        # Count votes for each candidate
        vote_counts = defaultdict(int)
        
        for vote in votes:
            vote_map = vote.get('votes', {})
            for position, candidate_id in vote_map.items():
                vote_counts[candidate_id] += 1
        
        # Build results by position
        for candidate in candidates:
            position = candidate['position']
            candidate_id = candidate['candidateId']
            
            results[position]['position'] = position
            results[position]['candidates'].append({
                'id': candidate_id,
                'userId': candidate['userId'],
                'batch': candidate['batch'],
                'votes': vote_counts.get(candidate_id, 0),
                'percentage': round((vote_counts.get(candidate_id, 0) / total_votes * 100), 2) if total_votes > 0 else 0
            })
        
        # Sort candidates by votes within each position
        for position_data in results.values():
            position_data['candidates'].sort(key=lambda x: x['votes'], reverse=True)
            
            # Determine winner(s)
            if position_data['candidates']:
                max_votes = position_data['candidates'][0]['votes']
                winners = [c for c in position_data['candidates'] if c['votes'] == max_votes]
                
                position_data['winners'] = [
                    {'id': w['id'], 'userId': w['userId'], 'votes': w['votes']}
                    for w in winners
                ]
                position_data['isTie'] = len(winners) > 1
        
        return response(200, {
            'success': True,
            'results': list(results.values()),
            'totalVotes': total_votes,
            'timestamp': datetime.utcnow().isoformat() + 'Z'
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