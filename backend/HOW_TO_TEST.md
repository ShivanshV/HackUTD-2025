# How to Test the Orchestrator API

## ✅ Quick Start

Your API is running and ready to test! Here are multiple ways to test it.

## Method 1: Browser (Easiest) 🌐

### Step 1: Open Interactive Docs
```
http://localhost:8000/docs
```

### Step 2: Test Orchestrator Chat
1. Find `/api/orchestrator/chat` endpoint
2. Click **"Try it out"**
3. Paste this example:
```json
{
  "messages": [
    {
      "role": "user",
      "content": "I'm looking for a sedan under $30,000 with good fuel economy"
    }
  ]
}
```
4. Click **"Execute"**
5. See the AI response with tool calls!

### Step 3: Try Other Endpoints
- `GET /api/orchestrator/status` - Check status
- `GET /api/orchestrator/tools` - List available tools
- `GET /api/vehicles` - Get all vehicles
- `GET /api/vehicles/search` - Search vehicles

## Method 2: PowerShell Script ⚡

### Run the Test Script
```powershell
cd backend
.\test_orchestrator_chat.ps1
```

This will test:
- ✅ Orchestrator status
- ✅ Available tools
- ✅ Simple chat
- ✅ Find cars (with tool calling)
- ✅ Cost calculation (with tool calling)

## Method 3: Manual PowerShell Commands 💻

### Test 1: Check Status
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/orchestrator/status" | ConvertTo-Json
```

### Test 2: Simple Chat
```powershell
$body = @{
    messages = @(
        @{
            role = "user"
            content = "Hello! Can you help me find a car?"
        }
    )
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/orchestrator/chat" `
    -Method Post `
    -Body $body `
    -ContentType "application/json" | ConvertTo-Json
```

### Test 3: Find Cars (Tool Calling)
```powershell
$body = @{
    messages = @(
        @{
            role = "user"
            content = "I'm looking for a sedan under $30,000 with good fuel economy"
        }
    )
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/orchestrator/chat" `
    -Method Post `
    -Body $body `
    -ContentType "application/json" `
    -TimeoutSec 60 | ConvertTo-Json
```

### Test 4: Cost Calculation (Tool Calling)
```powershell
$body = @{
    messages = @(
        @{
            role = "user"
            content = "I have a 50-mile commute. What's the total cost of owning a Camry?"
        }
    )
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/orchestrator/chat" `
    -Method Post `
    -Body $body `
    -ContentType "application/json" `
    -TimeoutSec 60 | ConvertTo-Json
```

## Method 4: Python Test Script 🐍

### Run the Python Test
```powershell
# Inside Docker
docker compose -f docker-compose.dev.yml exec backend python test_orchestrator_api.py

# Or locally (if you have Python installed)
cd backend
python test_orchestrator_api.py
```

## Method 5: cURL Commands (Linux/Mac/Git Bash) 🔧

### Test Status
```bash
curl http://localhost:8000/api/orchestrator/status
```

### Test Chat
```bash
curl -X POST http://localhost:8000/api/orchestrator/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "I'm looking for a sedan under $30,000"
      }
    ]
  }'
```

## Example Test Cases 🧪

### 1. Simple Greeting
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Hello! Can you help me find a car?"
    }
  ]
}
```

### 2. Find Cars (Triggers Tool)
```json
{
  "messages": [
    {
      "role": "user",
      "content": "I'm looking for a sedan under $30,000 with good fuel economy"
    }
  ]
}
```

### 3. Cost Calculation (Triggers Tool)
```json
{
  "messages": [
    {
      "role": "user",
      "content": "I have a 50-mile commute each way. What would be the total cost of owning a Camry?"
    }
  ]
}
```

### 4. Vehicle Details (Triggers Tool)
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Tell me about the 2024 Toyota Camry. What are its specifications?"
    }
  ]
}
```

### 5. Multi-Turn Conversation
```json
{
  "messages": [
    {
      "role": "user",
      "content": "I need a car for my family"
    },
    {
      "role": "agent",
      "content": "I'd be happy to help! How many people will be riding?"
    },
    {
      "role": "user",
      "content": "We have 5 people, including 3 kids"
    },
    {
      "role": "user",
      "content": "I'd like to stay under $40,000 and need good fuel economy for my 60-mile commute"
    }
  ]
}
```

## Testing Vehicle Endpoints (No AI) 🚗

### Get All Vehicles
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/vehicles" | ConvertTo-Json
```

### Search Vehicles
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/vehicles/search?max_price=30000&min_mpg=30&body_style=sedan" | ConvertTo-Json
```

### Get Vehicle Stats
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/vehicles/stats" | ConvertTo-Json
```

### Get Specific Vehicle
```powershell
# Replace {vehicle-id} with actual ID from vehicles list
Invoke-RestMethod -Uri "http://localhost:8000/api/vehicles/{vehicle-id}" | ConvertTo-Json
```

## What to Expect 📊

### Successful Response
```json
{
  "role": "agent",
  "content": "Based on your requirements, I found several sedans under $30,000..."
}
```

### Tool Calling
When you ask about vehicles, the orchestrator will:
1. Automatically call `find_cars` tool
2. Get vehicle data
3. Generate intelligent response using the data
4. Return formatted response to you

### Error Response
If something goes wrong:
```json
{
  "role": "agent",
  "content": "Error: ..."
}
```

## Troubleshooting 🔧

### API Not Responding
```powershell
# Check if server is running
Invoke-RestMethod -Uri "http://localhost:8000/health"
```

### 401 Unauthorized
- Check if API key is set in `.env`
- Restart backend: `docker compose -f docker-compose.dev.yml restart backend`

### Timeout Errors
- Tool calling can take 30-60 seconds
- Increase timeout in your request
- Check server logs: `docker compose -f docker-compose.dev.yml logs backend`

### No Tool Calls
- Make sure your query is specific (e.g., "find sedan under $30,000")
- Check available tools: `GET /api/orchestrator/tools`

## Next Steps 🚀

1. **Test Basic Chat**: Start with simple greetings
2. **Test Tool Calling**: Ask about vehicles, prices, costs
3. **Test Multi-Turn**: Have a conversation
4. **Integrate Frontend**: Connect your frontend to the API
5. **Monitor Logs**: Watch tool calls in action

## Useful Links 🔗

- **API Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health
- **Status**: http://localhost:8000/api/orchestrator/status
- **Tools**: http://localhost:8000/api/orchestrator/tools

## Quick Test Commands 📝

```powershell
# Quick status check
Invoke-RestMethod -Uri "http://localhost:8000/api/orchestrator/status"

# Quick chat test
$body = '{"messages":[{"role":"user","content":"Hello!"}]}'
Invoke-RestMethod -Uri "http://localhost:8000/api/orchestrator/chat" -Method Post -Body $body -ContentType "application/json"

# Quick vehicle search
Invoke-RestMethod -Uri "http://localhost:8000/api/vehicles/search?max_price=30000"
```

Happy Testing! 🎉

