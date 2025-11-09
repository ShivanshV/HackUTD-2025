# 🧪 Local Testing Guide

## Quick Start

Your services are running at:
- 🌐 **Frontend (UI)**: http://localhost:3000
- 🔧 **Backend API**: http://localhost:8000
- 📚 **API Docs**: http://localhost:8000/docs

## 1️⃣ **Frontend Testing** (Best for Demos)

**Open:** http://localhost:3000

### Test Scenarios:

#### Simple Query (Nemotron asks for details)
```
Type: "I need a car"

Expected: Nemotron asks for:
- Budget
- Family size
- Income/down payment/credit
- Priorities
```

#### With Preferences (Gets scored recommendations)
```
Type: "I need a family car for 5 people under $35k"

Expected:
- Shows top matches (Camry, RAV4, etc.)
- Explains why they fit
```

#### With Financial Info (Full analysis)
```
Type: "I make $5000 per month, have $8k down, credit score 720. 
      Need a family car for 5 people."

Expected:
- Shows recommendations
- Shows monthly payments
- Shows affordability scores
- Shows warnings if any
```

#### Priority-Based
```
Type: "Budget $30k, fuel efficiency is my top priority"

Expected:
- Shows hybrids first (Prius, Corolla Hybrid)
- Explains high MPG
```

#### Multi-Turn Conversation
```
1. Type: "I want a Toyota"
2. Nemotron asks for budget/needs
3. Type: "Budget $40k, need good MPG"
4. Get recommendations
```

---

## 2️⃣ **Backend API Testing** (For Development)

### Chat Endpoint (Main Interface)

```bash
# Simple query
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "I need a car"}
    ]
  }' | jq -r '.content'

# With financial info
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "I make $60k per year, have $5k down, credit 720. Need family car for 5."
      }
    ]
  }' | jq -r '.content'
```

### Scoring Endpoint (Direct Access)

```bash
# Get all cars
curl http://localhost:8000/api/scoring/cars | jq '.[0:3]'

# Score cars for user profile
curl -X POST http://localhost:8000/api/scoring/score \
  -H "Content-Type: application/json" \
  -d '{
    "budget_max": 40000,
    "commute_miles": 50,
    "passengers": 5,
    "has_children": true,
    "priorities": ["fuel_efficiency", "safety"]
  }' | jq '.top_3'
```

---

## 3️⃣ **Test Scripts** (Comprehensive Testing)

Run inside Docker:

```bash
# Test Nemotron API key
docker compose -f docker-compose.dev.yml exec backend python test_api.py

# Test catalog scoring
docker compose -f docker-compose.dev.yml exec backend python test_catalog_scoring.py

# Test financial service
docker compose -f docker-compose.dev.yml exec backend python test_financial_service.py

# Test priority weights
docker compose -f docker-compose.dev.yml exec backend python test_priority_weights.py

# Test credit score impact
docker compose -f docker-compose.dev.yml exec backend python test_credit_score_impact.py

# Or run the interactive test script
./TEST_EXAMPLES.sh
```

---

## 4️⃣ **API Documentation** (Interactive)

**Open:** http://localhost:8000/docs

- See all endpoints
- Try requests directly in browser
- View request/response schemas

---

## 🎯 **Test Scenarios for Demo**

### Scenario 1: Budget-Conscious Family
```
Query: "I make $50k per year, have $3k down. Need a safe car for my family of 4."

Expected Flow:
1. Extracts: income=$50k, down=$3k, passengers=4, priority=safety
2. Scores catalog
3. Evaluates affordability
4. Recommends: Camry, Corolla (affordable), warns against Highlander (tight budget)
```

### Scenario 2: Eco-Conscious Professional
```
Query: "Budget $35k, drive 80 miles daily, fuel efficiency is critical, good credit"

Expected Flow:
1. Extracts: budget=$35k, commute=80mi, priority=fuel_efficiency
2. Adjusts weights (fuel_efficiency = 0.38)
3. Recommends: Prius, Camry Hybrid, Corolla Hybrid
4. Shows MPG comparisons
```

### Scenario 3: Poor Credit Reality Check
```
Query: "Want a Highlander, make $60k/year, credit score 620, $5k down"

Expected Flow:
1. Calculates: $807/month payment (with 11.99% APR)
2. DTI = 16.2% (over 15% limit)
3. Warns: "May strain budget"
4. Suggests: "Consider RAV4 instead ($547/month, 10.9% DTI)"
```

