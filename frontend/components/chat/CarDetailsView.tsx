'use client';

import React from 'react';
import styles from './CarDetailsView.module.css';

interface CarDetails {
  id: string;
  make: string;
  model: string;
  trim: string;
  year: number;
  image?: string;
  specs: {
    body_style: string;
    size_class: string;
    pricing: {
      base_msrp: number;
      msrp_range: number[];
      est_lease_monthly: number;
      est_loan_monthly: number;
    };
    powertrain: {
      fuel_type: string;
      drivetrain: string;
      mpg_city: number;
      mpg_hwy: number;
      mpg_combined: number;
      est_range_miles: number;
    };
    capacity: {
      seats: number;
      rear_seat_child_seat_fit: string;
      isofix_latch_points: boolean;
      cargo_volume_l: number;
      fold_flat_rear_seats: boolean;
    };
    dimensions: {
      length_mm: number;
      width_mm: number;
      height_mm: number;
      turning_radius_m: number;
    };
    comfort: {
      ride_comfort_score: number;
      noise_level_score: number;
    };
    parking_tags: {
      city_friendly: boolean;
      tight_space_ok: boolean;
    };
    environment_fit: {
      ground_clearance_in: number;
      offroad_capable: boolean;
      rough_road_score: number;
      snow_rain_score: number;
    };
    safety: {
      has_tss: boolean;
      airbags: number;
      driver_assist: string[];
      crash_test_score: number;
    };
  };
  derived_scores: {
    eco_score: number;
    family_friendly_score: number;
    city_commute_score: number;
    road_trip_score: number;
  };
}

interface CarDetailsViewProps {
  car: CarDetails;
  onBack: () => void;
  userPreferences?: {
    hasFamily?: boolean;
    longCommute?: boolean;
    ecoConscious?: boolean;
    cityDriver?: boolean;
  };
}

