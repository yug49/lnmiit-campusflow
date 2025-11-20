import json
import boto3
import os

dynamodb = boto3.resource('dynamodb', region_name='ap-south-1')
table = dynamodb.Table(os.environ['CANDIDATES_TABLE'])

def lambda_handler(event, context):
    """
    GET /voting/candidatures
    Admin: Get all candidature applications
    """
    
    # Get user from authorizer
    authorizer = event['requestContext']['authorizer']
    role = authorizer['role']
    
    # Check if user is admin
    if role != 'admin':
        return {
            'statusCode': 403,
            'headers': cors_headers(),
            'body': json.dumps({
                'success': False,
                'message': 'Access denied'
            })
        }
    
    try:
        # Scan entire table (small dataset, acceptable)
        response = table.scan()
        
        candidatures = response.get('Items', [])
        
        # Sort by submittedAt (newest first)
        candidatures.sort(key=lambda x: x.get('submittedAt', ''), reverse=True)
        
        return {
            'statusCode': 200,
            'headers': cors_headers(),
            'body': json.dumps({
                'success': True,
                'candidatures': candidatures
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