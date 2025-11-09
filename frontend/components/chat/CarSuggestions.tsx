'use client';

import React, { useEffect, useState } from 'react';
import { Vehicle } from '@/lib/types/chat';
import { getAllVehicles, getAiSuggestedVehicles } from '@/lib/api/vehicles';
import styles from './CarSuggestions.module.css';

interface CarSuggestionsProps {
  cars?: Vehicle[];
  onViewDetails?: (carId: string) => void;
  recommendedCarIds?: string[];
}

const CarSuggestions: React.FC<CarSuggestionsProps> = ({ cars, onViewDetails, recommendedCarIds = [] }) => {
  const [allCars, setAllCars] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch vehicles - check AiSuggested.json when recommendations exist, otherwise load all
  useEffect(() => {
    const fetchVehicles = async () => {
      // If cars prop is provided, use it
      if (cars) {
        setAllCars(cars);
        return;
      }

      setLoading(true);
      
      try {
        // If we have recommendedCarIds, ALWAYS try to load from AiSuggested.json first
        if (recommendedCarIds && recommendedCarIds.length > 0) {
          console.log('🔍 Checking AiSuggested.json for', recommendedCarIds.length, 'recommended cars');
          const aiSuggested = await getAiSuggestedVehicles();
          if (aiSuggested && aiSuggested.length > 0) {
            console.log('✅ Loaded', aiSuggested.length, 'vehicles from AiSuggested.json');
            setAllCars(aiSuggested);
            setLoading(false);
            return;
          } else {
            console.log('⚠️ AiSuggested.json is empty, will filter from all vehicles');
            // Continue to load all vehicles, then filter below
          }
        }
        
        // Load all vehicles (either no recommendations, or AiSuggested.json was empty)
        console.log('📦 Loading all vehicles from catalog...');
        const allVehicles: Vehicle[] = [];
        let currentSkip = 0;
        const batchSize = 100;
        
        while (true) {
          const batch = await getAllVehicles(currentSkip, batchSize);
          if (batch.length === 0) break;
          
          allVehicles.push(...batch);
          currentSkip += batchSize;
          
          if (batch.length < batchSize) break;
        }
        
        console.log('✅ Loaded', allVehicles.length, 'total vehicles');
        setAllCars(allVehicles);
      } catch (err) {
        console.error('❌ Failed to load vehicles:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVehicles();
  }, [cars, recommendedCarIds]); // Re-fetch when recommendedCarIds changes

  // Display logic:
  // 1. If we loaded from AiSuggested.json, allCars already contains only recommended cars
  // 2. If we have recommendedCarIds but loaded all cars, filter to recommended IDs
  // 3. Otherwise, show all cars
  // 4. Apply search filter on top
  
  let displayCars = allCars;
  
  // If AI has recommended specific cars, ensure we only show those
  if (recommendedCarIds && recommendedCarIds.length > 0) {
    // Check if we already loaded only recommended cars from AiSuggested.json
    const allCarsAreRecommended = allCars.length > 0 && 
      allCars.every(car => recommendedCarIds.includes(car.id));
    
    if (!allCarsAreRecommended && allCars.length > recommendedCarIds.length) {
      // We have all cars loaded, so filter to recommended IDs
      displayCars = allCars.filter((car) => recommendedCarIds.includes(car.id));
      console.log(`🎯 Filtered to ${displayCars.length} recommended vehicles (from ${allCars.length} total)`);
    } else if (allCarsAreRecommended) {
      // Already showing only recommended cars from AiSuggested.json
      console.log(`✅ Displaying ${displayCars.length} recommended vehicles from AiSuggested.json`);
    }
  }
  
  // Apply search filter on top
  if (searchQuery.trim()) {
    const searchLower = searchQuery.toLowerCase();
    const beforeSearch = displayCars.length;
    displayCars = displayCars.filter((car) => {
      const carTitle = `${car.year} ${car.make} ${car.model} ${car.trim}`.toLowerCase();
      return carTitle.includes(searchLower);
    });
    console.log(`🔍 Search "${searchQuery}" filtered to ${displayCars.length} vehicles (from ${beforeSearch})`);
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

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
            <h3 className={styles.title}>
              {recommendedCarIds && recommendedCarIds.length > 0 ? (
                <>✨ AI Recommended Vehicles</>
              ) : (
                <>All Available Vehicles</>
              )}
            </h3>
            <p className={styles.subtitle}>
              {recommendedCarIds && recommendedCarIds.length > 0 ? (
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
            <p className={styles.noResultsText}>No vehicles found matching "{searchQuery}"</p>
            <p className={styles.noResultsHint}>Try adjusting your search terms</p>
          </div>
        ) : (
          displayCars.map((car, index) => (
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

