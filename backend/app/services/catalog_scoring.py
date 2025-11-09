"""
Catalog & Scoring Service (Person A)

Pure functions for car data and ranking logic.
No AI/Nemotron calls - just structured scoring based on user profile.
Flexible weight system allows Nemotron (Person B) to adjust priorities.
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
                {
                    "budget_max": 40000,
                    "commute_miles": 50,
                    "passengers": 5,
                    "terrain": "city" | "highway" | "mixed" | "offroad",
                    "priorities": ["fuel_efficiency", "safety", "performance"],  # Text list
                    "features_wanted": ["awd", "apple_carplay", "leather_seats"],
                    "has_children": true/false,
                    "weights": {  # Optional: Nemotron can override defaults
                        "budget": 0.15,
                        "fuel_efficiency": 0.40,  # User emphasizes MPG
                        "seating": 0.15,
                        "performance": 0.10,
                        ...
                    }
                }
        
        Returns:
            List of scored cars: [
                {
                    "id": "rav4-2024-xle",
                    "score": 0.87,
                    "reasons": ["awd_match", "good_mpg", "within_budget"]
                }
            ]
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
        custom_weights = profile.get("weights", {})
        weights = self.DEFAULT_WEIGHTS.copy()
        weights.update(custom_weights)
        return weights
    
    def _score_single_car(self, car: Dict[str, Any], profile: Dict[str, Any]) -> tuple[float, List[str]]:
        """
        Score a single car against user profile
        
        Returns:
            (score, reasons) where score is 0.0-1.0 and reasons is list of strings
        """
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
    
    def _score_budget(self, car: Dict[str, Any], profile: Dict[str, Any]) -> tuple[float, List[str]]:
        """Score based on budget"""
        reasons = []
        budget_max = profile.get("budget_max", 50000)
        
        if car["price"] <= budget_max:
            # Cheaper cars get slight bonus
            ratio = 1.0 - (car["price"] / budget_max) * 0.3
            reasons.append("within_budget")
            if car["price"] <= budget_max * 0.8:
                reasons.append("under_budget")
            return (ratio, reasons)
        else:
            # Over budget = major penalty
            return (0.2, [])
    
    def _score_fuel_efficiency(self, car: Dict[str, Any], profile: Dict[str, Any]) -> tuple[float, List[str]]:
        """Score based on fuel efficiency"""
        reasons = []
        avg_mpg = (car["mpg_city"] + car["mpg_highway"]) / 2
        commute = profile.get("commute_miles", 0)
        
        # Long commute = MPG matters more
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
            # Short commute = MPG less critical
            if avg_mpg >= 30:
                reasons.append("good_mpg")
            return (0.7, reasons)
    
    def _score_seating(self, car: Dict[str, Any], profile: Dict[str, Any]) -> tuple[float, List[str]]:
        """Score based on seating capacity"""
        reasons = []
        passengers_needed = profile.get("passengers", 5)
        
        if car["seating"] >= passengers_needed:
            reasons.append("enough_seats")
            if car["seating"] >= passengers_needed + 2:
                reasons.append("extra_space")
            return (1.0, reasons)
        else:
            # Not enough seats = major penalty
            return (0.2, reasons)
    
    def _score_drivetrain(self, car: Dict[str, Any], profile: Dict[str, Any]) -> tuple[float, List[str]]:
        """Score based on drivetrain (AWD/4WD)"""
        reasons = []
        features_wanted = profile.get("features_wanted", [])
        terrain = profile.get("terrain", "mixed")
        
        wants_awd = "awd" in features_wanted or terrain == "offroad"
        has_awd = car["drivetrain"] in ["AWD", "4WD"]
        
        if wants_awd and has_awd:
            reasons.append("awd_match")
            return (1.0, reasons)
        elif wants_awd and not has_awd:
            return (0.4, reasons)
        else:
            # User doesn't need AWD - FWD is fine
            return (0.8, reasons)
    
    def _score_vehicle_type(self, car: Dict[str, Any], profile: Dict[str, Any]) -> tuple[float, List[str]]:
        """Score based on vehicle type"""
        reasons = []
        has_children = profile.get("has_children", False)
        terrain = profile.get("terrain", "mixed")
        
        if has_children:
            if car["type"] == "suv" or car["seating"] >= 7:
                reasons.append("family_friendly")
                return (1.0, reasons)
            elif car["type"] == "sedan":
                return (0.7, reasons)
            else:
                return (0.5, reasons)
        else:
            if terrain == "offroad" and car["type"] == "truck":
                reasons.append("offroad_capable")
                return (1.0, reasons)
            elif car["type"] in ["sedan", "hybrid"]:
                reasons.append("efficient_choice")
                return (0.9, reasons)
            else:
                return (0.8, reasons)
    
    def _score_performance(self, car: Dict[str, Any], profile: Dict[str, Any]) -> tuple[float, List[str]]:
        """Score based on horsepower/performance"""
        reasons = []
        priorities = profile.get("priorities", [])
        
        # Check if user cares about performance
        cares_about_performance = "performance" in priorities or "power" in priorities
        
        hp = car.get("horsepower", 200)
        
        if cares_about_performance:
            if hp >= 275:
                reasons.append("high_performance")
                return (1.0, reasons)
            elif hp >= 225:
                reasons.append("good_power")
                return (0.8, reasons)
            elif hp >= 180:
                return (0.6, reasons)
            else:
                return (0.4, reasons)
        else:
            # Performance not a priority - any HP is fine
            if hp >= 200:
                reasons.append("adequate_power")
            return (0.7, reasons)
    
    def _score_features(self, car: Dict[str, Any], profile: Dict[str, Any]) -> tuple[float, List[str]]:
        """Score based on specific features wanted"""
        reasons = []
        features_wanted = profile.get("features_wanted", [])
        car_features_lower = [f.lower() for f in car.get("features", [])]
        
        if not features_wanted:
            return (0.7, reasons)  # No specific features requested
        
        # Normalize feature names for matching
        feature_map = {
            "apple_carplay": "apple carplay",
            "android_auto": "android auto",
            "leather_seats": "leather seats",
            "panoramic_sunroof": "panoramic sunroof",
            "sunroof": "sunroof",
            "blind_spot_monitor": "blind spot monitor",
            "adaptive_cruise": "adaptive cruise control",
            "lane_departure": "lane departure alert",
            "3_row_seating": "3-row seating",
            "hybrid": "hybrid",
            "power_liftgate": "power liftgate",
            "wireless_charging": "wireless charging",
        }
        
        matches = 0
        for wanted in features_wanted:
            wanted_lower = wanted.lower()
            feature_to_match = feature_map.get(wanted_lower, wanted_lower)
            
            # Check if feature exists in car
            if any(feature_to_match in cf for cf in car_features_lower):
                matches += 1
                # Add specific reason codes
                if "carplay" in wanted_lower:
                    reasons.append("has_carplay")
                elif "leather" in wanted_lower:
                    reasons.append("has_leather")
                elif "sunroof" in wanted_lower:
                    reasons.append("has_sunroof")
                elif "hybrid" in wanted_lower:
                    reasons.append("eco_friendly")
                elif "3_row" in wanted_lower or "3-row" in wanted_lower:
                    reasons.append("three_row_seating")
        
        if len(features_wanted) > 0:
            match_ratio = matches / len(features_wanted)
            if match_ratio >= 0.8:
                reasons.append("feature_rich")
            return (match_ratio, reasons)
        
        return (0.7, reasons)
    
    def _score_safety(self, car: Dict[str, Any], profile: Dict[str, Any]) -> tuple[float, List[str]]:
        """Score based on safety rating and features"""
        reasons = []
        safety_rating = car.get("safety_rating", 4.0)
        
        if safety_rating >= 5.0:
            reasons.append("top_safety")
            return (1.0, reasons)
        elif safety_rating >= 4.5:
            reasons.append("excellent_safety")
            return (0.9, reasons)
        elif safety_rating >= 4.0:
            return (0.7, reasons)
        else:
            return (0.5, reasons)


# Singleton instance
catalog_scoring_service = CatalogScoringService()
