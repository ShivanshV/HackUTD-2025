# Ambiguous Query Handling

## Overview

Nemotron intelligently handles ambiguous user queries by analyzing what information is missing and asking targeted clarifying questions. This ensures that the catalog scoring and financial analysis tools receive the necessary data to provide accurate, personalized recommendations.

## How It Works

### 1. Information Extraction

The system extracts two types of profiles from user messages:
- **User Profile**: Budget, passengers, commute distance, terrain, priorities, features wanted
- **Financial Profile**: Income (monthly/annual), credit score, down payment, loan term preference

### 2. Missing Information Analysis

The `_analyze_missing_information()` method detects what critical information is missing:

**Vehicle Preferences:**
- Budget range
- Passenger count
- Priorities (fuel efficiency, performance, safety, space, etc.)
- Features wanted (AWD, hybrid, 3rd row seating, etc.)
- Commute distance/terrain

**Financial Information:**
- Income (monthly or annual)
- Credit score
- Down payment amount
- Loan term preference

### 3. Context-Aware Question Generation

The system generates suggested questions based on:
- **Query Intent**: Detects if the query is about affordability, preferences, or general car shopping
- **Missing Critical Info**: Prioritizes questions for information that significantly impacts recommendations
- **Service Capabilities**: Asks for data that the catalog scoring and financial analysis tools need

### 4. Nemotron Intelligence

Nemotron receives:
- **System Prompt**: Instructions on its role and available tools
- **Missing Information Analysis**: Detailed breakdown of what's missing and why it's needed
- **Suggested Questions**: Framework for asking clarifying questions naturally
- **Service Context**: Explanation of how the scoring and financial tools use the information

## Query Types

### Completely Ambiguous
**Example**: "I need a car"

**Handling**: 
- Detects no vehicle preferences and no financial information
- Provides comprehensive missing information analysis
- Nemotron asks about budget, passengers, income, credit score, priorities

### Ambiguous Income
**Example**: "I make $5000" or "I make $60k"

**Handling**:
- Detects income amount provided but unclear if monthly or yearly
- Determines likelihood based on amount magnitude:
  - Numbers with "k" suffix (e.g., "$60k") → likely annual
  - Numbers $1,000-$20,000 → could be either (needs clarification)
  - Numbers > $20,000 → likely annual
  - Numbers < $1,000 → likely monthly
- **Priority handling**: Ambiguous income takes precedence over other missing information
- Nemotron asks: "Is your income of $X per month or per year? (This helps calculate exact monthly payments)"
- **Context provided**: Explains why this is critical:
  - Monthly payments depend on whether income is monthly or yearly
  - Debt-to-income (DTI) ratio calculations require monthly income
  - Affordability analysis needs accurate monthly income to be meaningful

**Examples**:
- "I make $5000" → Asks if this is monthly or yearly
- "I make $60k" → Likely annual but asks for confirmation
- "I make $5000 and need a family car for 5 people" → Shows vehicle recommendations but asks for income clarification

### Partial Vehicle Preferences
**Example**: "I have a budget of $30k"

**Handling**:
- Detects budget but missing passengers, priorities, financial info
- Can provide initial recommendations based on budget
- Nemotron suggests providing additional details (passengers, priorities, financial info) to refine recommendations

### Partial Financial Information
**Example**: "I make $50k per year"

**Handling**:
- Detects income but missing credit score, down payment
- Can show affordable cars based on income
- Nemotron explains that credit score and down payment would help calculate exact monthly payments

### Financial Focus (Affordability Query)
**Example**: "What can I afford?"

**Handling**:
- Detects query intent is about affordability
- Prioritizes asking for financial information (income, credit score, down payment)
- Explains why each piece of information is needed for accurate calculations

### Vague Preferences
**Example**: "I want something good for my family"

**Handling**:
- Detects general intent but missing specifics
- Asks for passenger count, budget, priorities, and financial information
- Can provide family-friendly recommendations once details are gathered

## Implementation Details

### Key Methods

1. **`_analyze_missing_information()`**
   - Analyzes user_profile and financial_profile
   - Detects missing critical information
   - **Detects ambiguous income** (amount provided but unclear if monthly/yearly)
   - Generates context-aware suggested questions
   - Returns structured missing_info dictionary with `needs_income_clarification` flag