### Scenario 4: Excellent Credit Advantage
```
Query: "Income $80k/year, credit 780, $10k down, need family SUV"

Expected Flow:
1. Excellent credit = 5.49% APR
2. Shows Highlander: $520/month (7.8% DTI) - Very comfortable
3. Shows affordability score: 100%
4. Explains: "Excellent financial position for this vehicle"
```

---

## 🔍 **What to Look For**

### ✅ **Good Responses:**
- Nemotron asks for missing critical info (income, credit, passengers)
- Recommendations match user needs
- Monthly payments are calculated correctly
- DTI ratios are accurate (10% = comfortable, 15% = max)
- Warnings appear when appropriate
- Explains WHY a car is recommended

### ❌ **Issues to Watch:**
- Recommends unaffordable cars
- Doesn't ask for credit score (huge impact!)
- Ignores user's stated priorities
- Makes up specifications
- Incorrect monthly payment calculations

---

## 🐛 **Troubleshooting**

### Frontend not loading?
```bash
docker compose -f docker-compose.dev.yml logs frontend
docker compose -f docker-compose.dev.yml restart frontend
```

### Backend errors?
```bash
docker compose -f docker-compose.dev.yml logs backend
docker compose -f docker-compose.dev.yml restart backend
```

### Nemotron not responding?
```bash
# Check API key
docker compose -f docker-compose.dev.yml exec backend python test_api.py
```

### Services not running?
```bash
docker compose -f docker-compose.dev.yml up -d
docker compose -f docker-compose.dev.yml ps
```

---

## 📊 **Expected Performance**

- **Response time:** 5-15 seconds (Nemotron reasoning)
- **Catalog scoring:** <1 second
- **Financial calculations:** <0.1 second
- **Total cars in catalog:** 200+

---

## 🎬 **Demo Preparation**

### Before Your Demo:
1. ✅ Start services: `docker compose -f docker-compose.dev.yml up -d`
2. ✅ Test API key: `docker compose -f docker-compose.dev.yml exec backend python test_api.py`
3. ✅ Open frontend: http://localhost:3000
4. ✅ Test 2-3 queries to warm up the system
5. ✅ Prepare 3-4 test scenarios (different priorities)

### During Demo:
1. **Show the UI** - http://localhost:3000
2. **Start with simple query** - "I need a car" (shows intelligence)
3. **Follow up with complete info** - Income, credit, needs (shows power)
4. **Show different priorities** - Fuel efficiency vs performance (shows flexibility)
5. **Explain the architecture** - Catalog → Scoring → Financial → Nemotron

### Backup (If Live Demo Fails):
- Have screenshots ready
- Have curl examples ready
- Show test output logs
- Explain the flow with diagrams

---

## 💡 **Pro Tips**

1. **Use `jq`** to format JSON responses: `curl ... | jq`
2. **Watch logs live**: `docker compose -f docker-compose.dev.yml logs -f backend`
3. **Clear browser cache** if frontend not updating
4. **Test each layer independently**:
   - Scoring API: Direct endpoint
   - Financial: Test scripts
   - Nemotron: test_api.py
   - Integration: Chat endpoint
5. **Prepare multiple personas**:
   - Budget-conscious family
   - Wealthy buyer
   - Poor credit buyer
   - Eco-warrior
   - Performance enthusiast

---

## 📝 **Quick Commands Reference**

```bash
# Start everything
docker compose -f docker-compose.dev.yml up -d

# Check status
docker compose -f docker-compose.dev.yml ps

# View logs
docker compose -f docker-compose.dev.yml logs -f

# Stop everything
docker compose -f docker-compose.dev.yml down

# Rebuild (after code changes)
docker compose -f docker-compose.dev.yml build
docker compose -f docker-compose.dev.yml up -d

# Test Nemotron
docker compose -f docker-compose.dev.yml exec backend python test_api.py

# Access backend shell
docker compose -f docker-compose.dev.yml exec backend bash
```

---

## 🚀 **You're Ready!**

Your Toyota AI Assistant is running and ready to test. Start with the frontend UI for the best experience, then dive into the API for detailed testing.

**Main Testing URL:** http://localhost:3000 🌐

