"""
Simple script to test the Orchestrator API endpoints locally

Usage:
    python test_orchestrator_api.py

Make sure the server is running on http://localhost:8000
"""

import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_orchestrator_status():
    """Test the orchestrator status endpoint"""
    print("=" * 60)
    print("TEST 1: Orchestrator Status")
    print("=" * 60)
    
    try:
        response = requests.get(f"{BASE_URL}/orchestrator/status")
        response.raise_for_status()
        data = response.json()
        print(f"Status: {data.get('status')}")
        print(f"API Key Configured: {data.get('api_key_configured')}")
        print(f"Tools Count: {data.get('tools_count')}")
        print(f"Model: {data.get('model')}")
        print("✅ Status check passed")
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_available_tools():
    """Test the available tools endpoint"""
    print("\n" + "=" * 60)
    print("TEST 2: Available Tools")
    print("=" * 60)
    
    try:
        response = requests.get(f"{BASE_URL}/orchestrator/tools")
        response.raise_for_status()
        data = response.json()
        print(f"Found {data.get('count')} tools:")
        for tool in data.get('tools', []):
            print(f"  - {tool.get('name')}: {tool.get('description', '')[:60]}...")
        print("✅ Tools check passed")
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_orchestrator_chat():
    """Test the orchestrator chat endpoint"""
    print("\n" + "=" * 60)
    print("TEST 3: Orchestrator Chat (Simple Message)")
    print("=" * 60)
    
    payload = {
        "messages": [
            {
                "role": "user",
                "content": "Hello! Can you help me find a car?"
            }
        ]
    }
    
    try:
        print(f"Sending request: {payload['messages'][0]['content']}")
        response = requests.post(
            f"{BASE_URL}/orchestrator/chat",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        data = response.json()
        print(f"\nResponse:")
        print(f"  Role: {data.get('role')}")
        print(f"  Content: {data.get('content', '')[:200]}...")
        print("✅ Chat test passed")
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")
        return False


def test_orchestrator_chat_with_tool_calling():
    """Test the orchestrator chat with a query that should trigger tool calls"""
    print("\n" + "=" * 60)
    print("TEST 4: Orchestrator Chat (Tool Calling)")
    print("=" * 60)
    
    payload = {
        "messages": [
            {
                "role": "user",
                "content": "I'm looking for a sedan under $30,000 with good fuel economy. Can you help me find one?"
            }
        ]
    }
    
    try:
        print(f"Sending request: {payload['messages'][0]['content']}")
        print("(This may take a moment as the orchestrator calls tools...)")
        response = requests.post(
            f"{BASE_URL}/orchestrator/chat",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=60  # Tool calling can take longer
        )
        response.raise_for_status()
        data = response.json()
        print(f"\nResponse:")
        print(f"  Role: {data.get('role')}")
        print(f"  Content:\n{data.get('content', '')}")
        print("\n✅ Tool calling test passed")
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")
        return False


def test_multi_turn_conversation():
    """Test multi-turn conversation"""
    print("\n" + "=" * 60)
    print("TEST 5: Multi-Turn Conversation")
    print("=" * 60)
    
    payload = {
        "messages": [
            {
                "role": "user",
                "content": "I need a car for my family"
            },
            {
                "role": "agent",
                "content": "I'd be happy to help you find a car for your family! How many people will be riding in the car regularly?"
            },
            {
                "role": "user",
                "content": "We have 5 people, including 3 kids"
            },
            {
                "role": "agent",
                "content": "Great! For a family of 5, you'll want a vehicle with at least 5 seats. Do you have a budget in mind?"
            },
            {
                "role": "user",
                "content": "I'd like to stay under $40,000 and need good fuel economy for my 60-mile commute"
            }
        ]
    }
    
    try:
        print("Sending multi-turn conversation...")
        print(f"Last user message: {payload['messages'][-1]['content']}")
        response = requests.post(
            f"{BASE_URL}/orchestrator/chat",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=60
        )
        response.raise_for_status()
        data = response.json()
        print(f"\nResponse:")
        print(f"  Content:\n{data.get('content', '')}")
        print("\n✅ Multi-turn conversation test passed")
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")
        return False


def test_cost_calculation_query():
    """Test a query that should trigger cost calculation"""
    print("\n" + "=" * 60)
    print("TEST 6: Cost Calculation Query")
    print("=" * 60)
    
    payload = {
        "messages": [
            {
                "role": "user",
                "content": "I have a 50-mile commute each way. What would be the total cost of owning a Camry?"
            }
        ]
    }
    
    try:
        print(f"Sending request: {payload['messages'][0]['content']}")
        response = requests.post(
            f"{BASE_URL}/orchestrator/chat",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=60
        )
        response.raise_for_status()
        data = response.json()
        print(f"\nResponse:")
        print(f"  Content:\n{data.get('content', '')}")
        print("\n✅ Cost calculation test passed")
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")
        return False


def main():
    """Run all tests"""
    print("\n" + "=" * 60)
    print("ORCHESTRATOR API TESTS")
    print("=" * 60)
    print(f"\nTesting API at: {BASE_URL}")
    print("Make sure the server is running on http://localhost:8000")
    print()
    
    results = []
    
    # Run tests
    results.append(("Status Check", test_orchestrator_status()))
    results.append(("Available Tools", test_available_tools()))
    results.append(("Simple Chat", test_orchestrator_chat()))
    results.append(("Tool Calling", test_orchestrator_chat_with_tool_calling()))
    results.append(("Multi-Turn Conversation", test_multi_turn_conversation()))
    results.append(("Cost Calculation", test_cost_calculation_query()))
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print()
    print(f"Total: {passed}/{total} tests passed")
    print("=" * 60)


if __name__ == "__main__":
    main()

