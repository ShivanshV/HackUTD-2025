"""
Test script demonstrating Nemotron weight adjustment

This shows how Person B (Nemotron) can dynamically adjust scoring weights
based on what the user emphasizes in conversation.
"""

from app.services.catalog_scoring import catalog_scoring_service
import json


def test_default_weights():
    """Baseline: Using default weights"""
    print("=" * 60)
    print("TEST 1: Default Weights (Balanced)")
    print("=" * 60)
    
    user_profile = {
        "budget_max": 40000,
        "commute_miles": 50,
        "passengers": 5,
        "terrain": "mixed",
        "features_wanted": ["awd"],
        "has_children": True
    }
    
    print("Using DEFAULT weights (balanced):")
    print("  - budget: 0.20")
    print("  - fuel_efficiency: 0.20")
    print("  - seating: 0.15")
    print("  - drivetrain: 0.10")
    print("  - vehicle_type: 0.10")
    print("  - performance: 0.10")
    print("  - features: 0.10")
    print("  - safety: 0.05")
    print()
    
    scored_cars = catalog_scoring_service.score_cars_for_user(user_profile)
    
    print("Top 3 Recommendations:")
    for i, result in enumerate(scored_cars[:3], 1):
        print(f"  {i}. {result['id']}: {result['score']}")
    
    print("\n")


def test_mpg_priority():
    """User emphasizes: 'Fuel efficiency is my TOP priority!'"""
    print("=" * 60)
    print("TEST 2: Nemotron Detects MPG Priority")
    print("=" * 60)
    print("User says: 'Fuel efficiency is my absolute top priority!'")
    print()
    
    user_profile = {
        "budget_max": 40000,
        "commute_miles": 50,
        "passengers": 5,
        "terrain": "mixed",
        "features_wanted": ["awd"],
        "has_children": True,
        # Nemotron adjusts weights based on conversation:
        "weights": {
            "budget": 0.10,           # Reduced
            "fuel_efficiency": 0.45,  # BOOSTED!
            "seating": 0.15,
            "drivetrain": 0.10,
            "vehicle_type": 0.05,
            "performance": 0.05,
            "features": 0.05,
            "safety": 0.05
        }
    }
    
    print("Nemotron adjusts weights:")
    print("  - fuel_efficiency: 0.45 ⬆️ (BOOSTED)")
    print("  - budget: 0.10 ⬇️")
    print("  - others: reduced")
    print()
    
    scored_cars = catalog_scoring_service.score_cars_for_user(user_profile)
    
    print("Top 3 Recommendations:")
    for i, result in enumerate(scored_cars[:3], 1):
        print(f"  {i}. {result['id']}: {result['score']}")
    
    print("\n")


def test_performance_priority():
    """User emphasizes: 'I want something POWERFUL!'"""
    print("=" * 60)
    print("TEST 3: Nemotron Detects Performance Priority")
    print("=" * 60)
    print("User says: 'I want something with a lot of power!'")
    print()
    
    user_profile = {
        "budget_max": 50000,
        "commute_miles": 20,
        "passengers": 4,
        "terrain": "mixed",
        "priorities": ["performance", "power"],
        # Nemotron adjusts weights:
        "weights": {
            "budget": 0.15,
            "fuel_efficiency": 0.10,  # Reduced
            "seating": 0.10,
            "drivetrain": 0.15,
            "vehicle_type": 0.10,
            "performance": 0.35,       # BOOSTED!
            "features": 0.05,
            "safety": 0.00             # User doesn't care
        }
    }
    
    print("Nemotron adjusts weights:")
    print("  - performance: 0.35 ⬆️ (BOOSTED)")
    print("  - fuel_efficiency: 0.10 ⬇️ (less important)")
    print("  - safety: 0.00 (user doesn't mention)")
    print()
    
    scored_cars = catalog_scoring_service.score_cars_for_user(user_profile)
    
    print("Top 3 Recommendations:")
    for i, result in enumerate(scored_cars[:3], 1):
        print(f"  {i}. {result['id']}: {result['score']}")
        # Check horsepower
        car = next(c for c in catalog_scoring_service.get_all_cars() if c['id'] == result['id'])
        print(f"      → {car['horsepower']} HP")
    
    print("\n")