const CarDetailsView: React.FC<CarDetailsViewProps> = ({ car, onBack, userPreferences = {} }) => {
  const formatPrice = (price: number) => {
    return `$${price.toLocaleString()}`;
  };

  const formatFuelType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return '#22C55E'; // Green
    if (score >= 0.6) return '#EAB308'; // Yellow
    return '#EF4444'; // Red
  };

  const renderScoreBar = (label: string, score: number, icon: string) => {
    const percentage = score * 100;
    return (
      <div className={styles.scoreBar}>
        <div className={styles.scoreLabel}>
          <span className={styles.scoreIcon}>{icon}</span>
          <span>{label}</span>
        </div>
        <div className={styles.scoreBarContainer}>
          <div 
            className={styles.scoreBarFill} 
            style={{ 
              width: `${percentage}%`,
              backgroundColor: getScoreColor(score)
            }}
          />
        </div>
        <span className={styles.scoreValue}>{Math.round(percentage)}%</span>
      </div>
    );
  };

  const getPersonalizedMessage = () => {
    const messages = [];
    
    if (userPreferences.hasFamily && car.derived_scores.family_friendly_score >= 0.8) {
      messages.push({
        icon: '👨‍👩‍👧‍👦',
        title: 'Perfect for Your Growing Family',
        text: `With ${car.specs.capacity.seats} seats, ${car.specs.capacity.cargo_volume_l}L of cargo space, and excellent child seat compatibility, this ${car.model} adapts to your family's needs.`
      });
    }

    if (userPreferences.longCommute && car.specs.powertrain.mpg_combined >= 35) {
      messages.push({
        icon: '⛽',
        title: 'Exceptional Fuel Efficiency',
        text: `Save money on your daily commute with an impressive ${car.specs.powertrain.mpg_combined} MPG combined. That's approximately ${car.specs.powertrain.est_range_miles} miles per tank!`
      });
    }

    if (userPreferences.ecoConscious && car.derived_scores.eco_score >= 0.7) {
      messages.push({
        icon: '🌱',
        title: 'Environmentally Conscious Choice',
        text: `This ${formatFuelType(car.specs.powertrain.fuel_type)} powertrain reduces your carbon footprint while delivering excellent performance.`
      });
    }

    if (userPreferences.cityDriver && car.derived_scores.city_commute_score >= 0.7) {
      messages.push({
        icon: '🏙️',
        title: 'Built for City Life',
        text: `With a tight ${car.specs.dimensions.turning_radius_m}m turning radius and compact dimensions, navigating city streets and parking is effortless.`
      });
    }

    // Default messages if no preferences match
    if (messages.length === 0) {
      messages.push({
        icon: '⭐',
        title: 'Exceptional All-Around Performance',
        text: `The ${car.year} ${car.model} ${car.trim} offers a perfect blend of comfort, safety, and reliability that Toyota is known for.`
      });
    }

    return messages;
  };

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <div className={styles.hero}>
        <button className={styles.backButton} onClick={onBack}>
          ← Back to Chat
        </button>
        <div className={styles.heroImage}>
          {car.image ? (
            <img src={car.image} alt={`${car.year} ${car.model}`} />
          ) : (
            <div className={styles.imagePlaceholder}>
              <span className={styles.carEmoji}>🚗</span>
            </div>
          )}
        </div>
        <div className={styles.heroContent}>
          <h1 className={styles.carTitle}>{car.year} {car.model}</h1>
          <p className={styles.carSubtitle}>{car.trim} • {car.specs.body_style}</p>
          <p className={styles.price}>Starting MSRP {formatPrice(car.specs.pricing.base_msrp)}*</p>
          <div className={styles.heroCtas}>
            <button className={styles.ctaPrimary}>Build & Price</button>
            <button className={styles.ctaSecondary}>Schedule Test Drive</button>
          </div>
        </div>
      </div>

      {/* Personalized Recommendations */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Why This Car is Perfect for You</h2>
        <div className={styles.recommendationsGrid}>
          {getPersonalizedMessage().map((message, index) => (
            <div key={index} className={styles.recommendationCard}>
              <div className={styles.recIcon}>{message.icon}</div>
              <h3 className={styles.recTitle}>{message.title}</h3>
              <p className={styles.recText}>{message.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Key Scores */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Performance Ratings</h2>
        <div className={styles.scoresContainer}>
          {renderScoreBar('Eco-Friendliness', car.derived_scores.eco_score, '🌿')}
          {renderScoreBar('Family Friendly', car.derived_scores.family_friendly_score, '👨‍👩‍👧')}
          {renderScoreBar('City Commute', car.derived_scores.city_commute_score, '🏙️')}
          {renderScoreBar('Road Trip Ready', car.derived_scores.road_trip_score, '🛣️')}
          {renderScoreBar('Safety Rating', car.specs.safety.crash_test_score, '🛡️')}
          {renderScoreBar('Ride Comfort', car.specs.comfort.ride_comfort_score, '💺')}
        </div>
      </div>

      {/* Fuel Efficiency Chart */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Fuel Efficiency</h2>
        <div className={styles.fuelChart}>
          <div className={styles.fuelBar}>
            <div className={styles.fuelBarLabel}>City</div>
            <div className={styles.fuelBarGraph}>
              <div 
                className={styles.fuelBarFill}
                style={{ width: `${(car.specs.powertrain.mpg_city / 60) * 100}%` }}
              >
                <span className={styles.fuelBarValue}>{car.specs.powertrain.mpg_city} MPG</span>
              </div>
            </div>
          </div>
          <div className={styles.fuelBar}>
            <div className={styles.fuelBarLabel}>Highway</div>
            <div className={styles.fuelBarGraph}>
              <div 
                className={styles.fuelBarFill}
                style={{ width: `${(car.specs.powertrain.mpg_hwy / 60) * 100}%` }}
              >
                <span className={styles.fuelBarValue}>{car.specs.powertrain.mpg_hwy} MPG</span>
              </div>
            </div>
          </div>
          <div className={styles.fuelBar}>
            <div className={styles.fuelBarLabel}>Combined</div>
            <div className={styles.fuelBarGraph}>
              <div 
                className={styles.fuelBarFill}
                style={{ width: `${(car.specs.powertrain.mpg_combined / 60) * 100}%` }}
              >
                <span className={styles.fuelBarValue}>{car.specs.powertrain.mpg_combined} MPG</span>
              </div>
            </div>
          </div>
          <div className={styles.rangeInfo}>
            <span className={styles.rangeIcon}>⛽</span>
            <span>Estimated Range: <strong>{car.specs.powertrain.est_range_miles} miles</strong></span>
          </div>
        </div>
      </div>

      {/* Key Specs Grid */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Key Specifications</h2>
        <div className={styles.specsGrid}>
          <div className={styles.specCard}>
            <div className={styles.specIcon}>💰</div>
            <div className={styles.specLabel}>Starting Price</div>
            <div className={styles.specValue}>{formatPrice(car.specs.pricing.base_msrp)}</div>
          </div>
          <div className={styles.specCard}>
            <div className={styles.specIcon}>⛽</div>
            <div className={styles.specLabel}>Fuel Type</div>
            <div className={styles.specValue}>{formatFuelType(car.specs.powertrain.fuel_type)}</div>
          </div>
          <div className={styles.specCard}>
            <div className={styles.specIcon}>🚗</div>
            <div className={styles.specLabel}>Drivetrain</div>
            <div className={styles.specValue}>{car.specs.powertrain.drivetrain}</div>
          </div>
          <div className={styles.specCard}>
            <div className={styles.specIcon}>👥</div>
            <div className={styles.specLabel}>Seating</div>
            <div className={styles.specValue}>{car.specs.capacity.seats} Seats</div>
          </div>
          <div className={styles.specCard}>
            <div className={styles.specIcon}>📦</div>
            <div className={styles.specLabel}>Cargo Space</div>
            <div className={styles.specValue}>{car.specs.capacity.cargo_volume_l}L</div>
          </div>
          <div className={styles.specCard}>
            <div className={styles.specIcon}>🛡️</div>
            <div className={styles.specLabel}>Airbags</div>
            <div className={styles.specValue}>{car.specs.safety.airbags}</div>
          </div>
        </div>
      </div>

      {/* Safety Features */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Advanced Safety Features</h2>
        <div className={styles.safetyGrid}>
          {car.specs.safety.has_tss && (
            <div className={styles.featureChip}>
              <span className={styles.chipIcon}>✓</span> Toyota Safety Sense
            </div>
          )}
          {car.specs.safety.driver_assist.map((feature, index) => (
            <div key={index} className={styles.featureChip}>
              <span className={styles.chipIcon}>✓</span> {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </div>
          ))}
        </div>
      </div>

      {/* Payment Options */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Estimated Monthly Payments</h2>
        <div className={styles.paymentOptions}>
          <div className={styles.paymentCard}>
            <div className={styles.paymentType}>Lease</div>
            <div className={styles.paymentAmount}>{formatPrice(car.specs.pricing.est_lease_monthly)}/mo</div>
            <div className={styles.paymentTerms}>36-month lease</div>
          </div>
          <div className={styles.paymentCard}>
            <div className={styles.paymentType}>Finance</div>
            <div className={styles.paymentAmount}>{formatPrice(car.specs.pricing.est_loan_monthly)}/mo</div>
            <div className={styles.paymentTerms}>60-month loan</div>
          </div>
        </div>
      </div>

      {/* CTA Footer */}
      <div className={styles.footer}>
        <h2 className={styles.footerTitle}>Ready to Experience the {car.model}?</h2>
        <div className={styles.footerCtas}>
          <button className={styles.ctaPrimary}>Schedule Test Drive</button>
          <button className={styles.ctaSecondary}>Get a Quote</button>
          <button className={styles.ctaSecondary}>Find a Dealer</button>
        </div>
      </div>
    </div>
  );
};

export default CarDetailsView;

