#!/bin/bash

# Toyota AI Assistant - Local Testing Examples
# Make sure Docker services are running: docker compose -f docker-compose.dev.yml up

echo "=========================================="
echo "Toyota AI Assistant - Test Examples"
echo "=========================================="
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo ""
echo "=========================================="
echo ""

# Test 1: Simple query (Nemotron asks for details)
echo "Test 1: Simple Query"
echo "--------------------"
echo "Query: 'I need a car'"
echo ""
curl -s -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "I need a car"}]
  }' | jq -r '.content' | head -20
echo ""
read -p "Press Enter to continue..."
echo ""

# Test 2: With vehicle preferences
echo "Test 2: Vehicle Preferences"
echo "----------------------------"
echo "Query: 'I need a family car for 5 people under $35k'"
echo ""
curl -s -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "I need a family car for 5 people under $35k"}]
  }' | jq -r '.content' | head -30
echo ""
read -p "Press Enter to continue..."
echo ""

# Test 3: With financial info (FULL POWER)
echo "Test 3: Complete Financial Profile"
echo "-----------------------------------"
echo "Query: 'I make $5000 per month, have $8k down, credit score 720. Need a family car for 5.'"
echo ""
curl -s -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "I make $5000 per month, have $8k down, credit score 720. Need a family car for 5 people."
      }
    ]
  }' | jq -r '.content' | head -40
echo ""
read -p "Press Enter to continue..."
echo ""

# Test 4: Fuel efficiency priority
echo "Test 4: Priority-Based Recommendation"
echo "--------------------------------------"
echo "Query: 'Budget $30k, fuel efficiency is my top priority'"
echo ""
curl -s -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "I need a car under $30k. Fuel efficiency is my top priority."
      }
    ]
  }' | jq -r '.content' | head -30
echo ""
read -p "Press Enter to continue..."
echo ""

# Test 5: Direct scoring API
echo "Test 5: Direct Scoring API (No Nemotron)"
echo "-----------------------------------------"
echo "Testing catalog scoring service directly"
echo ""
curl -s -X POST http://localhost:8000/api/scoring/score \
  -H "Content-Type: application/json" \
  -d '{
    "budget_max": 40000,
    "commute_miles": 50,
    "passengers": 5,
    "has_children": true,
    "priorities": ["fuel_efficiency", "safety"]
  }' | jq '.top_3[] | {id: .id, score: .score, reasons: .reasons[0:3]}'
echo ""
read -p "Press Enter to continue..."
echo ""

# Test 6: Check services
echo "Test 6: Service Health Check"
echo "-----------------------------"
echo "Backend status:"
curl -s http://localhost:8000/health 2>/dev/null && echo "✅ Backend is running" || echo "❌ Backend is not responding"
echo ""
echo "Frontend status:"
curl -s http://localhost:3000 > /dev/null 2>&1 && echo "✅ Frontend is running" || echo "❌ Frontend is not responding"
echo ""

echo "=========================================="
echo "Testing Complete!"
echo "=========================================="
echo ""
echo "For visual testing, open: http://localhost:3000"
echo ""

