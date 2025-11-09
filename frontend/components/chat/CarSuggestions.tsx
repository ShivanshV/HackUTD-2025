'use client';

import React, { useEffect, useState } from 'react';
import { Vehicle } from '@/lib/types/chat';
import { getAllVehicles } from '@/lib/api/vehicles';
import styles from './CarSuggestions.module.css';

interface CarSuggestionsProps {
  cars?: Vehicle[];
  onViewDetails?: (carId: string) => void;
}

const CarSuggestions: React.FC<CarSuggestionsProps> = ({ cars, onViewDetails }) => {
  const [suggestedCars, setSuggestedCars] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all vehicles in batches
  useEffect(() => {
    if (!cars) {
      setLoading(true);
      
      // Fetch all vehicles by loading them in batches
      const fetchAllVehicles = async () => {
        const allVehicles: Vehicle[] = [];
        let currentSkip = 0;
        const batchSize = 100;
        
        try {
          while (true) {
            const batch = await getAllVehicles(currentSkip, batchSize);
            if (batch.length === 0) break;
            
            allVehicles.push(...batch);
            currentSkip += batchSize;
            
            // If we got less than the batch size, we've reached the end
            if (batch.length < batchSize) break;
          }
          
          setSuggestedCars(allVehicles);
        } catch (err) {
          console.error('Failed to load vehicles:', err);
        } finally {
          setLoading(false);
        }
      };
      
      fetchAllVehicles();
    }
  }, [cars]);

  // Filter cars based on search query
  const allCars = cars || suggestedCars;
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

  // Debug logging
  useEffect(() => {
    console.log('CarSuggestions - displayCars:', displayCars.length, displayCars.slice(0, 2));
  }, [displayCars]);

  if (loading) {
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
            <h3 className={styles.title}>All Available Vehicles</h3>
            <p className={styles.subtitle}>
              {displayCars.length} {displayCars.length === allCars.length ? 'Toyota vehicles' : `of ${allCars.length} vehicles`} in our catalog
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
            <p className={styles.noResultsText}>No vehicles found matching "{searchQuery}"</p>
            <p className={styles.noResultsHint}>Try adjusting your search terms</p>
          </div>
        ) : (
          displayCars.map((car, index) => (
            <div key={car.id} className={styles.carCard}>
              <div className={styles.carImage}>
                <div className={styles.imagePlaceholder}>
                  🚗
                </div>
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

