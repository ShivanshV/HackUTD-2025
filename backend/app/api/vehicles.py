from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import json
from pathlib import Path
from app.models.chat import Vehicle
from app.services.vehicle_service import vehicle_service

router = APIRouter()

@router.get("/vehicles", response_model=List[Vehicle])
async def get_all_vehicles(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(50, ge=1, le=500, description="Number of records to return"),
):
    """
    Get all vehicles with pagination
    
    Returns a paginated list of all available vehicles
    """
    all_vehicles = vehicle_service.get_all_vehicles()
    return all_vehicles[skip:skip + limit]

@router.get("/vehicles/stats")
async def get_vehicle_stats():
    """Get statistics about the vehicle catalog"""
    return vehicle_service.get_catalog_stats()

@router.get("/vehicles/search", response_model=List[Vehicle])
async def search_vehicles(
    model: Optional[str] = Query(None, description="Model: Camry, RAV4, Prius, etc."),
    body_style: Optional[str] = Query(None, description="Body style: sedan, suv, truck, coupe, etc."),
    fuel_type: Optional[str] = Query(None, description="Fuel type: gasoline, hybrid, electric, etc."),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price"),
    min_mpg: Optional[int] = Query(None, ge=0, description="Minimum highway MPG"),
    min_seating: Optional[int] = Query(None, ge=1, description="Minimum seating capacity"),
    year: Optional[int] = Query(None, ge=2000, description="Model year"),
    condition: Optional[str] = Query(None, description="Condition: New, Used, Certified Pre-Owned"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
):
    """
    Search vehicles with filters
    
    Apply multiple filters to find specific vehicles
    """
    vehicles = vehicle_service.find_vehicles(
        model=model,
        body_style=body_style,
        fuel_type=fuel_type,
        max_price=max_price,
        min_mpg=min_mpg,
        min_seating=min_seating,
        year=year,
        condition=condition,
    )
    
    return vehicles[skip:skip + limit]

@router.get("/vehicles/suggested", response_model=List[Vehicle])
async def get_suggested_vehicles():
    """
    Get recommended vehicles from suggested.json
    
    Returns the list of recommended vehicles that were generated
    from the most recent chat interaction. This file is automatically
    updated after each user prompt when recommendations are available.
    """
    try:
        suggested_json_path = Path(__file__).parent.parent / "data" / "suggested.json"
        
        print(f"🔍 Looking for suggested.json at: {suggested_json_path}")
        print(f"🔍 File exists: {suggested_json_path.exists()}")
        
        # Check if file exists
        if not suggested_json_path.exists():
            print(f"⚠️ suggested.json does not exist at {suggested_json_path}")
            # Create empty file if it doesn't exist
            suggested_json_path.parent.mkdir(parents=True, exist_ok=True)
            with open(suggested_json_path, 'w') as f:
                json.dump([], f)
            return []
        
        # Read suggested.json
        with open(suggested_json_path, 'r') as f:
            suggested_cars = json.load(f)
        
        print(f"📖 Read {len(suggested_cars) if isinstance(suggested_cars, list) else 0} cars from suggested.json")
        
        # Handle empty array or invalid data
        if not suggested_cars or not isinstance(suggested_cars, list):
            print(f"⚠️ suggested.json is empty or invalid")
            return []
        
        # Convert to Vehicle models (skip 'Reason' field if present)
        vehicles = []
        for car in suggested_cars:
            try:
                # Remove 'Reason' and '_score' fields if present (not part of Vehicle model)
                car_dict = {k: v for k, v in car.items() if k not in ['Reason', '_score']}
                vehicles.append(Vehicle(**car_dict))
            except Exception as e:
                print(f"⚠️ Error converting car to Vehicle model: {e}")
                print(f"   Car data: {list(car.keys())[:10]}")
                continue
        
        print(f"✅ Returning {len(vehicles)} vehicles from suggested.json")
        return vehicles
    except json.JSONDecodeError as e:
        # If file is empty or invalid JSON, return empty list
        print(f"⚠️ JSON decode error reading suggested.json: {e}")
        return []
    except Exception as e:
        print(f"❌ Error reading suggested.json: {e}")
        import traceback
        traceback.print_exc()
        return []

@router.get("/vehicles/{vehicle_id}", response_model=Vehicle)
async def get_vehicle_by_id(vehicle_id: str):
    """Get a single vehicle by ID"""
    vehicle = vehicle_service.get_vehicle_by_id(vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail=f"Vehicle not found: {vehicle_id}")
    return vehicle

@router.post("/vehicles/suggested/clear")
async def clear_suggested_vehicles():
    """
    Clear suggested.json file (e.g., on page reload)
    
    This endpoint is called when the user reloads the page to reset
    the AI recommendations.
    """
    try:
        suggested_json_path = Path(__file__).parent.parent / "data" / "suggested.json"
        
        # Clear the file by writing an empty array
        with open(suggested_json_path, 'w') as f:
            json.dump([], f, indent=2)
        
        print(f"🗑️ Cleared suggested.json via API endpoint")
        return {"status": "success", "message": "Suggested vehicles cleared"}
    except Exception as e:
        print(f"❌ Error clearing suggested.json: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error clearing suggested vehicles: {str(e)}")
