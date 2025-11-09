#!/bin/bash

# Quick Test Script for Toyota AI Assistant
# Make sure backend is running: docker compose -f docker-compose.dev.yml up -d

echo "=========================================="
echo "Testing Toyota AI Assistant - Backend API"
echo "=========================================="
echo ""

# Test 1: Only Financial Info (Shows Affordable Cars)
echo "Test 1: Only Financial Info"
echo "---------------------------"
echo "Query: 'I make $5000 per month, have $8k down, credit score 720'"
echo ""
curl -s -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "I make $5000 per month, have $8k down, credit score 720"
      }
    ]
  }' | jq -r '.content'
echo ""
echo "---"
echo ""

# Test 2: Complete Info (Financial + Preferences)
echo "Test 2: Complete Info"
echo "---------------------"
echo "Query: 'I make $60k per year, have $5k down, credit 720. Need family car for 5 people.'"
echo ""
curl -s -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "I make $60k per year, have $5k down, credit 720. Need family car for 5 people."
      }
    ]
  }' | jq -r '.content'
echo ""
echo "---"
echo ""

# Test 3: Only Preferences (No Financial)
echo "Test 3: Only Preferences"
echo "------------------------"
echo "Query: 'I need a family car for 5 people under $35k'"
echo ""
curl -s -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "I need a family car for 5 people under $35k"
      }
    ]
  }' | jq -r '.content'
echo ""
echo "---"
echo ""

# Test 4: Simple Query (Asks for Info)
echo "Test 4: Simple Query"
echo "--------------------"
echo "Query: 'I need a car'"
echo ""
curl -s -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "I need a car"
      }
    ]
  }' | jq -r '.content'
echo ""
echo "=========================================="
echo "Testing Complete!"
echo "=========================================="

