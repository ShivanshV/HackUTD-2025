'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Vehicle } from '@/lib/types/chat';
import { getSuggestedVehicles } from '@/lib/api/vehicles';
import styles from './CarSuggestions.module.css';

interface CarSuggestionsProps {
  cars?: Vehicle[];
  onViewDetails?: (carId: string) => void;
  recommendedCarIds?: string[];
}

const CarSuggestions: React.FC<CarSuggestionsProps> = ({ cars, onViewDetails, recommendedCarIds = [] }) => {
  const [suggestedCars, setSuggestedCars] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch suggested vehicles from suggested.json
  const fetchSuggestedVehicles = useCallback(async () => {
    try {
      setLoading(true);
      const vehicles = await getSuggestedVehicles();
      setSuggestedCars(vehicles);
    } catch (err) {
      console.error('Failed to load suggested vehicles:', err);
      setSuggestedCars([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch suggested vehicles on mount
  useEffect(() => {
    // Always fetch from suggested.json first to get latest recommendations
    fetchSuggestedVehicles();
    
    // If cars prop is provided, use it as a fallback or override
    if (cars && cars.length > 0) {
      // Only override if we don't have suggestions yet, or if cars prop is explicitly provided
      // This allows the component to show AI recommendations from suggested.json
      if (suggestedCars.length === 0) {
        setSuggestedCars(cars);
      }
    }
  }, []); // Only run on mount

  // Always poll for updates to suggested.json every 2 seconds
  // This ensures we show the latest recommendations even if the AI agent updates them
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSuggestedVehicles();
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [fetchSuggestedVehicles]);

  // Determine which cars to display
  // Priority: 1) suggestedCars from suggested.json (AI recommendations), 2) cars prop, 3) empty
  const allCars = suggestedCars.length > 0 ? suggestedCars : (cars && cars.length > 0 ? cars : []);

  // Filter cars based on search query
  const displayCars = allCars.filter((car) => {
    if (!searchQuery.trim()) return true;
    
    const searchLower = searchQuery.toLowerCase();
    const carTitle = `${car.year} ${car.make} ${car.model} ${car.trim}`.toLowerCase();
    return carTitle.includes(searchLower);
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading && allCars.length === 0) {
    return (
      <div className={styles.sidebar}>
        <div className={styles.header}>
          <h3 className={styles.title}>Suggested Vehicles</h3>
          <p className={styles.subtitle}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.headerText}>
            <h3 className={styles.title}>
              {suggestedCars.length > 0 || (cars && cars.length > 0) ? (
                <>✨ AI Recommended Vehicles</>
              ) : (
                <>All Available Vehicles</>
              )}
            </h3>
            <p className={styles.subtitle}>
              {suggestedCars.length > 0 || (cars && cars.length > 0) ? (
                `${displayCars.length} ${displayCars.length === 1 ? 'vehicle' : 'vehicles'} match your needs`
              ) : (
                `${displayCars.length} ${displayCars.length === 1 ? 'vehicle' : 'vehicles'} in our catalog`
              )}
            </p>
          </div>
          <div className={styles.searchContainer}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search vehicles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className={styles.searchIcon}>🔍</span>
          </div>
        </div>
      </div>

      <div className={styles.carsList}>
        {displayCars.length === 0 ? (
          <div className={styles.noResults}>
            <span className={styles.noResultsIcon}>🔍</span>
            <p className={styles.noResultsText}>
              {searchQuery.trim() 
                ? `No vehicles found matching "${searchQuery}"`
                : 'No vehicles found. Start a conversation to get personalized recommendations!'
              }
            </p>
            <p className={styles.noResultsHint}>
              {searchQuery.trim() ? 'Try adjusting your search terms' : 'Tell the AI about your preferences'}
            </p>
          </div>
        ) : (
          displayCars.map((car) => (
            <div key={car.id} className={styles.carCard}>
              <div className={styles.carImage}>
                {car.image_url ? (
                  <img 
                    src={car.image_url} 
                    alt={`${car.year} ${car.model}`}
                    className={styles.carImageImg}
                  />
                ) : (
                  <div className={styles.imagePlaceholder}>
                    🚗
                  </div>
                )}
                {car.condition && (
                  <div className={styles.conditionBadge}>
                    {car.condition}
                  </div>
                )}
              </div>
              <div className={styles.carInfo}>
                <h4 className={styles.carName}>
                  {car.year} {car.make} {car.model} {car.trim}
                </h4>
                <p className={styles.carType}>{car.specs?.body_style || 'Unknown'}</p>
                <p className={styles.carMpg}>
                  {car.specs?.powertrain?.mpg_city || 0}/{car.specs?.powertrain?.mpg_hwy || 0} MPG
                </p>
                <p className={styles.carPrice}>
                  {formatPrice(car.specs?.pricing?.base_msrp || 0)}
                </p>
                <button 
                  className={styles.viewButton}
                  onClick={() => onViewDetails && onViewDetails(car.id)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CarSuggestions;
