import axios from 'axios';
import { Vehicle } from '@/lib/types/chat';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface VehicleSearchParams {
  body_style?: string;
  fuel_type?: string;
  max_price?: number;
  min_mpg?: number;
  min_seating?: number;
  year?: number;
  skip?: number;
  limit?: number;
}

export interface VehicleStats {
  total_vehicles: number;
  body_styles: Record<string, number>;
  fuel_types: Record<string, number>;
  years: number[];
  price_range: {
    min: number;
    max: number;
  };
}

// Get all vehicles with pagination
export async function getAllVehicles(skip: number = 0, limit: number = 50): Promise<Vehicle[]> {
  try {
    const response = await apiClient.get<Vehicle[]>('/api/vehicles', {
      params: { skip, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    throw new Error('Failed to fetch vehicles');
  }
}

// Get a single vehicle by ID
export async function getVehicleById(id: string): Promise<Vehicle> {
  try {
    const response = await apiClient.get<Vehicle>(`/api/vehicles/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    throw new Error('Failed to fetch vehicle details');
  }
}

// Search vehicles with filters
export async function searchVehicles(params: VehicleSearchParams): Promise<Vehicle[]> {
  try {
    const response = await apiClient.get<Vehicle[]>('/api/vehicles/search', {
      params
    });
    return response.data;
  } catch (error) {
    console.error('Error searching vehicles:', error);
    throw new Error('Failed to search vehicles');
  }
}

// Get vehicle catalog statistics
export async function getVehicleStats(): Promise<VehicleStats> {
  try {
    const response = await apiClient.get<VehicleStats>('/api/vehicles/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching vehicle stats:', error);
    throw new Error('Failed to fetch vehicle statistics');
  }
}

