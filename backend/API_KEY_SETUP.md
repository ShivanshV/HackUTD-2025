# Setting Up Nemotron API Key

## Issue: 401 Unauthorized Error

If you're seeing this error:
```json
{
  "role": "agent",
  "content": "Error: Error code: 401 - {'status': 401, 'title': 'Unauthorized', 'detail': 'Authentication failed'}"
}
```

This means your Nemotron API key is either:
1. Not set
2. Invalid/expired
3. Still using the placeholder value

## Solution: Get a Valid API Key

### Option 1: Get Nemotron API Key from NVIDIA

1. **Visit NVIDIA API Portal**:
   - Go to: https://build.nvidia.com/nvidia/nemotron
   - Sign up or log in to your NVIDIA account

2. **Create an API Key**:
   - Navigate to API keys section
   - Create a new API key
   - Copy the key (it will look like: `nvapi-xxxxx-xxxxx-xxxxx-xxxxx`)

3. **Add to Your .env File**:
   ```bash
   # In backend/.env
   NEMOTRON_API_KEY=nvapi-your-actual-key-here
   ```

4. **Restart the Server**:
   ```bash
   docker compose -f docker-compose.dev.yml restart backend
   ```

### Option 2: Test Without API Key (Tool Testing)

Even without a valid API key, you can test the vehicle search tools directly:

#### Test Vehicle Endpoints (No API Key Required)

```bash
# Get all vehicles
curl http://localhost:8000/api/vehicles

# Search vehicles
curl "http://localhost:8000/api/vehicles/search?max_price=30000&min_mpg=30"

# Get vehicle by ID
curl http://localhost:8000/api/vehicles/{vehicle-id}

# Get vehicle stats
curl http://localhost:8000/api/vehicles/stats
```

#### Use the FastAPI Docs

1. Go to: http://localhost:8000/docs
2. Try the `/api/vehicles/*` endpoints (these don't require the API key)
3. These endpoints let you test the vehicle search functionality directly

### Option 3: Use Mock Mode (For Development)

If you want to test the orchestrator structure without a real API key, you can modify the orchestrator to use mock responses. However, this requires code changes.

## Verifying Your API Key

### Check if API Key is Loaded

```bash
# Inside Docker container
docker compose -f docker-compose.dev.yml exec backend python -c "from app.core.config import settings; print('Key loaded:', bool(settings.NEMOTRON_API_KEY)); print('Key preview:', settings.NEMOTRON_API_KEY[:10] + '...' if settings.NEMOTRON_API_KEY and len(settings.NEMOTRON_API_KEY) > 10 else 'NOT SET')"
```

### Test API Key Validity

```bash
# Test the API key directly
docker compose -f docker-compose.dev.yml exec backend python test_api.py
```

If the key is valid, you'll see:
```
✅ SUCCESS: Nemotron API key is working correctly!
```

If invalid, you'll see:
```
❌ FAILED: Nemotron API key is not working
```

## File Locations

- **Environment file**: `backend/.env`
- **Example file**: `backend/.env.example` (if it exists)
- **Config file**: `backend/app/core/config.py`

## Environment File Format

Your `.env` file should look like:

```env
# Server Configuration
HOST=0.0.0.0
PORT=8000
ENV=development

# CORS
CORS_ORIGINS=["http://localhost:3000","http://frontend:3000"]

# AI Model Configuration
MODEL_TEMPERATURE=0.7
MAX_TOKENS=1000

# API Keys
NEMOTRON_API_KEY=nvapi-your-actual-key-here
```

## Common Issues

### 1. API Key Not Loading

**Problem**: Key is set in `.env` but not being loaded

**Solution**:
- Make sure `.env` is in the `backend/` directory
- Restart the Docker container after changing `.env`
- Check that the key name is exactly `NEMOTRON_API_KEY` (case-sensitive)

### 2. Placeholder Key Still Being Used

**Problem**: Key looks like "your-nemotron-api-key"

**Solution**:
- Replace with your actual API key from NVIDIA
- Remove any quotes around the key in `.env`
- Don't include spaces around the `=` sign

### 3. 401 Unauthorized After Setting Key

**Problem**: Key is set but still getting 401 errors

**Solution**:
- Verify the key is correct (no typos)
- Check if the key has expired
- Make sure you're using a Nemotron API key, not an OpenAI key
- Try regenerating the key from NVIDIA portal

## Testing Without API Key

While you wait for a valid API key, you can:

1. **Test Vehicle Tools Directly**:
   - Use `/api/vehicles/*` endpoints
   - These work without any API key

2. **Test Tool Execution**:
   - Run: `docker compose -f docker-compose.dev.yml exec backend python test_orchestrator_flow.py`
   - The direct tool execution tests (TEST 8) will work without an API key

3. **View Available Tools**:
   - `GET /api/orchestrator/tools` - Works without API key
   - `GET /api/orchestrator/status` - Shows API key status

## Next Steps

1. Get a valid Nemotron API key from NVIDIA
2. Add it to `backend/.env`
3. Restart the backend container
4. Test with: `docker compose -f docker-compose.dev.yml exec backend python test_api.py`
5. Once verified, test the orchestrator endpoints

## Additional Resources

- NVIDIA Nemotron: https://build.nvidia.com/nvidia/nemotron
- API Documentation: http://localhost:8000/docs
- Testing Guide: `backend/TESTING_GUIDE.md`

