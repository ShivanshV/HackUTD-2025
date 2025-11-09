'use client';

import React, { useState, useEffect, useMemo } from 'react';
import styles from './CatalogResults.module.css';
import CarDetailsView from '../chat/CarDetailsView';
import { Vehicle } from '@/lib/types/chat';
import { getVehicleById } from '@/lib/api/vehicles';

interface CatalogFilters {
  status: string;
  model: string;
  bodyStyle: string;
  zipCode: string;
}

interface CatalogResultsProps {
  filters: CatalogFilters;
  onBackToSearch: () => void;
}

interface Car {
  id: string;
  make: string;
  model: string;
  trim: string;
  year: number;
  condition: string;
  specs: {
    body_style: string;
    pricing: {
      base_msrp: number;
      est_lease_monthly: number;
      est_loan_monthly: number;
    };
    powertrain: {
      fuel_type: string;
      mpg_combined: number;
    };
    capacity: {
      seats: number;
    };
  };
  image_url?: string;
  best_for: string;
}

const CatalogResults: React.FC<CatalogResultsProps> = ({ filters, onBackToSearch }) => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('price-low');
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
  const [selectedCar, setSelectedCar] = useState<Vehicle | null>(null);
  const [loadingCarDetails, setLoadingCarDetails] = useState(false);

  // Define helper functions BEFORE hooks (they're not hooks, but good practice)
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Fetch cars from backend based on filters
  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true);
      console.log('🔄 CatalogResults: Fetching cars with filters:', filters);
      
      try {
        // Build query parameters
        const params = new URLSearchParams();
        
        if (filters.model && filters.model !== 'All Toyota Models') {
          params.append('model', filters.model);
        }
        if (filters.bodyStyle && filters.bodyStyle !== 'All Body Styles') {
          params.append('body_style', filters.bodyStyle.toLowerCase());
        }
        
        // Add condition filter to backend query
        if (filters.status && filters.status !== 'All') {
          params.append('condition', filters.status);
          console.log('🔍 Adding condition filter:', filters.status);
        }
        
        // Add limit to get more results
        params.append('limit', '300');
        
        // Fetch from backend API using search endpoint
        // Use the API client from lib/api/vehicles for consistent API base URL
        const apiBaseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000';
        const url = `${apiBaseUrl}/api/vehicles/search?${params.toString()}`;
        console.log('📡 Fetching from URL:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch vehicles: ${response.status} ${response.statusText}`);
        }
        
        const data: Vehicle[] = await response.json();
        console.log(`✅ Received ${data.length} cars from API`);
        // Convert Vehicle[] to Car[] format (they're compatible, but we can type cast)
        setCars(data as any as Car[]);
      } catch (error) {
        console.error('❌ Error fetching cars:', error);
        // Fallback to empty array if API fails
        setCars([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, [filters.status, filters.model, filters.bodyStyle, filters.zipCode]); // Use individual filter properties for dependency

  // Fetch car details when a car is selected
  useEffect(() => {
    if (selectedCarId) {
      setLoadingCarDetails(true);
      getVehicleById(selectedCarId)
        .then((car) => {
          setSelectedCar(car);
          setLoadingCarDetails(false);
        })
        .catch((error) => {
          console.error('Error fetching car details:', error);
          setLoadingCarDetails(false);
          setSelectedCarId(null);
        });
    }
  }, [selectedCarId]);

  // Sort cars based on selected option (useMemo hook)
  const sortedCars = useMemo(() => {
    const sorted = [...cars];
    
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => a.specs.pricing.base_msrp - b.specs.pricing.base_msrp);
      case 'price-high':
        return sorted.sort((a, b) => b.specs.pricing.base_msrp - a.specs.pricing.base_msrp);
      case 'year-new':
        return sorted.sort((a, b) => b.year - a.year);
      case 'year-old':
        return sorted.sort((a, b) => a.year - b.year);
      case 'mpg':
        return sorted.sort((a, b) => b.specs.powertrain.mpg_combined - a.specs.powertrain.mpg_combined);
      default:
        return sorted;
    }
  }, [cars, sortBy]);

  // Event handlers (defined after hooks but before conditional returns)
  const handleViewDetails = (carId: string) => {
    console.log('🔍 View details clicked for car ID:', carId);
    setSelectedCarId(carId);
  };

  const handleBackFromDetails = () => {
    setSelectedCarId(null);
    setSelectedCar(null);
  };

  // Conditional returns - MUST be after all hooks
  // Show loading state while fetching car details
  if (loadingCarDetails) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  // Show car details if a car is selected and loaded
  if (selectedCarId && selectedCar) {
    return (
      <CarDetailsView 
        car={selectedCar} 
        onBack={handleBackFromDetails}
        userPreferences={{
          hasFamily: true,
          longCommute: true,
          ecoConscious: true,
          cityDriver: false
        }}
      />
    );
  }

  return (
    <div className={styles.container}>
      {/* Header with filters summary */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onBackToSearch}>
          ← Back to Search
        </button>
        <div className={styles.resultsInfo}>
          <h1 className={styles.title}>
            {filters.model !== 'All Toyota Models' ? filters.model : 'All Models'}
          </h1>
          <p className={styles.subtitle}>
            <span>{filters.status}</span>
            <span>•</span>
            <span>{filters.bodyStyle}</span>
            <span>•</span>
            <span>Near {filters.zipCode}</span>
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className={styles.filterBar}>
        <div className={styles.resultsCount}>
          {loading ? 'Loading...' : `${sortedCars.length} vehicle${sortedCars.length !== 1 ? 's' : ''} found`}
        </div>
        <div className={styles.sortControl}>
          <label>Sort by:</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className={styles.sortSelect}
          >
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="year-new">Newest First</option>
            <option value="year-old">Oldest First</option>
            <option value="mpg">Best MPG</option>
          </select>
        </div>
      </div>

      {/* Cars grid */}
      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Finding the perfect Toyota for you...</p>
        </div>
      ) : cars.length === 0 ? (
        <div className={styles.noResults}>
          <div className={styles.noResultsIcon}>🔍</div>
          <h2>No vehicles found</h2>
          <p>Try adjusting your search criteria</p>
          <button className={styles.resetButton} onClick={onBackToSearch}>
            Modify Search
          </button>
        </div>
      ) : (
        <div className={styles.carGrid}>
          {sortedCars.map((car) => (
            <div key={car.id} className={styles.carCard}>
              <div className={styles.carImageContainer}>
                {car.image_url ? (
                  <img 
                    src={car.image_url} 
                    alt={`${car.year} ${car.model}`}
                    className={styles.carImage}
                  />
                ) : (
                  <div className={styles.carImagePlaceholder}>
                    🚗
                  </div>
                )}
                <div className={styles.bestForBadge}>{car.best_for}</div>
                {car.condition && (
                  <div className={styles.conditionBadge}>{car.condition}</div>
                )}
              </div>
              
              <div className={styles.carContent}>
                <div className={styles.carHeader}>
                  <h3 className={styles.carTitle}>
                    {car.year} {car.model} {car.trim}
                  </h3>
                  <div className={styles.carSpecs}>
                    <span>{car.specs.capacity.seats} seats</span>
                    <span>•</span>
                    <span>{car.specs.powertrain.mpg_combined} MPG</span>
                    <span>•</span>
                    <span>{car.specs.powertrain.fuel_type}</span>
                  </div>
                </div>

                <div className={styles.pricingSection}>
                  <div className={styles.priceRow}>
                    <span className={styles.priceLabel}>MSRP</span>
                    <span className={styles.priceValue}>
                      {formatPrice(car.specs.pricing.base_msrp)}
                    </span>
                  </div>
                  <div className={styles.financingOptions}>
                    <div className={styles.financingOption}>
                      <span>Lease from</span>
                      <strong>{formatPrice(car.specs.pricing.est_lease_monthly)}/mo</strong>
                    </div>
                    <div className={styles.financingOption}>
                      <span>Finance from</span>
                      <strong>{formatPrice(car.specs.pricing.est_loan_monthly)}/mo</strong>
                    </div>
                  </div>
                </div>

                <div className={styles.cardActions}>
                  <button 
                    className={styles.viewDetailsBtn}
                    onClick={() => handleViewDetails(car.id)}
                  >
                    View Details
                  </button>
                  <button className={styles.compareBtn}>
                    <span>⚖️</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CatalogResults;

