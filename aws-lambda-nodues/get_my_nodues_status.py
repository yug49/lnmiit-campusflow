import json
import boto3

dynamodb = boto3.resource('dynamodb', region_name='ap-south-1')
TABLE_NAME = 'BTP-StudentNoDues'

def lambda_handler(event, context):
    """
    Get student's own no-dues status
    Query param: studentEmail (from auth token)
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
        # Get student email from query parameters
        query_params = event.get('queryStringParameters', {}) or {}
        student_email = query_params.get('studentEmail')
        
        if not student_email:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': False, 'message': 'Student email is required'})
            }
        
        # Query using StudentEmailIndex
        table = dynamodb.Table(TABLE_NAME)
        response = table.query(
            IndexName='StudentEmailIndex',
            KeyConditionExpression='studentEmail = :email',
            ExpressionAttributeValues={':email': student_email},
            ScanIndexForward=False  # Most recent first
        )
        
        items = response.get('Items', [])
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'success': True,
                'data': items
            }, default=str)
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'success': False,
                'message': f'Error fetching no-dues status: {str(e)}'
            })
        }
