# Conflict Resolution in Conversations

## Overview

The system handles conflicting information in multi-turn conversations by **always preferring the most recent information**. When users correct themselves or provide updated information, the system automatically uses the latest values.

## How It Works

### 1. **Profile Extraction from Conversation History**

The system processes **ALL user messages** in chronological order and merges profiles:
- **Latest values override earlier values** for conflicting fields
- **Non-conflicting fields are preserved** (e.g., if user provides income in message 1 and down payment in message 5, both are kept)
- **Financial fields**: Direct override (new value replaces old)
- **User preferences**: Direct override (new value replaces old)
- **Weights**: Merged (new weights update existing weights)

### 2. **Examples**

#### Example 1: Credit Score Correction
```
Turn 1: "I have bad credit"
→ credit_score: 'poor'

Turn 2: "Actually, my credit score is 720"
→ credit_score: 720 ✅ (overrides 'poor')
```

#### Example 2: Budget Change
```
Turn 1: "Budget is $30k"
→ budget_max: 30000

Turn 2: "Actually, my budget is $40k"
→ budget_max: 40000 ✅ (overrides 30000)
```

#### Example 3: Income Correction
```
Turn 1: "I make $50k per year"
→ annual_income: 50000

Turn 2: "Actually, I make $60k per year"
→ annual_income: 60000 ✅ (overrides 50000)
```

#### Example 4: Priority Change
```
Turn 1: "Fuel efficiency is my top priority"
→ priorities: ['fuel_efficiency']
→ weights: {fuel_efficiency: 0.38, ...}

Turn 2: "Actually, performance is more important"
→ priorities: ['performance'] ✅ (replaces fuel_efficiency)
→ weights: {performance: 0.38, ...} ✅ (updated)
```

#### Example 5: Multiple Corrections
```
Turn 1: "I have bad credit, make $50k, budget $30k"
→ credit_score: 'poor'
→ annual_income: 50000
→ budget_max: 30000

Turn 2: "Actually my credit is 720 and I make $60k"
→ credit_score: 720 ✅
→ annual_income: 60000 ✅
→ budget_max: 30000 (preserved)

Turn 3: "My budget is actually $40k"
→ credit_score: 720 (preserved)
→ annual_income: 60000 (preserved)
→ budget_max: 40000 ✅
```

## Technical Implementation

### Method: `_extract_profiles_from_conversation()`

```python
def _extract_profiles_from_conversation(messages):
    """
    Process ALL user messages in chronological order.
    Later messages override earlier ones for conflicting fields.
    """
    user_profile = {}
    financial_profile = {}
    
    for msg in messages:
        if msg.role == "user":
            current_user = extract_user_profile(msg.content)
            current_financial = extract_financial_profile(msg.content)
            
            # Merge: newer values override older ones
            if current_user:
                for key, value in current_user.items():
                    user_profile[key] = value  # Direct override
            
            if current_financial:
                for key, value in current_financial.items():
                    financial_profile[key] = value  # Direct override
    
    return (user_profile, financial_profile)
```

### Field-Specific Behavior

| Field Type | Behavior | Example |
|------------|----------|---------|
| **Credit Score** | Latest overrides | "bad credit" → "720" → Uses 720 |
| **Income** | Latest overrides | "$50k" → "$60k" → Uses $60k |
| **Budget** | Latest overrides | "$30k" → "$40k" → Uses $40k |
| **Down Payment** | Latest overrides | "$3k" → "$8k" → Uses $8k |
| **Passengers** | Latest overrides | "5 people" → "7 people" → Uses 7 |
| **Priorities** | Latest replaces | ["fuel"] → ["performance"] → Uses ["performance"] |
| **Features** | Latest replaces | ["awd"] → ["awd", "hybrid"] → Uses ["awd", "hybrid"] |
| **Weights** | Merged/Updated | {fuel: 0.38} → {perf: 0.38} → Uses {perf: 0.38} |

## Smart Extraction

### Avoiding False Positives

The system avoids extracting incorrect values:

**Example: Budget vs Income**
```
Message: "My budget is actually $40k"
→ Extracts: budget_max = 40000
→ Does NOT extract: annual_income = 40000 ✅
```

**Example: Down Payment vs Budget**
```
Message: "I have $8k down"
→ Extracts: down_payment = 8000
→ Does NOT extract: budget_max = 8000 ✅
```

### Context Awareness

- **Budget messages**: Don't extract income from "$Xk" mentions
- **Down payment messages**: Don't extract budget from "$Xk" mentions
- **Credit score**: Numeric scores (720) take precedence over text ("bad credit")

## Benefits

### ✅ **For Users:**
- Can correct mistakes naturally
- Don't need to start over
- Conversation feels natural and forgiving
- System remembers corrections

### ✅ **For System:**
- Always uses most accurate information
- Handles user errors gracefully
- Maintains conversation context
- Provides better recommendations

### ✅ **For Hackathon:**
- Shows intelligent conversation handling
- Demonstrates real-world usability
- Differentiates from rigid form-based systems
- Impresses judges with natural interaction

## Test Cases

### Test 1: Credit Score Correction ✅
```python
messages = [
    "I have bad credit",
    "Actually, my credit score is 720"
]
Result: credit_score = 720 ✅
```

### Test 2: Budget Change ✅
```python
messages = [
    "Budget is $30k",
    "Actually, my budget is $40k"
]
Result: budget_max = 40000 ✅
```

### Test 3: Income Correction ✅
```python
messages = [
    "I make $50k per year",
    "Actually, I make $60k per year"
]
Result: annual_income = 60000 ✅
```

### Test 4: Multiple Corrections ✅
```python
messages = [
    "I have bad credit, make $50k, budget $30k",
    "Actually my credit is 720 and I make $60k",
    "My budget is actually $40k"
]
Result:
  credit_score = 720 ✅
  annual_income = 60000 ✅
  budget_max = 40000 ✅
```

## Real-World Example

### Conversation Flow:

```
User: "I have bad credit and need a car under $30k"
System: [Shows options with poor credit rates]

User: "Actually, my credit score is 720 and my budget is $40k"
System: [Uses credit=720, budget=$40k]
     → Shows better options with lower interest rates
     → Shows more expensive cars within $40k budget ✅

User: "I need it for a family of 5"
System: [Uses credit=720, budget=$40k, passengers=5]
     → Filters to cars that seat 5+ people
     → Shows Highlander, RAV4, etc. ✅
```

## Summary

**✅ YES - The system handles conflicting data correctly!**

- **Latest information ALWAYS overrides earlier information**
- **Works for all fields**: credit, income, budget, passengers, priorities, features
- **Context-aware**: Avoids false positives (budget vs income, etc.)
- **Natural**: Users can correct themselves without starting over
- **Tested**: All conflict resolution scenarios pass ✅

**This makes the system robust and user-friendly for real-world conversations!** 🎯

