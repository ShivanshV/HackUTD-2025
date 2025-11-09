# Quick Fix: 401 Unauthorized Error

## The Problem
Your `.env` file has a placeholder API key: `your-nemotron-api-key-here`

This causes 401 errors when calling the Nemotron API.

## Solution Options

### Option 1: Get a Real API Key (For Full AI Features)

1. **Get API Key from NVIDIA**:
   - Visit: https://build.nvidia.com/nvidia/nemotron
   - Sign up/log in
   - Create an API key
   - Copy the key (looks like: `nvapi-xxxxx-xxxxx-xxxxx`)

2. **Update .env File**:
   ```powershell
   # Open backend/.env in a text editor
   # Replace this line:
   NEMOTRON_API_KEY=your-nemotron-api-key-here
   # With:
   NEMOTRON_API_KEY=nvapi-your-actual-key-here
   ```

3. **Restart Backend**:
   ```powershell
   docker compose -f docker-compose.dev.yml restart backend
   ```

4. **Verify**:
   ```powershell
   docker compose -f docker-compose.dev.yml exec backend python test_api.py
   ```

### Option 2: Test Without API Key (Vehicle Tools Work!)

You can test the vehicle search functionality immediately without an API key:

#### Using Browser (Easiest)
1. Open: **http://localhost:8000/docs**
2. Try these endpoints (no API key needed):
   - `GET /api/vehicles` - Get all vehicles
   - `GET /api/vehicles/search` - Search vehicles
   - `GET /api/vehicles/stats` - Get statistics

#### Using PowerShell
```powershell
# Get all vehicles
Invoke-RestMethod -Uri "http://localhost:8000/api/vehicles" | ConvertTo-Json

# Search vehicles
Invoke-RestMethod -Uri "http://localhost:8000/api/vehicles/search?max_price=30000&min_mpg=30" | ConvertTo-Json

# Get stats
Invoke-RestMethod -Uri "http://localhost:8000/api/vehicles/stats" | ConvertTo-Json
```

#### Using cURL
```bash
# Get all vehicles
curl http://localhost:8000/api/vehicles

# Search vehicles
curl "http://localhost:8000/api/vehicles/search?max_price=30000&min_mpg=30"

# Get stats
curl http://localhost:8000/api/vehicles/stats
```

### Option 3: Use the Setup Script

Run the PowerShell setup script:

```powershell
cd backend
.\SETUP_API_KEY.ps1
```

This will guide you through updating your API key.

## What Works Without API Key

✅ **Vehicle Endpoints** - All work without API key
- `/api/vehicles` - Get all vehicles
- `/api/vehicles/search` - Search with filters
- `/api/vehicles/{id}` - Get specific vehicle
- `/api/vehicles/stats` - Get statistics

✅ **Tool Execution** - Direct tool calls work
- `find_cars` - Search vehicles
- `calculate_true_cost` - Calculate costs
- `get_vehicle_details` - Get vehicle info

❌ **AI Chat/Orchestrator** - Requires valid API key
- `/api/orchestrator/chat` - Needs API key
- `/api/chat` - Needs API key

## Quick Test (No API Key Needed)

Test the vehicle search right now:

```powershell
# Open in browser
Start-Process "http://localhost:8000/docs"

# Or test with PowerShell
$response = Invoke-RestMethod -Uri "http://localhost:8000/api/vehicles/search?max_price=30000&min_mpg=30"
$response | ConvertTo-Json -Depth 3
```

## Summary

**Right Now (No API Key)**:
- ✅ Test vehicle endpoints at http://localhost:8000/docs
- ✅ Test tool execution: `docker compose -f docker-compose.dev.yml exec backend python test_orchestrator_flow.py`

**After Getting API Key**:
1. Update `backend/.env` with real key
2. Restart: `docker compose -f docker-compose.dev.yml restart backend`
3. Test: `docker compose -f docker-compose.dev.yml exec backend python test_api.py`
4. Test orchestrator: Use http://localhost:8000/docs → `/api/orchestrator/chat`

## Need Help?

- API Key Setup: See `backend/API_KEY_SETUP.md`
- Testing Guide: See `backend/TESTING_GUIDE.md`
- Quick Test: See `backend/QUICK_TEST_NO_API_KEY.md`

