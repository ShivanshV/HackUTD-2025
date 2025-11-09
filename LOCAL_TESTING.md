# 🧪 Local Testing Guide

## Quick Start

**Backend URL:** http://localhost:8000  
**API Docs:** http://localhost:8000/docs

---

## Method 1: Quick Test Script (Easiest)

```bash
# Run all test scenarios
./QUICK_TEST.sh
```

This runs 4 test scenarios and shows the responses.

---

## Method 2: Individual curl Commands

### Test 1: Only Financial Info (Shows Affordable Cars)

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "I make $5000 per month, have $8k down, credit score 720"
      }
    ]
  }' | jq -r '.content'
```

**Expected:** Shows affordable Toyota options with monthly payments and affordability scores.

---

### Test 2: Complete Info (Financial + Preferences)

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "I make $60k per year, have $5k down, credit 720. Need family car for 5 people."
      }
    ]
  }' | jq -r '.content'
```

**Expected:** Shows personalized recommendations matching both preferences and budget.

---

### Test 3: Only Preferences (No Financial)

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "I need a family car for 5 people under $35k"
      }
    ]
  }' | jq -r '.content'
```

**Expected:** Shows matching cars, then asks for financial info for affordability analysis.

---

### Test 4: Simple Query (Asks for Info)

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "I need a car"
      }
    ]
  }' | jq -r '.content'
```

**Expected:** Conversationally asks for budget, family size, commute, financial info.

---

### Test 5: Priority-Based

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Budget $30k, fuel efficiency is my top priority"
      }
    ]
  }' | jq -r '.content'
```

**Expected:** Shows hybrids first (Prius, Corolla Hybrid, Camry Hybrid) with high MPG.

---

### Test 6: Poor Credit Scenario

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "I want a Highlander. I make $50k per year, credit score 620, have $3k down."
      }
    ]
  }' | jq -r '.content'
```

**Expected:** Warns about high payment, suggests more affordable alternatives.

---

## Method 3: API Documentation (Interactive)

**Open in browser:** http://localhost:8000/docs

1. Click on `/api/chat`
2. Click "Try it out"
3. Paste this in the request body:

```json
{
  "messages": [
    {
      "role": "user",
      "content": "I make $5000 per month, have $8k down, credit score 720"
    }
  ]
}
```

4. Click "Execute"
5. See the response in the browser

---

## Method 4: Test Scripts (Inside Docker)

```bash
# Test Nemotron API key
docker compose -f docker-compose.dev.yml exec backend python test_api.py

# Test financial service
docker compose -f docker-compose.dev.yml exec backend python test_financial_service.py

# Test credit score impact
docker compose -f docker-compose.dev.yml exec backend python test_credit_score_impact.py

# Test priority weights
docker compose -f docker-compose.dev.yml exec backend python test_priority_weights.py
```

---

## Method 5: Direct Scoring API (No AI)

```bash
# Get all cars
curl http://localhost:8000/api/scoring/cars | jq '.[0:3]'

# Score cars for user profile
curl -X POST http://localhost:8000/api/scoring/score \
  -H "Content-Type: application/json" \
  -d '{
    "budget_max": 40000,
    "passengers": 5,
    "has_children": true,
    "priorities": ["fuel_efficiency", "safety"]
  }' | jq '.top_3'
```

---

## Method 6: Using Postman / Thunder Client

1. **Method:** POST
2. **URL:** `http://localhost:8000/api/chat`
3. **Headers:**
   ```
   Content-Type: application/json
   ```
4. **Body:** (Copy any test from above)

---

## Expected Response Times

- **Simple query:** 3-5 seconds
- **With financial analysis:** 5-10 seconds
- **Complex recommendations:** 10-15 seconds

*(Nemotron reasoning takes time - this is normal)*

---

## Troubleshooting

### Backend not responding?
```bash
# Check if running
docker compose -f docker-compose.dev.yml ps

# View logs
docker compose -f docker-compose.dev.yml logs backend

# Restart
docker compose -f docker-compose.dev.yml restart backend
```

### Nemotron not working?
```bash
# Test API key
docker compose -f docker-compose.dev.yml exec backend python test_api.py

# Check .env file has NEMOTRON_API_KEY set
docker compose -f docker-compose.dev.yml exec backend cat .env | grep NEMOTRON
```

### Services not running?
```bash
# Start everything
docker compose -f docker-compose.dev.yml up -d

# Check status
docker compose -f docker-compose.dev.yml ps
```

---

## Test Scenarios Summary

| Scenario | What It Tests | Expected Behavior |
|----------|---------------|-------------------|
| Financial Only | Affordability-based recommendations | Shows affordable cars, offers to refine |
| Complete Info | Full integration | Shows personalized matches with financial analysis |
| Preferences Only | Catalog scoring | Shows matches, asks for financial info |
| Simple Query | Conversation flow | Asks for information conversationally |
| Priority-Based | Weight adjustment | Shows cars matching priority (e.g., hybrids for fuel efficiency) |
| Poor Credit | Financial warnings | Warns about affordability, suggests alternatives |

---

## Quick Reference

### Start Services
```bash
docker compose -f docker-compose.dev.yml up -d
```

### Stop Services
```bash
docker compose -f docker-compose.dev.yml down
```

### View Logs
```bash
docker compose -f docker-compose.dev.yml logs -f backend
```

### Restart Backend
```bash
docker compose -f docker-compose.dev.yml restart backend
```

### Test Endpoint
```bash
curl http://localhost:8000/health
```

---

## Tips

1. **Use `jq`** to format JSON: `curl ... | jq`
2. **Watch logs** while testing: `docker compose -f docker-compose.dev.yml logs -f backend`
3. **Test incrementally:** Start with simple queries, then add complexity
4. **Check API docs** for request/response schemas: http://localhost:8000/docs

---

**Happy Testing! 🚀**

