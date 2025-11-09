"""
Financial Evaluation Service

Evaluates vehicle affordability based on user's financial profile.
Calculates monthly payments, total cost of ownership, and affordability scores.

This ensures recommendations are not just about preferences, but also financial reality.
"""

from typing import Dict, Any, List, Optional
from dataclasses import dataclass
import math


@dataclass
class AffordabilityResult:
    """Result of affordability calculation"""
    affordable: bool
    affordability_score: float  # 0-1, where 1 is most affordable
    monthly_payment: float
    down_payment_required: float
    total_cost_5yr: float
    debt_to_income_ratio: float
    reasons: List[str]
    warnings: List[str]


class FinancialService:
    """Handles financial calculations and affordability assessments"""
    
    # Industry standard affordability guidelines
    MAX_DTI_RATIO = 0.15  # Car payment shouldn't exceed 15% of monthly income
    RECOMMENDED_DTI_RATIO = 0.10  # Recommended is 10%
    MIN_DOWN_PAYMENT_PERCENT = 0.10  # Minimum 10% down
    RECOMMENDED_DOWN_PAYMENT_PERCENT = 0.20  # 20% recommended to avoid underwater loan
    
    # Interest rates by credit score (approximate 2024 rates)
    INTEREST_RATES = {
        'excellent': 0.0549,  # 750+
        'good': 0.0699,       # 700-749
        'fair': 0.0899,       # 650-699
        'poor': 0.1199,       # 600-649
        'very_poor': 0.1599,  # <600
    }
    
    def __init__(self):
        pass
    
    def evaluate_affordability(
        self, 
        car: Dict[str, Any], 
        financial_profile: Dict[str, Any]
    ) -> AffordabilityResult:
        """
        Evaluate if a car is affordable for the user
        
        Args:
            car: Vehicle data from catalog
            financial_profile: User's financial information
        
        Returns:
            AffordabilityResult with detailed affordability analysis
        """
        # Extract car pricing
        car_price = self._get_car_price(car)
        
        # Extract user financial info
        monthly_income = financial_profile.get('monthly_income', 0)
        annual_income = financial_profile.get('annual_income', 0)
        if annual_income and not monthly_income:
            monthly_income = annual_income / 12
        
        down_payment = financial_profile.get('down_payment', 0)
        credit_score = financial_profile.get('credit_score', 'good')
        loan_term_months = financial_profile.get('loan_term_months', 60)  # Default 5 years
        trade_in_value = financial_profile.get('trade_in_value', 0)
        
        # Get interest rate based on credit score
        interest_rate = self._get_interest_rate(credit_score)
        
        # Calculate down payment
        if down_payment == 0:
            # Auto-calculate minimum down payment
            down_payment = car_price * self.MIN_DOWN_PAYMENT_PERCENT
        
        # Add trade-in to down payment
        effective_down_payment = down_payment + trade_in_value
        
        # Calculate loan amount
        loan_amount = car_price - effective_down_payment
        
        if loan_amount < 0:
            loan_amount = 0
        
        # Calculate monthly payment
        monthly_payment = self._calculate_monthly_payment(
            loan_amount, 
            interest_rate, 
            loan_term_months
        )
        
        # Calculate total 5-year cost of ownership
        total_cost_5yr = self._calculate_total_cost_ownership(
            car, 
            car_price, 
            monthly_payment, 
            loan_term_months
        )
        
        # Calculate debt-to-income ratio
        dti_ratio = monthly_payment / monthly_income if monthly_income > 0 else 1.0
        
        # Determine affordability
        affordable = self._determine_affordability(
            monthly_payment,
            monthly_income,
            dti_ratio,
            down_payment,
            car_price
        )
        
        # Calculate affordability score (0-1)
        affordability_score = self._calculate_affordability_score(
            dti_ratio,
            effective_down_payment,
            car_price,
            monthly_income
        )
        
        # Generate reasons and warnings
        reasons = self._generate_affordability_reasons(
            affordable,
            dti_ratio,
            effective_down_payment,
            car_price,
            monthly_income
        )
        
        warnings = self._generate_warnings(
            dti_ratio,
            effective_down_payment,
            car_price,
            credit_score,
            loan_term_months
        )
        
        return AffordabilityResult(
            affordable=affordable,
            affordability_score=affordability_score,
            monthly_payment=round(monthly_payment, 2),
            down_payment_required=round(effective_down_payment, 2),
            total_cost_5yr=round(total_cost_5yr, 2),
            debt_to_income_ratio=round(dti_ratio, 3),
            reasons=reasons,
            warnings=warnings
        )
    
    def _get_car_price(self, car: Dict[str, Any]) -> float:
        """Extract car price from nested structure"""
        return car.get('specs', {}).get('pricing', {}).get('base_msrp', 0)
    
    def _get_interest_rate(self, credit_score: Any) -> float:
        """Get interest rate based on credit score"""
        if isinstance(credit_score, int):
            if credit_score >= 750:
                return self.INTEREST_RATES['excellent']
            elif credit_score >= 700:
                return self.INTEREST_RATES['good']
            elif credit_score >= 650:
                return self.INTEREST_RATES['fair']
            elif credit_score >= 600:
                return self.INTEREST_RATES['poor']
            else:
                return self.INTEREST_RATES['very_poor']
        elif isinstance(credit_score, str):
            return self.INTEREST_RATES.get(credit_score.lower(), self.INTEREST_RATES['good'])
        else:
            return self.INTEREST_RATES['good']
    
    def _calculate_monthly_payment(
        self, 
        loan_amount: float, 
        annual_interest_rate: float, 
        loan_term_months: int
    ) -> float:
        """Calculate monthly loan payment using amortization formula"""
        if loan_amount <= 0:
            return 0
        
        if annual_interest_rate == 0:
            return loan_amount / loan_term_months
        
        monthly_rate = annual_interest_rate / 12
        
        # Amortization formula: P * [r(1+r)^n] / [(1+r)^n - 1]
        payment = loan_amount * (
            monthly_rate * math.pow(1 + monthly_rate, loan_term_months)
        ) / (
            math.pow(1 + monthly_rate, loan_term_months) - 1
        )
        
        return payment
    
    def _calculate_total_cost_ownership(
        self,
        car: Dict[str, Any],
        car_price: float,
        monthly_payment: float,
        loan_term_months: int
    ) -> float:
        """Calculate 5-year total cost of ownership"""
        # Purchase cost (total payments over loan term, capped at 5 years)
        months_in_5yr = min(loan_term_months, 60)
        purchase_cost = monthly_payment * months_in_5yr
        
        # Extract operating costs from car data
        annual_fuel = car.get('annual_fuel_cost', 1200)
        annual_insurance = car.get('annual_insurance', 1200)
        annual_maintenance = car.get('annual_maintenance', 800)
        
        # 5-year operating costs
        operating_costs_5yr = (annual_fuel + annual_insurance + annual_maintenance) * 5
        
        # Depreciation (cars typically lose 60% value in 5 years)
        depreciation = car_price * 0.60
        
        # Total cost
        total_cost = purchase_cost + operating_costs_5yr
        
        return total_cost
    
    def _determine_affordability(
        self,
        monthly_payment: float,
        monthly_income: float,
        dti_ratio: float,
        down_payment: float,
        car_price: float
    ) -> bool:
        """Determine if the car is affordable"""
        if monthly_income == 0:
            return False
        
        # Check DTI ratio
        if dti_ratio > self.MAX_DTI_RATIO:
            return False
        
        # Check if down payment is sufficient
        if down_payment < car_price * self.MIN_DOWN_PAYMENT_PERCENT:
            return False
        
        return True
    
    def _calculate_affordability_score(
        self,
        dti_ratio: float,
        down_payment: float,
        car_price: float,
        monthly_income: float
    ) -> float:
        """
        Calculate affordability score (0-1)
        Higher score = more affordable
        """
        if monthly_income == 0:
            return 0.0
        
        # Score based on DTI ratio (lower is better)
        if dti_ratio <= self.RECOMMENDED_DTI_RATIO:
            dti_score = 1.0
        elif dti_ratio <= self.MAX_DTI_RATIO:
            # Linear scale between recommended and max
            dti_score = 1.0 - ((dti_ratio - self.RECOMMENDED_DTI_RATIO) / 
                              (self.MAX_DTI_RATIO - self.RECOMMENDED_DTI_RATIO)) * 0.4
        else:
            # Penalty for exceeding max DTI
            dti_score = max(0, 0.6 - (dti_ratio - self.MAX_DTI_RATIO) * 2)
        
        # Score based on down payment percentage (higher is better)
        down_payment_ratio = down_payment / car_price if car_price > 0 else 0
        if down_payment_ratio >= self.RECOMMENDED_DOWN_PAYMENT_PERCENT:
            down_payment_score = 1.0
        else:
            down_payment_score = down_payment_ratio / self.RECOMMENDED_DOWN_PAYMENT_PERCENT
        
        # Weighted average (DTI is more important than down payment)
        affordability_score = (dti_score * 0.7) + (down_payment_score * 0.3)
        
        return min(1.0, max(0.0, affordability_score))
    
    def _generate_affordability_reasons(
        self,
        affordable: bool,
        dti_ratio: float,
        down_payment: float,
        car_price: float,
        monthly_income: float
    ) -> List[str]:
        """Generate human-readable reasons for affordability assessment"""
        reasons = []
        
        if affordable:
            if dti_ratio <= self.RECOMMENDED_DTI_RATIO:
                reasons.append("excellent_payment_ratio")
            elif dti_ratio <= self.MAX_DTI_RATIO:
                reasons.append("acceptable_payment_ratio")
            
            down_payment_ratio = down_payment / car_price if car_price > 0 else 0
            if down_payment_ratio >= self.RECOMMENDED_DOWN_PAYMENT_PERCENT:
                reasons.append("strong_down_payment")
            elif down_payment_ratio >= self.MIN_DOWN_PAYMENT_PERCENT:
                reasons.append("adequate_down_payment")
        else:
            if dti_ratio > self.MAX_DTI_RATIO:
                reasons.append("payment_too_high_for_income")
            
            down_payment_ratio = down_payment / car_price if car_price > 0 else 0
            if down_payment_ratio < self.MIN_DOWN_PAYMENT_PERCENT:
                reasons.append("insufficient_down_payment")
        
        return reasons
    
    def _generate_warnings(
        self,
        dti_ratio: float,
        down_payment: float,
        car_price: float,
        credit_score: Any,
        loan_term_months: int
    ) -> List[str]:
        """Generate warnings about potential financial issues"""
        warnings = []
        
        # DTI warnings
        if dti_ratio > self.RECOMMENDED_DTI_RATIO and dti_ratio <= self.MAX_DTI_RATIO:
            warnings.append("Payment is higher than recommended 10% of income")
        elif dti_ratio > self.MAX_DTI_RATIO:
            warnings.append("Payment exceeds 15% of income - financial strain likely")
        
        # Down payment warnings
        down_payment_ratio = down_payment / car_price if car_price > 0 else 0
        if down_payment_ratio < self.RECOMMENDED_DOWN_PAYMENT_PERCENT:
            warnings.append("Less than 20% down - may be underwater on loan")
        
        # Credit score warnings
        if isinstance(credit_score, int) and credit_score < 650:
            warnings.append("Credit score may result in high interest rates")
        elif isinstance(credit_score, str) and credit_score.lower() in ['fair', 'poor', 'very_poor']:
            warnings.append("Credit rating may result in high interest rates")
        
        # Loan term warnings
        if loan_term_months > 60:
            warnings.append("Loan term over 5 years - will pay more interest")
        
        return warnings
    
    def format_affordability_summary(self, result: AffordabilityResult) -> str:
        """Format affordability result for display"""
        summary = f"""
Financial Analysis:
- Monthly Payment: ${result.monthly_payment:,.2f}
- Down Payment: ${result.down_payment_required:,.2f}
- Debt-to-Income: {result.debt_to_income_ratio:.1%}
- 5-Year Total Cost: ${result.total_cost_5yr:,.2f}
- Affordability Score: {result.affordability_score:.0%}
- Status: {'✅ Affordable' if result.affordable else '❌ May Strain Budget'}
"""
        
        if result.warnings:
            summary += "\nWarnings:\n"
            for warning in result.warnings:
                summary += f"  ⚠️  {warning}\n"
        
        return summary


# Singleton instance
financial_service = FinancialService()

