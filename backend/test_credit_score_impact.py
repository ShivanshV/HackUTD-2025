"""
Demonstrate how credit score dramatically affects affordability
"""

from app.services.financial_service import financial_service
from app.services.catalog_scoring import catalog_scoring_service

def test_credit_score_impact():
    """Show how credit score affects monthly payment and affordability"""
    
    print("=" * 80)
    print("CREDIT SCORE IMPACT ON AFFORDABILITY")
    print("=" * 80)
    
    # Get a sample car
    all_cars = catalog_scoring_service.get_all_cars()
    rav4 = next((car for car in all_cars if 'rav4' in car['id'].lower() and 
                 'hybrid' not in car['id'].lower() and car['year'] == 2024), all_cars[10])
    
    car_price = rav4['specs']['pricing']['base_msrp']
    print(f"\n🚗 Vehicle: {rav4['year']} {rav4['make']} {rav4['model']} {rav4['trim']}")
    print(f"💰 Price: ${car_price:,}")
    
    # Same financial profile, different credit scores
    base_profile = {
        "annual_income": 60000,  # $5,000/month
        "down_payment": 5000,
        "loan_term_months": 60
    }
    
    credit_scenarios = [
        ("Excellent (750+)", 800),
        ("Good (700-749)", 720),
        ("Fair (650-699)", 670),
        ("Poor (600-649)", 620),
        ("Very Poor (<600)", 580)
    ]
    
    print(f"\n{'Credit Score':<20} | {'Interest':<10} | {'Monthly':<12} | {'Total Paid':<12} | {'DTI':<8} | {'Affordable':<10}")
    print("-" * 80)
    
    for credit_name, credit_score in credit_scenarios:
        profile = base_profile.copy()
        profile['credit_score'] = credit_score
        
        result = financial_service.evaluate_affordability(rav4, profile)
        
        # Calculate total amount paid over 60 months
        total_paid = result.monthly_payment * 60
        
        # Get interest rate
        interest_rate = financial_service._get_interest_rate(credit_score)
        
        status = "✅ YES" if result.affordable else "❌ NO"
        
        print(f"{credit_name:<20} | {interest_rate*100:>6.2f}%   | ${result.monthly_payment:>9,.2f} | ${total_paid:>10,.2f} | {result.debt_to_income_ratio:>6.1%} | {status}")
    
    print("\n" + "=" * 80)
    print("KEY INSIGHTS:")
    print("=" * 80)
    
    # Calculate differences
    excellent_profile = base_profile.copy()
    excellent_profile['credit_score'] = 800
    excellent_result = financial_service.evaluate_affordability(rav4, excellent_profile)
    
    poor_profile = base_profile.copy()
    poor_profile['credit_score'] = 580
    poor_result = financial_service.evaluate_affordability(rav4, poor_profile)
    
    monthly_diff = poor_result.monthly_payment - excellent_result.monthly_payment
    total_diff = monthly_diff * 60
    
    print(f"\n💡 EXCELLENT vs VERY POOR Credit:")
    print(f"   • Monthly payment difference: ${monthly_diff:.2f}")
    print(f"   • Total extra cost over 5 years: ${total_diff:,.2f}")
    print(f"   • That's {(monthly_diff/excellent_result.monthly_payment)*100:.1f}% more per month!")
    
    print(f"\n⚠️  Impact on Affordability:")
    print(f"   • Excellent Credit: {excellent_result.debt_to_income_ratio:.1%} DTI (Comfortable)")
    print(f"   • Very Poor Credit: {poor_result.debt_to_income_ratio:.1%} DTI (May strain budget)")
    
    if excellent_result.affordable and not poor_result.affordable:
        print(f"   • 🚨 CRITICAL: This car is affordable with excellent credit but NOT with poor credit!")
    
    print("\n" + "=" * 80)
    print("🎯 WHY NEMOTRON SHOULD ASK ABOUT CREDIT SCORE:")
    print("=" * 80)
    print("✓ Changes monthly payment by $100+ on a $30k car")
    print("✓ Can make/break affordability (push DTI over 15% limit)")
    print("✓ Affects total cost by $6,000+ over loan term")
    print("✓ Critical for accurate financial guidance")
    print("=" * 80)

if __name__ == "__main__":
    test_credit_score_impact()

