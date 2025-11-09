# Scoring Method Explanation

The `scoring_method` field in the chat API response indicates how cars were ranked and selected for recommendation.

## Possible Values

### 1. `"preference_based"` 
**When:** User provided vehicle preferences (budget, passengers, priorities, features, terrain, etc.)

**How it works:**
- Cars are scored based on how well they match user's preferences
- Scoring considers:
  - Budget fit (within budget, under budget, flexible budget)
  - Passenger capacity (seating requirements)
  - Priorities (fuel efficiency, safety, space, performance) with dynamic weights
  - Features wanted (AWD, hybrid, 3rd row, etc.)
  - Terrain/commute needs (city, highway, off-road, rough roads)
  - Ground clearance (for potholes/speed bumps)
  - Cargo space (especially if space is top priority)

**Note:** If user also provided financial info, cars are still ranked primarily by preferences (60% weight), but affordability is also considered (40% weight). The `scoring_method` remains `"preference_based"` to indicate preferences were the primary driver.

### 2. `"affordability_based"`
**When:** User only provided financial information (income, credit score, down payment) but no specific vehicle preferences

**How it works:**
- All cars are scored neutrally first
- Then filtered by affordability:
  - Monthly payment calculation (based on income, credit score, down payment, loan term)
  - Debt-to-income (DTI) ratio (must be ≤ 18% to be included)
  - Affordability score (0-100% based on DTI, down payment, loan term)
  - Total cost of ownership (5-year estimate)
- Only affordable cars (DTI ≤ 18%) are shown
- Cars are ranked by affordability score (70%) + neutral preference score (30%)

### 3. `None`
**When:** User hasn't provided enough information yet (no vehicle preferences AND no financial info)

**What happens:**
- No car recommendations are shown
- Nemotron asks clarifying questions to gather:
  - Budget
  - Passenger count
  - Priorities (fuel efficiency, safety, space, performance)
  - Terrain/commute information
  - Financial information (income, credit score, down payment)

## Scoring Logic Flow

```
User Input
    │
    ├─ Has Vehicle Preferences? ──YES──> "preference_based"
    │   │                                    │
    │   │                                    ├─ Has Financial Info? ──YES──> Combine: 60% preferences + 40% affordability
    │   │                                    │
    │   │                                    └─ NO ──> Pure preference scoring
    │   │
    │   └─ NO
    │       │
    │       └─ Has Financial Info? ──YES──> "affordability_based"
    │           │
    │           └─ NO ──> None (ask clarifying questions)
```

## Frontend Usage

The frontend can use `scoring_method` to:
1. **Display context**: Show user how recommendations were generated
   - "Based on your preferences" (preference_based)
   - "Based on your budget" (affordability_based)
   - "Tell me more about what you need" (None)

2. **Adjust UI**: 
   - For `preference_based`: Highlight matching features, priorities
   - For `affordability_based`: Show monthly payment, DTI ratio prominently
   - For `None`: Show form to collect preferences/financial info

3. **Debugging**: Understand why certain cars were recommended

## Example Responses

### Preference-Based
```json
{
  "role": "agent",
  "content": "Based on your need for trunk space and pothole handling...",
  "recommended_car_ids": ["rav4-xle-2021", "highlander-platinum-2021"],
  "scoring_method": "preference_based"
}
```

### Affordability-Based
```json
{
  "role": "agent",
  "content": "Based on your $5,000/month income and 720 credit score...",
  "recommended_car_ids": ["camry-le-2018", "corolla-le-2020"],
  "scoring_method": "affordability_based"
}
```

### None (No Recommendations Yet)
```json
{
  "role": "agent",
  "content": "To help you find the perfect Toyota, I need to know...",
  "recommended_car_ids": null,
  "scoring_method": null
}
```

## Future Enhancements

Consider adding:
- `"combined"` - When both preferences and financial info are used with equal weight
- `"refinement"` - When user is refining previous recommendations ("show more", "show different options")

