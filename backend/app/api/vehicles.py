from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.models.chat import Vehicle
from app.services.vehicle_service import vehicle_service

router = APIRouter()

@router.get("/vehicles", response_model=List[Vehicle])
async def get_all_vehicles(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(50, ge=1, le=100, description="Number of records to return"),
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
    limit: int = Query(50, ge=1, le=100),
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

