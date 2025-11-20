import json
import boto3
from datetime import datetime

dynamodb = boto3.resource('dynamodb', region_name='ap-south-1')
TABLE_NAME = 'BTP-StudentNoDues'

def lambda_handler(event, context):
    """
    Reject no-dues (faculty/admin)
    Path parameter: noDuesId
    Body: {
        "reason": "Rejection reason",
        "rejectedBy": {
            "email": "faculty@lnmiit.ac.in",
            "name": "Faculty Name",
            "department": "Department"
        }
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
        reason = body.get('reason', 'No reason provided')
        rejected_by = body.get('rejectedBy', {})
        
        if not rejected_by.get('email'):
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': False, 'message': 'Rejector email is required'})
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
        
        # Verify rejector is the current approver
        current_stage = item.get('currentStage', 0)
        approval_flow = item.get('approvalFlow', [])
        
        if current_stage < len(approval_flow):
            current_approver = approval_flow[current_stage]
            if current_approver['email'].lower() != rejected_by['email'].lower():
                return {
                    'statusCode': 403,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': False, 'message': 'You are not authorized to reject at this stage'})
                }
        
        # Update to rejected status
        timestamp = int(datetime.utcnow().timestamp())
        rejection_details = {
            'rejectedBy': rejected_by,
            'reason': reason,
            'timestamp': timestamp
        }
        
        table.update_item(
            Key={'noDuesId': nodues_id},
            UpdateExpression='SET #status = :status, rejectionDetails = :rejection, updatedAt = :updated, currentApproverEmail = :empty',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={
                ':status': 'rejected',
                ':rejection': rejection_details,
                ':updated': timestamp,
                ':empty': ''
            }
        )
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'success': True,
                'message': 'No-Dues rejected successfully',
                'data': {
                    'status': 'rejected',
                    'reason': reason
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
                'message': f'Error rejecting no-dues: {str(e)}'
            })
        }
