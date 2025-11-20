import json
import boto3

dynamodb = boto3.resource('dynamodb', region_name='ap-south-1')
TABLE_NAME = 'BTP-StudentNoDues'

def lambda_handler(event, context):
    """
    Get pending no-dues for specific approver (faculty/admin)
    Query param: approverEmail
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
        # Get approver email from query parameters
        query_params = event.get('queryStringParameters', {}) or {}
        approver_email = query_params.get('approverEmail')
        
        if not approver_email:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': False, 'message': 'Approver email is required'})
            }
        
        # Query using ApproverEmailIndex
        table = dynamodb.Table(TABLE_NAME)
        response = table.query(
            IndexName='ApproverEmailIndex',
            KeyConditionExpression='currentApproverEmail = :email',
            FilterExpression='#status IN (:pending, :in_progress)',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={
                ':email': approver_email,
                ':pending': 'pending',
                ':in_progress': 'in_progress'
            },
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
                'message': f'Error fetching pending no-dues: {str(e)}'
            })
        }
