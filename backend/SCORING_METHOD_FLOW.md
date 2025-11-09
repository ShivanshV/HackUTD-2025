# How Scoring Method Works - Complete Flow

## Overview

The scoring method determines how cars are ranked and selected based on what information the user provides. Here's how it works from start to finish.

## Step-by-Step Flow

### 1. **User Input Analysis**

```
User sends message → Extract user profile + financial profile
```

**User Profile Extraction:**
- Budget (max price, total cost, flexible)
- Passengers/family size
- Priorities (fuel efficiency, safety, space, performance)
- Features (AWD, hybrid, 3rd row, etc.)
- Terrain/commute (city, highway, off-road, rough roads)
- Ground clearance needs
- Top priority (if explicitly stated)

**Financial Profile Extraction:**
- Income (monthly or annual)
- Credit score
- Down payment
- Loan term
- Trade-in value

### 2. **Determine Scoring Method**

The system checks what information is available and assigns a scoring method:

```python
if has_substantial_vehicle_preferences:
    scoring_method = "preference_based"
elif has_vehicle_preferences:  # Some but not substantial
    scoring_method = "preference_based"
elif has_financial_info:  # Only financial, no preferences
    scoring_method = "affordability_based"
else:
    scoring_method = None  # Ask for more info
```

### 3. **Score Cars Based on Method**

#### **A. Preference-Based Scoring**

**When:** User provided vehicle preferences

**Process:**
1. **Catalog Scoring Service** scores each car:
   - Budget match (0-1.0): Within budget? Under budget? Flexible?
   - Seating capacity (0-1.0): Enough seats? Extra space?
   - Cargo space (0-1.0): Especially if space is top priority
   - Fuel efficiency (0-1.0): MPG match
   - Safety (0-1.0): Crash test scores, safety features
   - Performance (0-1.0): Power, acceleration
   - Features (0-1.0): AWD, hybrid, etc.
   - Ground clearance (0-1.0): For rough roads
   - Vehicle type (0-1.0): SUV for families, etc.

2. **Dynamic Weights:**
   - Top priority gets 0.45 weight
   - Other priorities get 0.30 weight (shared)
   - Non-priorities get 0.06 weight
   - Example: If "space" is top priority → seating/cargo gets 0.45 weight

3. **Final Score:**
   ```
   car_score = (budget_score * budget_weight) + 
               (seating_score * seating_weight) + 
               (fuel_score * fuel_weight) + 
               ... (all criteria)
   ```

4. **Ranking:** Cars sorted by score (highest first)

**Example:**
```
User: "I need trunk space (top priority), budget $33k, 5 passengers, pothole handling"

Scoring:
- RAV4: space_score=0.9, budget_score=0.8, clearance_score=0.95 → total=0.88
- Camry: space_score=0.6, budget_score=0.9, clearance_score=0.5 → total=0.67
- Highlander: space_score=0.95, budget_score=0.7, clearance_score=0.9 → total=0.85

Result: RAV4 ranks #1 (best combination)
```

#### **B. Affordability-Based Scoring**

**When:** User only provided financial info (no vehicle preferences)

**Process:**
1. **Get all cars** scored neutrally (no preference weighting)

2. **Financial Service** evaluates each car:
   - Calculate monthly payment (amortization formula)
   - Calculate debt-to-income (DTI) ratio
   - Calculate affordability score (0-100%)
   - Calculate total cost of ownership (5 years)
   - Generate warnings (high DTI, low down payment, etc.)

3. **Filter:** Only include cars with DTI ≤ 18% (affordable)

4. **Combined Score:**
   ```
   combined_score = (affordability_score * 0.7) + (neutral_preference_score * 0.3)
   ```
   - 70% weight on affordability
   - 30% weight on neutral preference (all cars scored equally)

5. **Ranking:** Cars sorted by combined score (highest first)

**Example:**
```
User: "I make $5,000/month, credit score 720, $8k down payment"

Financial Analysis:
- Camry ($24k): monthly=$354, DTI=7.1%, affordability=95% → score=0.92
- RAV4 ($28k): monthly=$420, DTI=8.4%, affordability=90% → score=0.87
- Highlander ($36k): monthly=$560, DTI=11.2%, affordability=75% → score=0.71
- Land Cruiser ($85k): monthly=$1,200, DTI=24% → FILTERED OUT (DTI > 18%)

Result: Camry ranks #1 (most affordable)
```

#### **C. Combined Scoring (Preference + Financial)**

**When:** User provided BOTH preferences AND financial info

**Process:**
1. **First:** Score cars by preferences (same as preference-based)

2. **Then:** For each preference-matched car, calculate affordability

3. **Combined Score:**
   ```
   combined_score = (preference_score * 0.6) + (affordability_score * 0.4)
   ```
   - 60% weight on preference match
   - 40% weight on affordability

4. **Ranking:** Cars sorted by combined score

**Current Behavior:** Still marked as `"preference_based"` (but actually combined)

