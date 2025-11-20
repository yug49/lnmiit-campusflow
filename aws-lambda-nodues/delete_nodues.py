import json
import boto3

dynamodb = boto3.resource('dynamodb', region_name='ap-south-1')
s3_client = boto3.client('s3', region_name='ap-south-1')

TABLE_NAME = 'BTP-StudentNoDues'
BUCKET_NAME = 'btp-nodues-docs'

def lambda_handler(event, context):
    """
    Delete no-dues (only if pending or rejected)
    Path parameter: noDuesId
    Query param: studentEmail (for authorization)
    """
    # Handle OPTIONS preflight request
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,DELETE'
            },
            'body': ''
        }
    
    try:
        # Get noDuesId from path parameters
        path_params = event.get('pathParameters', {}) or {}
        nodues_id = path_params.get('id')
        
        # Get student email from query parameters
        query_params = event.get('queryStringParameters', {}) or {}
        student_email = query_params.get('studentEmail')
        
        if not nodues_id:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': False, 'message': 'No-Dues ID is required'})
            }
        
        if not student_email:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': False, 'message': 'Student email is required'})
            }
        
        # Get current no-dues record
        table = dynamodb.Table(TABLE_NAME)
        response = table.get_item(Key={'noDuesId': nodues_id})
        item = response.get('Item')
        
        if not item:
            return {
                'statusCode': 404,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': False, 'message': 'No-Dues record not found'})
            }
        
        # Check ownership
        if item.get('studentEmail', '').lower() != student_email.lower():
            return {
                'statusCode': 403,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': False, 'message': 'You can only delete your own no-dues'})
            }
        
        # Check if approved (cannot delete approved)
        if item['status'] == 'approved':
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': False, 'message': 'Cannot delete approved no-dues'})
            }
        
        # Delete associated S3 documents if any
        document_url = item.get('documentUrl', '')
        if document_url and 'btp-nodues-docs' in document_url:
            try:
                # Extract S3 key from URL
                s3_key = document_url.split('btp-nodues-docs/')[-1]
                s3_client.delete_object(Bucket=BUCKET_NAME, Key=s3_key)
            except Exception as s3_error:
                print(f"Error deleting S3 object: {str(s3_error)}")
                # Continue with DynamoDB deletion even if S3 fails
        
        # Delete from DynamoDB
        table.delete_item(Key={'noDuesId': nodues_id})
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'success': True,
                'message': 'No-Dues deleted successfully'
            })
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
                'message': f'Error deleting no-dues: {str(e)}'
            })
        }
