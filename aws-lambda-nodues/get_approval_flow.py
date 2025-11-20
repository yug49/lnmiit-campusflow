import json
import boto3

# This would typically query your user management system
# For now, returning a default flow - you can make this dynamic later
def lambda_handler(event, context):
    """
    Get approval flow configuration
    This can be made dynamic by storing in DynamoDB config table
    """
    # Handle OPTIONS preflight request
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': ''
        }
    
    try:
        # Default approval flow - can be fetched from DynamoDB config table
        approval_flow = [
            {
                'email': 'hod@lnmiit.ac.in',
                'department': 'HOD',
                'order': 1
            },
            {
                'email': 'dean@lnmiit.ac.in',
                'department': 'Dean',
                'order': 2
            },
            {
                'email': 'admin@lnmiit.ac.in',
                'department': 'Administration',
                'order': 3
            }
        ]
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'success': True,
                'data': approval_flow
            })
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'success': False,
                'message': f'Error fetching approval flow: {str(e)}'
            })
        }