**Example:**
```
User: "I need trunk space (top priority), budget $33k, 5 passengers, 
       pothole handling. Income $5,000/month, credit 720, $8k down"

Scoring:
- RAV4: 
  - Preference score: 0.88 (great space, good clearance, within budget)
  - Affordability score: 0.90 (monthly=$420, DTI=8.4%)
  - Combined: (0.88 * 0.6) + (0.90 * 0.4) = 0.888

- Highlander:
  - Preference score: 0.85 (excellent space, good clearance, slightly over budget)
  - Affordability score: 0.75 (monthly=$560, DTI=11.2%)
  - Combined: (0.85 * 0.6) + (0.75 * 0.4) = 0.81

- Camry:
  - Preference score: 0.67 (less space, poor clearance)
  - Affordability score: 0.95 (monthly=$354, DTI=7.1%)
  - Combined: (0.67 * 0.6) + (0.95 * 0.4) = 0.782

Result: RAV4 ranks #1 (best balance of preferences + affordability)
```

#### **D. No Scoring (None)**

**When:** User hasn't provided enough information

**Process:**
1. No cars are scored or ranked
2. Nemotron asks clarifying questions:
   - "What's your budget?"
   - "How many passengers?"
   - "What are your priorities?"
   - "What's your income?"
   - etc.

3. Once enough info is collected, scoring method is assigned

### 4. **Select Top Cars**

After scoring, the system:
1. Takes top N cars (default: 8, or based on user request)
2. Collects car IDs for API response
3. Builds context for Nemotron to explain recommendations
4. Returns car IDs + scoring method to frontend

### 5. **Nemotron Explanation**

Nemotron receives:
- Scored car list with details
- User requirements summary
- Scoring method context
- Instructions on how to explain results

Nemotron generates:
- Friendly explanation of why these cars match
- Highlights key features that match user needs
- Mentions financial implications (if applicable)
- Asks for more info if needed

## Visual Flow Diagram

```
User Message
    │
    ├─ Extract Profiles
    │   ├─ User Profile (preferences, budget, etc.)
    │   └─ Financial Profile (income, credit, etc.)
    │
    ├─ Determine Scoring Method
    │   ├─ Has Preferences? → "preference_based"
    │   ├─ Only Financial? → "affordability_based"
    │   └─ Neither? → None (ask questions)
    │
    ├─ Score Cars
    │   ├─ Preference-Based:
    │   │   └─ Catalog Scoring (budget, seating, features, etc.)
    │   ├─ Affordability-Based:
    │   │   └─ Financial Service (monthly payment, DTI, affordability)
    │   └─ Combined:
    │       └─ Catalog Scoring (60%) + Financial Service (40%)
    │
    ├─ Filter & Rank
    │   ├─ Sort by score (highest first)
    │   ├─ Filter unaffordable (DTI > 18%) if financial info available
    │   └─ Take top N cars
    │
    ├─ Build Context for Nemotron
    │   ├─ Car details with scores
    │   ├─ User requirements summary
    │   └─ Scoring method explanation
    │
    └─ Return to Frontend
        ├─ Text response (Nemotron explanation)
        ├─ Car IDs (recommended_car_ids)
        └─ Scoring method ("preference_based", "affordability_based", or None)
```

## Example Scenarios

### Scenario 1: Preference-Based Only
```
Input: "I need a family car with good trunk space, budget $35k"
Output: 
  - scoring_method: "preference_based"
  - recommended_car_ids: ["highlander-le-2021", "rav4-xle-2021", "sienna-le-2020"]
  - Explanation: "Based on your need for family space and trunk capacity..."
```

### Scenario 2: Affordability-Based Only
```
Input: "I make $4,000/month, credit score 680, $5k down payment"
Output:
  - scoring_method: "affordability_based"
  - recommended_car_ids: ["camry-le-2018", "corolla-le-2020", "prius-le-2019"]
  - Explanation: "Based on your financial profile, here are affordable options..."
```

### Scenario 3: Combined (Preference + Financial)
```
Input: "I need trunk space (top priority), budget $33k, pothole handling. 
        Income $5,000/month, credit 720, $8k down"
Output:
  - scoring_method: "preference_based" (currently, but should be "combined")
  - recommended_car_ids: ["rav4-xle-2021", "highlander-le-2021", "camry-se-2020"]
  - Explanation: "Based on your need for trunk space and budget, and considering 
                  your financial profile, the RAV4 offers the best balance..."
```

### Scenario 4: No Information
```
Input: "I need a car"
Output:
  - scoring_method: None
  - recommended_car_ids: null
  - Explanation: "To help you find the perfect Toyota, I need to know: 
                  your budget, how many passengers, your priorities, etc."
```

## Key Differences

| Scoring Method | Primary Factor | Secondary Factor | Weight Split |
|---------------|---------------|------------------|--------------|
| `preference_based` | User preferences | None (or affordability if provided) | 100% preferences (or 60/40) |
| `affordability_based` | Financial affordability | Neutral preferences | 70% affordability, 30% neutral |
| `combined` (proposed) | Both equally | N/A | 60% preferences, 40% affordability |
| `None` | N/A | N/A | Ask for more info |

## Benefits of This System

1. **Flexible**: Works with partial information
2. **Intelligent**: Prioritizes based on what user values
3. **Financial-aware**: Considers affordability when provided
4. **Transparent**: Scoring method tells frontend how recommendations were generated
5. **User-friendly**: Asks for more info when needed

## Future Improvements

1. **Add "combined" scoring method** when both preferences and financial info are used
2. **Dynamic weight adjustment** based on user emphasis (e.g., "budget is most important")
3. **Refinement scoring** when user says "show more" or "show different options"
4. **Personalization** based on conversation history

