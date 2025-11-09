#!/bin/bash

# Test script to demonstrate how Nemotron handles ambiguous queries
# This shows how the system asks for clarification when information is missing

echo "=== Test 1: Completely ambiguous query ==="
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
echo ""

echo "=== Test 2: Partial information (only budget) ==="
echo "Query: 'I have a budget of $30k'"
echo ""
curl -s -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "I have a budget of $30k"
      }
    ]
  }' | jq -r '.content'
echo ""
echo ""

echo "=== Test 3: Financial focus but missing details ==="
echo "Query: 'I want to know what I can afford'"
echo ""
curl -s -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "I want to know what I can afford"
      }
    ]
  }' | jq -r '.content'
echo ""
echo ""

echo "=== Test 4: Partial financial info (income only) ==="
echo "Query: 'I make $50k per year'"
echo ""
curl -s -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "I make $50k per year"
      }
    ]
  }' | jq -r '.content'
echo ""
echo ""

echo "=== Test 5: Vague preferences ==="
echo "Query: 'I want something good for my family'"
echo ""
curl -s -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "I want something good for my family"
      }
    ]
  }' | jq -r '.content'
echo ""
echo ""

echo "=== Test 6: Ambiguous income (number without time period) ==="
echo "Query: 'I make $5000'"
echo ""
curl -s -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "I make $5000"
      }
    ]
  }' | jq -r '.content'
echo ""
echo ""

echo "=== Test 7: Ambiguous income with 'k' suffix ==="
echo "Query: 'I make $60k and need a car'"
echo ""
curl -s -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "I make $60k and need a car"
      }
    ]
  }' | jq -r '.content'
echo ""
echo ""

echo "=== Test 8: Ambiguous income with vehicle preferences ==="
echo "Query: 'I make $5000 and need a family car for 5 people'"
echo ""
curl -s -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "I make $5000 and need a family car for 5 people"
      }
    ]
  }' | jq -r '.content'
echo ""

