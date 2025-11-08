from pydantic import BaseModel
from typing import List, Literal
from datetime import datetime

class ChatMessage(BaseModel):
    """Single chat message"""
    role: Literal["user", "agent"]
    content: str
    timestamp: datetime | None = None

class ChatRequest(BaseModel):
    """Request payload for chat endpoint"""
    messages: List[ChatMessage]

class ChatResponse(BaseModel):
    """Response payload from chat endpoint"""
    role: Literal["agent"] = "agent"
    content: str

class Vehicle(BaseModel):
    """Vehicle model"""
    id: str
    name: str
    model: str
    year: int
    price: float
    type: Literal["sedan", "suv", "truck", "hybrid", "electric"]
    mpg_city: int | None = None
    mpg_highway: int | None = None
    features: List[str] = []
    image_url: str | None = None
    engine: str | None = None
    transmission: str | None = None
    drivetrain: str | None = None
    seating: int | None = None
    horsepower: int | None = None
    safety_rating: float | None = None

