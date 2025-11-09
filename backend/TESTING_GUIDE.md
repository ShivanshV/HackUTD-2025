# Testing the Orchestrator API Locally

This guide explains how to test the Nemotron Orchestrator API on your local machine.

## Prerequisites

1. **Docker Desktop** must be running (if using Docker)
2. **Python 3.11+** installed (if running directly)
3. **NEMOTRON_API_KEY** configured in `.env` file (optional - some tests will work without it)

## Option 1: Using Docker (Recommended)

### Start the Server

```bash
# From the project root
docker compose -f docker-compose.dev.yml up --build

# Or if containers are already built
docker compose -f docker-compose.dev.yml up
```

The API will be available at: **http://localhost:8000**

### Test the API

#### Method 1: FastAPI Interactive Docs (Easiest)

1. Open your browser and go to: **http://localhost:8000/docs**
2. You'll see the interactive API documentation (Swagger UI)
3. Click on any endpoint to expand it
4. Click "Try it out" to test the endpoint
5. Fill in the request body and click "Execute"

**Example: Test Orchestrator Chat**
1. Navigate to `/api/orchestrator/chat` endpoint
2. Click "Try it out"
3. Use this request body:
```json
{
  "messages": [
    {
      "role": "user",
      "content": "I'm looking for a sedan under $30,000"
    }
  ]
}
```
4. Click "Execute"
5. See the response below

#### Method 2: Using the Test Script

```bash
# Install requests if not already installed
docker compose -f docker-compose.dev.yml exec backend pip install requests

# Run the test script
docker compose -f docker-compose.dev.yml exec backend python test_orchestrator_api.py
```

#### Method 3: Using cURL

```bash
# Test orchestrator status
curl http://localhost:8000/api/orchestrator/status

# Test available tools
curl http://localhost:8000/api/orchestrator/tools

# Test orchestrator chat
curl -X POST http://localhost:8000/api/orchestrator/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Hello! Can you help me find a car?"
      }
    ]
  }'
```

#### Method 4: Using Python Requests

```python
import requests

# Test orchestrator chat
response = requests.post(
    "http://localhost:8000/api/orchestrator/chat",
    json={
        "messages": [
            {
                "role": "user",
                "content": "I'm looking for a sedan under $30,000"
            }
        ]
    }
)

print(response.json())
```

## Option 2: Running Directly (Without Docker)

### Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file with your API key
echo "NEMOTRON_API_KEY=your-key-here" > .env
```

### Start the Server

```bash
# From the backend directory
python main.py

# Or using uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: **http://localhost:8000**

### Test the API

Same methods as Option 1, but run the test script directly:

```bash
# Install requests
pip install requests

# Run the test script
python test_orchestrator_api.py
```

## Available Endpoints

### 1. Orchestrator Status
- **GET** `/api/orchestrator/status`
- Returns orchestrator configuration and status

### 2. Available Tools
- **GET** `/api/orchestrator/tools`
- Returns list of available tools

### 3. Orchestrator Chat (Main Endpoint)
- **POST** `/api/orchestrator/chat`
- Request body:
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Your message here"
    }
  ]
}
```
- Response:
```json
{
  "role": "agent",
  "content": "Agent's response"
}
```

### 4. Streaming Chat
- **POST** `/api/orchestrator/chat/stream`
- Returns Server-Sent Events (SSE) stream
- Use with EventSource in JavaScript or similar

## Example Test Cases

### Simple Chat
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

### Tool Calling - Find Cars
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

### Tool Calling - Cost Calculation
```json
{
  "messages": [
    {
      "role": "user",
      "content": "I have a 50-mile commute. What would be the total cost of owning a Camry?"
    }
  ]
}
```

### Multi-Turn Conversation
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
    }
  ]
}
```

### Vehicle Details
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Tell me about the 2024 Toyota Camry"
    }
  ]
}
```

## Testing Tools Directly

You can also test the tools directly using the vehicle endpoints:

```bash
# Get all vehicles
curl http://localhost:8000/api/vehicles

# Search vehicles
curl "http://localhost:8000/api/vehicles/search?max_price=30000&min_mpg=30"

# Get vehicle by ID
curl http://localhost:8000/api/vehicles/camry-2024
```

## Troubleshooting

### API Key Not Configured
If you see `401 Unauthorized` errors, make sure:
1. Your `.env` file exists in the `backend/` directory
2. It contains: `NEMOTRON_API_KEY=your-actual-api-key`
3. The server has been restarted after adding the key

### Server Not Starting
- Check if port 8000 is already in use
- Make sure Docker is running (if using Docker)
- Check the logs: `docker compose -f docker-compose.dev.yml logs backend`

### Tools Not Working
- Verify that `cars.json` exists in `backend/app/data/`
- Check the server logs for errors
- Test the vehicle endpoints directly to ensure data is loaded

## Next Steps

1. **Test with Real API Key**: Get a Nemotron API key and add it to `.env`
2. **Integrate with Frontend**: Connect the frontend to use the orchestrator endpoint
3. **Monitor Logs**: Watch the server logs to see tool calls in action
4. **Customize Tools**: Add more tools or modify existing ones in `app/tools/vehicle_tools.py`

## Additional Resources

- FastAPI Docs: http://localhost:8000/docs
- Alternative Docs: http://localhost:8000/redoc
- Health Check: http://localhost:8000/health

