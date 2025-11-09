# Nemotron Recommendation Algorithm

## Overview

Nemotron doesn't actually *create* the recommendations - it **explains** them. The algorithm is a hybrid system where:
1. **Python code** does all the scoring, filtering, and ranking
2. **Nemotron** generates natural language explanations of the results

## The Complete Algorithm Flow

### Step 1: Message Reception
```
User sends message: "I need a fuel-efficient car for my 60-mile commute, budget $30,000"
    ↓
System receives: List[ChatMessage] (full conversation history)
```

### Step 2: Profile Extraction (Python Regex-Based)

#### A. User Profile Extraction
```python
_extract_user_profile(message) → Dict[str, Any]
```

Extracts from natural language using regex patterns:
- **Budget**: `r'budget.*?\$?(\d+)k?'` → `budget_max: 30000`
- **Passengers**: `r'(\d+)\s*(?:people|passengers|seats)'` → `passengers: 5`
- **Commute**: `r'commute.*?(\d+)\s*(?:miles|mi)'` → `commute_miles: 60`
- **Priorities**: Detects keywords like "fuel efficiency", "safety", "space" → `priorities: ["fuel_efficiency"]`
- **Features**: Detects "AWD", "hybrid", "3-row seating" → `features_wanted: ["hybrid"]`
- **Terrain**: Detects "city", "highway", "offroad" → `terrain: "highway"`
- **Top Priority**: Detects "most important is X" → `top_priority: "fuel_efficiency"`

#### B. Financial Profile Extraction
```python
_extract_financial_profile(message) → Dict[str, Any]
```

Extracts:
- **Income**: Monthly or annual income → `monthly_income: 5000` or `annual_income: 60000`
- **Credit Score**: Numeric or text → `credit_score: 720` or `credit_score: "good"`
- **Down Payment**: `r'\$?(\d+)k?\s+down'` → `down_payment: 8000`
- **Loan Term**: `r'(\d+)\s*(?:year|yr)\s+loan'` → `loan_term_months: 60`
- **Trade-in**: `r'trade[\s-]in\s+(?:worth\s+|value\s+)?\$?(\d+)k?'` → `trade_in_value: 5000`

#### C. Conversation History Processing
```python
_extract_profiles_from_conversation(messages) → (user_profile, financial_profile)
```

- Processes **ALL** user messages in chronological order
- **Later messages override earlier ones** (handles corrections)
- Example: "I have bad credit" → later: "Actually, my credit is good" → Uses "good"

### Step 3: Preference Analysis

#### A. Substantial Preferences Check
```python
_has_substantial_vehicle_preferences(user_profile) → bool
```

Determines if user has enough information (at least 2 of):
- Budget (or flexible budget)
- Passengers/family needs
- Priorities (especially top priority)
- Features wanted
- Terrain/commute
- Specific needs (ground clearance, cargo space)

#### B. Missing Information Analysis
```python
_analyze_missing_information(user_profile, financial_profile, user_message) → Dict[str, Any]
```

Identifies what's missing:
- `needs_budget`: Budget not specified
- `needs_passengers`: Passenger count not specified
- `needs_income`: Income not specified
- `needs_income_clarification`: Income provided but unclear if monthly/yearly
- `needs_credit`: Credit score not specified
- `needs_down_payment`: Down payment not specified
- `needs_priorities`: Priorities not specified
- `needs_features`: Features not specified
- `needs_commute`: Terrain/commute not specified

### Step 4: Weight Calculation

#### A. Priority to Weights Conversion
```python
_priorities_to_weights(priorities, top_priority) → Dict[str, float]
```

Converts user priorities to scoring weights:
- **Top priority**: Gets 0.45 weight (45%)
- **Other priorities**: Share 0.30 weight (30%)
- **Non-priorities**: Get 0.06 weight (6%) each
- **Normalized**: All weights sum to 1.0

Example:
- Priorities: `["fuel_efficiency"]`, top_priority: `"fuel_efficiency"`
- Weights: `{"fuel_efficiency": 0.45, "budget": 0.06, "seating": 0.06, ...}`

### Step 5: Car Scoring (Catalog Scoring Service)

#### A. Score All Cars
```python
catalog.score_cars_for_user(scoring_profile) → List[Dict[str, Any]]
```

For **EACH car** in catalog (all 246 cars):
1. **Budget Scoring** (weight × score):
   - Checks if car price is within budget
   - Handles total cost vs base price
   - Handles flexible budgets
   - Returns score: 0.0-1.0

2. **Fuel Efficiency Scoring** (weight × score):
   - Considers commute distance
   - Scores based on MPG (city/highway)
   - Prioritizes hybrid/electric
   - Returns score: 0.0-1.0

