"""
Test Financial Service - Demonstrates affordability calculations
"""

from app.services.financial_service import financial_service
from app.services.catalog_scoring import catalog_scoring_service

def test_financial_scenarios():
    """Test various financial scenarios"""
    
    print("=" * 80)
    print("FINANCIAL EVALUATION SERVICE - TEST SCENARIOS")
    print("=" * 80)
    
    # Get a sample car from catalog
    all_cars = catalog_scoring_service.get_all_cars()
    camry = next((car for car in all_cars if 'camry' in car['id'].lower() and car['year'] == 2024), all_cars[0])
    rav4 = next((car for car in all_cars if 'rav4' in car['id'].lower() and 'hybrid' not in car['id'].lower() and car['year'] == 2024), all_cars[10])
    
    print(f"\nTest Vehicles:")
    print(f"1. {camry['year']} {camry['make']} {camry['model']} {camry['trim']}")
    print(f"   Price: ${camry['specs']['pricing']['base_msrp']:,}")
    print(f"2. {rav4['year']} {rav4['make']} {rav4['model']} {rav4['trim']}")
    print(f"   Price: ${rav4['specs']['pricing']['base_msrp']:,}")
    
    # Test scenarios
    scenarios = [
        {
            "name": "💰 Strong Financial Position",
            "profile": {
                "annual_income": 80000,
                "down_payment": 8000,
                "credit_score": 750,  # Excellent
                "loan_term_months": 60
            }
        },
        {
            "name": "👨‍👩‍👧‍👦 Average Family Budget",
            "profile": {
                "monthly_income": 5000,  # $60k/year
                "down_payment": 5000,
                "credit_score": "good",  # 700-749
                "loan_term_months": 60
            }
        },
        {
            "name": "🎓 First-Time Buyer (Tight Budget)",
            "profile": {
                "annual_income": 40000,
                "down_payment": 3000,
                "credit_score": 680,  # Fair
                "loan_term_months": 72  # 6 years
            }
        },
        {
            "name": "💎 High Earner with Trade-In",
            "profile": {
                "annual_income": 120000,
                "down_payment": 10000,
                "trade_in_value": 8000,  # Total $18k down
                "credit_score": 800,  # Excellent
                "loan_term_months": 48  # 4 years
            }
        }
    ]
    
    for scenario in scenarios:
        print("\n" + "=" * 80)
        print(f"Scenario: {scenario['name']}")
        print("=" * 80)
        print(f"\nFinancial Profile:")
        for key, value in scenario['profile'].items():
            if 'income' in key or 'payment' in key or 'value' in key:
                print(f"  {key}: ${value:,}")
            elif 'credit_score' in key:
                print(f"  {key}: {value}")
            else:
                print(f"  {key}: {value}")
        
        # Evaluate Camry
        print(f"\n--- Evaluating: {camry['model']} ${camry['specs']['pricing']['base_msrp']:,} ---")
        result_camry = financial_service.evaluate_affordability(camry, scenario['profile'])
        print(f"  ✓ Monthly Payment: ${result_camry.monthly_payment:,.2f}")
        print(f"  ✓ Down Payment: ${result_camry.down_payment_required:,.2f}")
        print(f"  ✓ DTI Ratio: {result_camry.debt_to_income_ratio:.1%}")
        print(f"  ✓ 5-Year Total Cost: ${result_camry.total_cost_5yr:,.2f}")
        print(f"  ✓ Affordability Score: {result_camry.affordability_score:.0%}")
        print(f"  ✓ Status: {'✅ AFFORDABLE' if result_camry.affordable else '❌ MAY STRAIN BUDGET'}")
        
        if result_camry.warnings:
            print(f"  ⚠️  Warnings:")
            for warning in result_camry.warnings:
                print(f"     - {warning}")
        
        # Evaluate RAV4
        print(f"\n--- Evaluating: {rav4['model']} ${rav4['specs']['pricing']['base_msrp']:,} ---")
        result_rav4 = financial_service.evaluate_affordability(rav4, scenario['profile'])
        print(f"  ✓ Monthly Payment: ${result_rav4.monthly_payment:,.2f}")
        print(f"  ✓ Down Payment: ${result_rav4.down_payment_required:,.2f}")
        print(f"  ✓ DTI Ratio: {result_rav4.debt_to_income_ratio:.1%}")
        print(f"  ✓ 5-Year Total Cost: ${result_rav4.total_cost_5yr:,.2f}")
        print(f"  ✓ Affordability Score: {result_rav4.affordability_score:.0%}")
        print(f"  ✓ Status: {'✅ AFFORDABLE' if result_rav4.affordable else '❌ MAY STRAIN BUDGET'}")
        
        if result_rav4.warnings:
            print(f"  ⚠️  Warnings:")
            for warning in result_rav4.warnings:
                print(f"     - {warning}")
    
    print("\n" + "=" * 80)
    print("✅ Financial service successfully evaluates affordability!")
    print("=" * 80)
    print("\nKey Features:")
    print("  • Calculates monthly payments with accurate amortization")
    print("  • Adjusts interest rates based on credit score")
    print("  • Evaluates debt-to-income ratio (recommends <10%, max 15%)")
    print("  • Calculates total 5-year cost of ownership")
    print("  • Provides affordability scores and warnings")
    print("  • Supports trade-in values and flexible down payments")
    print("=" * 80)

if __name__ == "__main__":
    test_financial_scenarios()

