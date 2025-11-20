import json
import boto3
from decimal import Decimal
from boto3.dynamodb.conditions import Attr

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
    Get MOUs submitted by a specific user
    Query params: ?userId=user_id
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
        # Get query parameters
        query_params = event.get('queryStringParameters') or {}
        user_id = query_params.get('userId')
        
        if not user_id:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Missing userId parameter'})
            }
        
        table = dynamodb.Table(TABLE_NAME)
        
        # Scan with filter for submittedBy OR submittedByEmail (to handle both cases)
        response = table.scan(
            FilterExpression=Attr('submittedBy').eq(user_id) | Attr('submittedByEmail').eq(user_id)
        )
        
        mous = response.get('Items', [])
        
        # Generate presigned URLs for documents
        for mou in mous:
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
        
        # Sort by createdAt (newest first)
        mous.sort(key=lambda x: x.get('createdAt', ''), reverse=True)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'mous': mous,
                'count': len(mous)
            }, cls=DecimalEncoder),
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
            'body': json.dumps({'error': f'Failed to fetch user MOUs: {str(e)}'}),
            'isBase64Encoded': False
        }