3. **Seating Scoring** (weight × score):
   - Scores based on passenger capacity
   - Includes cargo/trunk space
   - Considers baby seat room
   - Returns score: 0.0-1.0

4. **Drivetrain Scoring** (weight × score):
   - Scores based on AWD/FWD/RWD preferences
   - Considers terrain needs
   - Returns score: 0.0-1.0

5. **Vehicle Type Scoring** (weight × score):
   - Scores based on body style (SUV, sedan, truck)
   - Considers ground clearance needs
   - Handles rough terrain requirements
   - Returns score: 0.0-1.0

6. **Performance Scoring** (weight × score):
   - Scores based on horsepower
   - Considers towing capacity
   - Returns score: 0.0-1.0

7. **Features Scoring** (weight × score):
   - Scores based on desired features
   - Matches feature keywords to car specs
   - Returns score: 0.0-1.0

8. **Safety Scoring** (weight × score):
   - Scores based on crash test scores
   - Considers driver assist features
   - Returns score: 0.0-1.0

#### B. Total Score Calculation
```python
total_score = (
    weights["budget"] * budget_score +
    weights["fuel_efficiency"] * mpg_score +
    weights["seating"] * seating_score +
    weights["drivetrain"] * drivetrain_score +
    weights["vehicle_type"] * type_score +
    weights["performance"] * performance_score +
    weights["features"] * features_score +
    weights["safety"] * safety_score
)
```

#### C. Sort by Score
```python
scored_cars.sort(key=lambda x: x["score"], reverse=True)
```

### Step 6: Financial Analysis (If Financial Info Available)

#### A. Affordability Calculation
```python
financial_service.evaluate_affordability(car, financial_profile) → AffordabilityResult
```

For each car:
1. **Monthly Payment**: Amortization formula
   - Loan amount = (car price - down payment - trade-in)
   - Interest rate = f(credit_score)
   - Monthly payment = PMT(rate, term, principal)

2. **Debt-to-Income (DTI) Ratio**:
   - DTI = (monthly_payment / monthly_income) × 100
   - Industry standard: DTI < 15% is comfortable

3. **Affordability Score** (0.0-1.0):
   - Based on DTI ratio
   - Considers down payment percentage
   - Considers loan term
   - Returns score: 0.0-1.0

4. **Total Cost of Ownership (TCO)**:
   - Purchase cost
   - Annual fuel costs (based on commute)
   - Annual insurance
   - Annual maintenance
   - Depreciation over 5 years

5. **Warnings**:
   - High DTI (> 15%)
   - Low down payment (< 10%)
   - Long loan term (> 6 years)

#### B. Combined Score (If Both Preferences and Financial Info)
```python
combined_score = (
    preference_score * 0.6 +  # Preference is 60%
    affordability_score * 0.4  # Affordability is 40%
)
```

Or (if only financial info):
```python
combined_score = (
    affordability_score * 0.7 +  # Affordability is 70%
    preference_score * 0.3        # Base preference is 30%
)
```

### Step 7: Car Filtering and Selection

#### A. Determine Scoring Method
- **`preference_based`**: User has substantial vehicle preferences
- **`affordability_based`**: User only provided financial info
- **`None`**: No specific info (ambiguous query)

#### B. Filter Cars
- **Preference-based**: Take top N scored cars (default: 8, can be 15, 25, etc.)
- **Affordability-based**: Filter by DTI ≤ 18%, sort by combined score
- **Combined**: Take top 10, combine preference + affordability scores

#### C. Dynamic Result Adjustment
```python
_should_show_more_results(messages) → (bool, int)
```

Detects if user wants more results:
- "show more" → 15 results
- "show all" → 25 results
- "show 5 more" → 8 + 5 = 13 results

### Step 8: Context Building for Nemotron

#### A. Build Catalog Context
```python
catalog_context = """
USER REQUIREMENTS SUMMARY:
🎯 TOP PRIORITY: Fuel Efficiency
💰 Budget: $30,000 (base price)
👥 Passengers: 5
🛣️ Terrain: Highway
⭐ Priorities: Fuel Efficiency
🔧 Features: Hybrid

Top 8 Matches (ranked by how well they match your requirements):

1. Car: 2020 Toyota Prius LE
   Match Score: 0.94
   Price: $28,000
   MPG: 54 city / 50 hwy
   Fuel Type: Hybrid
   ...
   Match Reasons: within_budget, excellent_mpg, eco_friendly

2. Car: 2020 Toyota Corolla Hybrid LE
   Match Score: 0.92
   ...
"""
```

#### B. Add Financial Analysis (If Available)
```python
Financial Analysis:
  Monthly Payment: $450.00
  Down Payment Required: $8,000.00
  Total 5-Year Cost: $35,000.00
  Debt-to-Income Ratio: 9.0%
  Affordability Score: 95%
  Status: ✅ Financially Comfortable
```

