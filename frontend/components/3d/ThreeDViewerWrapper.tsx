'use client';

import { useEffect, useState } from 'react';
import { Vehicle } from '@/lib/types/chat';
import styles from './ThreeDViewer.module.css';

interface ThreeDViewerWrapperProps {
  vehicle: Vehicle;
  onClose: () => void;
}

export default function ThreeDViewerWrapper({ vehicle, onClose }: ThreeDViewerWrapperProps) {
  const [ViewerComponent, setViewerComponent] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && typeof window !== 'undefined') {
      // Try to load the simple Three.js viewer (not React Three Fiber)
      import('./SimpleThreeDViewer')
        .then((mod) => {
          console.log('✅ SimpleThreeDViewer loaded successfully');
          setViewerComponent(() => mod.default);
        })
        .catch((error) => {
          console.error('❌ Failed to load SimpleThreeDViewer:', error);
          // Fall back to placeholder
          setViewerComponent(() => PlaceholderViewer);
        });
    }
  }, [isClient]);

  if (!isClient || !ViewerComponent) {
    return (
      <div className={styles.viewerContainer}>
        <div className={styles.topBar}>
          <button className={styles.backButton} onClick={onClose}>
            ← Back to Catalog
          </button>
          <h2 className={styles.vehicleTitle}>
            {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
          </h2>
        </div>
        <div className={styles.canvasContainer}>
          <div className={styles.loadingOverlay}>
            <div className={styles.spinner}></div>
            <p>Initializing 3D viewer...</p>
          </div>
        </div>
      </div>
    );
  }

  return <ViewerComponent vehicle={vehicle} onClose={onClose} />;
}

// Placeholder fallback component
function PlaceholderViewer({ vehicle, onClose }: ThreeDViewerWrapperProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const renderScoreBar = (label: string, score: number, emoji: string) => (
    <div className={styles.scoreBar}>
      <span className={styles.scoreLabel}>{emoji} {label}</span>
      <div className={styles.scoreGraph}>
        <div className={styles.scoreFill} style={{ width: `${score * 100}%` }}></div>
        <span className={styles.scoreValue}>{(score * 100).toFixed(0)}%</span>
      </div>
    </div>
  );

  return (
    <div className={styles.viewerContainer}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <button className={styles.backButton} onClick={onClose}>
          ← Back to Catalog
        </button>
        <h2 className={styles.vehicleTitle}>
          {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
        </h2>
      </div>

      {/* Vehicle Showcase */}
      <div className={styles.canvasContainer}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          padding: '40px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        }}>
          <div style={{
            fontSize: '80px',
            marginBottom: '20px',
            animation: 'pulse 2s ease-in-out infinite',
          }}>
            🚗
          </div>
          <h3 style={{ color: 'white', fontSize: '24px', marginBottom: '10px' }}>
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h3>
          <p style={{ color: '#EB0A1E', fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
            {vehicle.trim}
          </p>
          {vehicle.image_url && (
            <div style={{ marginTop: '30px', maxWidth: '700px', width: '100%' }}>
              <img 
                src={vehicle.image_url} 
                alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                style={{
                  width: '100%',
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px rgba(235, 10, 30, 0.3)',
                }}
              />
            </div>
          )}
          <div style={{
            marginTop: '30px',
            display: 'flex',
            gap: '20px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '15px 25px',
              borderRadius: '8px',
              backdropFilter: 'blur(10px)',
            }}>
              <div style={{ color: '#999', fontSize: '12px', marginBottom: '5px' }}>MSRP</div>
              <div style={{ color: 'white', fontSize: '20px', fontWeight: '700' }}>
                {formatPrice(vehicle.specs.pricing.base_msrp)}
              </div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '15px 25px',
              borderRadius: '8px',
              backdropFilter: 'blur(10px)',
            }}>
              <div style={{ color: '#999', fontSize: '12px', marginBottom: '5px' }}>MPG COMBINED</div>
              <div style={{ color: 'white', fontSize: '20px', fontWeight: '700' }}>
                {vehicle.specs.powertrain.mpg_combined}
              </div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '15px 25px',
              borderRadius: '8px',
              backdropFilter: 'blur(10px)',
            }}>
              <div style={{ color: '#999', fontSize: '12px', marginBottom: '5px' }}>RANGE</div>
              <div style={{ color: 'white', fontSize: '20px', fontWeight: '700' }}>
                {vehicle.specs.powertrain.est_range_miles} mi
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar with Vehicle Info */}
      <div className={`${styles.sidebar} ${styles.sidebarOpen}`}>
        <div className={styles.sidebarContent}>
          <h3 className={styles.sidebarTitle}>Vehicle Analytics</h3>

          {/* Pricing */}
          <div className={styles.analyticsSection}>
            <h4 className={styles.analyticsTitle}>💰 Pricing</h4>
            <p>MSRP: {formatPrice(vehicle.specs.pricing.base_msrp)}</p>
            <p>Est. Lease/Month: {formatPrice(vehicle.specs.pricing.est_lease_monthly)}</p>
            <p>Est. Finance/Month: {formatPrice(vehicle.specs.pricing.est_loan_monthly)}</p>
          </div>

          {/* Performance */}
          <div className={styles.analyticsSection}>
            <h4 className={styles.analyticsTitle}>⚡ Performance</h4>
            <p>MPG Combined: {vehicle.specs.powertrain.mpg_combined}</p>
            <p>Fuel Type: {vehicle.specs.powertrain.fuel_type}</p>
            <p>Drivetrain: {vehicle.specs.powertrain.drivetrain}</p>
            <p>Est. Range: {vehicle.specs.powertrain.est_range_miles} miles</p>
          </div>

          {/* Capacity */}
          <div className={styles.analyticsSection}>
            <h4 className={styles.analyticsTitle}>👥 Capacity</h4>
            <p>Seating: {vehicle.specs.capacity.seats} seats</p>
            <p>Cargo Volume: {vehicle.specs.capacity.cargo_volume_l}L</p>
          </div>

          {/* Ratings */}
          <div className={styles.analyticsSection}>
            <h4 className={styles.analyticsTitle}>⭐ Ratings</h4>
            {renderScoreBar('Eco Score', vehicle.derived_scores.eco_score, '🌿')}
            {renderScoreBar('Family Friendly', vehicle.derived_scores.family_friendly_score, '👨‍👩‍👧')}
            {renderScoreBar('City Commute', vehicle.derived_scores.city_commute_score, '🏙️')}
            {renderScoreBar('Road Trip Ready', vehicle.derived_scores.road_trip_score, '🛣️')}
            {renderScoreBar('Safety Rating', vehicle.specs.safety.crash_test_score, '🛡️')}
          </div>

          {/* Safety Features */}
          <div className={styles.analyticsSection}>
            <h4 className={styles.analyticsTitle}>🛡️ Safety Features</h4>
            <p>Toyota Safety Sense: {vehicle.specs.safety.has_tss ? `Yes (${vehicle.specs.safety.tss_version || 'N/A'})` : 'No'}</p>
            <p>Airbags: {vehicle.specs.safety.airbags}</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
