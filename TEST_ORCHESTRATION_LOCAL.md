# Testing Nemotron Orchestration Locally

## Prerequisites

1. **Docker Desktop running** (if using Docker)
2. **Backend dependencies installed** (if running directly)
3. **Nemotron API key configured** in `backend/.env`

## Method 1: Using Docker (Recommended)

### Step 1: Start the Backend

```bash
# Navigate to project root
cd /Users/shivansh/abombinator/HackUTD-2025

# Start backend in dev mode
docker compose -f docker-compose.dev.yml up --build backend
```

### Step 2: Check Backend is Running

```bash
# In another terminal, check health endpoint
curl http://localhost:8000/health
```

Expected response: `{"status": "healthy"}`

### Step 3: Test Basic Chat Query

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "I need a fuel-efficient car for my family"}
    ]
  }'
```

### Step 4: Monitor Backend Logs

Watch the Docker logs to see tool calls:

```bash
# In terminal running Docker
docker compose -f docker-compose.dev.yml logs -f backend
```

Look for:
- `🔧 Nemotron calling tool: score_cars_for_user`
- `✅ Tool score_cars_for_user executed successfully`
- Tool execution results

## Method 2: Running Directly (Without Docker)

### Step 1: Install Dependencies

```bash
cd /Users/shivansh/abombinator/HackUTD-2025/backend
pip install -r requirements.txt
```

### Step 2: Set Environment Variables

```bash
# Make sure .env file exists with NEMOTRON_API_KEY
cat backend/.env
```

### Step 3: Start Backend Server

```bash
cd /Users/shivansh/abombinator/HackUTD-2025/backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Step 4: Test API

Same as Method 1, Step 3.

## Test Cases

### Test Case 1: Basic Vehicle Preferences

**Query**: User asks for a fuel-efficient car

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "I need a fuel-efficient car for my daily commute"}
    ]
  }' | jq
```

**Expected Behavior**:
- Nemotron calls `score_cars_for_user` tool
- Tool returns scored cars
- Nemotron generates response with recommendations
- Response includes `recommended_car_ids`

**Check Logs For**:
```
🔧 Nemotron calling tool: score_cars_for_user with args: {...}
✅ Tool score_cars_for_user executed successfully
```

### Test Case 2: Financial Query

**Query**: User asks about affordability

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "I make $50,000 per year and have a $5,000 down payment. What cars can I afford?"}
    ]
  }' | jq
```

**Expected Behavior**:
- Nemotron calls `score_cars_for_user` tool (to get cars)
- Nemotron calls `evaluate_affordability` tool for top cars
- Nemotron generates response with affordable recommendations
- Response includes financial analysis

**Check Logs For**:
```
🔧 Nemotron calling tool: score_cars_for_user with args: {...}
✅ Tool score_cars_for_user executed successfully
🔧 Nemotron calling tool: evaluate_affordability with args: {...}
✅ Tool evaluate_affordability executed successfully
```

### Test Case 3: Specific Car Query

**Query**: User asks about a specific car

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Tell me about the 2020 Toyota Prius"}
    ]
  }' | jq
```

**Expected Behavior**:
- Nemotron calls `get_car_details` tool
- Tool returns car details
- Nemotron generates response with car information

**Check Logs For**:
```
🔧 Nemotron calling tool: get_car_details with args: {"vehicle_id": "prius-le-2020"}
✅ Tool get_car_details executed successfully
```

### Test Case 4: Multi-Step Workflow

**Query**: User provides preferences and financial info

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "I need a family car with good fuel economy. My budget is $30,000 and I make $60,000 per year."}
    ]
  }' | jq
```

**Expected Behavior**:
- Nemotron calls `score_cars_for_user` tool (with budget, passengers, fuel_efficiency)
- Nemotron analyzes results
- Nemotron calls `evaluate_affordability` tool for top cars
- Nemotron generates comprehensive response

**Check Logs For**:
```
🔧 Nemotron calling tool: score_cars_for_user with args: {"budget_max": 30000, "priorities": ["fuel_efficiency"], ...}
✅ Tool score_cars_for_user executed successfully
🔧 Nemotron calling tool: evaluate_affordability with args: {"vehicle_id": "...", "annual_income": 60000, ...}
✅ Tool evaluate_affordability executed successfully
```

### Test Case 5: Multi-Turn Conversation

**Query**: User provides information in multiple messages

