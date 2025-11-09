# Nemotron's Intelligent Question-Asking

## Overview

**YES**, Nemotron WILL ask users about missing critical parameters that significantly affect recommendations. The system is designed to be **conversationally intelligent** and guide users toward providing the information needed for accurate recommendations.

## Critical Parameters That Change Recommendations

### 1. 💰 **Credit Score** (MASSIVE Impact)

**Effect on RAV4 ($29,575) with $5k down:**

| Credit Score | Interest Rate | Monthly Payment | Total 5-Year Cost | Difference |
|--------------|---------------|-----------------|-------------------|------------|
| Excellent (750+) | 5.49% | $469 | $28,158 | Baseline |
| Good (700-749) | 6.99% | $487 | $29,190 | +$1,032 |
| Fair (650-699) | 8.99% | $510 | $30,601 | +$2,443 |
| Poor (600-649) | 11.99% | $547 | $32,792 | +$4,634 |
| Very Poor (<600) | 15.99% | $597 | $35,849 | +$7,691 |

**Impact:** 
- 📈 **27.3% higher monthly payment** (Excellent vs Very Poor)
- 💸 **$7,691 extra cost over 5 years**
- ⚠️ **Can push DTI from 9.4% to 11.9%** (comfortable → strained)

**When it matters most:**
- Difference between affordable and unaffordable
- Tight budgets where every $50/month matters
- Expensive vehicles where interest compounds

---

### 2. 💵 **Income** (CRITICAL for Affordability)

**Without income, the system CANNOT:**
- Calculate debt-to-income ratio
- Determine affordability
- Provide realistic guidance

**Example: Highlander ($39,270)**

| Annual Income | Monthly Payment | DTI Ratio | Affordable? |
|---------------|-----------------|-----------|-------------|
| $50k | $693 | 16.6% | ❌ NO (over 15% limit) |
| $75k | $693 | 11.1% | ✅ YES |
| $100k | $693 | 8.3% | ✅ YES (comfortable) |

**Impact:** Changes the ENTIRE recommendation set!

---

### 3. 💰 **Down Payment** (Affects Loan Amount & Affordability)

**Example: Camry ($27,025), $60k income**

| Down Payment | Loan Amount | Monthly Payment | DTI | Affordable? |
|--------------|-------------|-----------------|-----|-------------|
| $0 (10% min) | $24,323 | $481 | 9.6% | ✅ YES |
| $5,000 | $22,025 | $436 | 8.7% | ✅ YES |
| $10,000 | $17,025 | $337 | 6.7% | ✅ YES (very comfortable) |

**Impact:** 
- 📉 Reduces monthly payment
- ✅ Improves affordability score
- ⚠️ Less than 10% = loan denied
- ⚠️ Less than 20% = underwater warning

---

### 4. 🚗 **Specific Model Request** (Changes Entire Search)

**User:** "I want a hybrid"
→ System filters to: Camry Hybrid, Corolla Hybrid, RAV4 Hybrid, Prius, Highlander Hybrid

**User:** "I need a truck"
→ System filters to: Tacoma, Tundra

**Impact:** Completely different recommendation set!

---

### 5. 👨‍👩‍👧‍👦 **Family Size / Passengers** (Vehicle Type Filter)

**Example: Family of 7**

| Passengers Needed | Suitable Vehicles | Unsuitable |
|-------------------|-------------------|------------|
| 2-5 | All vehicles | None |
| 6-7 | Highlander, Sienna, Sequoia, 4Runner | Camry, Corolla, RAV4 |
| 8 | Sienna, Sequoia | Most others |

**Impact:** Can eliminate 80%+ of catalog from consideration!

---

## How Nemotron Asks for Missing Information

### Scenario 1: User Mentions Affordability But No Financial Info

**User:** "I want to buy a Toyota but need to know what I can afford"

**Nemotron Response:**
> Great! Let's start by understanding your needs and financials. Can you share:
> 
> 1. **Budget**: What's your total budget for the car?
> 2. **Family size**: How many people will regularly ride in the car?
> 3. **Commute**: How many miles per day/week do you drive?
> 4. **Financials**:
>    - Annual income
>    - Down payment amount
>    - Credit score range
>    - Preferred loan term (e.g., 3 years, 5 years)?

✅ **Asks for ALL critical financial parameters**

---

### Scenario 2: Partial Info Provided (Budget but No Income/Credit)

**User:** "I need a family SUV, budget is $35k, I have 2 kids"

**Nemotron Response:**
> I'd be happy to help you find the right family SUV within your $35k budget! To narrow down options and ensure affordability, I'll need a few more details:
> 
> 1. What's your monthly income?
> 2. How much can you put toward a down payment?
> 3. What's your credit score range?
> 4. Do you prefer a shorter loan term (e.g., 3 years) or longer (e.g., 5 years)?
> 5. Any specific features you want (e.g., third-row seating, tech features)?

✅ **Proactively asks for missing financial details**
✅ **Also asks for feature preferences to refine recommendations**

---

### Scenario 3: Complete Info Provided

**User:** "I make $5000 per month, have $8k down, credit score 720, want to finance for 5 years. Need a Camry or Corolla."

**Nemotron Response:**
> *Provides immediate recommendations with full financial analysis for both models*

