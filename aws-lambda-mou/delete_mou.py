import json
import boto3

dynamodb = boto3.resource('dynamodb', region_name='ap-south-1')
s3_client = boto3.client('s3', region_name='ap-south-1')

TABLE_NAME = 'CampusFlow-MOUs'
BUCKET_NAME = 'campusflow-mou-documents'

def lambda_handler(event, context):
    """
    Delete an MOU (only if in PENDING_FACULTY or REJECTED status)
    Path parameter: /mou/{mouId}
    """
    # Handle OPTIONS preflight request
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'OPTIONS,DELETE'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        # Get mouId from path parameters
        path_params = event.get('pathParameters') or {}
        mou_id = path_params.get('mouId')
        
        if not mou_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Missing mouId parameter'}),
                'isBase64Encoded': False
            }
        
        # Fetch MOU from DynamoDB
        table = dynamodb.Table(TABLE_NAME)
        response = table.get_item(Key={'mouId': mou_id})
        
        if 'Item' not in response:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'MOU not found'}),
                'isBase64Encoded': False
            }
        
        mou = response['Item']
        current_status = mou.get('status')
        
        # Only allow deletion of pending or rejected MOUs
        if current_status not in ['PENDING_FACULTY', 'REJECTED']:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'Cannot delete MOU in current status',
                    'currentStatus': current_status
                }),
                'isBase64Encoded': False
            }
        
        # Delete all S3 objects related to this MOU
        s3_keys_to_delete = []
        
        if 'mouDocumentKey' in mou:
            s3_keys_to_delete.append(mou['mouDocumentKey'])
        
        if 'facultySignatureKey' in mou and mou['facultySignatureKey']:
            s3_keys_to_delete.append(mou['facultySignatureKey'])
        
        if 'adminSignatureKey' in mou and mou['adminSignatureKey']:
            s3_keys_to_delete.append(mou['adminSignatureKey'])
        
        if 'supportingDocsKeys' in mou:
            s3_keys_to_delete.extend(mou['supportingDocsKeys'])
        
        # Delete S3 objects
        for key in s3_keys_to_delete:
            try:
                s3_client.delete_object(Bucket=BUCKET_NAME, Key=key)
            except Exception as s3_error:
                print(f"Error deleting S3 object {key}: {str(s3_error)}")
        
        # Delete DynamoDB item
        table.delete_item(Key={'mouId': mou_id})
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': 'MOU deleted successfully',
                'mouId': mou_id
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Failed to delete MOU: {str(e)}'}),
            'isBase64Encoded': False
        }
