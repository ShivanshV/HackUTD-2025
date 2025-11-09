// Chat message types
export interface ChatMessage {
  role: 'user' | 'agent';
  content: string;
  timestamp?: Date;
}

// API request/response types
export interface ChatRequest {
  messages: ChatMessage[];
}

export interface ChatResponse {
  role: 'agent';
  content: string;
  recommended_car_ids?: string[];
  scoring_method?: string;
}

// Vehicle types matching the backend data structure
export interface Vehicle {
  id: string;
  make: string;
  model: string;
  trim: string;
  year: number;
  condition: string;
  specs: VehicleSpecs;
  derived_scores: DerivedScores;
  cargo_space: string;
  towing_capacity: string;
  annual_fuel_cost: number;
  annual_insurance: number;
  annual_maintenance: number;
  description: string;
  best_for: string;
  image_url: string;
  video_id?: string;
  '3d_model_url'?: string;
  dealerInventory?: DealerInventory[];
}

export interface VehicleSpecs {
  body_style: string;
  size_class: string;
  pricing: Pricing;
  powertrain: Powertrain;
  capacity: Capacity;
  dimensions: Dimensions;
  comfort: Comfort;
  parking_tags: ParkingTags;
  environment_fit: EnvironmentFit;
  safety: Safety;
}

export interface Pricing {
  base_msrp: number;
  msrp_range: [number, number];
  est_lease_monthly: number;
  est_loan_monthly: number;
}

export interface Powertrain {
  fuel_type: string;
  drivetrain: string;
  mpg_city: number;
  mpg_hwy: number;
  mpg_combined: number;
  est_range_miles: number;
}

export interface Capacity {
  seats: number;
  rear_seat_child_seat_fit: string;
  isofix_latch_points: boolean;
  cargo_volume_l: number;
  fold_flat_rear_seats: boolean;
}

export interface Dimensions {
  length_mm: number;
  width_mm: number;
  height_mm: number;
  turning_radius_m: number;
}

export interface Comfort {
  ride_comfort_score: number;
  noise_level_score: number;
}

export interface ParkingTags {
  city_friendly: boolean;
  tight_space_ok: boolean;
}

export interface EnvironmentFit {
  ground_clearance_in: number;
  offroad_capable: boolean;
  rough_road_score: number;
  snow_rain_score: number;
}

export interface Safety {
  has_tss: boolean;
  tss_version?: string;
  airbags: number;
  driver_assist: string[];
  crash_test_score: number;
}

export interface DerivedScores {
  eco_score: number;
  family_friendly_score: number;
  city_commute_score: number;
  road_trip_score: number;
}

export interface DealerInventory {
  dealer: string;
  stock: number;
  price: number;
}

// User preferences (extracted by AI)
export interface UserPreferences {
  commute?: number;
  budget?: number;
  passengers?: number;
  priorities?: string[];
  hasFamily?: boolean;
  longCommute?: boolean;
  ecoConscious?: boolean;
  cityDriver?: boolean;
}
