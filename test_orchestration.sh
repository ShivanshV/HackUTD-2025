#!/bin/bash

echo "🧪 Testing Nemotron Orchestration"
echo "=================================="
echo ""

# Check if backend is running
echo "📡 Checking backend health..."
health=$(curl -s http://localhost:8000/health)
if [ "$health" != '{"status":"healthy"}' ]; then
    echo "❌ Backend is not running. Please start it first:"
    echo "   docker compose -f docker-compose.dev.yml up --build backend"
    exit 1
fi
echo "✅ Backend is healthy"
echo ""

# Test 1: Basic query
echo "Test 1: Basic Vehicle Preferences"
echo "-----------------------------------"
response1=$(curl -s -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "I need a fuel-efficient car for my daily commute"}
    ]
  }')

echo "Response:"
echo "$response1" | jq -r '.content' | head -5
echo ""
echo "Recommended Car IDs:"
echo "$response1" | jq -r '.recommended_car_ids // []' | head -5
echo "Scoring Method: $(echo "$response1" | jq -r '.scoring_method // "N/A"')"
echo ""
echo "---"
echo ""

# Test 2: Financial query
echo "Test 2: Financial Query"
echo "------------------------"
response2=$(curl -s -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "I make $50,000 per year and have a $5,000 down payment. What cars can I afford?"}
    ]
  }')

echo "Response:"
echo "$response2" | jq -r '.content' | head -5
echo ""
echo "Recommended Car IDs:"
echo "$response2" | jq -r '.recommended_car_ids // []' | head -5
echo "Scoring Method: $(echo "$response2" | jq -r '.scoring_method // "N/A"')"
echo ""
echo "---"
echo ""

# Test 3: Specific car
echo "Test 3: Specific Car Query"
echo "---------------------------"
response3=$(curl -s -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Tell me about the 2020 Toyota Prius"}
    ]
  }')

echo "Response:"
echo "$response3" | jq -r '.content' | head -5
echo ""
echo "---"
echo ""

# Test 4: Multi-step workflow
echo "Test 4: Multi-Step Workflow"
echo "----------------------------"
response4=$(curl -s -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "I need a family car with good fuel economy. My budget is $30,000 and I make $60,000 per year."}
    ]
  }')

echo "Response:"
echo "$response4" | jq -r '.content' | head -5
echo ""
echo "Recommended Car IDs:"
echo "$response4" | jq -r '.recommended_car_ids // []' | head -5
echo "Scoring Method: $(echo "$response4" | jq -r '.scoring_method // "N/A"')"
echo ""
echo "---"
echo ""

echo "✅ Tests complete!"
echo ""
echo "💡 Tip: Check backend logs to see tool calls:"
echo "   docker compose -f docker-compose.dev.yml logs -f backend"

