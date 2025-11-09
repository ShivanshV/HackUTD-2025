import json
from pathlib import Path
from typing import List, Dict, Any, Optional
from app.models.chat import Vehicle

class VehicleService:
    """Service for loading and filtering vehicle data from JSON"""

    def __init__(self):
        # Load cars.json on initialization
        self.cars_data = self._load_cars_data()

    def _load_cars_data(self) -> List[Dict[str, Any]]:
        """Load vehicle data from cars.json"""
        cars_file = Path(__file__).parent.parent / "data" / "cars.json"

        try:
            with open(cars_file, 'r') as f:
                data = json.load(f)
            print(f"✅ Loaded {len(data)} vehicles from cars.json")
            return data
        except FileNotFoundError:
            print(f"⚠️ Warning: {cars_file} not found")
            return []
        except json.JSONDecodeError as e:
            print(f"❌ Error decoding JSON: {e}")
            return []

    def get_all_vehicles(self) -> List[Vehicle]:
        """Get all vehicles"""
        return [Vehicle(**car) for car in self.cars_data]

    def find_vehicles(
        self,
        model: Optional[str] = None,
        body_style: Optional[str] = None,
        fuel_type: Optional[str] = None,
        max_price: Optional[float] = None,
        min_mpg: Optional[int] = None,
        min_seating: Optional[int] = None,
        year: Optional[int] = None,
    ) -> List[Vehicle]:
        """
        Filter vehicles based on criteria

        This is where your AI agent's tools will call to find cars
        """
        filtered_cars = self.cars_data

        # Filter by model
        if model:
            filtered_cars = [
                car for car in filtered_cars
                if car.get("model", "").lower() == model.lower()
            ]

        # Filter by body style
        if body_style:
            filtered_cars = [
                car for car in filtered_cars
                if car.get("specs", {}).get("body_style", "").lower() == body_style.lower()
            ]

        # Filter by fuel type
        if fuel_type:
            filtered_cars = [
                car for car in filtered_cars
                if car.get("specs", {}).get("powertrain", {}).get("fuel_type", "").lower() == fuel_type.lower()
            ]

        # Filter by max price
        if max_price:
            filtered_cars = [
                car for car in filtered_cars
                if car.get("specs", {}).get("pricing", {}).get("base_msrp", float('inf')) <= max_price
            ]

        # Filter by minimum highway MPG
        if min_mpg:
            filtered_cars = [
                car for car in filtered_cars
                if car.get("specs", {}).get("powertrain", {}).get("mpg_hwy", 0) >= min_mpg
            ]

        # Filter by minimum seating
        if min_seating:
            filtered_cars = [
                car for car in filtered_cars
                if car.get("specs", {}).get("capacity", {}).get("seats", 0) >= min_seating
            ]

        # Filter by year
        if year:
            filtered_cars = [
                car for car in filtered_cars
                if car.get("year") == year
            ]

        return [Vehicle(**car) for car in filtered_cars]

    def get_vehicle_by_id(self, vehicle_id: str) -> Optional[Vehicle]:
        """Get a specific vehicle by ID"""
        for car in self.cars_data:
            if car.get("id") == vehicle_id:
                return Vehicle(**car)
        return None

    def calculate_true_cost(
        self,
        vehicle_id: str,
        commute_miles: int,
        gas_price: float = 3.50
    ) -> Dict[str, Any]:
        """
        Calculate true cost of ownership including fuel

        Example tool that your AI agent could use
        """
        vehicle = self.get_vehicle_by_id(vehicle_id)
        if not vehicle:
            return {"error": "Vehicle not found"}

        # Annual fuel cost calculation
        annual_miles = commute_miles * 2 * 250  # Round trip, 250 work days

        mpg_hwy = vehicle.specs.powertrain.mpg_hwy
        if mpg_hwy:
            annual_gallons = annual_miles / mpg_hwy
            annual_fuel_cost = annual_gallons * gas_price
        else:
            annual_fuel_cost = 0

        # Include other annual costs
        annual_insurance = vehicle.annual_insurance
        annual_maintenance = vehicle.annual_maintenance

        return {
            "vehicle_name": f"{vehicle.make} {vehicle.model} {vehicle.trim}",
            "year": vehicle.year,
            "msrp": vehicle.specs.pricing.base_msrp,
            "annual_fuel_cost": round(annual_fuel_cost, 2),
            "annual_insurance": round(annual_insurance, 2),
            "annual_maintenance": round(annual_maintenance, 2),
            "total_annual_cost": round(annual_fuel_cost + annual_insurance + annual_maintenance, 2),
            "five_year_fuel_cost": round(annual_fuel_cost * 5, 2),
            "five_year_total": round(
                vehicle.specs.pricing.base_msrp + 
                (annual_fuel_cost + annual_insurance + annual_maintenance) * 5, 
                2
            ),
        }

    def get_catalog_stats(self) -> Dict[str, Any]:
        """Get statistics about the vehicle catalog"""
        body_styles = {}
        fuel_types = {}
        years = set()
        price_range = {"min": float('inf'), "max": 0}
        
        for car in self.cars_data:
            # Count by body style
            body_style = car.get("specs", {}).get("body_style", "unknown")
            body_styles[body_style] = body_styles.get(body_style, 0) + 1
            
            # Count by fuel type
            fuel_type = car.get("specs", {}).get("powertrain", {}).get("fuel_type", "unknown")
            fuel_types[fuel_type] = fuel_types.get(fuel_type, 0) + 1
            
            # Track years
            years.add(car.get("year"))
            
            # Track price range
            price = car.get("specs", {}).get("pricing", {}).get("base_msrp", 0)
            if price > 0:
                price_range["min"] = min(price_range["min"], price)
                price_range["max"] = max(price_range["max"], price)
        
        return {
            "total_vehicles": len(self.cars_data),
            "body_styles": body_styles,
            "fuel_types": fuel_types,
            "years": sorted(list(years)),
            "price_range": price_range,
        }

# Singleton instance
vehicle_service = VehicleService()