```bash
# First message
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "I need a car for my family"}
    ]
  }' | jq

# Second message (with conversation history)
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "I need a car for my family"},
      {"role": "agent", "content": "..."},
      {"role": "user", "content": "I have a budget of $40,000 and need space for 5 people"}
    ]
  }' | jq
```

**Expected Behavior**:
- First message: Nemotron asks for more information or calls tools
- Second message: Nemotron uses conversation history to call tools with updated parameters
- Nemotron maintains context across turns

## Monitoring Tool Calls

### View Real-Time Logs

```bash
# Docker
docker compose -f docker-compose.dev.yml logs -f backend

# Direct
# Logs will appear in the terminal where uvicorn is running
```

### What to Look For

1. **Tool Call Messages**:
   ```
   🔧 Nemotron calling tool: score_cars_for_user with args: {...}
   ```

2. **Tool Execution Success**:
   ```
   ✅ Tool score_cars_for_user executed successfully
   ```

3. **Tool Results** (in formatted_messages):
   - Tool results are added to conversation
   - Nemotron processes results
   - Nemotron decides next steps

4. **Final Response**:
   - Nemotron generates response after tool calls
   - Response includes recommendations
   - Response includes `recommended_car_ids`

## Troubleshooting

### Issue: No Tool Calls

**Symptoms**: Nemotron doesn't call any tools

**Possible Causes**:
1. Tools not defined correctly
2. System prompt not instructing Nemotron to use tools
3. Nemotron API doesn't support function calling

**Solutions**:
1. Check tool definitions in `_define_tools()`
2. Check system prompt in `_build_system_prompt()`
3. Verify Nemotron API supports function calling
4. Check logs for errors

### Issue: Tool Execution Errors

**Symptoms**: Tools fail to execute

**Possible Causes**:
1. Invalid tool arguments
2. Service errors (catalog_scoring, financial_service)
3. Missing car data

**Solutions**:
1. Check tool argument validation
2. Check service logs
3. Verify car data exists
4. Check error messages in logs

### Issue: Infinite Loop

**Symptoms**: Tool calls continue indefinitely

**Possible Causes**:
1. Max iterations too high
2. Nemotron keeps calling tools
3. Tool results don't satisfy Nemotron

**Solutions**:
1. Check max_iterations (currently 10)
2. Check tool call loop logic
3. Verify tool results are correct
4. Check if tool_choice="none" is used for final response

### Issue: No Response

**Symptoms**: API returns error or no response

**Possible Causes**:
1. API key not configured
2. Nemotron API error
3. Backend crash

**Solutions**:
1. Check `.env` file has `NEMOTRON_API_KEY`
2. Check Nemotron API status
3. Check backend logs for errors
4. Verify backend is running

## Expected Response Format

```json
{
  "role": "agent",
  "content": "Based on your needs for a fuel-efficient family car...",
  "recommended_car_ids": ["prius-le-2020", "corolla-hybrid-le-2020", ...],
  "scoring_method": "preference_based"
}
```

## Verification Checklist

- [ ] Backend starts without errors
- [ ] Health endpoint returns `{"status": "healthy"}`
- [ ] Chat endpoint accepts requests
- [ ] Nemotron calls tools (check logs)
- [ ] Tool execution succeeds (check logs)
- [ ] Response includes recommendations
- [ ] Response includes `recommended_car_ids`
- [ ] Multi-step workflows work (multiple tool calls)
- [ ] Multi-turn conversations work (conversation history)

## Quick Test Script

Save this as `test_orchestration.sh`:

```bash
#!/bin/bash

echo "Testing Nemotron Orchestration..."
echo ""

# Test 1: Basic query
echo "Test 1: Basic query"
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "I need a fuel-efficient car"}
    ]
  }' | jq '.content, .recommended_car_ids, .scoring_method'

echo ""
echo "---"
echo ""

# Test 2: Financial query
echo "Test 2: Financial query"
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "I make $50,000 per year. What can I afford?"}
    ]
  }' | jq '.content, .recommended_car_ids, .scoring_method'

echo ""
echo "---"
echo ""

# Test 3: Specific car
echo "Test 3: Specific car"
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Tell me about the 2020 Prius"}
    ]
  }' | jq '.content, .recommended_car_ids'

echo ""
echo "Tests complete!"
```

Run it:

```bash
chmod +x test_orchestration.sh
./test_orchestration.sh
```

## Next Steps

1. **Test all scenarios** above
2. **Monitor logs** for tool calls
3. **Verify responses** are correct
4. **Check for errors** in logs
5. **Optimize** if needed (tool descriptions, system prompt, etc.)

