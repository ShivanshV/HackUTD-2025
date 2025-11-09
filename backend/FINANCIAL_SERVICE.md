# Financial Evaluation Service

## Overview

The Financial Evaluation Service provides **realistic affordability analysis** for vehicle recommendations, ensuring users make smart financial decisions based on their income, down payment, credit score, and other financial factors.

## Architecture

```
User Query: "I make $60k/year, have $5k down, need a family car"
    ↓
AI Agent extracts:
  - Vehicle needs: passengers=5, has_children=true
  - Financial info: annual_income=60000, down_payment=5000
    ↓
Catalog Scoring: Scores 200+ vehicles → Top 5 matches
    ↓
Financial Service: Evaluates affordability for each top match
  - Calculates monthly payment (with amortization)
  - Determines DTI ratio
  - Calculates 5-year total cost
  - Provides affordability score & warnings
    ↓
Nemotron: Explains recommendations with:
  - Why each car matches needs
  - Monthly payment breakdowns
  - Financial warnings/advice
  - Practical guidance
    ↓
User gets: Smart, financially-aware recommendations ✅
```

## What It Calculates

### 1. Monthly Payment
- Uses standard amortization formula
- Adjusts interest rate based on credit score:
  - Excellent (750+): 5.49% APR
  - Good (700-749): 6.99% APR
  - Fair (650-699): 8.99% APR
  - Poor (600-649): 11.99% APR
  - Very Poor (<600): 15.99% APR

### 2. Debt-to-Income Ratio (DTI)
- Recommended: ≤ 10% of monthly income
- Maximum acceptable: ≤ 15% of monthly income
- Above 15%: Flagged as potentially unaffordable

### 3. Total Cost of Ownership (5 years)
- Loan payments (up to 60 months)
- Annual fuel costs (from car data)
- Annual insurance (from car data)
- Annual maintenance (from car data)

### 4. Affordability Score (0-100%)
- Weighted formula:
  - 70% based on DTI ratio
  - 30% based on down payment percentage
- Higher score = more financially comfortable

### 5. Warnings & Recommendations
- High payment-to-income ratio
- Insufficient down payment (<10%)
- Less than recommended down payment (<20%)
- Long loan term (>5 years)
- Credit score may result in high rates

## User Input Options

The AI agent automatically extracts financial information from natural language:

### Annual/Monthly Income
- "I make $60k per year"
- "My annual income is $75,000"
- "I earn $5000 per month"
- "Monthly income of $4500"

### Down Payment
- "I have $5k down"
- "Can put down $8000"
- "Down payment of $10k"
- "$7000 down"

### Credit Score
- "Credit score is 720"
- "My credit is 680"
- "I have excellent credit"
- "Good credit" / "Fair credit" / "Poor credit"

### Loan Term
- "Want a 5 year loan"
- "Finance for 60 months"
- "3 year loan"

### Trade-In
- "Trade-in worth $6k"
- "$5000 trade-in value"
- "Trading in my old car for $8000"

## Example Scenarios

### Scenario 1: Strong Financial Position
```
Income: $80,000/year ($6,667/month)
Down Payment: $8,000
Credit Score: 750
Result for Camry ($27,025):
  - Monthly Payment: $363
  - DTI: 5.4%
  - Affordability: 100% ✅
  - Status: Excellent financial fit
```

### Scenario 2: Average Family Budget
```
Income: $60,000/year ($5,000/month)
Down Payment: $5,000
Credit Score: Good (700-749)
Result for RAV4 ($29,575):
  - Monthly Payment: $487
  - DTI: 9.7%
  - Affordability: 95% ✅
  - Warning: Less than 20% down
```

### Scenario 3: First-Time Buyer (Tight Budget)
```
Income: $40,000/year ($3,333/month)
Down Payment: $3,000
Credit Score: 680 (Fair)
Result for Camry ($27,025):
  - Monthly Payment: $433
  - DTI: 13.0%
  - Affordability: 70% ⚠️
  - Warnings:
    * Payment higher than recommended 10%
    * Less than 20% down
    * 6-year loan = more interest
```

### Scenario 4: High Earner with Trade-In
```
Income: $120,000/year ($10,000/month)
Down Payment: $10,000
Trade-In: $8,000 (total $18k down)
Credit Score: 800
Result for RAV4 ($29,575):
  - Monthly Payment: $269
  - DTI: 2.7%
  - Affordability: 100% ✅
  - Status: Exceptional financial position
```

## Integration with AI Agent

The financial service integrates seamlessly with Nemotron:

```python
# AI Agent automatically:
1. Extracts financial profile from user message
2. Gets scored vehicles from catalog
3. Evaluates affordability for each top match
4. Formats results for Nemotron
5. Nemotron explains with context
```

### Example Output:

**User:** "I make $60k per year, have $5k down, need a family car"

**AI Response:**
> Based on your financial profile ($60k income, $5k down payment), here are the best Toyota family vehicles:
>
> **1. Toyota Highlander LE - $38,000**
> - Monthly Payment: $620
> - DTI: 12.4% (acceptable but slightly high)
> - Why: Seats 7, excellent safety, good MPG
> - ⚠️ Warning: Payment near upper limit, consider downsizing
>
> **2. Toyota Camry LE - $27,025** ⭐ BEST VALUE
> - Monthly Payment: $436
> - DTI: 8.7% (comfortable range)
> - Why: Reliable, efficient, affordable, seats 5
> - ✅ Strong financial fit
>
> **Recommendation:** The Camry offers the best balance of affordability and family needs at just 8.7% of your income.

## API Usage

### Direct API Call to Financial Service:

```python
from app.services.financial_service import financial_service

financial_profile = {
    "annual_income": 60000,
    "down_payment": 5000,
    "credit_score": "good",
    "loan_term_months": 60
}

result = financial_service.evaluate_affordability(car, financial_profile)

print(f"Monthly Payment: ${result.monthly_payment:,.2f}")
print(f"Affordable: {result.affordable}")
print(f"Score: {result.affordability_score:.0%}")
```

### Chat API (Natural Language):

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "I make $5000 per month and have $8k down. What Toyotas can I afford?"
      }
    ]
  }'
```

## Benefits

### For Users:
- ✅ **Realistic recommendations** based on actual financial capacity
- ✅ **Transparent pricing** with monthly payment breakdowns
- ✅ **Smart warnings** about budget strain
- ✅ **No surprises** at the dealership

### For the Project:
- ✅ **Practical value** - Not just preferences, but affordability
- ✅ **Trust building** - Shows responsible AI
- ✅ **Differentiation** - Most car recommendation systems ignore finances
- ✅ **Real-world applicability** - This is how people actually buy cars

## Technical Details

### Files:
- `backend/app/services/financial_service.py` - Core financial calculations
- `backend/app/services/ai_agent.py` - Extracts financial info, integrates service
- `backend/test_financial_service.py` - Comprehensive test scenarios

### Dependencies:
- No external libraries needed (uses Python `math` module)
- Fully integrated with existing catalog and AI systems

### Industry Standards Used:
- Standard loan amortization formula
- Realistic 2024 interest rates
- DTI recommendations from financial advisors
- Down payment guidelines from automotive finance

## Future Enhancements

Potential additions:
- Insurance quote integration
- Trade-in value estimator (using KBB/Edmunds API)
- Lease vs. buy comparison
- Total cost comparison (3-year vs 5-year ownership)
- Tax and registration calculator by state
- Incentive/rebate tracker
- Pre-qualification check (soft credit pull)

---

**This financial service makes your Toyota assistant not just smart, but financially responsible.** 🎯💰

