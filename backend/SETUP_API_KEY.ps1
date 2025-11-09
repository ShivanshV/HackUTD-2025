# PowerShell script to help set up Nemotron API Key
# Run this script to update your .env file with a real API key

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Nemotron API Key Setup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ Error: .env file not found!" -ForegroundColor Red
    Write-Host "Please create a .env file in the backend directory" -ForegroundColor Yellow
    exit 1
}

Write-Host "Current .env file found." -ForegroundColor Green
Write-Host ""

# Instructions
Write-Host "To get a Nemotron API key:" -ForegroundColor Yellow
Write-Host "1. Visit: https://build.nvidia.com/nvidia/nemotron" -ForegroundColor White
Write-Host "2. Sign up or log in to your NVIDIA account" -ForegroundColor White
Write-Host "3. Create a new API key" -ForegroundColor White
Write-Host "4. Copy the API key (it will look like: nvapi-xxxxx-xxxxx-xxxxx)" -ForegroundColor White
Write-Host ""

# Ask for API key
$apiKey = Read-Host "Enter your Nemotron API key (or press Enter to skip)"

if ([string]::IsNullOrWhiteSpace($apiKey)) {
    Write-Host ""
    Write-Host "⚠️  No API key provided. Skipping update." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "You can still test the vehicle endpoints without an API key:" -ForegroundColor Cyan
    Write-Host "  - http://localhost:8000/api/vehicles" -ForegroundColor White
    Write-Host "  - http://localhost:8000/api/vehicles/search" -ForegroundColor White
    Write-Host "  - http://localhost:8000/docs" -ForegroundColor White
    exit 0
}

# Update .env file
Write-Host ""
Write-Host "Updating .env file..." -ForegroundColor Yellow

$envContent = Get-Content .env -Raw

# Replace the placeholder API key
$envContent = $envContent -replace "NEMOTRON_API_KEY=your-nemotron-api-key-here", "NEMOTRON_API_KEY=$apiKey"
$envContent = $envContent -replace "NEMOTRON_API_KEY=.*", "NEMOTRON_API_KEY=$apiKey"

Set-Content -Path .env -Value $envContent -NoNewline

Write-Host "✅ API key updated in .env file!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Restart the backend container:" -ForegroundColor White
Write-Host "   docker compose -f docker-compose.dev.yml restart backend" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Test the API key:" -ForegroundColor White
Write-Host "   docker compose -f docker-compose.dev.yml exec backend python test_api.py" -ForegroundColor Gray
Write-Host ""

