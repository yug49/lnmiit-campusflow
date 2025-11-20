import json
import boto3
from datetime import datetime

dynamodb = boto3.resource('dynamodb', region_name='ap-south-1')
TABLE_NAME = 'BTP-StudentNoDues'

def lambda_handler(event, context):
    """
    Sign/approve no-dues (faculty/admin)
    Path parameter: noDuesId
    Body: {
        "signature": "signature_string",
        "walletAddress": "0x...",
        "signerName": "Faculty Name",
        "signerEmail": "faculty@lnmiit.ac.in"
    }
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
        
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        signature = body.get('signature')
        wallet_address = body.get('walletAddress')
        signer_name = body.get('signerName')
        signer_email = body.get('signerEmail')
        
        if not all([signature, wallet_address, signer_email]):
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': False, 'message': 'Signature, wallet address, and signer email are required'})
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
        
        # Check if already approved or rejected
        if item['status'] in ['approved', 'rejected']:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': False, 'message': f'No-Dues already {item["status"]}'})
            }
        
        # Verify signer is the current approver
        current_stage = item.get('currentStage', 0)
        approval_flow = item.get('approvalFlow', [])
        
        if current_stage >= len(approval_flow):
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': False, 'message': 'All approvals already completed'})
            }
        
        current_approver = approval_flow[current_stage]
        if current_approver['email'].lower() != signer_email.lower():
            return {
                'statusCode': 403,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': False, 'message': 'You are not authorized to sign at this stage'})
            }
        
        # Add signature
        timestamp = int(datetime.utcnow().timestamp())
        new_signature = {
            'signerEmail': signer_email,
            'signerName': signer_name,
            'department': current_approver.get('department', ''),
            'walletAddress': wallet_address,
            'signature': signature,
            'timestamp': timestamp,
            'order': current_stage + 1
        }
        
        signatures = item.get('signatures', [])
        signatures.append(new_signature)
        
        # Update stage and status
        new_stage = current_stage + 1
        new_status = 'approved' if new_stage >= len(approval_flow) else 'in_progress'
        
        # Get next approver email if not complete
        next_approver_email = ''
        if new_stage < len(approval_flow):
            next_approver_email = approval_flow[new_stage]['email']
        
        # Update DynamoDB
        update_expression = 'SET signatures = :signatures, currentStage = :stage, #status = :status, updatedAt = :updated, currentApproverEmail = :nextEmail'
        expression_values = {
            ':signatures': signatures,
            ':stage': new_stage,
            ':status': new_status,
            ':updated': timestamp,
            ':nextEmail': next_approver_email
        }
        
        if new_status == 'approved':
            update_expression += ', completedAt = :completed'
            expression_values[':completed'] = timestamp
        
        table.update_item(
            Key={'noDuesId': nodues_id},
            UpdateExpression=update_expression,
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues=expression_values
        )
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'success': True,
                'message': f'No-Dues {new_status} successfully',
                'data': {
                    'status': new_status,
                    'currentStage': new_stage,
                    'totalStages': len(approval_flow)
                }
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
                'message': f'Error signing no-dues: {str(e)}'
            })
        }