def test_budget_not_important():
    """User says: 'Budget is not an issue, I want the BEST'"""
    print("=" * 60)
    print("TEST 4: Nemotron Detects Budget Doesn't Matter")
    print("=" * 60)
    print("User says: 'Money is no object, I want the best car'")
    print()
    
    user_profile = {
        "budget_max": 100000,  # High budget
        "commute_miles": 30,
        "passengers": 5,
        "has_children": True,
        "features_wanted": ["leather_seats", "panoramic_sunroof", "awd"],
        # Nemotron adjusts weights:
        "weights": {
            "budget": 0.00,           # Not important!
            "fuel_efficiency": 0.10,
            "seating": 0.20,
            "drivetrain": 0.10,
            "vehicle_type": 0.15,
            "performance": 0.15,
            "features": 0.25,         # BOOSTED - wants luxury
            "safety": 0.05
        }
    }
    
    print("Nemotron adjusts weights:")
    print("  - budget: 0.00 (user says money no object)")
    print("  - features: 0.25 ⬆️ (wants luxury)")
    print("  - seating: 0.20 ⬆️ (family needs)")
    print()
    
    scored_cars = catalog_scoring_service.score_cars_for_user(user_profile)
    
    print("Top 3 Recommendations:")
    for i, result in enumerate(scored_cars[:3], 1):
        car = next(c for c in catalog_scoring_service.get_all_cars() if c['id'] == result['id'])
        print(f"  {i}. {result['id']}: {result['score']}")
        print(f"      → ${car['price']:,}, {car['seating']} seats")
    
    print("\n")


def test_feature_focused():
    """User has very specific feature requirements"""
    print("=" * 60)
    print("TEST 5: Feature-Focused User")
    print("=" * 60)
    print("User says: 'Must have Apple CarPlay, leather seats, and sunroof'")
    print()
    
    user_profile = {
        "budget_max": 45000,
        "commute_miles": 25,
        "passengers": 5,
        "features_wanted": ["apple_carplay", "leather_seats", "panoramic_sunroof"],
        # Nemotron adjusts weights:
        "weights": {
            "budget": 0.15,
            "fuel_efficiency": 0.10,
            "seating": 0.15,
            "drivetrain": 0.05,
            "vehicle_type": 0.05,
            "performance": 0.05,
            "features": 0.40,         # BOOSTED - very specific
            "safety": 0.05
        }
    }
    
    print("Nemotron adjusts weights:")
    print("  - features: 0.40 ⬆️ (BOOSTED - user very specific)")
    print("  - other factors: reduced")
    print()
    
    scored_cars = catalog_scoring_service.score_cars_for_user(user_profile)
    
    print("Top 3 Recommendations:")
    for i, result in enumerate(scored_cars[:3], 1):
        car = next(c for c in catalog_scoring_service.get_all_cars() if c['id'] == result['id'])
        print(f"  {i}. {result['id']}: {result['score']}")
        print(f"      Features: {', '.join(car['features'][:3])}...")
    
    print("\n")


def compare_default_vs_adjusted():
    """Side-by-side comparison"""
    print("=" * 60)
    print("COMPARISON: Default vs. Adjusted Weights")
    print("=" * 60)
    
    base_profile = {
        "budget_max": 40000,
        "commute_miles": 60,
        "passengers": 5,
        "terrain": "highway"
    }
    
    # Default weights
    default_scores = catalog_scoring_service.score_cars_for_user(base_profile)
    
    # MPG-focused weights
    mpg_profile = base_profile.copy()
    mpg_profile["weights"] = {
        "fuel_efficiency": 0.50,  # User really cares about MPG
        "budget": 0.15,
        "seating": 0.15,
        "drivetrain": 0.05,
        "vehicle_type": 0.05,
        "performance": 0.05,
        "features": 0.05,
        "safety": 0.00
    }
    mpg_scores = catalog_scoring_service.score_cars_for_user(mpg_profile)
    
    print("                       DEFAULT    MPG-FOCUSED")
    print("                       -------    -----------")
    for i in range(3):
        default_car = default_scores[i]
        mpg_car = mpg_scores[i]
        print(f"{i+1}. {default_car['id']:20} {default_car['score']}      vs      {mpg_car['score']} {mpg_car['id']}")
    
    print("\n")


if __name__ == "__main__":
    test_default_weights()
    test_mpg_priority()
    test_performance_priority()
    test_budget_not_important()
    test_feature_focused()
    compare_default_vs_adjusted()
    
    print("=" * 60)
    print("✅ Weight Override Demonstration Complete!")
    print("=" * 60)
    print()
    print("KEY TAKEAWAY:")
    print("Person B (Nemotron) can analyze conversation and adjust")
    print("scoring weights to match what the user emphasizes.")

