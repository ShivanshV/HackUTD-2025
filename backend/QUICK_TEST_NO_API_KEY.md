# Quick Test Guide (No API Key Required)

You can test the vehicle search functionality immediately without an API key!

## Test Vehicle Endpoints (No API Key Needed)

### 1. Using FastAPI Docs (Easiest)

1. Open: **http://localhost:8000/docs**
2. Find the `/api/vehicles/*` endpoints
3. Try these endpoints:

#### Get All Vehicles
- Endpoint: `GET /api/vehicles`
- Click "Try it out" → "Execute"
- See all 246 vehicles

#### Search Vehicles
- Endpoint: `GET /api/vehicles/search`
- Parameters:
  - `max_price`: 30000
  - `min_mpg`: 30
  - `body_style`: sedan
- Click "Execute"
- See filtered results

#### Get Vehicle Stats
- Endpoint: `GET /api/vehicles/stats`
- Click "Execute"
- See catalog statistics

### 2. Using cURL

```bash
# Get all vehicles
curl http://localhost:8000/api/vehicles

# Search for sedans under $30,000
curl "http://localhost:8000/api/vehicles/search?max_price=30000&body_style=sedan"

# Get vehicle stats
curl http://localhost:8000/api/vehicles/stats

# Get specific vehicle (replace {id} with actual vehicle ID)
curl http://localhost:8000/api/vehicles/{vehicle-id}
```

### 3. Using Python

```python
import requests

# Get all vehicles
response = requests.get("http://localhost:8000/api/vehicles")
vehicles = response.json()
print(f"Found {len(vehicles)} vehicles")

# Search vehicles
response = requests.get("http://localhost:8000/api/vehicles/search", params={
    "max_price": 30000,
    "min_mpg": 30,
    "body_style": "sedan"
})
results = response.json()
print(f"Found {len(results)} matching vehicles")
```

## Test Tool Execution Directly

Run the orchestrator flow test (tools work without API key):

```bash
docker compose -f docker-compose.dev.yml exec backend python test_orchestrator_flow.py
```

This will test:
- ✅ Tool definitions
- ✅ Direct tool execution (find_cars, calculate_true_cost, get_vehicle_details)
- ❌ AI chat (requires API key)

## Get a Valid API Key

To test the full orchestrator with AI responses:

1. Get API key from: https://build.nvidia.com/nvidia/nemotron
2. Add to `backend/.env`: `NEMOTRON_API_KEY=your-actual-key`
3. Restart: `docker compose -f docker-compose.dev.yml restart backend`
4. Test: `docker compose -f docker-compose.dev.yml exec backend python test_api.py`

## Summary

- **Vehicle endpoints** ✅ Work without API key
- **Tool execution** ✅ Works without API key  
- **AI chat/orchestrator** ❌ Requires valid API key

Start with the vehicle endpoints to test the core functionality!

