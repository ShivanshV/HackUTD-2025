'use client';

import React, { useState } from 'react';
import styles from './CatalogResults.module.css';

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

  // Fetch cars from backend based on filters
  React.useEffect(() => {
    const fetchCars = async () => {
      setLoading(true);
      
      try {
        // Build query parameters
        const params = new URLSearchParams();
        
        if (filters.model !== 'All Toyota Models') {
          params.append('model', filters.model);
        }
        if (filters.bodyStyle !== 'All Body Styles') {
          params.append('body_style', filters.bodyStyle.toLowerCase());
        }
        
        // Add limit to get more results
        params.append('limit', '100');
        
        // Fetch from backend API using search endpoint
        const response = await fetch(`http://localhost:8000/api/vehicles/search?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch vehicles');
        }
        
        const data = await response.json();
        setCars(data);
      } catch (error) {
        console.error('Error fetching cars:', error);
        // Fallback to empty array if API fails
        setCars([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, [filters]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Sort cars based on selected option
  const sortedCars = React.useMemo(() => {
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
            {filters.status} • {filters.bodyStyle} • Near {filters.zipCode}
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
                  <button className={styles.viewDetailsBtn}>
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

