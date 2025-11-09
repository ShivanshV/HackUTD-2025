'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import { Vehicle } from '@/lib/types/chat';
import { getAllVehicles } from '@/lib/api/vehicles';
import styles from './page.module.css';

export default function ComparePage() {
  const router = useRouter();
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicles, setSelectedVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [reportOptions, setReportOptions] = useState({
    pricing: true,
    performance: true,
    safety: true,
    dimensions: true,
  });

  // Fetch all vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const vehicles: Vehicle[] = [];
        let currentSkip = 0;
        const batchSize = 100;

        while (true) {
          const batch = await getAllVehicles(currentSkip, batchSize);
          if (batch.length === 0) break;
          
          vehicles.push(...batch);
          currentSkip += batchSize;
          
          if (batch.length < batchSize) break;
        }
        
        setAllVehicles(vehicles);
      } catch (err) {
        console.error('Failed to load vehicles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  const handleVehicleSelect = (vehicle: Vehicle) => {
    if (selectedVehicles.find(v => v.id === vehicle.id)) {
      setSelectedVehicles(selectedVehicles.filter(v => v.id !== vehicle.id));
    } else if (selectedVehicles.length < 3) {
      setSelectedVehicles([...selectedVehicles, vehicle]);
    }
  };

  const filteredVehicles = allVehicles.filter((vehicle) => {
    if (!searchQuery.trim()) return true;
    const searchLower = searchQuery.toLowerCase();
    const vehicleName = `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim}`.toLowerCase();
    return vehicleName.includes(searchLower);
  });

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
      <div className={styles.container}>
        <Header />
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading vehicles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Compare Vehicles</h1>
          <p className={styles.subtitle}>
            Select up to 3 vehicles to compare side-by-side
          </p>
        </div>

        {selectedVehicles.length > 0 && (
          <div className={styles.comparisonSection}>
            <div className={styles.comparisonHeader}>
              <h2>Selected Vehicles ({selectedVehicles.length}/3)</h2>
              <button 
                className={styles.clearButton}
                onClick={() => setSelectedVehicles([])}
              >
                Clear All
              </button>
            </div>
            <div className={styles.comparisonGrid}>
              {selectedVehicles.map((vehicle) => (
                <div key={vehicle.id} className={styles.comparisonCard}>
                  <button 
                    className={styles.removeButton}
                    onClick={() => handleVehicleSelect(vehicle)}
                  >
                    ×
                  </button>
                  <div className={styles.comparisonImageContainer}>
                    {vehicle.image_url ? (
                      <img 
                        src={vehicle.image_url} 
                        alt={`${vehicle.year} ${vehicle.model}`}
                        className={styles.comparisonImage}
                      />
                    ) : (
                      <div className={styles.comparisonImagePlaceholder}>🚗</div>
                    )}
                  </div>
                  <div className={styles.vehicleHeader}>
                    <h3>{vehicle.year} {vehicle.make}</h3>
                    <h4>{vehicle.model} {vehicle.trim}</h4>
                  </div>
                  <div className={styles.specs}>
                    <div className={styles.specCategory}>
                      <h5 className={styles.categoryTitle}>💰 Pricing</h5>
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>Base MSRP</span>
                        <span className={styles.specValue}>
                          {formatPrice(vehicle.specs.pricing.base_msrp)}
                        </span>
                      </div>
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>Est. Lease/Month</span>
                        <span className={styles.specValue}>
                          {formatPrice(vehicle.specs.pricing.est_lease_monthly)}
                        </span>
                      </div>
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>Est. Finance/Month</span>
                        <span className={styles.specValue}>
                          {formatPrice(vehicle.specs.pricing.est_loan_monthly)}
                        </span>
                      </div>
                    </div>

                    <div className={styles.specCategory}>
                      <h5 className={styles.categoryTitle}>⚡ Performance</h5>
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>MPG (City/Hwy/Combined)</span>
                        <span className={styles.specValue}>
                          {vehicle.specs.powertrain.mpg_city}/{vehicle.specs.powertrain.mpg_hwy}/{vehicle.specs.powertrain.mpg_combined}
                        </span>
                      </div>
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>Fuel Type</span>
                        <span className={styles.specValue}>{vehicle.specs.powertrain.fuel_type}</span>
                      </div>
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>Drivetrain</span>
                        <span className={styles.specValue}>{vehicle.specs.powertrain.drivetrain}</span>
                      </div>
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>Est. Range</span>
                        <span className={styles.specValue}>{vehicle.specs.powertrain.est_range_miles} mi</span>
                      </div>
                    </div>

                    <div className={styles.specCategory}>
                      <h5 className={styles.categoryTitle}>🚗 Dimensions & Specs</h5>
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>Body Style</span>
                        <span className={styles.specValue}>{vehicle.specs.body_style}</span>
                      </div>
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>Size Class</span>
                        <span className={styles.specValue}>{vehicle.specs.size_class}</span>
                      </div>
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>Length × Width × Height</span>
                        <span className={styles.specValue}>
                          {vehicle.specs.dimensions.length_mm}mm × {vehicle.specs.dimensions.width_mm}mm × {vehicle.specs.dimensions.height_mm}mm
                        </span>
                      </div>
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>Turning Radius</span>
                        <span className={styles.specValue}>{vehicle.specs.dimensions.turning_radius_m}m</span>
                      </div>
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>Ground Clearance</span>
                        <span className={styles.specValue}>{vehicle.specs.environment_fit.ground_clearance_in}"</span>
                      </div>
                    </div>

                    <div className={styles.specCategory}>
                      <h5 className={styles.categoryTitle}>👥 Capacity</h5>
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>Seating</span>
                        <span className={styles.specValue}>{vehicle.specs.capacity.seats} seats</span>
                      </div>
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>Cargo Volume</span>
                        <span className={styles.specValue}>{vehicle.specs.capacity.cargo_volume_l}L</span>
                      </div>
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>Rear Seat Child Fit</span>
                        <span className={styles.specValue}>{vehicle.specs.capacity.rear_seat_child_seat_fit}</span>
                      </div>
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>ISOFIX/LATCH</span>
                        <span className={styles.specValue}>{vehicle.specs.capacity.isofix_latch_points ? 'Yes' : 'No'}</span>
                      </div>
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>Fold-Flat Seats</span>
                        <span className={styles.specValue}>{vehicle.specs.capacity.fold_flat_rear_seats ? 'Yes' : 'No'}</span>
                      </div>
                    </div>

                    <div className={styles.specCategory}>
                      <h5 className={styles.categoryTitle}>🛡️ Safety</h5>
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>Crash Test Score</span>
                        <span className={styles.specValue}>
                          {(vehicle.specs.safety.crash_test_score * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>Toyota Safety Sense</span>
                        <span className={styles.specValue}>
                          {vehicle.specs.safety.has_tss ? `Yes (${vehicle.specs.safety.tss_version || 'N/A'})` : 'No'}
                        </span>
                      </div>
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>Airbags</span>
                        <span className={styles.specValue}>{vehicle.specs.safety.airbags}</span>
                      </div>
                    </div>

                    <div className={styles.specCategory}>
                      <h5 className={styles.categoryTitle}>💵 Annual Costs</h5>
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>Fuel</span>
                        <span className={styles.specValue}>
                          {vehicle.annual_fuel_cost ? formatPrice(vehicle.annual_fuel_cost) : 'N/A'}
                        </span>
                      </div>
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>Insurance</span>
                        <span className={styles.specValue}>
                          {vehicle.annual_insurance ? formatPrice(vehicle.annual_insurance) : 'N/A'}
                        </span>
                      </div>
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>Maintenance</span>
                        <span className={styles.specValue}>
                          {vehicle.annual_maintenance ? formatPrice(vehicle.annual_maintenance) : 'N/A'}
                        </span>
                      </div>
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>Total Annual</span>
                        <span className={styles.specValue}>
                          {vehicle.annual_fuel_cost && vehicle.annual_insurance && vehicle.annual_maintenance
                            ? formatPrice(vehicle.annual_fuel_cost + vehicle.annual_insurance + vehicle.annual_maintenance)
                            : 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className={styles.specCategory}>
                      <h5 className={styles.categoryTitle}>⭐ Ratings</h5>
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>Eco Score</span>
                        <span className={styles.specValue}>
                          {(vehicle.derived_scores.eco_score * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>Family Friendly</span>
                        <span className={styles.specValue}>
                          {(vehicle.derived_scores.family_friendly_score * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>City Commute</span>
                        <span className={styles.specValue}>
                          {(vehicle.derived_scores.city_commute_score * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>Road Trip Ready</span>
                        <span className={styles.specValue}>
                          {(vehicle.derived_scores.road_trip_score * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>Ride Comfort</span>
                        <span className={styles.specValue}>
                          {(vehicle.specs.comfort.ride_comfort_score * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>Noise Level</span>
                        <span className={styles.specValue}>
                          {(vehicle.specs.comfort.noise_level_score * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    <div className={styles.specCategory}>
                      <h5 className={styles.categoryTitle}>🏙️ City/Environment Fit</h5>
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>City Friendly</span>
                        <span className={styles.specValue}>
                          {vehicle.specs.parking_tags.city_friendly ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>Tight Space OK</span>
                        <span className={styles.specValue}>
                          {vehicle.specs.parking_tags.tight_space_ok ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>Offroad Capable</span>
                        <span className={styles.specValue}>
                          {vehicle.specs.environment_fit.offroad_capable ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>Rough Road Score</span>
                        <span className={styles.specValue}>
                          {(vehicle.specs.environment_fit.rough_road_score * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>Snow/Rain Score</span>
                        <span className={styles.specValue}>
                          {(vehicle.specs.environment_fit.snow_rain_score * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedVehicles.length >= 2 && (
              <div className={styles.reportSection}>
                <div className={styles.reportHeader}>
                  <div className={styles.reportInfo}>
                    <h3>📊 Generate Comparison Report</h3>
                    <p>Export a detailed comparison report of your selected vehicles</p>
                  </div>
                </div>
                <div className={styles.reportOptions}>
                  <label className={styles.checkboxLabel}>
                    <input 
                      type="checkbox" 
                      checked={reportOptions.pricing}
                      onChange={(e) => setReportOptions({ ...reportOptions, pricing: e.target.checked })}
                    />
                    <span>Include Pricing & Costs</span>
                  </label>
                  <label className={styles.checkboxLabel}>
                    <input 
                      type="checkbox" 
                      checked={reportOptions.performance}
                      onChange={(e) => setReportOptions({ ...reportOptions, performance: e.target.checked })}
                    />
                    <span>Include Performance & Fuel Economy</span>
                  </label>
                  <label className={styles.checkboxLabel}>
                    <input 
                      type="checkbox" 
                      checked={reportOptions.safety}
                      onChange={(e) => setReportOptions({ ...reportOptions, safety: e.target.checked })}
                    />
                    <span>Include Safety & Ratings</span>
                  </label>
                  <label className={styles.checkboxLabel}>
                    <input 
                      type="checkbox" 
                      checked={reportOptions.dimensions}
                      onChange={(e) => setReportOptions({ ...reportOptions, dimensions: e.target.checked })}
                    />
                    <span>Include Dimensions & Capacity</span>
                  </label>
                </div>
                <div className={styles.reportActions}>
                  <button 
                    className={styles.reportButton}
                    onClick={() => {
                      const vehicleIds = selectedVehicles.map(v => v.id).join(',');
                      const options = JSON.stringify(reportOptions);
                      router.push(`/compare/report?vehicles=${vehicleIds}&options=${encodeURIComponent(options)}`);
                    }}
                  >
                    <span className={styles.buttonIcon}>📄</span>
                    View Report
                  </button>
                  <button className={styles.reportButtonSecondary}>
                    <span className={styles.buttonIcon}>📧</span>
                    Email Report
                  </button>
                  <button className={styles.reportButtonSecondary}>
                    <span className={styles.buttonIcon}>🖨️</span>
                    Print Report
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className={styles.selectionSection}>
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

          <div className={styles.vehicleGrid}>
            {filteredVehicles.map((vehicle) => {
              const isSelected = selectedVehicles.find(v => v.id === vehicle.id);
              const canSelect = selectedVehicles.length < 3 || isSelected;

              return (
                <div
                  key={vehicle.id}
                  className={`${styles.vehicleCard} ${isSelected ? styles.selected : ''} ${!canSelect ? styles.disabled : ''}`}
                  onClick={() => canSelect && handleVehicleSelect(vehicle)}
                >
                  {isSelected && (
                    <div className={styles.selectedBadge}>✓ Selected</div>
                  )}
                  <div className={styles.vehicleImage}>
                    {vehicle.image_url ? (
                      <img 
                        src={vehicle.image_url} 
                        alt={`${vehicle.year} ${vehicle.model}`}
                        className={styles.vehicleImageImg}
                      />
                    ) : (
                      <div className={styles.imagePlaceholder}>🚗</div>
                    )}
                  </div>
                  <div className={styles.vehicleInfo}>
                    <h4 className={styles.vehicleName}>
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h4>
                    <p className={styles.vehicleTrim}>{vehicle.trim}</p>
                    <p className={styles.vehiclePrice}>
                      {formatPrice(vehicle.specs.pricing.base_msrp)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

