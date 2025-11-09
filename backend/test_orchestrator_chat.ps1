# PowerShell script to test the Orchestrator API
# This script tests the orchestrator chat endpoint with various queries

$baseUrl = "http://localhost:8000/api"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Testing Orchestrator API" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Check Status
Write-Host "Test 1: Checking Orchestrator Status..." -ForegroundColor Yellow
try {
    $status = Invoke-RestMethod -Uri "$baseUrl/orchestrator/status" -Method Get
    Write-Host "✅ Status: $($status.status)" -ForegroundColor Green
    Write-Host "   API Key Configured: $($status.api_key_configured)" -ForegroundColor White
    Write-Host "   Tools Available: $($status.tools_count)" -ForegroundColor White
    Write-Host "   Model: $($status.model)" -ForegroundColor White
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 2: Get Available Tools
Write-Host "Test 2: Getting Available Tools..." -ForegroundColor Yellow
try {
    $tools = Invoke-RestMethod -Uri "$baseUrl/orchestrator/tools" -Method Get
    Write-Host "✅ Found $($tools.count) tools:" -ForegroundColor Green
    foreach ($tool in $tools.tools) {
        Write-Host "   - $($tool.name): $($tool.description.Substring(0, [Math]::Min(60, $tool.description.Length)))..." -ForegroundColor White
    }
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 3: Simple Chat
Write-Host "Test 3: Simple Chat (No Tool Calling)..." -ForegroundColor Yellow
$simpleChat = @{
    messages = @(
        @{
            role = "user"
            content = "Hello! Can you help me find a car?"
        }
    )
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/orchestrator/chat" -Method Post -Body $simpleChat -ContentType "application/json"
    Write-Host "✅ Response:" -ForegroundColor Green
    Write-Host "   $($response.content.Substring(0, [Math]::Min(200, $response.content.Length)))..." -ForegroundColor White
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "   Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}
Write-Host ""

# Test 4: Find Cars (Should Trigger Tool)
Write-Host "Test 4: Find Cars Query (Tool Calling)..." -ForegroundColor Yellow
$findCars = @{
    messages = @(
        @{
            role = "user"
            content = "I'm looking for a sedan under $30,000 with good fuel economy. Can you help me find one?"
        }
    )
} | ConvertTo-Json

try {
    Write-Host "   Sending request (this may take a moment)..." -ForegroundColor Gray
    $response = Invoke-RestMethod -Uri "$baseUrl/orchestrator/chat" -Method Post -Body $findCars -ContentType "application/json" -TimeoutSec 60
    Write-Host "✅ Response:" -ForegroundColor Green
    Write-Host "   $($response.content)" -ForegroundColor White
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "   Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}
Write-Host ""

# Test 5: Cost Calculation (Should Trigger Tool)
Write-Host "Test 5: Cost Calculation Query (Tool Calling)..." -ForegroundColor Yellow
$costCalc = @{
    messages = @(
        @{
            role = "user"
            content = "I have a 50-mile commute each way. What would be the total cost of owning a Camry?"
        }
    )
} | ConvertTo-Json

try {
    Write-Host "   Sending request (this may take a moment)..." -ForegroundColor Gray
    $response = Invoke-RestMethod -Uri "$baseUrl/orchestrator/chat" -Method Post -Body $costCalc -ContentType "application/json" -TimeoutSec 60
    Write-Host "✅ Response:" -ForegroundColor Green
    Write-Host "   $($response.content)" -ForegroundColor White
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "   Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}
Write-Host ""

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Testing Complete!" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "For more interactive testing, visit:" -ForegroundColor Yellow
Write-Host "  http://localhost:8000/docs" -ForegroundColor White
Write-Host ""

