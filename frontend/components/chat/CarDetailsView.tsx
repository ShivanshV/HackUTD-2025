'use client';

import React from 'react';
import { Vehicle, UserPreferences } from '@/lib/types/chat';
import styles from './CarDetailsView.module.css';
import { 
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

interface CarDetailsViewProps {
  car: Vehicle;
  onBack: () => void;
  userPreferences?: UserPreferences;
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
          {car.image_url ? (
            <img 
              src={car.image_url} 
              alt={`${car.year} ${car.make} ${car.model}`}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className={styles.imagePlaceholder}>
              <span className={styles.carEmoji}>🚗</span>
            </div>
          )}
        </div>
        <div className={styles.heroContent}>
          <h1 className={styles.carTitle}>{car.year} {car.make} {car.model}</h1>
          <p className={styles.carSubtitle}>{car.trim} • {car.specs.body_style}</p>
          <p className={styles.description}>{car.description}</p>
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

      {/* Annual Ownership Costs with Charts */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Estimated Annual Costs</h2>
        <div className={styles.chartsContainer}>
          {/* Left: Pie Chart */}
          <div className={styles.chartBox}>
            <h3 className={styles.chartTitle}>Annual Cost Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Fuel', value: car.annual_fuel_cost, color: '#FF6384' },
                    { name: 'Insurance', value: car.annual_insurance, color: '#36A2EB' },
                    { name: 'Maintenance', value: car.annual_maintenance, color: '#FFCE56' }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[
                    { name: 'Fuel', value: car.annual_fuel_cost, color: '#FF6384' },
                    { name: 'Insurance', value: car.annual_insurance, color: '#36A2EB' },
                    { name: 'Maintenance', value: car.annual_maintenance, color: '#FFCE56' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatPrice(value)} />
              </PieChart>
            </ResponsiveContainer>
            <div className={styles.chartSummary}>
              <div className={styles.summaryItem}>
                <span className={styles.dot} style={{ background: '#FF6384' }}></span>
                <span>Fuel: {formatPrice(car.annual_fuel_cost)}/year</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.dot} style={{ background: '#36A2EB' }}></span>
                <span>Insurance: {formatPrice(car.annual_insurance)}/year</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.dot} style={{ background: '#FFCE56' }}></span>
                <span>Maintenance: {formatPrice(car.annual_maintenance)}/year</span>
              </div>
              <div className={styles.summaryTotal}>
                Total Annual: {formatPrice(car.annual_fuel_cost + car.annual_insurance + car.annual_maintenance)}
              </div>
            </div>
          </div>

          {/* Right: 5-Year Cost Projection */}
          <div className={styles.chartBox}>
            <h3 className={styles.chartTitle}>5-Year Total Cost of Ownership</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={[
                  { year: 'Purchase', cost: car.specs.pricing.base_msrp },
                  { year: 'Year 1', cost: car.specs.pricing.base_msrp + (car.annual_fuel_cost + car.annual_insurance + car.annual_maintenance) * 1 },
                  { year: 'Year 2', cost: car.specs.pricing.base_msrp + (car.annual_fuel_cost + car.annual_insurance + car.annual_maintenance) * 2 },
                  { year: 'Year 3', cost: car.specs.pricing.base_msrp + (car.annual_fuel_cost + car.annual_insurance + car.annual_maintenance) * 3 },
                  { year: 'Year 4', cost: car.specs.pricing.base_msrp + (car.annual_fuel_cost + car.annual_insurance + car.annual_maintenance) * 4 },
                  { year: 'Year 5', cost: car.specs.pricing.base_msrp + (car.annual_fuel_cost + car.annual_insurance + car.annual_maintenance) * 5 }
                ]}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => formatPrice(value)} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="cost" 
                  stroke="#EB0A1E" 
                  strokeWidth={3}
                  name="Total Cost"
                  dot={{ fill: '#EB0A1E', r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className={styles.chartNote}>
              <strong>5-Year Total: {formatPrice(
                car.specs.pricing.base_msrp + 
                (car.annual_fuel_cost + car.annual_insurance + car.annual_maintenance) * 5
              )}</strong>
              <p>Includes purchase price + 5 years of fuel, insurance, and maintenance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Options with Bar Chart */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Estimated Monthly Payments</h2>
        <div className={styles.paymentsWrapper}>
          {/* Payment Cards - Now on Top */}
          <div className={styles.paymentCardsRow}>
            <div className={styles.paymentCard}>
              <div className={styles.paymentType}>💳 LEASE</div>
              <div className={styles.paymentAmount}>{formatPrice(car.specs.pricing.est_lease_monthly)}/mo</div>
              <div className={styles.paymentTerms}>36-month lease</div>
              <div className={styles.paymentTotal}>
                Total: {formatPrice(car.specs.pricing.est_lease_monthly * 36)}
              </div>
            </div>
            <div className={styles.paymentCard}>
              <div className={styles.paymentType}>🏦 FINANCE</div>
              <div className={styles.paymentAmount}>{formatPrice(car.specs.pricing.est_loan_monthly)}/mo</div>
              <div className={styles.paymentTerms}>60-month loan</div>
              <div className={styles.paymentTotal}>
                Total: {formatPrice(car.specs.pricing.est_loan_monthly * 60)}
              </div>
            </div>
          </div>

          {/* Comparison Chart - Below Cards */}
          <div className={styles.comparisonChartBox}>
            <h3 className={styles.chartSubtitle}>Lease vs Finance Comparison</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={[
                  { 
                    option: 'Lease (36 months)', 
                    monthly: car.specs.pricing.est_lease_monthly,
                    total: car.specs.pricing.est_lease_monthly * 36
                  },
                  { 
                    option: 'Finance (60 months)', 
                    monthly: car.specs.pricing.est_loan_monthly,
                    total: car.specs.pricing.est_loan_monthly * 60
                  }
                ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="option" 
                  tick={{ fill: '#666', fontSize: 12 }}
                />
                <YAxis 
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  tick={{ fill: '#666', fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => {
                    if (name === 'Monthly Payment') return `$${value}/month`;
                    return formatPrice(value);
                  }}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '12px'
                  }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
                <Bar 
                  dataKey="monthly" 
                  fill="#EB0A1E" 
                  name="Monthly Payment"
                  radius={[8, 8, 0, 0]}
                />
                <Bar 
                  dataKey="total" 
                  fill="#FF6B6B" 
                  name="Total Paid"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Dealer Inventory */}
      {car.dealerInventory && car.dealerInventory.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Available at Local Dealers</h2>
          <div className={styles.dealerGrid}>
            {car.dealerInventory.map((dealer, index) => (
              <div key={index} className={styles.dealerCard}>
                <div className={styles.dealerName}>{dealer.dealer}</div>
                <div className={styles.dealerStock}>
                  {dealer.stock} {dealer.stock === 1 ? 'vehicle' : 'vehicles'} in stock
                </div>
                <div className={styles.dealerPrice}>{formatPrice(dealer.price)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

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

