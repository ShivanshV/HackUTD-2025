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
}

// Vehicle types
export interface Vehicle {
  id: string;
  name: string;
  model: string;
  year: number;
  price: number;
  type: 'sedan' | 'suv' | 'truck' | 'hybrid' | 'electric';
  mpg?: {
    city: number;
    highway: number;
  };
  features: string[];
  imageUrl?: string;
  specs?: VehicleSpecs;
}

export interface VehicleSpecs {
  engine: string;
  transmission: string;
  drivetrain: string;
  seating: number;
  cargoSpace?: string;
  horsepower: number;
  safetyRating?: number;
}

// User preferences (extracted by AI)
export interface UserPreferences {
  commute?: number;
  budget?: number;
  passengers?: number;
  priorities?: string[];
}

