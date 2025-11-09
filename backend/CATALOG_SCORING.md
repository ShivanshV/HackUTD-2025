# Catalog & Scoring Service (Person A)

Pure Python module for car catalog management and comprehensive user-based scoring with **flexible Nemotron-adjustable weights**.

**No AI/Nemotron calls** - just structured logic. Person B (Nemotron) can dynamically adjust priorities.

## Files

- `backend/app/services/catalog_scoring.py` - Main service with flexible scoring
- `backend/app/data/cars.json` - Car catalog  
- `backend/test_catalog_scoring.py` - Basic functionality tests
- `backend/test_weight_override.py` - Weight adjustment demonstrations

## Features

✅ **Comprehensive scoring** - All car attributes covered  
✅ **Flexible weights** - Nemotron can adjust based on conversation  
✅ **8 scoring dimensions** - Budget, MPG, seating, drivetrain, type, performance, features, safety  
✅ **Smart feature matching** - Recognizes CarPlay, leather seats, sunroof, etc.  
✅ **Performance-aware** - Scores horsepower for power seekers  
✅ **Default fallbacks** - Works without custom weights

## API

### `get_all_cars()`

Returns all cars from the catalog.

```python
from app.services.catalog_scoring import catalog_scoring_service

cars = catalog_scoring_service.get_all_cars()
# Returns: List of car dictionaries
```

### `score_cars_for_user(user_profile)`

Scores and ranks cars based on user profile with optional weight overrides.

```python
user_profile = {
    # User requirements
    "budget_max": 40000,
    "commute_miles": 50,
    "passengers": 5,
    "terrain": "city" | "highway" | "mixed" | "offroad",
    "priorities": ["fuel_efficiency", "performance"],  # Text list
    "features_wanted": ["awd", "apple_carplay", "leather_seats"],
    "has_children": True,
    
    # Optional: Nemotron can override weights based on conversation
    "weights": {
        "budget": 0.15,
        "fuel_efficiency": 0.45,  # User emphasizes MPG!
        "seating": 0.15,
        "drivetrain": 0.05,
        "vehicle_type": 0.05,
        "performance": 0.05,
        "features": 0.05,
        "safety": 0.05
    }
}

scored_cars = catalog_scoring_service.score_cars_for_user(user_profile)
```

**Returns:**
```json
[
  {
    "id": "rav4-2024-xle",
    "score": 0.87,
    "reasons": ["awd_match", "good_mpg", "within_budget", "feature_rich"]
  }
]
```

## Scoring Dimensions (8 Total)

### Default Weights
```python
{
    "budget": 0.20,
    "fuel_efficiency": 0.20,
    "seating": 0.15,
    "drivetrain": 0.10,
    "vehicle_type": 0.10,
    "performance": 0.10,
    "features": 0.10,
    "safety": 0.05
}
```

### 1. Budget (0.20)
- Fits within budget?
- Bonus for being under budget
- Major penalty for over budget

**Reasons:**
- `within_budget` - ≤ max budget
- `under_budget` - ≤ 80% of max budget

### 2. Fuel Efficiency (0.20)
- MPG scoring based on commute distance
- Long commute = MPG matters more

**Reasons:**
- `excellent_mpg` - ≥40 MPG average
- `good_mpg` - ≥30 MPG average
- `decent_mpg` - ≥25 MPG average

### 3. Seating (0.15)
- Meets passenger requirements?
- Extra space bonus

**Reasons:**
- `enough_seats` - Meets minimum
- `extra_space` - 2+ extra seats

### 4. Drivetrain (0.10)
- AWD/4WD for offroad or when requested

**Reasons:**
- `awd_match` - Has AWD/4WD when needed

### 5. Vehicle Type (0.10)
- SUV for families
- Truck for offroad
- Sedan/hybrid for efficiency

**Reasons:**
- `family_friendly` - SUV or 7+ seats
- `efficient_choice` - Sedan/hybrid
- `offroad_capable` - Truck for terrain

### 6. Performance (0.10)
- Horsepower scoring
- Matters more if user mentions "power" or "performance"

**Reasons:**
- `high_performance` - ≥275 HP
- `good_power` - ≥225 HP
- `adequate_power` - ≥200 HP

### 7. Features (0.10)
- Matches specific features wanted
- Smart feature name matching

**Recognized features:**
- `apple_carplay`, `android_auto`
- `leather_seats`, `panoramic_sunroof`
- `blind_spot_monitor`, `adaptive_cruise`
- `lane_departure`, `3_row_seating`
- `hybrid`, `power_liftgate`, `wireless_charging`

**Reasons:**
- `has_carplay` - Has Apple CarPlay
- `has_leather` - Leather seats
- `has_sunroof` - Sunroof/panoramic
- `eco_friendly` - Hybrid
- `three_row_seating` - 3-row seating
- `feature_rich` - ≥80% feature match

### 8. Safety (0.05)
- Safety rating scoring

**Reasons:**
- `top_safety` - 5.0 rating
- `excellent_safety` - ≥4.5 rating

