import json
import boto3

dynamodb = boto3.resource('dynamodb', region_name='ap-south-1')
TABLE_NAME = 'BTP-StudentNoDues'

def lambda_handler(event, context):
    """
    Get specific no-dues by ID
    Path parameter: noDuesId
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
        # Get noDuesId from path parameters
        path_params = event.get('pathParameters', {}) or {}
        nodues_id = path_params.get('id')
        
        if not nodues_id:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': False, 'message': 'No-Dues ID is required'})
            }
        
        # Get item from DynamoDB
        table = dynamodb.Table(TABLE_NAME)
        response = table.get_item(Key={'noDuesId': nodues_id})
        
        item = response.get('Item')
        
        if not item:
            return {
                'statusCode': 404,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': False, 'message': 'No-Dues record not found'})
            }
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'success': True,
                'data': item
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
                'message': f'Error fetching no-dues: {str(e)}'
            })
        }
