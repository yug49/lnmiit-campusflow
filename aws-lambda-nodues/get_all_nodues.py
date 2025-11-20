import json
import boto3

dynamodb = boto3.resource('dynamodb', region_name='ap-south-1')
TABLE_NAME = 'BTP-StudentNoDues'

def lambda_handler(event, context):
    """
    Get all no-dues records with optional status filter
    Query params: status (optional: pending, in_progress, approved, rejected)
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
        # Get optional status filter from query parameters
        query_params = event.get('queryStringParameters', {}) or {}
        status_filter = query_params.get('status')
        
        table = dynamodb.Table(TABLE_NAME)
        
        if status_filter:
            # Query using StatusIndex
            response = table.query(
                IndexName='StatusIndex',
                KeyConditionExpression='#status = :status',
                ExpressionAttributeNames={'#status': 'status'},
                ExpressionAttributeValues={':status': status_filter},
                ScanIndexForward=False  # Most recent first
            )
        else:
            # Scan all items (use carefully - expensive for large tables)
            response = table.scan()
        
        items = response.get('Items', [])
        
        # Sort by submittedAt descending
        items.sort(key=lambda x: x.get('submittedAt', 0), reverse=True)
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'success': True,
                'count': len(items),
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
                'message': f'Error fetching all no-dues: {str(e)}'
            })
        }
