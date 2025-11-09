"""
Test script to verify Nemotron API key is working

Run this inside Docker container:
  docker compose -f docker-compose.dev.yml exec backend python test_api.py

Or run locally (if you have dependencies installed):
  python test_api.py
"""

from openai import OpenAI
from app.core.config import settings

def test_nemotron_api():
    """Test if Nemotron API key is working"""
    
    print("=" * 60)
    print("Testing Nemotron API Connection")
    print("=" * 60)
    
    # Check if API key is set
    if not settings.NEMOTRON_API_KEY:
        print("❌ ERROR: NEMOTRON_API_KEY is not set in .env file")
        print("\nPlease add your API key to backend/.env:")
        print("NEMOTRON_API_KEY=your-key-here")
        return False
    
    print(f"✓ API Key found: {settings.NEMOTRON_API_KEY[:20]}...")
    print(f"✓ Model: nvidia/nvidia-nemotron-nano-9b-v2")
    print(f"✓ Base URL: https://integrate.api.nvidia.com/v1")
    print()
    
    # Initialize client
    try:
        client = OpenAI(
            base_url="https://integrate.api.nvidia.com/v1",
            api_key=settings.NEMOTRON_API_KEY
        )
        print("✓ OpenAI client initialized")
    except Exception as e:
        print(f"❌ ERROR: Failed to initialize client: {e}")
        return False
    
    # Make a test API call (matching your original example)
    print("\nMaking test API call...")
    try:
        completion = client.chat.completions.create(
            model="nvidia/nvidia-nemotron-nano-9b-v2",
            messages=[{"role": "system", "content": "/think"}],
            temperature=0.6,
            top_p=0.95,
            max_tokens=2048,
            frequency_penalty=0,
            presence_penalty=0,
            stream=True,
            extra_body={
                "min_thinking_tokens": 1024,
                "max_thinking_tokens": 2048
            }
        )
        
        # Collect streaming response (matching your example)
        response_content = ""
        reasoning_count = 0
        for chunk in completion:
            reasoning = getattr(chunk.choices[0].delta, "reasoning_content", None)
            if reasoning:
                reasoning_count += len(reasoning)
                # Don't print reasoning, just count it
            
            if chunk.choices[0].delta.content is not None:
                response_content += chunk.choices[0].delta.content
        
        if response_content:
            print("✓ API call successful!")
            print(f"✓ Reasoning tokens received: {reasoning_count} characters")
            print(f"\nResponse: {response_content}")
            print("\n" + "=" * 60)
            print("✅ SUCCESS: Nemotron API key is working correctly!")
            print("=" * 60)
            return True
        elif reasoning_count > 0:
            print("✓ API call successful!")
            print(f"✓ Reasoning tokens received: {reasoning_count} characters")
            print("⚠️  No content response, but reasoning tokens were generated")
            print("This might be normal for this model configuration")
            print("\n" + "=" * 60)
            print("✅ SUCCESS: Nemotron API key is working correctly!")
            print("=" * 60)
            return True
        else:
            print("⚠️  API call succeeded but received empty response")
            print("This might indicate an issue with the model or API configuration")
            return False
        
    except Exception as e:
        print(f"\n❌ ERROR: API call failed")
        print(f"Error details: {str(e)}")
        print("\n" + "=" * 60)
        print("❌ FAILED: Nemotron API key is not working")
        print("=" * 60)
        print("\nPossible issues:")
        print("1. API key is invalid or expired")
        print("2. API key doesn't have access to this model")
        print("3. Network connectivity issues")
        print("4. NVIDIA API service is down")
        return False

if __name__ == "__main__":
    test_nemotron_api()

