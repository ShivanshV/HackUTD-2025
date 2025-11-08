import json
from pathlib import Path
from typing import List, Dict, Any
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
            return data
        except FileNotFoundError:
            print(f"Warning: {cars_file} not found")
            return []
        except json.JSONDecodeError as e:
            print(f"Error decoding JSON: {e}")
            return []
    
    def get_all_vehicles(self) -> List[Vehicle]:
        """Get all vehicles"""
        return [Vehicle(**car) for car in self.cars_data]
    
    def find_vehicles(
        self,
        vehicle_type: str | None = None,
        max_price: float | None = None,
        min_mpg: int | None = None,
        min_seating: int | None = None,
    ) -> List[Vehicle]:
        """
        Filter vehicles based on criteria
        
        This is where your AI agent's tools will call to find cars
        """
        filtered_cars = self.cars_data
        
        # Filter by type
        if vehicle_type:
            filtered_cars = [
                car for car in filtered_cars
                if car.get("type", "").lower() == vehicle_type.lower()
            ]
        
        # Filter by max price
        if max_price:
            filtered_cars = [
                car for car in filtered_cars
                if car.get("price", float('inf')) <= max_price
            ]
        
        # Filter by minimum highway MPG
        if min_mpg:
            filtered_cars = [
                car for car in filtered_cars
                if car.get("mpg_highway", 0) >= min_mpg
            ]
        
        # Filter by minimum seating
        if min_seating:
            filtered_cars = [
                car for car in filtered_cars
                if car.get("seating", 0) >= min_seating
            ]
        
        return [Vehicle(**car) for car in filtered_cars]
    
    def get_vehicle_by_id(self, vehicle_id: str) -> Vehicle | None:
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
        
        if vehicle.mpg_highway:
            annual_gallons = annual_miles / vehicle.mpg_highway
            annual_fuel_cost = annual_gallons * gas_price
        else:
            annual_fuel_cost = 0
        
        return {
            "vehicle_name": f"{vehicle.name} {vehicle.model}",
            "msrp": vehicle.price,
            "annual_fuel_cost": round(annual_fuel_cost, 2),
            "five_year_fuel_cost": round(annual_fuel_cost * 5, 2),
            "five_year_total": round(vehicle.price + (annual_fuel_cost * 5), 2),
        }

# Singleton instance
vehicle_service = VehicleService()