2. **`_extract_financial_profile()`**
   - Extracts financial information from user messages
   - **Detects ambiguous income** when amount is provided without time period
   - Uses magnitude-based heuristics to determine likelihood (monthly vs yearly)
   - Stores ambiguous income in `ambiguous_income` and `ambiguous_income_likely_annual` fields

3. **`process_message()`**
   - Extracts profiles from conversation history
   - Analyzes missing information
   - Builds clarification context for ambiguous queries
   - Provides Nemotron with detailed guidance on what to ask

3. **System Prompt Enhancement**
   - Includes instructions on handling ambiguous queries
   - Explains available tools and what data they need
   - Guides Nemotron to ask friendly, conversational questions

### Context Provided to Nemotron

For ambiguous queries, Nemotron receives:

**Completely Ambiguous Query:**
```
MISSING INFORMATION ANALYSIS:
- Budget: Not specified. The scoring tool uses budget to filter and rank vehicles.
- Passenger count: Not specified. Needed to match vehicles with appropriate seating capacity.
- Income: Not specified. Required for financial affordability analysis (monthly payments, DTI ratio).
- Credit score: Not specified. Critical for calculating interest rates (affects monthly payment significantly).
...

SUGGESTED QUESTIONS:
1. What is your monthly or annual income?
2. What is your credit score range (excellent, good, fair, or a specific number)?
3. How many passengers do you need to seat regularly?
...
```

**Ambiguous Income Query:**
```
MISSING INFORMATION ANALYSIS:
- Income: User provided $5,000, but it's unclear if this is monthly or yearly income. This is CRITICAL for accurate financial calculations:
  * Monthly payments depend on whether income is monthly or yearly
  * Debt-to-income (DTI) ratio calculations require monthly income
  * Affordability analysis needs accurate monthly income to be meaningful
  * Based on the amount, it's likely monthly, but you should confirm
...

SUGGESTED QUESTIONS:
1. Is your income of $5,000 per month or per year? (This helps calculate exact monthly payments)
...
```

**YOUR TASK:**
Ask friendly, conversational clarifying questions to gather the missing information.
Focus on what's needed to use the catalog scoring and financial analysis tools effectively.
Be helpful and explain why you need this information (e.g., 'To calculate your monthly payment, I need to know...').

## Benefits

1. **Accuracy**: Ensures recommendations are based on complete information
2. **User Experience**: Friendly, conversational questioning rather than technical forms
3. **Context-Aware**: Asks relevant questions based on query intent
4. **Service Integration**: Questions align with what the scoring and financial tools need
5. **Progressive Refinement**: Can provide partial recommendations while asking for more details

## Testing

Use the `test_ambiguous_queries.sh` script to test various ambiguous query scenarios:

```bash
./test_ambiguous_queries.sh
```

This tests:
- Completely ambiguous queries
- Partial information scenarios
- Financial focus queries
- Vague preference queries

## Example Flow

**User**: "I need a car"

**Nemotron**: "I'd be happy to help you find the perfect Toyota! To provide you with the best recommendations, I need a bit more information:

1. What's your budget range for the vehicle?
2. How many passengers do you need to seat regularly?
3. What are your priorities? (fuel efficiency, performance, space, safety, etc.)
4. What is your monthly or annual income? (This helps me calculate what you can afford)
5. What is your credit score range? (This affects interest rates and monthly payments)

Once I have these details, I can use Toyota's catalog and financial analysis tools to find vehicles that match your needs and budget!"

**User**: "I have a budget of $30k, need to seat 5 people, and make $60k per year"

**Nemotron**: [Provides recommendations based on catalog scoring and financial analysis]

---

**Example 2: Ambiguous Income**

**User**: "I make $5000 and need a car"

**Nemotron**: "I'd be happy to help you find a Toyota that fits your budget! I noticed you mentioned your income is $5,000. To calculate accurate monthly payments and determine what you can afford, I need to clarify:

Is your income of $5,000 per month or per year? This is important because:
- Monthly payment calculations depend on whether this is your monthly or yearly income
- Debt-to-income ratio (DTI) calculations require monthly income
- Affordability analysis needs accurate monthly income to provide meaningful recommendations

Once I know this, I can use Toyota's catalog and financial analysis tools to show you vehicles that fit both your needs and your budget!"

**User**: "It's $5000 per month"

**Nemotron**: [Provides recommendations based on catalog scoring and financial analysis with accurate monthly payment calculations]

