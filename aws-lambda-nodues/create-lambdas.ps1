# PowerShell script to create Lambda deployment packages for No-Dues system

Write-Host "Creating Lambda deployment packages for No-Dues system..." -ForegroundColor Cyan

# Create deployment directory
$deployDir = "deployment-packages"
if (Test-Path $deployDir) {
    Remove-Item -Recurse -Force $deployDir
}
New-Item -ItemType Directory -Path $deployDir | Out-Null

# List of Lambda functions for Student No-Dues
$lambdaFunctions = @(
    "submit_student_nodues",
    "get_my_nodues_status",
    "get_pending_nodues",
    "get_all_nodues",
    "get_nodues_by_id",
    "sign_nodues",
    "reject_nodues",
    "get_approval_flow",
    "delete_nodues"
)

Write-Host "`nCreating deployment packages..." -ForegroundColor Yellow

foreach ($func in $lambdaFunctions) {
    Write-Host "  Processing $func..." -ForegroundColor White
    
    # Create function directory
    $funcDir = Join-Path $deployDir $func
    New-Item -ItemType Directory -Path $funcDir | Out-Null
    
    # Copy Python file and rename to lambda_function.py (AWS Lambda convention)
    Copy-Item "$func.py" (Join-Path $funcDir "lambda_function.py")
    
    # Create zip file
    $zipPath = Join-Path $deployDir "$func.zip"
    Compress-Archive -Path (Join-Path $funcDir "*") -DestinationPath $zipPath -Force
    
    # Clean up temp directory
    Remove-Item -Recurse -Force $funcDir
    
    Write-Host "    Created $func.zip" -ForegroundColor Green
}

Write-Host "`nAll deployment packages created in '$deployDir' folder!" -ForegroundColor Green
Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "STUDENT NO-DUES LAMBDA FUNCTIONS" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Go to AWS Lambda Console: https://ap-south-1.console.aws.amazon.com/lambda" -ForegroundColor White
Write-Host "2. Create 9 Lambda functions for Student No-Dues (names below)" -ForegroundColor White
Write-Host "3. Upload the corresponding .zip file for each function" -ForegroundColor White
Write-Host "4. Configure each Lambda with:" -ForegroundColor White
Write-Host "   - Runtime: Python 3.11" -ForegroundColor Gray
Write-Host "   - Handler: lambda_function.lambda_handler" -ForegroundColor Gray
Write-Host "   - Role: CampusFlow-MOU-Lambda-Role (or your role)" -ForegroundColor Gray
Write-Host "   - Timeout: 30 seconds" -ForegroundColor Gray
Write-Host "   - Memory: 512 MB" -ForegroundColor Gray

Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "LAMBDA FUNCTION NAMES TO CREATE" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

$functionMapping = @{
    "BTP-SubmitStudentNoDues" = "submit_student_nodues.zip"
    "BTP-GetMyNoDuesStatus" = "get_my_nodues_status.zip"
    "BTP-GetPendingNoDues" = "get_pending_nodues.zip"
    "BTP-GetAllNoDues" = "get_all_nodues.zip"
    "BTP-GetNoDuesById" = "get_nodues_by_id.zip"
    "BTP-SignNoDues" = "sign_nodues.zip"
    "BTP-RejectNoDues" = "reject_nodues.zip"
    "BTP-GetApprovalFlow" = "get_approval_flow.zip"
    "BTP-DeleteNoDues" = "delete_nodues.zip"
}

Write-Host "`nFunction Name → Upload File:" -ForegroundColor Yellow
foreach ($funcName in $functionMapping.Keys | Sort-Object) {
    Write-Host "  $funcName" -ForegroundColor White -NoNewline
    Write-Host " → " -ForegroundColor Gray -NoNewline
    Write-Host "$($functionMapping[$funcName])" -ForegroundColor Green
}

Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "IMPORTANT REMINDERS" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "- Use existing role: CampusFlow-MOU-Lambda-Role" -ForegroundColor Yellow
Write-Host "- DynamoDB Table: BTP-StudentNoDues" -ForegroundColor Yellow
Write-Host "- S3 Bucket: btp-nodues-docs" -ForegroundColor Yellow
Write-Host "- Region: ap-south-1 (Mumbai)" -ForegroundColor Yellow
Write-Host "`nFor Faculty No-Dues, repeat the same process with:" -ForegroundColor Cyan
Write-Host "- DynamoDB Table: BTP-FacultyNoDues" -ForegroundColor Yellow
Write-Host "- Same Lambda functions (just change TABLE_NAME in code)" -ForegroundColor Yellow
