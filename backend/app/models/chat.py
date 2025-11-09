from pydantic import BaseModel
from typing import List, Literal, Optional

# Chat models
class ChatMessage(BaseModel):
    role: Literal["user", "agent"]
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

# Vehicle models matching the JSON structure
class Pricing(BaseModel):
    base_msrp: float
    msrp_range: List[float]
    est_lease_monthly: float
    est_loan_monthly: float

class Powertrain(BaseModel):
    fuel_type: str
    drivetrain: str
    mpg_city: int
    mpg_hwy: int
    mpg_combined: int
    est_range_miles: int

class Capacity(BaseModel):
    seats: int
    rear_seat_child_seat_fit: str
    isofix_latch_points: bool
    cargo_volume_l: int
    fold_flat_rear_seats: bool

class Dimensions(BaseModel):
    length_mm: int
    width_mm: int
    height_mm: int
    turning_radius_m: float

class Comfort(BaseModel):
    ride_comfort_score: float
    noise_level_score: float

class ParkingTags(BaseModel):
    city_friendly: bool
    tight_space_ok: bool

class EnvironmentFit(BaseModel):
    ground_clearance_in: float
    offroad_capable: bool
    rough_road_score: float
    snow_rain_score: float

class Safety(BaseModel):
    has_tss: bool
    tss_version: Optional[str] = None
    airbags: int
    driver_assist: List[str]
    crash_test_score: float

class VehicleSpecs(BaseModel):
    body_style: str
    size_class: str
    pricing: Pricing
    powertrain: Powertrain
    capacity: Capacity
    dimensions: Dimensions
    comfort: Comfort
    parking_tags: ParkingTags
    environment_fit: EnvironmentFit
    safety: Safety

class DerivedScores(BaseModel):
    eco_score: float
    family_friendly_score: float
    city_commute_score: float
    road_trip_score: float

class DealerInventory(BaseModel):
    dealer: str
    stock: int
    price: float

class Vehicle(BaseModel):
    id: str
    make: str
    model: str
    trim: str
    year: int
    specs: VehicleSpecs
    derived_scores: DerivedScores
    cargo_space: str
    towing_capacity: str
    annual_fuel_cost: float
    annual_insurance: float
    annual_maintenance: float
    description: str
    best_for: str
    image_url: str
    video_id: Optional[str] = None
    model_config = {"extra": "allow"}  # Allow 3d_model_url field
    dealerInventory: Optional[List[DealerInventory]] = None

# Chat response model
class ChatResponse(BaseModel):
    role: Literal["agent"]
    content: str
    recommended_car_ids: Optional[List[str]] = None  # Car IDs recommended by Nemotron (frontend can fetch full details via /api/vehicles/{id})
    scoring_method: Optional[str] = None  # "preference_based", "affordability_based", etc.
