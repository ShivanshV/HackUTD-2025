"""
Catalog & Scoring Service (Person A)

Pure functions for car data and ranking logic.
No AI/Nemotron calls - just structured scoring based on user profile.
Flexible weight system allows Nemotron (Person B) to adjust priorities.

Updated to work with comprehensive nested JSON format.
"""

from typing import List, Dict, Any
import json
from pathlib import Path


class CatalogScoringService:
    """Handles car catalog and user-based scoring"""
    
    # Default weights (can be overridden by user_profile["weights"])
    DEFAULT_WEIGHTS = {
        "budget": 0.20,
        "fuel_efficiency": 0.20,
        "seating": 0.15,
        "drivetrain": 0.10,
        "vehicle_type": 0.10,
        "performance": 0.10,
        "features": 0.10,
        "safety": 0.05
    }
    
    def __init__(self):
        """Load car catalog on initialization"""
        self.cars = self._load_cars()
    
    def _load_cars(self) -> List[Dict[str, Any]]:
        """Load cars from JSON file"""
        catalog_path = Path(__file__).parent.parent / "data" / "cars.json"
        with open(catalog_path, 'r') as f:
            return json.load(f)
    
    def get_all_cars(self) -> List[Dict[str, Any]]:
        """
        Get all cars from catalog
        
        Returns:
            List of all car dictionaries
        """
        return self.cars
    
    def score_cars_for_user(self, user_profile: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Score and rank cars based on user profile
        
        Args:
            user_profile: Dictionary with user preferences
        
        Returns:
            List of scored cars with reasons
        """
        scored_cars = []
        
        for car in self.cars:
            score, reasons = self._score_single_car(car, user_profile)
            scored_cars.append({
                "id": car["id"],
                "score": round(score, 2),
                "reasons": reasons
            })
        
        # Sort by score descending
        scored_cars.sort(key=lambda x: x["score"], reverse=True)
        
        return scored_cars
    
    def _get_weights(self, profile: Dict[str, Any]) -> Dict[str, float]:
        """Get weights from profile or use defaults"""
        custom_weights = profile.get("weights") or {}
        weights = self.DEFAULT_WEIGHTS.copy()
        if custom_weights:
            weights.update(custom_weights)
        return weights
    
    def _score_single_car(self, car: Dict[str, Any], profile: Dict[str, Any]) -> tuple[float, List[str]]:
        """Score a single car against user profile"""
        score = 0.0
        reasons = []
        weights = self._get_weights(profile)
        
        # 1. Budget scoring
        budget_score, budget_reasons = self._score_budget(car, profile)
        score += weights["budget"] * budget_score
        reasons.extend(budget_reasons)
        
        # 2. Fuel efficiency scoring
        mpg_score, mpg_reasons = self._score_fuel_efficiency(car, profile)
        score += weights["fuel_efficiency"] * mpg_score
        reasons.extend(mpg_reasons)
        
        # 3. Seating capacity scoring
        seating_score, seating_reasons = self._score_seating(car, profile)
        score += weights["seating"] * seating_score
        reasons.extend(seating_reasons)
        
        # 4. Drivetrain scoring
        drivetrain_score, drivetrain_reasons = self._score_drivetrain(car, profile)
        score += weights["drivetrain"] * drivetrain_score
        reasons.extend(drivetrain_reasons)
        
        # 5. Vehicle type scoring
        type_score, type_reasons = self._score_vehicle_type(car, profile)
        score += weights["vehicle_type"] * type_score
        reasons.extend(type_reasons)
        
        # 6. Performance scoring
        performance_score, performance_reasons = self._score_performance(car, profile)
        score += weights["performance"] * performance_score
        reasons.extend(performance_reasons)
        
        # 7. Features scoring
        features_score, features_reasons = self._score_features(car, profile)
        score += weights["features"] * features_score
        reasons.extend(features_reasons)
        
        # 8. Safety scoring
        safety_score, safety_reasons = self._score_safety(car, profile)
        score += weights["safety"] * safety_score
        reasons.extend(safety_reasons)
        
        return (score, reasons)
    
    # Helper methods to extract data from new format
    def _get_price(self, car: Dict[str, Any]) -> float:
        """Extract price from nested structure"""
        return car.get("specs", {}).get("pricing", {}).get("base_msrp", 50000)
    
    def _get_mpg_city(self, car: Dict[str, Any]) -> float:
        """Extract city MPG"""
        return car.get("specs", {}).get("powertrain", {}).get("mpg_city", 25)
    
    def _get_mpg_hwy(self, car: Dict[str, Any]) -> float:
        """Extract highway MPG"""
        return car.get("specs", {}).get("powertrain", {}).get("mpg_hwy", 30)
    
    def _get_seating(self, car: Dict[str, Any]) -> int:
        """Extract seating capacity"""
        return car.get("specs", {}).get("capacity", {}).get("seats", 5)
    
    def _get_drivetrain(self, car: Dict[str, Any]) -> str:
        """Extract drivetrain"""
        return car.get("specs", {}).get("powertrain", {}).get("drivetrain", "FWD")
    
    def _get_body_style(self, car: Dict[str, Any]) -> str:
        """Extract body style"""
        return car.get("specs", {}).get("body_style", "sedan")
    
    def _get_fuel_type(self, car: Dict[str, Any]) -> str:
        """Extract fuel type"""
        return car.get("specs", {}).get("powertrain", {}).get("fuel_type", "gasoline")
    
    def _get_safety_score(self, car: Dict[str, Any]) -> float:
        """Extract safety score (0-1 scale)"""
        return car.get("specs", {}).get("safety", {}).get("crash_test_score", 0.8)
    
    def _get_driver_assist_features(self, car: Dict[str, Any]) -> List[str]:
        """Extract driver assist features"""
        return car.get("specs", {}).get("safety", {}).get("driver_assist", [])
    
    def _is_offroad_capable(self, car: Dict[str, Any]) -> bool:
        """Check if car is offroad capable"""
        return car.get("specs", {}).get("environment_fit", {}).get("offroad_capable", False)
    
    def _get_ground_clearance(self, car: Dict[str, Any]) -> float:
        """Get ground clearance in inches"""
        return car.get("specs", {}).get("environment_fit", {}).get("ground_clearance_in", 5.0)
    
    def _get_child_seat_fit(self, car: Dict[str, Any]) -> str:
        """Get child seat fit rating"""
        return car.get("specs", {}).get("capacity", {}).get("rear_seat_child_seat_fit", "good")
    
    # Scoring methods
    def _score_budget(self, car: Dict[str, Any], profile: Dict[str, Any]) -> tuple[float, List[str]]:
        """Score based on budget"""
        reasons = []
        budget_max = profile.get("budget_max", 50000)
        price = self._get_price(car)
        
        if price <= budget_max:
            ratio = 1.0 - (price / budget_max) * 0.3
            reasons.append("within_budget")
            if price <= budget_max * 0.8:
                reasons.append("under_budget")
            return (ratio, reasons)
        else:
            return (0.2, [])
    
    def _score_fuel_efficiency(self, car: Dict[str, Any], profile: Dict[str, Any]) -> tuple[float, List[str]]:
        """Score based on fuel efficiency"""
        reasons = []
        mpg_city = self._get_mpg_city(car)
        mpg_hwy = self._get_mpg_hwy(car)
        avg_mpg = (mpg_city + mpg_hwy) / 2
        commute = profile.get("commute_miles", 0)
        
        # Check if hybrid/electric
        fuel_type = self._get_fuel_type(car)
        if fuel_type in ["hybrid", "electric", "plug_in_hybrid"]:
            reasons.append("eco_friendly")
        
        if commute > 30:
            if avg_mpg >= 40:
                reasons.append("excellent_mpg")
                return (1.0, reasons)
            elif avg_mpg >= 30:
                reasons.append("good_mpg")
                return (0.8, reasons)
            elif avg_mpg >= 25:
                reasons.append("decent_mpg")
                return (0.6, reasons)
            else:
                return (0.3, reasons)
        else:
            if avg_mpg >= 30:
                reasons.append("good_mpg")
            return (0.7, reasons)
    
    def _score_seating(self, car: Dict[str, Any], profile: Dict[str, Any]) -> tuple[float, List[str]]:
        """Score based on seating capacity"""
        reasons = []
        passengers_needed = profile.get("passengers", 5)
        seats = self._get_seating(car)
        
        if seats >= passengers_needed:
            reasons.append("enough_seats")
            if seats >= passengers_needed + 2:
                reasons.append("extra_space")
            
            # Bonus for good child seat fit if has children
            if profile.get("has_children") and self._get_child_seat_fit(car) in ["good", "excellent"]:
                reasons.append("child_seat_friendly")
            
            return (1.0, reasons)
        else:
            return (0.2, reasons)
    
    def _score_drivetrain(self, car: Dict[str, Any], profile: Dict[str, Any]) -> tuple[float, List[str]]:
        """Score based on drivetrain"""
        reasons = []
        features_wanted = profile.get("features_wanted", [])
        terrain = profile.get("terrain", "mixed")
        drivetrain = self._get_drivetrain(car)
        
        wants_awd = "awd" in features_wanted or terrain == "offroad"
        has_awd = drivetrain in ["AWD", "4WD"]
        
        if wants_awd and has_awd:
            reasons.append("awd_match")
            return (1.0, reasons)
        elif wants_awd and not has_awd:
            return (0.4, reasons)
        else:
            return (0.8, reasons)
    
    def _score_vehicle_type(self, car: Dict[str, Any], profile: Dict[str, Any]) -> tuple[float, List[str]]:
        """Score based on vehicle type"""
        reasons = []
        has_children = profile.get("has_children", False)
        terrain = profile.get("terrain", "mixed")
        body_style = self._get_body_style(car)
        seats = self._get_seating(car)
        
        if has_children:
            if body_style in ["suv", "minivan"] or seats >= 7:
                reasons.append("family_friendly")
                return (1.0, reasons)
            elif body_style == "sedan":
                return (0.7, reasons)
            else:
                return (0.5, reasons)
        else:
            if terrain == "offroad":
                if self._is_offroad_capable(car) or body_style == "truck":
                    reasons.append("offroad_capable")
                    return (1.0, reasons)
                elif self._get_ground_clearance(car) >= 8.0:
                    reasons.append("good_clearance")
                    return (0.8, reasons)
                else:
                    return (0.5, reasons)
            elif body_style in ["sedan", "hatchback"]:
                reasons.append("efficient_choice")
                return (0.9, reasons)
            else:
                return (0.8, reasons)
    
    def _score_performance(self, car: Dict[str, Any], profile: Dict[str, Any]) -> tuple[float, List[str]]:
        """Score based on performance (using eco_score inversely for performance)"""
        reasons = []
        priorities = profile.get("priorities", [])
        
        cares_about_performance = "performance" in priorities or "power" in priorities
        
        # Use fuel economy as inverse indicator of performance
        # Low MPG often means more powerful engine
        avg_mpg = (self._get_mpg_city(car) + self._get_mpg_hwy(car)) / 2
        
        if cares_about_performance:
            if avg_mpg < 25:  # Lower MPG = more powerful
                reasons.append("high_performance")
                return (1.0, reasons)
            elif avg_mpg < 30:
                reasons.append("good_power")
                return (0.8, reasons)
            else:
                return (0.6, reasons)
        else:
            # Performance not a priority
            reasons.append("adequate_power")
            return (0.7, reasons)
    
    def _score_features(self, car: Dict[str, Any], profile: Dict[str, Any]) -> tuple[float, List[str]]:
        """Score based on features"""
        reasons = []
        features_wanted = profile.get("features_wanted", [])
        
        if not features_wanted:
            return (0.7, reasons)
        
        driver_assist = self._get_driver_assist_features(car)
        driver_assist_lower = [f.lower().replace("_", " ") for f in driver_assist]
        
        # Feature matching
        feature_map = {
            "apple_carplay": ["apple", "carplay"],
            "android_auto": ["android", "auto"],
            "leather_seats": ["leather"],
            "panoramic_sunroof": ["panoramic", "sunroof"],
            "sunroof": ["sunroof"],
            "blind_spot_monitor": ["blind spot", "blind_spot"],
            "adaptive_cruise": ["adaptive cruise", "adaptive_cruise_control"],
            "lane_departure": ["lane", "lane_keep"],
            "3_row_seating": ["3_row", "three_row"],
            "hybrid": ["hybrid"],
        }
        
        matches = 0
        for wanted in features_wanted:
            wanted_lower = wanted.lower()
            
            # Check if it's a known feature
            search_terms = feature_map.get(wanted_lower, [wanted_lower])
            
            # Check against driver assist features
            for term in search_terms:
                if any(term in feature for feature in driver_assist_lower):
                    matches += 1
                    if "carplay" in wanted_lower or "apple" in wanted_lower:
                        reasons.append("has_carplay")
                    elif "cruise" in wanted_lower:
                        reasons.append("has_adaptive_cruise")
                    elif "lane" in wanted_lower:
                        reasons.append("has_lane_assist")
                    break
            
            # Check fuel type for hybrid
            if "hybrid" in wanted_lower and self._get_fuel_type(car) in ["hybrid", "plug_in_hybrid"]:
                matches += 1
                reasons.append("eco_friendly")
        
        if len(features_wanted) > 0:
            match_ratio = matches / len(features_wanted)
            if match_ratio >= 0.8:
                reasons.append("feature_rich")
            return (match_ratio, reasons)
        
        return (0.7, reasons)
    
    def _score_safety(self, car: Dict[str, Any], profile: Dict[str, Any]) -> tuple[float, List[str]]:
        """Score based on safety"""
        reasons = []
        safety_score = self._get_safety_score(car)  # 0-1 scale
        driver_assist = self._get_driver_assist_features(car)
        
        # Convert 0-1 scale to ratings
        if safety_score >= 0.9:
            reasons.append("top_safety")
            score = 1.0
        elif safety_score >= 0.8:
            reasons.append("excellent_safety")
            score = 0.9
        elif safety_score >= 0.7:
            score = 0.7
        else:
            score = 0.5
        
        # Bonus for comprehensive driver assist
        if len(driver_assist) >= 5:
            reasons.append("advanced_safety_features")
        
        return (score, reasons)


# Singleton instance
catalog_scoring_service = CatalogScoringService()
