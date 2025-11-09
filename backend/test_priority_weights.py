"""
Test to visualize how user priorities affect scoring weights
"""

from app.services.ai_agent import AIAgent

def test_priority_weights():
    agent = AIAgent()
    
    print("=" * 70)
    print("PRIORITY WEIGHT ADJUSTMENT SYSTEM")
    print("=" * 70)
    
    test_cases = [
        {
            "name": "No Priorities (Default)",
            "priorities": []
        },
        {
            "name": "Fuel Efficiency Only",
            "priorities": ["fuel_efficiency"]
        },
        {
            "name": "Performance Only",
            "priorities": ["performance"]
        },
        {
            "name": "Safety Only",
            "priorities": ["safety"]
        },
        {
            "name": "Fuel Efficiency + Safety",
            "priorities": ["fuel_efficiency", "safety"]
        },
        {
            "name": "Performance + Space",
            "priorities": ["performance", "space"]
        }
    ]
    
    for test_case in test_cases:
        print(f"\n📊 Scenario: {test_case['name']}")
        print("-" * 70)
        
        priorities = test_case['priorities']
        
        if priorities:
            weights = agent._priorities_to_weights(priorities)
            
            # Sort by weight (highest first)
            sorted_weights = sorted(weights.items(), key=lambda x: x[1], reverse=True)
            
            print(f"Priorities: {priorities}")
            print(f"\nResulting Weights:")
            for category, weight in sorted_weights:
                bar = "█" * int(weight * 100)
                print(f"  {category:20s}: {weight:.2f}  {bar}")
        else:
            print("Using DEFAULT_WEIGHTS:")
            default = {
                "budget": 0.20,
                "fuel_efficiency": 0.20,
                "seating": 0.15,
                "drivetrain": 0.10,
                "vehicle_type": 0.10,
                "performance": 0.10,
                "features": 0.10,
                "safety": 0.05
            }
            sorted_weights = sorted(default.items(), key=lambda x: x[1], reverse=True)
            for category, weight in sorted_weights:
                bar = "█" * int(weight * 100)
                print(f"  {category:20s}: {weight:.2f}  {bar}")
    
    print("\n" + "=" * 70)
    print("✅ This shows how user priorities dynamically reshape scoring!")
    print("=" * 70)

if __name__ == "__main__":
    test_priority_weights()

