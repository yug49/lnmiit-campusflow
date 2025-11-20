import json
import boto3
import base64
import uuid
from datetime import datetime
from decimal import Decimal

dynamodb = boto3.resource('dynamodb', region_name='ap-south-1')
s3_client = boto3.client('s3', region_name='ap-south-1')

TABLE_NAME = 'CampusFlow-MOUs'
BUCKET_NAME = 'campusflow-mou-documents'

def lambda_handler(event, context):
    """
    Submit a new MOU with document and signature uploads
    Expected body:
    {
        "title": "MOU Title",
        "organization": "Organization Name",
        "description": "Description",
        "amount": 50000,
        "mouDocument": "base64_encoded_pdf",
        "mouDocumentName": "document.pdf",
        "supportingDocs": ["base64_encoded_file1", "base64_encoded_file2"],
        "supportingDocsNames": ["file1.pdf", "file2.pdf"],
        "facultySignature": "base64_encoded_image",
        "submittedBy": "user_id",
        "submittedByName": "Faculty Name",
        "submittedByEmail": "faculty@lnmiit.ac.in"
    }
    """
    # Handle OPTIONS preflight request
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        # Log the entire event for debugging
        print(f"Full event received: {json.dumps(event)}")
        
        # Parse request body
        body_content = event.get('body', '{}')
        print(f"Body content type: {type(body_content)}")
        print(f"Body content: {body_content[:200] if body_content else 'None'}")
        
        # Handle case where body might already be a dict or None
        if isinstance(body_content, dict):
            body = body_content
        elif body_content is None or body_content == '':
            body = {}
        else:
            # Try to decode from base64 first (API Gateway sometimes base64 encodes the body)
            try:
                decoded_body = base64.b64decode(body_content).decode('utf-8')
                print(f"Body was base64 encoded, decoded to: {decoded_body[:200]}")
                body = json.loads(decoded_body)
            except Exception as base64_err:
                # If base64 decode fails, try parsing as regular JSON
                print(f"Base64 decode failed ({str(base64_err)}), trying direct JSON parse")
                try:
                    body = json.loads(body_content)
                except json.JSONDecodeError as json_err:
                    print(f"JSON parse also failed: {str(json_err)}")
                    return {
                        'statusCode': 400,
                        'headers': {
                            'Access-Control-Allow-Origin': '*',
                            'Content-Type': 'application/json'
                        },
                        'body': json.dumps({'error': f'Invalid request body format: {str(json_err)}'}),
                        'isBase64Encoded': False
                    }
        
        # Log parsed body
        print(f"Parsed body keys: {body.keys() if isinstance(body, dict) else 'Not a dict'}")
        
        # Validate required fields
        required_fields = ['title', 'organization', 'description', 'amount', 'mouDocument', 
                          'mouDocumentName', 'submittedBy', 'submittedByName', 'submittedByEmail']
        for field in required_fields:
            if field not in body:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': f'Missing required field: {field}'}),
                    'isBase64Encoded': False
                }
        
        # Generate unique MOU ID
        mou_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat()
        
        # Upload MOU document to S3
        mou_doc_key = f"mou-documents/{mou_id}/{body['mouDocumentName']}"
        mou_doc_data = base64.b64decode(body['mouDocument'])
        s3_client.put_object(
            Bucket=BUCKET_NAME,
            Key=mou_doc_key,
            Body=mou_doc_data,
            ContentType='application/pdf',
            ServerSideEncryption='AES256'
        )
        
        # Upload supporting documents if provided
        supporting_docs_keys = []
        if 'supportingDocs' in body and 'supportingDocsNames' in body:
            for idx, (doc, name) in enumerate(zip(body['supportingDocs'], body['supportingDocsNames'])):
                doc_key = f"mou-documents/{mou_id}/supporting/{name}"
                doc_data = base64.b64decode(doc)
                s3_client.put_object(
                    Bucket=BUCKET_NAME,
                    Key=doc_key,
                    Body=doc_data,
                    ServerSideEncryption='AES256'
                )
                supporting_docs_keys.append(doc_key)
        
        # Upload faculty signature if provided
        faculty_signature_key = None
        if 'facultySignature' in body:
            faculty_signature_key = f"signatures/{mou_id}/faculty_signature.png"
            signature_data = base64.b64decode(body['facultySignature'])
            s3_client.put_object(
                Bucket=BUCKET_NAME,
                Key=faculty_signature_key,
                Body=signature_data,
                ContentType='image/png',
                ServerSideEncryption='AES256'
            )
        
        # Prepare DynamoDB item
        table = dynamodb.Table(TABLE_NAME)
        item = {
            'mouId': mou_id,
            'title': body['title'],
            'organization': body['organization'],
            'description': body['description'],
            'amount': Decimal(str(body['amount'])),
            'mouDocumentKey': mou_doc_key,
            'mouDocumentName': body.get('mouDocumentName', 'document.pdf'),
            'documentHash': body.get('documentHash', ''),
            'supportingDocsKeys': supporting_docs_keys,
            'facultySignatureKey': faculty_signature_key,
            'submittedBy': body['submittedBy'],
            'submittedByName': body['submittedByName'],
            'submittedByEmail': body['submittedByEmail'],
            'status': 'PENDING_FACULTY',
            'createdAt': timestamp,
            'updatedAt': timestamp,
            'approvalChain': []
        }
        
        # Add recipientsFlow if provided
        if 'recipientsFlow' in body:
            item['recipientsFlow'] = body['recipientsFlow']
        
        # Add walletAddress if provided
        if 'walletAddress' in body:
            item['walletAddress'] = body['walletAddress']
        
        # Save to DynamoDB
        table.put_item(Item=item)
        
        return {
            'statusCode': 201,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': json.dumps({
                'message': 'MOU submitted successfully',
                'mouId': mou_id,
                'status': 'PENDING_FACULTY'
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': json.dumps({'error': f'Failed to submit MOU: {str(e)}'}),
            'isBase64Encoded': False
        }
