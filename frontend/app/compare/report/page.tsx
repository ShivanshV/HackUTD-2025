'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/ui/Header';
import { Vehicle } from '@/lib/types/chat';
import { getVehicleById } from '@/lib/api/vehicles';
import styles from './page.module.css';
import {
  BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

export default function ComparisonReportPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState({
    pricing: true,
    performance: true,
    safety: true,
    dimensions: true,
  });

  useEffect(() => {
    const vehicleIds = searchParams.get('vehicles')?.split(',') || [];
    const optionsParam = searchParams.get('options');
    
    if (optionsParam) {
      try {
        setOptions(JSON.parse(optionsParam));
      } catch (e) {
        console.error('Failed to parse options:', e);
      }
    }

    const fetchVehicles = async () => {
      try {
        const fetchedVehicles = await Promise.all(
          vehicleIds.map(id => getVehicleById(id))
        );
        setVehicles(fetchedVehicles);
      } catch (err) {
        console.error('Failed to load vehicles:', err);
      } finally {
        setLoading(false);
      }
    };

    if (vehicleIds.length > 0) {
      fetchVehicles();
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const colors = ['#EB0A1E', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'];

  if (loading) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Generating report...</p>
        </div>
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.error}>
          <h2>No vehicles to compare</h2>
          <button onClick={() => router.push('/compare')} className={styles.backButton}>
            Back to Compare
          </button>
        </div>
      </div>
    );
  }

  const printReport = () => {
    window.print();
  };

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.reportActions}>
        <button onClick={() => router.push('/compare')} className={styles.backButton}>
          ← Back to Compare
        </button>
        <button onClick={printReport} className={styles.printButton}>
          🖨️ Print Report
        </button>
      </div>
      
      <main className={styles.main}>
        <div className={styles.reportHeader}>
          <h1 className={styles.reportTitle}>Vehicle Comparison Report</h1>
          <p className={styles.reportDate}>Generated on {new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
        </div>

        {/* Vehicle Summary */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Vehicle Summary</h2>
          <div className={styles.summaryGrid}>
            {vehicles.map((vehicle, index) => (
              <div key={vehicle.id} className={styles.summaryCard}>
                <div className={styles.vehicleBadge} style={{ backgroundColor: colors[index] }}>
                  Vehicle {index + 1}
                </div>
                <h3 className={styles.vehicleName}>
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </h3>
                <div className={styles.vehicleMetaRow}>
                  <p className={styles.vehicleTrim}>{vehicle.trim}</p>
                  {vehicle.condition && (
                    <span className={styles.conditionBadge}>{vehicle.condition}</span>
                  )}
                </div>
                <div className={styles.quickStats}>
                  <div className={styles.quickStat}>
                    <span className={styles.quickStatLabel}>MSRP</span>
                    <span className={styles.quickStatValue}>
                      {formatPrice(vehicle.specs.pricing.base_msrp)}
                    </span>
                  </div>
                  <div className={styles.quickStat}>
                    <span className={styles.quickStatLabel}>MPG</span>
                    <span className={styles.quickStatValue}>
                      {vehicle.specs.powertrain.mpg_combined}
                    </span>
                  </div>
                  <div className={styles.quickStat}>
                    <span className={styles.quickStatLabel}>Seats</span>
                    <span className={styles.quickStatValue}>
                      {vehicle.specs.capacity.seats}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing & Costs */}
        {options.pricing && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>💰 Pricing & Costs Analysis</h2>
            
            <div className={styles.chartContainer}>
              <h3 className={styles.chartTitle}>Base MSRP Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={vehicles.map((v, i) => ({
                  name: `${v.make} ${v.model}`,
                  msrp: v.specs.pricing.base_msrp,
                  fill: colors[i]
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => formatPrice(value)} />
                  <Bar dataKey="msrp" radius={[8, 8, 0, 0]}>
                    {vehicles.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className={styles.chartContainer}>
              <h3 className={styles.chartTitle}>Monthly Payment Options</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={vehicles.flatMap((v, i) => [
                  {
                    vehicle: `${v.make} ${v.model}`,
                    type: 'Lease',
                    amount: v.specs.pricing.est_lease_monthly,
                    fill: colors[i]
                  },
                  {
                    vehicle: `${v.make} ${v.model}`,
                    type: 'Finance',
                    amount: v.specs.pricing.est_loan_monthly,
                    fill: colors[i]
                  }
                ])}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="vehicle" />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip formatter={(value: number) => formatPrice(value)} />
                  <Legend />
                  <Bar dataKey="amount" name="Monthly Payment" radius={[8, 8, 0, 0]}>
                    {vehicles.flatMap((_, i) => [
                      <Cell key={`lease-${i}`} fill={colors[i]} />,
                      <Cell key={`finance-${i}`} fill={colors[i]} opacity={0.6} />
                    ])}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className={styles.comparisonTable}>
              <table>
                <thead>
                  <tr>
                    <th>Pricing</th>
                    {vehicles.map((vehicle, index) => (
                      <th key={vehicle.id}>
                        <span className={styles.tableVehicleBadge} style={{ backgroundColor: colors[index] }}>
                          {vehicle.make} {vehicle.model}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Base MSRP</td>
                    {vehicles.map(v => (
                      <td key={v.id}>{formatPrice(v.specs.pricing.base_msrp)}</td>
                    ))}
                  </tr>
                  <tr>
                    <td>Est. Lease/Month</td>
                    {vehicles.map(v => (
                      <td key={v.id}>{formatPrice(v.specs.pricing.est_lease_monthly)}</td>
                    ))}
                  </tr>
                  <tr>
                    <td>Est. Finance/Month</td>
                    {vehicles.map(v => (
                      <td key={v.id}>{formatPrice(v.specs.pricing.est_loan_monthly)}</td>
                    ))}
                  </tr>
                  <tr>
                    <td>Annual Fuel Cost</td>
                    {vehicles.map(v => (
                      <td key={v.id}>{v.annual_fuel_cost ? formatPrice(v.annual_fuel_cost) : 'N/A'}</td>
                    ))}
                  </tr>
                  <tr>
                    <td>Annual Insurance</td>
                    {vehicles.map(v => (
                      <td key={v.id}>{v.annual_insurance ? formatPrice(v.annual_insurance) : 'N/A'}</td>
                    ))}
                  </tr>
                  <tr>
                    <td>Annual Maintenance</td>
                    {vehicles.map(v => (
                      <td key={v.id}>{v.annual_maintenance ? formatPrice(v.annual_maintenance) : 'N/A'}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Performance & Fuel Economy */}
        {options.performance && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>⚡ Performance & Fuel Economy</h2>
            
            <div className={styles.chartContainer}>
              <h3 className={styles.chartTitle}>Fuel Economy Comparison (MPG)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={vehicles.map((v, i) => ({
                  name: `${v.make} ${v.model}`,
                  City: v.specs.powertrain.mpg_city,
                  Highway: v.specs.powertrain.mpg_hwy,
                  Combined: v.specs.powertrain.mpg_combined,
                  color: colors[i]
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: 'MPG', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="City" stroke="#EB0A1E" strokeWidth={3} dot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Highway" stroke="#4ECDC4" strokeWidth={3} dot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Combined" stroke="#FFA07A" strokeWidth={3} dot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className={styles.comparisonTable}>
              <table>
                <thead>
                  <tr>
                    <th>Performance</th>
                    {vehicles.map((vehicle, index) => (
                      <th key={vehicle.id}>
                        <span className={styles.tableVehicleBadge} style={{ backgroundColor: colors[index] }}>
                          {vehicle.make} {vehicle.model}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>MPG City</td>
                    {vehicles.map(v => (
                      <td key={v.id}>{v.specs.powertrain.mpg_city}</td>
                    ))}
                  </tr>
                  <tr>
                    <td>MPG Highway</td>
                    {vehicles.map(v => (
                      <td key={v.id}>{v.specs.powertrain.mpg_hwy}</td>
                    ))}
                  </tr>
                  <tr>
                    <td>MPG Combined</td>
                    {vehicles.map(v => (
                      <td key={v.id}>{v.specs.powertrain.mpg_combined}</td>
                    ))}
                  </tr>
                  <tr>
                    <td>Fuel Type</td>
                    {vehicles.map(v => (
                      <td key={v.id}>{v.specs.powertrain.fuel_type}</td>
                    ))}
                  </tr>
                  <tr>
                    <td>Drivetrain</td>
                    {vehicles.map(v => (
                      <td key={v.id}>{v.specs.powertrain.drivetrain}</td>
                    ))}
                  </tr>
                  <tr>
                    <td>Est. Range</td>
                    {vehicles.map(v => (
                      <td key={v.id}>{v.specs.powertrain.est_range_miles} mi</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Safety & Ratings */}
        {options.safety && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>🛡️ Safety & Ratings</h2>
            
            <div className={styles.chartContainer}>
              <h3 className={styles.chartTitle}>Overall Ratings Comparison</h3>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={[
                  {
                    metric: 'Safety',
                    ...vehicles.reduce((acc, v, i) => ({
                      ...acc,
                      [`Vehicle ${i + 1}`]: v.specs.safety.crash_test_score * 100
                    }), {})
                  },
                  {
                    metric: 'Eco Score',
                    ...vehicles.reduce((acc, v, i) => ({
                      ...acc,
                      [`Vehicle ${i + 1}`]: v.derived_scores.eco_score * 100
                    }), {})
                  },
                  {
                    metric: 'Family Friendly',
                    ...vehicles.reduce((acc, v, i) => ({
                      ...acc,
                      [`Vehicle ${i + 1}`]: v.derived_scores.family_friendly_score * 100
                    }), {})
                  },
                  {
                    metric: 'City Commute',
                    ...vehicles.reduce((acc, v, i) => ({
                      ...acc,
                      [`Vehicle ${i + 1}`]: v.derived_scores.city_commute_score * 100
                    }), {})
                  },
                  {
                    metric: 'Road Trip',
                    ...vehicles.reduce((acc, v, i) => ({
                      ...acc,
                      [`Vehicle ${i + 1}`]: v.derived_scores.road_trip_score * 100
                    }), {})
                  }
                ]}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  {vehicles.map((_, i) => (
                    <Radar
                      key={`vehicle-${i}`}
                      name={`${vehicles[i].make} ${vehicles[i].model}`}
                      dataKey={`Vehicle ${i + 1}`}
                      stroke={colors[i]}
                      fill={colors[i]}
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  ))}
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className={styles.comparisonTable}>
              <table>
                <thead>
                  <tr>
                    <th>Safety Features</th>
                    {vehicles.map((vehicle, index) => (
                      <th key={vehicle.id}>
                        <span className={styles.tableVehicleBadge} style={{ backgroundColor: colors[index] }}>
                          {vehicle.make} {vehicle.model}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Crash Test Score</td>
                    {vehicles.map(v => (
                      <td key={v.id}>{(v.specs.safety.crash_test_score * 100).toFixed(0)}%</td>
                    ))}
                  </tr>
                  <tr>
                    <td>Toyota Safety Sense</td>
                    {vehicles.map(v => (
                      <td key={v.id}>{v.specs.safety.has_tss ? `✓ ${v.specs.safety.tss_version || ''}` : '✗'}</td>
                    ))}
                  </tr>
                  <tr>
                    <td>Airbags</td>
                    {vehicles.map(v => (
                      <td key={v.id}>{v.specs.safety.airbags}</td>
                    ))}
                  </tr>
                  <tr>
                    <td>Eco Score</td>
                    {vehicles.map(v => (
                      <td key={v.id}>{(v.derived_scores.eco_score * 100).toFixed(0)}%</td>
                    ))}
                  </tr>
                  <tr>
                    <td>Family Friendly Score</td>
                    {vehicles.map(v => (
                      <td key={v.id}>{(v.derived_scores.family_friendly_score * 100).toFixed(0)}%</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Dimensions & Capacity */}
        {options.dimensions && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>🚗 Dimensions & Capacity</h2>
            
            <div className={styles.chartContainer}>
              <h3 className={styles.chartTitle}>Seating and Cargo Capacity</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={vehicles.map((v, i) => ({
                  name: `${v.make} ${v.model}`,
                  Seats: v.specs.capacity.seats,
                  'Cargo (L)': v.specs.capacity.cargo_volume_l / 100, // Scale down for visibility
                  fill: colors[i]
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Seats" fill="#EB0A1E" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="Cargo (L)" fill="#4ECDC4" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className={styles.comparisonTable}>
              <table>
                <thead>
                  <tr>
                    <th>Dimensions</th>
                    {vehicles.map((vehicle, index) => (
                      <th key={vehicle.id}>
                        <span className={styles.tableVehicleBadge} style={{ backgroundColor: colors[index] }}>
                          {vehicle.make} {vehicle.model}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Body Style</td>
                    {vehicles.map(v => (
                      <td key={v.id}>{v.specs.body_style}</td>
                    ))}
                  </tr>
                  <tr>
                    <td>Size Class</td>
                    {vehicles.map(v => (
                      <td key={v.id}>{v.specs.size_class}</td>
                    ))}
                  </tr>
                  <tr>
                    <td>Seating</td>
                    {vehicles.map(v => (
                      <td key={v.id}>{v.specs.capacity.seats} seats</td>
                    ))}
                  </tr>
                  <tr>
                    <td>Cargo Volume</td>
                    {vehicles.map(v => (
                      <td key={v.id}>{v.specs.capacity.cargo_volume_l}L</td>
                    ))}
                  </tr>
                  <tr>
                    <td>Length</td>
                    {vehicles.map(v => (
                      <td key={v.id}>{v.specs.dimensions.length_mm}mm</td>
                    ))}
                  </tr>
                  <tr>
                    <td>Width</td>
                    {vehicles.map(v => (
                      <td key={v.id}>{v.specs.dimensions.width_mm}mm</td>
                    ))}
                  </tr>
                  <tr>
                    <td>Height</td>
                    {vehicles.map(v => (
                      <td key={v.id}>{v.specs.dimensions.height_mm}mm</td>
                    ))}
                  </tr>
                  <tr>
                    <td>Turning Radius</td>
                    {vehicles.map(v => (
                      <td key={v.id}>{v.specs.dimensions.turning_radius_m}m</td>
                    ))}
                  </tr>
                  <tr>
                    <td>Ground Clearance</td>
                    {vehicles.map(v => (
                      <td key={v.id}>{v.specs.environment_fit.ground_clearance_in}"</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Footer */}
        <div className={styles.reportFooter}>
          <p>© {new Date().getFullYear()} Toyota. All rights reserved.</p>
          <p className={styles.disclaimer}>
            *Prices and specifications are subject to change. Please contact your local dealer for the most up-to-date information.
          </p>
        </div>
      </main>
    </div>
  );
}

