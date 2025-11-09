"""
Test script for Catalog & Scoring Service

Run this with:
  docker compose -f docker-compose.dev.yml exec backend python test_catalog_scoring.py
"""

from app.services.catalog_scoring import catalog_scoring_service


def test_get_all_cars():
    """Test getting all cars from catalog"""
    print("=" * 60)
    print("TEST 1: Get All Cars")
    print("=" * 60)
    
    cars = catalog_scoring_service.get_all_cars()
    print(f"✓ Loaded {len(cars)} cars from catalog")
    
    for car in cars:
        print(f"  - {car['name']} {car['model']} ({car['year']}) - ${car['price']:,}")
    
    print()


def test_scoring_family_profile():
    """Test scoring for a family with long commute"""
    print("=" * 60)
    print("TEST 2: Family with Long Commute")
    print("=" * 60)
    
    user_profile = {
        "budget_max": 50000,
        "commute_miles": 60,  # Long commute
        "passengers": 6,  # Family of 6
        "terrain": "highway",
        "priorities": ["fuel_efficiency", "safety", "space"],
        "features_wanted": ["awd", "3_row_seating"],
        "has_children": True
    }
    
    print("User Profile:")
    print(f"  Budget: ${user_profile['budget_max']:,}")
    print(f"  Commute: {user_profile['commute_miles']} miles")
    print(f"  Passengers: {user_profile['passengers']}")
    print(f"  Wants: {', '.join(user_profile['features_wanted'])}")
    print()
    
    scored_cars = catalog_scoring_service.score_cars_for_user(user_profile)
    
    print("Top 3 Recommendations:")
    for i, result in enumerate(scored_cars[:3], 1):
        print(f"\n{i}. Car ID: {result['id']}")
        print(f"   Score: {result['score']}")
        print(f"   Reasons: {', '.join(result['reasons'])}")
    
    print("\n")


def test_scoring_eco_profile():
    """Test scoring for eco-conscious city driver"""
    print("=" * 60)
    print("TEST 3: Eco-Conscious City Driver")
    print("=" * 60)
    
    user_profile = {
        "budget_max": 35000,
        "commute_miles": 40,
        "passengers": 2,
        "terrain": "city",
        "priorities": ["fuel_efficiency", "eco_friendly"],
        "features_wanted": ["hybrid"],
        "has_children": False
    }
    
    print("User Profile:")
    print(f"  Budget: ${user_profile['budget_max']:,}")
    print(f"  Commute: {user_profile['commute_miles']} miles")
    print(f"  Passengers: {user_profile['passengers']}")
    print(f"  Wants: {', '.join(user_profile['features_wanted'])}")
    print()
    
    scored_cars = catalog_scoring_service.score_cars_for_user(user_profile)
    
    print("Top 3 Recommendations:")
    for i, result in enumerate(scored_cars[:3], 1):
        print(f"\n{i}. Car ID: {result['id']}")
        print(f"   Score: {result['score']}")
        print(f"   Reasons: {', '.join(result['reasons'])}")
    
    print("\n")


def test_scoring_offroad_profile():
    """Test scoring for off-road enthusiast"""
    print("=" * 60)
    print("TEST 4: Off-Road Enthusiast")
    print("=" * 60)
    
    user_profile = {
        "budget_max": 45000,
        "commute_miles": 20,
        "passengers": 4,
        "terrain": "offroad",
        "priorities": ["performance", "durability"],
        "features_wanted": ["awd"],
        "has_children": False
    }
    
    print("User Profile:")
    print(f"  Budget: ${user_profile['budget_max']:,}")
    print(f"  Terrain: {user_profile['terrain']}")
    print(f"  Passengers: {user_profile['passengers']}")
    print()
    
    scored_cars = catalog_scoring_service.score_cars_for_user(user_profile)
    
    print("Top 3 Recommendations:")
    for i, result in enumerate(scored_cars[:3], 1):
        print(f"\n{i}. Car ID: {result['id']}")
        print(f"   Score: {result['score']}")
        print(f"   Reasons: {', '.join(result['reasons'])}")
    
    print("\n")


def test_json_output():
    """Test JSON-formatted output"""
    print("=" * 60)
    print("TEST 5: Machine-Readable JSON Output")
    print("=" * 60)
    
    import json
    
    user_profile = {
        "budget_max": 40000,
        "commute_miles": 50,
        "passengers": 5,
        "terrain": "mixed",
        "priorities": ["fuel_efficiency", "safety"],
        "features_wanted": ["awd"],
        "has_children": True
    }
    
    scored_cars = catalog_scoring_service.score_cars_for_user(user_profile)
    
    # Take top 3
    output = scored_cars[:3]
    
    print(json.dumps(output, indent=2))
    print()


if __name__ == "__main__":
    test_get_all_cars()
    test_scoring_family_profile()
    test_scoring_eco_profile()
    test_scoring_offroad_profile()
    test_json_output()
    
    print("=" * 60)
    print("✅ All tests completed successfully!")
    print("=" * 60)

