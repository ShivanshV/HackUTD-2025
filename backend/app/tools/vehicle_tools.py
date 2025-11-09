"""
AI Agent Tools for Vehicle Search

These are the "tools" that your LangChain agent will have access to.
The agent decides when to call these based on the conversation.

Example:
  User: "I have a 60-mile commute"
  Agent: Calls findCars(min_mpg=30) and calculateTrueCost(commute_miles=60)
"""

from typing import List, Dict, Any
from app.services.vehicle_service import vehicle_service

def find_cars(
    vehicle_type: str | None = None,
    body_style: str | None = None,
    fuel_type: str | None = None,
    max_price: float | None = None,
    min_mpg: int | None = None,
    min_seating: int | None = None,
    year: int | None = None,
) -> List[Dict[str, Any]]:
    """
    Find Toyota vehicles matching the given criteria.
    
    Args:
        vehicle_type: Type of vehicle (sedan, suv, truck, hybrid, electric) - maps to body_style
        body_style: Body style (sedan, suv, truck, coupe, etc.)
        fuel_type: Fuel type (gasoline, hybrid, electric, etc.)
        max_price: Maximum price in dollars
        min_mpg: Minimum highway MPG
        min_seating: Minimum number of seats
        year: Model year
    
    Returns:
        List of matching vehicles with details
    """
    # Map vehicle_type to body_style if provided
    # If both are provided, body_style takes precedence
    if vehicle_type and not body_style:
        body_style = vehicle_type
    
    vehicles = vehicle_service.find_vehicles(
        body_style=body_style,
        fuel_type=fuel_type,
        max_price=max_price,
        min_mpg=min_mpg,
        min_seating=min_seating,
        year=year,
    )
    
    # Convert to dict for LangChain
    return [vehicle.model_dump() for vehicle in vehicles]


def calculate_true_cost(
    vehicle_id: str,
    commute_miles: int,
    gas_price: float = 3.50
) -> Dict[str, Any]:
    """
    Calculate the true cost of ownership including fuel costs.
    
    Args:
        vehicle_id: ID of the vehicle
        commute_miles: One-way commute distance in miles
        gas_price: Price per gallon of gas (default: $3.50)
    
    Returns:
        Cost breakdown including MSRP, fuel costs, and 5-year total
    """
    return vehicle_service.calculate_true_cost(
        vehicle_id=vehicle_id,
        commute_miles=commute_miles,
        gas_price=gas_price,
    )


def get_vehicle_details(vehicle_id: str) -> Dict[str, Any] | None:
    """
    Get detailed information about a specific vehicle.
    
    Args:
        vehicle_id: ID of the vehicle
    
    Returns:
        Vehicle details or None if not found
    """
    vehicle = vehicle_service.get_vehicle_by_id(vehicle_id)
    return vehicle.model_dump() if vehicle else None


# TODO: Add these tools to your LangChain agent
# When you set up LangChain, you'll wrap these functions as tools like:
# from langchain.agents import Tool
# tools = [
#     Tool(name="findCars", func=find_cars, description="..."),
#     Tool(name="calculateTrueCost", func=calculate_true_cost, description="..."),
# ]

