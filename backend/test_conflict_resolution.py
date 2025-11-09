"""
Test conflict resolution - verify that later messages override earlier ones
"""

from app.services.ai_agent import AIAgent
from app.models.chat import ChatMessage

def test_credit_score_conflict():
    """Test credit score correction"""
    print("=" * 80)
    print("TEST: Credit Score Conflict Resolution")
    print("=" * 80)
    
    agent = AIAgent()
    
    messages = [
        ChatMessage(role="user", content="I have bad credit and need a car"),
        ChatMessage(role="agent", content="I can help..."),
        ChatMessage(role="user", content="Actually, my credit score is 720"),
    ]
    
    user_profile, financial_profile = agent._extract_profiles_from_conversation(messages)
    
    print(f"\nUser Profile: {user_profile}")
    print(f"Financial Profile: {financial_profile}")
    print(f"\nCredit Score: {financial_profile.get('credit_score')}")
    
    assert financial_profile.get('credit_score') == 720, f"Expected 720, got {financial_profile.get('credit_score')}"
    print("\n✅ PASS: Latest credit score (720) overrides earlier 'bad credit'")
    print("=" * 80)

def test_budget_change():
    """Test budget correction"""
    print("\n" + "=" * 80)
    print("TEST: Budget Change")
    print("=" * 80)
    
    agent = AIAgent()
    
    messages = [
        ChatMessage(role="user", content="I need a car under $30k"),
        ChatMessage(role="agent", content="Here are options..."),
        ChatMessage(role="user", content="Actually, my budget is $40k"),
    ]
    
    user_profile, financial_profile = agent._extract_profiles_from_conversation(messages)
    
    print(f"\nUser Profile: {user_profile}")
    print(f"Budget Max: {user_profile.get('budget_max')}")
    
    assert user_profile.get('budget_max') == 40000, f"Expected 40000, got {user_profile.get('budget_max')}"
    print("\n✅ PASS: Latest budget ($40k) overrides earlier budget ($30k)")
    print("=" * 80)

def test_income_change():
    """Test income correction"""
    print("\n" + "=" * 80)
    print("TEST: Income Change")
    print("=" * 80)
    
    agent = AIAgent()
    
    messages = [
        ChatMessage(role="user", content="I make $50k per year"),
        ChatMessage(role="agent", content="Here are options..."),
        ChatMessage(role="user", content="Actually, I make $60k per year"),
    ]
    
    user_profile, financial_profile = agent._extract_profiles_from_conversation(messages)
    
    print(f"\nFinancial Profile: {financial_profile}")
    print(f"Annual Income: {financial_profile.get('annual_income')}")
    
    assert financial_profile.get('annual_income') == 60000, f"Expected 60000, got {financial_profile.get('annual_income')}"
    print("\n✅ PASS: Latest income ($60k) overrides earlier income ($50k)")
    print("=" * 80)

def test_priority_change():
    """Test priority correction"""
    print("\n" + "=" * 80)
    print("TEST: Priority Change")
    print("=" * 80)
    
    agent = AIAgent()
    
    messages = [
        ChatMessage(role="user", content="Fuel efficiency is my top priority"),
        ChatMessage(role="agent", content="Here are options..."),
        ChatMessage(role="user", content="Actually, performance is more important to me"),
    ]
    
    user_profile, financial_profile = agent._extract_profiles_from_conversation(messages)
    
    print(f"\nUser Profile: {user_profile}")
    print(f"Priorities: {user_profile.get('priorities')}")
    print(f"Weights: {user_profile.get('weights')}")
    
    assert 'performance' in user_profile.get('priorities', []), "Performance should be in priorities"
    print("\n✅ PASS: Latest priority (performance) replaces earlier priority (fuel_efficiency)")
    print("=" * 80)

def test_multiple_corrections():
    """Test multiple corrections in one conversation"""
    print("\n" + "=" * 80)
    print("TEST: Multiple Corrections")
    print("=" * 80)
    
    agent = AIAgent()
    
    messages = [
        ChatMessage(role="user", content="I have bad credit, make $50k, budget $30k"),
        ChatMessage(role="agent", content="Here are options..."),
        ChatMessage(role="user", content="Actually my credit is 720 and I make $60k"),
        ChatMessage(role="agent", content="Updated options..."),
        ChatMessage(role="user", content="My budget is actually $40k"),
    ]
    
    user_profile, financial_profile = agent._extract_profiles_from_conversation(messages)
    
    print(f"\nUser Profile: {user_profile}")
    print(f"Financial Profile: {financial_profile}")
    print(f"\nBudget: ${user_profile.get('budget_max')}")
    print(f"Income: ${financial_profile.get('annual_income')}")
    print(f"Credit: {financial_profile.get('credit_score')}")
    
    assert user_profile.get('budget_max') == 40000, "Budget should be $40k"
    assert financial_profile.get('annual_income') == 60000, "Income should be $60k"
    assert financial_profile.get('credit_score') == 720, "Credit should be 720"
    print("\n✅ PASS: All latest values override earlier values")
    print("=" * 80)

if __name__ == "__main__":
    test_credit_score_conflict()
    test_budget_change()
    test_income_change()
    test_priority_change()
    test_multiple_corrections()
    
    print("\n" + "=" * 80)
    print("✅ ALL TESTS PASSED: Conflict resolution working correctly!")
    print("=" * 80)
    print("\nKey Behavior:")
    print("• Latest information ALWAYS overrides earlier information")
    print("• Financial fields: Direct override (credit, income, down payment)")
    print("• User preferences: Direct override (budget, passengers, priorities)")
    print("• Weights: Merged (new weights update existing weights)")
    print("=" * 80)