#### C. Add Instructions for Nemotron
```python
"""
IMPORTANT RESPONSE STRUCTURE:
1. FIRST: Acknowledge all the user's requirements clearly
2. SECOND: Show the top car recommendations with explanations
3. THIRD: Mention that to calculate exact monthly payments, you need financial information
4. FOURTH: Ask for financial info (income, credit score, down payment)

RESPONSE TONE:
- Be enthusiastic about the matches you found
- Emphasize how the cars address their top priority
- Frame financial questions as 'to calculate exact payments'
"""
```

### Step 9: Nemotron API Call

#### A. Format Messages
```python
formatted_messages = [
    {
        "role": "system",
        "content": system_prompt  # Instructions about being a Toyota advisor
    },
    {
        "role": "user",
        "content": "I need a fuel-efficient car..."
    },
    {
        "role": "system",
        "content": catalog_context  # Scored cars and instructions
    }
]
```

#### B. Call Nemotron API
```python
completion = client.chat.completions.create(
    model="nvidia/nvidia-nemotron-nano-9b-v2",
    messages=formatted_messages,
    temperature=0.6,
    max_tokens=2048,
    stream=True,
    extra_body={
        "min_thinking_tokens": 512,
        "max_thinking_tokens": 1024
    }
)
```

#### C. Stream Response
```python
response_content = ""
for chunk in completion:
    if chunk.choices[0].delta.content:
        response_content += chunk.choices[0].delta.content
```

### Step 10: Response Generation

#### A. Nemotron's Role
Nemotron **does NOT**:
- ❌ Score cars
- ❌ Filter cars
- ❌ Rank cars
- ❌ Calculate affordability

Nemotron **DOES**:
- ✅ Generate natural language explanations
- ✅ Format recommendations nicely
- ✅ Provide conversational responses
- ✅ Ask clarifying questions
- ✅ Explain why cars match user needs
- ✅ Provide financial advice (based on calculated data)

#### B. Response Format
Nemotron generates responses like:
```
Based on your needs for fuel efficiency and a 60-mile commute, 
I found several excellent options:

1. **2020 Toyota Prius LE** - Score: 0.94
   Why it's a great match:
   - Excellent fuel economy: 54 MPG city / 50 MPG highway
   - Perfect for your commute: Saves $1,200/year on fuel
   - Within your budget: $28,000 (base price)
   - Hybrid technology: Eco-friendly and efficient

2. **2020 Toyota Corolla Hybrid LE** - Score: 0.92
   ...
```

### Step 11: Return Results

```python
return (
    response_text,              # Nemotron's natural language response
    recommended_car_ids_list,   # List of car IDs: ["prius-le-2020", "corolla-hybrid-le-2020"]
    scoring_method              # "preference_based", "affordability_based", or None
)
```

## Key Points

### 1. **Python Does the Scoring**
- All 246 cars are scored using 8 features
- Weights are calculated from user priorities
- Cars are ranked by score (highest first)

### 2. **Nemotron Does the Explaining**
- Nemotron receives the top-scored cars
- Nemotron generates natural language explanations
- Nemotron formats the response nicely

### 3. **Hybrid System**
- **Python**: Data processing, scoring, filtering, ranking
- **Nemotron**: Natural language generation, explanations, conversations

### 4. **Financial Integration**
- If financial info is provided, affordability is calculated
- Combined score = preference score + affordability score
- Nemotron explains financial implications

### 5. **Dynamic Adjustments**
- System detects if user wants more results
- System adjusts number of cars shown (8, 15, 25, etc.)
- System handles corrections (later messages override earlier ones)

## Algorithm Summary

```
User Message
    ↓
Extract User Profile (Python Regex)
    ↓
Extract Financial Profile (Python Regex)
    ↓
Calculate Weights from Priorities (Python)
    ↓
Score ALL Cars (Python - 8 features × weights)
    ↓
Calculate Affordability (Python - if financial info)
    ↓
Combine Scores (Python - preference + affordability)
    ↓
Filter & Sort Cars (Python - by combined score)
    ↓
Build Context for Nemotron (Python - top cars + instructions)
    ↓
Call Nemotron API (Nemotron - generate explanation)
    ↓
Return Response (Nemotron's natural language + car IDs)
```

## Why This Design?

### Advantages:
1. **Grounded**: All data comes from `cars.json` (no hallucinations)
2. **Explainable**: Clear scoring reasons for each car
3. **Accurate**: Python does precise calculations
4. **Conversational**: Nemotron provides natural language
5. **Flexible**: Handles various user queries and preferences

### Nemotron's Role:
- **Not**: A scoring system
- **Is**: A natural language generator that explains Python's scoring results

This ensures accuracy (Python) + natural conversation (Nemotron)!