## Weight Adjustment Examples

### Example 1: User emphasizes MPG
```python
# User: "Fuel efficiency is my absolute top priority!"
user_profile["weights"] = {
    "fuel_efficiency": 0.45,  # BOOSTED
    "budget": 0.10,           # Reduced
    "seating": 0.15,
    "drivetrain": 0.10,
    "vehicle_type": 0.05,
    "performance": 0.05,
    "features": 0.05,
    "safety": 0.05
}
# Result: Prius scores highest
```

### Example 2: Performance priority
```python
# User: "I want something powerful!"
user_profile["weights"] = {
    "performance": 0.35,      # BOOSTED
    "fuel_efficiency": 0.10,  # Reduced
    "budget": 0.15,
    # ...
}
# Result: Tacoma/Highlander score higher (278-295 HP)
```

### Example 3: Budget doesn't matter
```python
# User: "Money is no object"
user_profile["weights"] = {
    "budget": 0.00,          # Ignored!
    "features": 0.25,        # BOOSTED
    "seating": 0.20,
    # ...
}
# Result: Highlander scores highest (most features, space)
```

### Example 4: Feature-focused
```python
# User: "Must have CarPlay, leather, and sunroof"
user_profile["weights"] = {
    "features": 0.40,        # BOOSTED
    # ... others reduced
}
# Result: Cars with matching features score highest
```

## Testing

### Basic functionality test:
```bash
docker compose -f docker-compose.dev.yml exec backend python test_catalog_scoring.py
```

### Weight adjustment demo:
```bash
docker compose -f docker-compose.dev.yml exec backend python test_weight_override.py
```

## Integration with Person B (Nemotron)

Person B analyzes conversation and builds the `user_profile`:

```python
from app.services.catalog_scoring import catalog_scoring_service

# Person B extracts from conversation:
# "I need a car for my family, fuel efficiency is crucial, 
#  budget around $40k, want AWD"

user_profile = {
    "budget_max": 40000,
    "commute_miles": 50,      # Inferred from "need fuel efficiency"
    "passengers": 5,          # Inferred from "family"
    "features_wanted": ["awd"],
    "has_children": True,
    
    # Nemotron detects user emphasized "fuel efficiency is crucial"
    "weights": {
        "fuel_efficiency": 0.35,  # Boosted from default 0.20
        "budget": 0.20,
        "seating": 0.15,
        "vehicle_type": 0.10,
        "drivetrain": 0.10,
        "performance": 0.05,
        "features": 0.05,
        "safety": 0.00           # Not mentioned
    }
}

# Get scored results
scored_cars = catalog_scoring_service.score_cars_for_user(user_profile)
top_3 = scored_cars[:3]

# Person B generates natural language:
# "Based on your needs, I recommend the RAV4 (score: 0.88) 
#  because it offers excellent fuel efficiency with 31 MPG 
#  combined, has AWD for safety, and fits your budget at $35,800..."
```

## Car Catalog Schema

Each car in `cars.json`:

```json
{
  "id": "rav4-2024-xle",
  "name": "RAV4",
  "model": "XLE",
  "year": 2024,
  "price": 35800,
  "type": "sedan" | "suv" | "hybrid" | "truck",
  "mpg_city": 27,
  "mpg_highway": 35,
  "features": [
    "AWD",
    "Power Liftgate",
    "Panoramic Sunroof",
    "Apple CarPlay",
    ...
  ],
  "engine": "2.5L 4-Cylinder",
  "transmission": "8-Speed Automatic",
  "drivetrain": "FWD" | "AWD" | "4WD",
  "seating": 5,
  "horsepower": 203,
  "safety_rating": 5.0
}
```

## All Scorable Attributes

✅ price
✅ mpg_city / mpg_highway
✅ seating
✅ drivetrain (FWD/AWD/4WD)
✅ type (sedan/suv/hybrid/truck)
✅ horsepower
✅ features (all recognized)
✅ safety_rating
✅ engine (informational)
✅ transmission (informational)

## Decision: Hard-coded vs. Nemotron Weights

**Hybrid approach (implemented):**

✅ **Default weights** - Sensible baseline, works without AI  
✅ **Nemotron overrides** - AI adjusts based on conversation emphasis  
✅ **Flexible** - Best of both worlds

**Person A provides:** Scoring algorithm + defaults  
**Person B decides:** Weight adjustments from conversation

## Responsibilities (Person A)

✅ Maintain car catalog (`cars.json`)  
✅ Implement comprehensive scoring (8 dimensions)  
✅ Provide default weights  
✅ Accept weight overrides  
✅ Return machine-readable scores + reasons  
✅ Cover ALL car attributes  
❌ No Nemotron API calls  
❌ No natural language generation (that's Person B)

## Responsibilities (Person B - Nemotron)

✅ Analyze conversation  
✅ Extract user requirements  
✅ Detect emphasized priorities  
✅ Adjust weights dynamically  
✅ Call `score_cars_for_user(profile)`  
✅ Generate natural language response using scores + reasons  
❌ No scoring logic (that's Person A)