✅ **No additional questions needed**
✅ **Proceeds directly to recommendations**

---

## Why This Works

### 1. **Smart System Prompt**

The AI agent's system prompt explicitly instructs Nemotron:

```
When a user asks about cars, extract:
- Vehicle requirements (budget, passengers, commute distance, terrain, features wanted, etc.)
- Financial information (income, down payment, credit score, loan term preference)

Be realistic about affordability - help users make smart financial decisions.
```

### 2. **Context-Aware Responses**

Nemotron sees:
- What information was extracted (or not extracted)
- Whether catalog scoring was performed
- Whether financial analysis was performed

If critical info is missing, Nemotron naturally asks for it.

### 3. **Conversational Intelligence**

Nemotron doesn't use rigid forms - it asks questions naturally:
- "What's your monthly income?" (not "INCOME_FIELD_REQUIRED")
- "Can you share your credit score range?" (friendly, conversational)
- "Any specific features you want?" (open-ended)

---

## Real-World Examples

### Example 1: Credit Score Makes or Breaks Deal

**Scenario:** User wants Highlander, has $50k income, $3k down

| Credit Score | Monthly Payment | DTI | Affordable? |
|--------------|-----------------|-----|-------------|
| Excellent | $693 | 16.6% | ❌ NO (over 15%) |
| Poor | $807 | 19.4% | ❌ NO (WAY over 15%) |

**Without credit score info:**
- System might recommend Highlander
- User goes to dealer
- Gets shocked by $807/month payment
- **Bad user experience!**

**With credit score info:**
- System calculates $807/month
- Warns: "This exceeds 15% of income - may strain budget"
- Suggests: "Consider Camry ($433/month) instead"
- **Good user experience!**

---

### Example 2: Income Changes Everything

**User:** "I want a luxury SUV"

**Without income:**
- System might recommend Sequoia ($50k+)
- No way to know if affordable

**With income ($60k):**
- Calculates: Sequoia = $900+/month = 18% DTI
- Response: "⚠️ Sequoia would be 18% of income - not recommended. Consider Highlander ($718/month, 14.4% DTI) or RAV4 ($487/month, 9.7% DTI) instead."

---

## When Nemotron Asks Follow-Up Questions

### Triggers for Follow-Up Questions:

1. ✅ User mentions "afford" or "budget" → Ask for income/credit
2. ✅ User provides budget but no income → Ask for income to verify affordability
3. ✅ User provides income but no down payment → Ask for down payment
4. ✅ User doesn't mention credit → Ask for credit score range
5. ✅ User says "family car" but no passenger count → Ask how many people
6. ✅ User mentions specific needs but vague → Ask for clarification

### When Nemotron DOESN'T Ask (Proceeds Directly):

1. ✅ User provides complete financial profile
2. ✅ User asks general question ("What Toyotas do you have?")
3. ✅ User only wants to browse, not buy yet

---

## Technical Implementation

### Profile Extraction (ai_agent.py)

```python
# Automatically extracts from natural language
user_profile = self._extract_user_profile(user_message)
# Example: "I make $60k/year" → {'annual_income': 60000}

financial_profile = self._extract_financial_profile(user_message)
# Example: "Credit score 720" → {'credit_score': 720}
```

### Conditional Context Building

```python
if user_profile:
    # Got vehicle preferences - score cars
    scored_cars = self.catalog.score_cars_for_user(user_profile)
    
    if financial_profile:
        # Got financial info - evaluate affordability
        for car in scored_cars:
            affordability = financial_service.evaluate_affordability(car, financial_profile)
            # Include financial analysis in context for Nemotron
    else:
        # Missing financial info - Nemotron will ask for it
        # (no affordability context provided)
else:
    # Missing vehicle preferences - Nemotron will ask for them
    # (no catalog context provided)
```

---

## Summary

### ✅ **YES, Nemotron WILL Ask for Critical Parameters**

| Parameter | Impact Level | When Missing | Nemotron Asks? |
|-----------|-------------|--------------|----------------|
| Credit Score | 🔴 HIGH | Can't calculate accurate payment | ✅ YES |
| Income | 🔴 CRITICAL | Can't determine affordability | ✅ YES |
| Down Payment | 🟡 MEDIUM | Uses 10% default, but asks for accuracy | ✅ YES |
| Specific Model | 🟡 MEDIUM | Shows generic recommendations | ✅ YES |
| Passengers | 🟡 MEDIUM | Can't filter by size | ✅ YES |
| Loan Term | 🟢 LOW | Uses 5-year default | ✅ YES |

### 🎯 **Why This Matters**

1. **Accuracy** - Right recommendations need right information
2. **Trust** - Users trust AI that asks smart questions
3. **Value** - Prevents bad financial decisions
4. **Experience** - Conversational, not form-based
5. **Realistic** - Mimics how real car salespeople ask questions

### 💡 **The Intelligence**

Nemotron doesn't just blindly ask for everything - it:
- ✅ Asks when information would significantly change recommendations
- ✅ Asks in a natural, conversational way
- ✅ Prioritizes critical information (income/credit) over nice-to-haves (features)
- ✅ Adapts based on user's initial query
- ✅ Provides context for why the information matters

**This is the power of combining structured logic (catalog/financial services) with AI reasoning (Nemotron)!** 🚀

