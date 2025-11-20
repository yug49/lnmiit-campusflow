cd C:\Atharva\College\BTP\lnmiit-campusflow-main\aws-lambda-voting

# Variables
$ROLE_ARN_BASIC = "arn:aws:iam::604216967884:role/VotingSystemBTP-Lambda-Basic_Role"
$ROLE_ARN_DYNAMODB = "arn:aws:iam::604216967884:role/VotingSystemBTP-Lambda-DynamoDB-Role"
$CANDIDATES_TABLE = "VotingSystemBTP-Candidates"
$VOTES_TABLE = "VotingSystemBTP-Votes"
$SESSIONS_TABLE = "VotingSystemBTP-Sessions"
$PRIVY_APP_ID = "cmhts45j400ajjv0cecqu7mb4"

Write-Host "Creating Lambda functions..." -ForegroundColor Cyan

# Lambda 1: Authorizer (uses Basic role, no DynamoDB)
Write-Host "Creating Privy Authorizer..." -ForegroundColor Yellow
aws lambda create-function `
  --function-name VotingSystemBTP-PrivyAuthorizer `
  --runtime python3.11 `
  --role $ROLE_ARN_BASIC `
  --handler lambda_function.lambda_handler `
  --zip-file fileb://authorizer.zip `
  --timeout 10 `
  --environment "Variables={PRIVY_APP_ID=$PRIVY_APP_ID}" `
  --region ap-south-1

# Lambda 2: Submit Candidature
Write-Host "Creating Submit Candidature..." -ForegroundColor Yellow
aws lambda create-function `
  --function-name VotingSystemBTP-SubmitCandidature `
  --runtime python3.11 `
  --role $ROLE_ARN_DYNAMODB `
  --handler submit_candidature.lambda_handler `
  --zip-file fileb://submit_candidature.zip `
  --timeout 10 `
  --environment "Variables={CANDIDATES_TABLE=$CANDIDATES_TABLE}" `
  --region ap-south-1

# Lambda 3: Get My Candidatures
Write-Host "Creating Get My Candidatures..." -ForegroundColor Yellow
aws lambda create-function `
  --function-name VotingSystemBTP-GetMyCandidatures `
  --runtime python3.11 `
  --role $ROLE_ARN_DYNAMODB `
  --handler get_my_candidatures.lambda_handler `
  --zip-file fileb://get_my_candidatures.zip `
  --timeout 10 `
  --environment "Variables={CANDIDATES_TABLE=$CANDIDATES_TABLE}" `
  --region ap-south-1

# Lambda 4: Get All Candidatures (Admin)
Write-Host "Creating Get All Candidatures..." -ForegroundColor Yellow
aws lambda create-function `
  --function-name VotingSystemBTP-GetAllCandidatures `
  --runtime python3.11 `
  --role $ROLE_ARN_DYNAMODB `
  --handler get_all_candidatures.lambda_handler `
  --zip-file fileb://get_all_candidatures.zip `
  --timeout 10 `
  --environment "Variables={CANDIDATES_TABLE=$CANDIDATES_TABLE}" `
  --region ap-south-1

# Lambda 5: Update Candidature Status (Admin)
Write-Host "Creating Update Candidature Status..." -ForegroundColor Yellow
aws lambda create-function `
  --function-name VotingSystemBTP-UpdateCandidatureStatus `
  --runtime python3.11 `
  --role $ROLE_ARN_DYNAMODB `
  --handler update_candidature_status.lambda_handler `
  --zip-file fileb://update_candidature_status.zip `
  --timeout 10 `
  --environment "Variables={CANDIDATES_TABLE=$CANDIDATES_TABLE}" `
  --region ap-south-1

# Lambda 6: Get Approved Candidates
Write-Host "Creating Get Approved Candidates..." -ForegroundColor Yellow
aws lambda create-function `
  --function-name VotingSystemBTP-GetApprovedCandidates `
  --runtime python3.11 `
  --role $ROLE_ARN_DYNAMODB `
  --handler get_approved_candidates.lambda_handler `
  --zip-file fileb://get_approved_candidates.zip `
  --timeout 10 `
  --environment "Variables={CANDIDATES_TABLE=$CANDIDATES_TABLE}" `
  --region ap-south-1

# Lambda 7: Authorize Voter (Admin)
Write-Host "Creating Authorize Voter..." -ForegroundColor Yellow
aws lambda create-function `
  --function-name VotingSystemBTP-AuthorizeVoter `
  --runtime python3.11 `
  --role $ROLE_ARN_DYNAMODB `
  --handler authorize_voter.lambda_handler `
  --zip-file fileb://authorize_voter.zip `
  --timeout 10 `
  --environment "Variables={SESSIONS_TABLE=$SESSIONS_TABLE,VOTES_TABLE=$VOTES_TABLE}" `
  --region ap-south-1

# Lambda 8: Check Authorization
Write-Host "Creating Check Authorization..." -ForegroundColor Yellow
aws lambda create-function `
  --function-name VotingSystemBTP-CheckAuthorization `
  --runtime python3.11 `
  --role $ROLE_ARN_DYNAMODB `
  --handler check_authorization.lambda_handler `
  --zip-file fileb://check_authorization.zip `
  --timeout 10 `
  --environment "Variables={SESSIONS_TABLE=$SESSIONS_TABLE,VOTES_TABLE=$VOTES_TABLE}" `
  --region ap-south-1

# Lambda 9: Cast Vote (Critical!)
Write-Host "Creating Cast Vote..." -ForegroundColor Yellow
aws lambda create-function `
  --function-name VotingSystemBTP-CastVote `
  --runtime python3.11 `
  --role $ROLE_ARN_DYNAMODB `
  --handler cast_vote.lambda_handler `
  --zip-file fileb://cast_vote.zip `
  --timeout 15 `
  --environment "Variables={VOTES_TABLE=$VOTES_TABLE,SESSIONS_TABLE=$SESSIONS_TABLE,CANDIDATES_TABLE=$CANDIDATES_TABLE}" `
  --region ap-south-1

# Lambda 10: Get Election Results (Admin)
Write-Host "Creating Get Election Results..." -ForegroundColor Yellow
aws lambda create-function `
  --function-name VotingSystemBTP-GetElectionResults `
  --runtime python3.11 `
  --role $ROLE_ARN_DYNAMODB `
  --handler get_election_results.lambda_handler `
  --zip-file fileb://get_election_results.zip `
  --timeout 30 `
  --environment "Variables={VOTES_TABLE=$VOTES_TABLE,CANDIDATES_TABLE=$CANDIDATES_TABLE}" `
  --region ap-south-1

Write-Host "`nAll Lambda functions created successfully!" -ForegroundColor Green
Write-Host "Verify in AWS Console: Lambda service" -ForegroundColor Cyan