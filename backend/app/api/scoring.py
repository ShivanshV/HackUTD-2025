"""
Scoring API endpoint for testing catalog & scoring service
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.services.catalog_scoring import catalog_scoring_service

router = APIRouter()


class UserProfile(BaseModel):
    """User profile for scoring"""
    budget_max: int = 50000
    commute_miles: int = 0
    passengers: int = 5
    terrain: str = "mixed"
    priorities: List[str] = []
    features_wanted: List[str] = []
    has_children: bool = False
    weights: Optional[Dict[str, float]] = None


@router.get("/cars")
async def get_all_cars():
    """Get all cars from catalog"""
    return {
        "cars": catalog_scoring_service.get_all_cars(),
        "count": len(catalog_scoring_service.get_all_cars())
    }


@router.post("/score")
async def score_cars(profile: UserProfile):
    """Score cars based on user profile"""
    scored_cars = catalog_scoring_service.score_cars_for_user(profile.dict())
    
    return {
        "user_profile": profile.dict(),
        "scored_cars": scored_cars,
        "top_3": scored_cars[:3]
    }

