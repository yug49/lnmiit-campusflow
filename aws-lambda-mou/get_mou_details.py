import json
import boto3
from decimal import Decimal

dynamodb = boto3.resource('dynamodb', region_name='ap-south-1')
s3_client = boto3.client('s3', region_name='ap-south-1')

TABLE_NAME = 'CampusFlow-MOUs'
BUCKET_NAME = 'campusflow-mou-documents'

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

def lambda_handler(event, context):
    """
    Get detailed information about a specific MOU
    Path parameter: /mou/{mouId}
    """
    # Handle OPTIONS preflight request
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'OPTIONS,GET'
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
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'MOU not found'}),
                'isBase64Encoded': False
            }
        
        mou = response['Item']
        
        # Generate presigned URLs for all documents
        if 'mouDocumentKey' in mou:
            mou['mouDocumentUrl'] = s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': BUCKET_NAME, 'Key': mou['mouDocumentKey']},
                ExpiresIn=3600  # 1 hour
            )
        
        if 'facultySignatureKey' in mou and mou['facultySignatureKey']:
            mou['facultySignatureUrl'] = s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': BUCKET_NAME, 'Key': mou['facultySignatureKey']},
                ExpiresIn=3600
            )
        
        if 'adminSignatureKey' in mou and mou['adminSignatureKey']:
            mou['adminSignatureUrl'] = s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': BUCKET_NAME, 'Key': mou['adminSignatureKey']},
                ExpiresIn=3600
            )
        
        # Generate presigned URLs for supporting documents
        if 'supportingDocsKeys' in mou and mou['supportingDocsKeys']:
            mou['supportingDocsUrls'] = [
                s3_client.generate_presigned_url(
                    'get_object',
                    Params={'Bucket': BUCKET_NAME, 'Key': key},
                    ExpiresIn=3600
                ) for key in mou['supportingDocsKeys']
            ]
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'mou': mou}, cls=DecimalEncoder),
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
            'body': json.dumps({'error': f'Failed to fetch MOU details: {str(e)}'}),
            'isBase64Encoded': False
        }
