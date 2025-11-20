import json
import os
import base64

def lambda_handler(event, context):
    """
    Lambda Authorizer for Privy.io token verification
    Decodes JWT token locally without calling Privy API
    """
    
    print("Authorizer invoked")
    
    token = event.get('authorizationToken', '')
    method_arn = event['methodArn']
    
    # Check if token exists and starts with Bearer
    if not token or not token.startswith('Bearer '):
        print("ERROR: No token or invalid format")
        raise Exception('Unauthorized')
    
    # Extract token (remove "Bearer " prefix)
    privy_token = token[7:]
    print(f"Token received (first 30 chars): {privy_token[:30]}...")
    
    try:
        # Decode JWT token (without verification for now)
        user_data = decode_jwt_token(privy_token)
        print(f"✓ Token decoded for user: {user_data['user_id']}")
        
        # Generate IAM policy allowing access
        policy = generate_policy(
            principal_id=user_data['user_id'],
            effect='Allow',
            resource=method_arn,
            context=user_data
        )
        
        print("✓ Policy generated successfully")
        return policy
        
    except Exception as e:
        print(f"✗ Authorization failed: {str(e)}")
        raise Exception('Unauthorized')


def decode_jwt_token(token):
    """
    Decode JWT token and extract claims
    Note: This does NOT verify the signature - for production, you should verify
    """
    
    try:
        # JWT has 3 parts: header.payload.signature
        parts = token.split('.')
        
        if len(parts) != 3:
            raise Exception('Invalid JWT format')
        
        # Decode the payload (second part)
        # Add padding if needed (JWT base64 doesn't use padding)
        payload_b64 = parts[1]
        padding = 4 - (len(payload_b64) % 4)
        if padding != 4:
            payload_b64 += '=' * padding
        
        payload_bytes = base64.urlsafe_b64decode(payload_b64)
        payload = json.loads(payload_bytes.decode('utf-8'))
        
        print(f"JWT payload decoded: {json.dumps(payload)}")
        
        # Extract claims
        user_id = payload.get('sub')  # subject = user ID
        app_id = payload.get('aud')   # audience = Privy app ID
        issued_at = payload.get('iat')
        expires_at = payload.get('exp')
        
        if not user_id:
            raise Exception('Token missing "sub" (user ID) claim')
        
        # Verify app ID matches (optional but recommended)
        expected_app_id = os.environ.get('PRIVY_APP_ID')
        if expected_app_id and app_id != expected_app_id:
            print(f"WARNING: Token aud ({app_id}) doesn't match expected ({expected_app_id})")
            # For now, allow it - comment out line below to enforce
            # raise Exception('Token issued for different app')
        
        # Check expiration
        import time
        current_time = int(time.time())
        if expires_at and current_time > expires_at:
            raise Exception(f'Token expired at {expires_at}, current time is {current_time}')
        
        print(f"✓ Token valid - User: {user_id}, Expires: {expires_at}, Current: {current_time}")
        
        # For now, we don't have user email or role from the token
        # These would need to come from a database lookup or custom claims
        return {
            'user_id': user_id,
            'email': '',  # Would need to fetch from your user database
            'role': 'student'  # Default role, should fetch from database
        }
        
    except Exception as e:
        print(f"Token decode error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise Exception('Invalid token')


def generate_policy(principal_id, effect, resource, context):
    """
    Generate IAM policy for API Gateway
    """
    
    policy_document = {
        'Version': '2012-10-17',
        'Statement': [
            {
                'Action': 'execute-api:Invoke',
                'Effect': effect,
                'Resource': resource
            }
        ]
    }
    
    auth_response = {
        'principalId': principal_id,
        'policyDocument': policy_document,
        'context': {
            'userId': str(context['user_id']),
            'email': str(context['email']),
            'role': str(context['role'])
        }
    }
    
    return auth_response
