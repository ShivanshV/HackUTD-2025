from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
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
    )
    
    return vehicles[skip:skip + limit]

@router.get("/vehicles/{vehicle_id}", response_model=Vehicle)
async def get_vehicle_by_id(vehicle_id: str):
    """Get a single vehicle by ID"""
    vehicle = vehicle_service.get_vehicle_by_id(vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail=f"Vehicle not found: {vehicle_id}")
    return vehicle

@router.get("/vehicles/ai-suggested", response_model=List[Vehicle])
async def get_ai_suggested_vehicles():
    """
    Get vehicles recommended by the AI agent from AiSuggested.json
    Returns empty list if no recommendations available
    """
    import os
    import json
    
    try:
        data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
        ai_suggested_path = os.path.join(data_dir, "AiSuggested.json")
        
        if not os.path.exists(ai_suggested_path):
            return []
        
        with open(ai_suggested_path, "r") as f:
            vehicles_data = json.load(f)
        
        # Convert dicts to Vehicle models
        vehicles = []
        for vehicle_dict in vehicles_data:
            try:
                vehicle = Vehicle(**vehicle_dict)
                vehicles.append(vehicle)
            except Exception as e:
                print(f"Error parsing vehicle from AiSuggested.json: {e}")
                continue
        
        return vehicles
    except Exception as e:
        print(f"Error reading AiSuggested.json: {e}")
        return []

