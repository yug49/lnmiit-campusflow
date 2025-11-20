# PowerShell script to create Lambda deployment packages

Write-Host "Creating Lambda deployment packages for MOU system..." -ForegroundColor Cyan

# Create deployment directory
$deployDir = "deployment-packages"
if (Test-Path $deployDir) {
    Remove-Item -Recurse -Force $deployDir
}
New-Item -ItemType Directory -Path $deployDir | Out-Null

# List of Lambda functions
$lambdaFunctions = @(
    "submit_mou",
    "get_all_mous",
    "get_mou_details",
    "approve_mou",
    "reject_mou",
    "get_my_mous",
    "delete_mou"
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
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Go to AWS Lambda Console: https://ap-south-1.console.aws.amazon.com/lambda" -ForegroundColor White
Write-Host "2. Create 7 Lambda functions (one for each zip file)" -ForegroundColor White
Write-Host "3. Upload the corresponding .zip file for each function" -ForegroundColor White
Write-Host "4. Configure each Lambda with:" -ForegroundColor White
Write-Host "   - Runtime: Python 3.11" -ForegroundColor Gray
Write-Host "   - Handler: lambda_function.lambda_handler" -ForegroundColor Gray
Write-Host "   - Role: CampusFlow-MOU-Lambda-Role" -ForegroundColor Gray
Write-Host "   - Timeout: 30 seconds" -ForegroundColor Gray
Write-Host "   - Memory: 256 MB" -ForegroundColor Gray
