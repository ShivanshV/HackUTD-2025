'use client';

import { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Grid } from '@react-three/drei';
import { Vehicle } from '@/lib/types/chat';
import ModelLoader from './ModelLoader';
import styles from './ThreeDViewer.module.css';

interface ThreeDViewerClientProps {
  vehicle: Vehicle;
  onClose: () => void;
}

export default function ThreeDViewerClient({ vehicle, onClose }: ThreeDViewerClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

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
        <button
          className={`${styles.sidebarToggle} ${sidebarOpen ? styles.active : ''}`}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? '✕ Close Info' : 'ⓘ Vehicle Info'}
        </button>
      </div>

      {/* 3D Canvas */}
      <div className={styles.canvasContainer}>
        {loading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.spinner}></div>
            <p>Loading 3D model...</p>
          </div>
        )}
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[5, 2, 5]} fov={50} />
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            target={[0, 0.5, 0]}
            maxPolarAngle={Math.PI / 2}
          />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          <hemisphereLight skyColor="#ffffff" groundColor="#000000" intensity={0.3} />
          <Environment preset="sunset" background />
          <Grid
            renderOrder={-1}
            position={[0, -0.01, 0]}
            infiniteGrid
            cellSize={0.5}
            sectionSize={3}
            fadeDistance={50}
            followCamera
            // @ts-ignore
            material-color="#666666"
          />
          <Suspense fallback={null}>
            <ModelLoader
              url={vehicle._3d_model_url || ''}
              onLoadStart={() => setLoading(true)}
              onLoadEnd={() => setLoading(false)}
            />
          </Suspense>
        </Canvas>

        {/* Controls Help */}
        <div className={styles.controlsHelp}>
          <div className={styles.controlItem}>
            <span className={styles.controlIcon}>🖱️</span>
            <span>Left Click + Drag to Rotate</span>
          </div>
          <div className={styles.controlItem}>
            <span className={styles.controlIcon}>🔍</span>
            <span>Scroll to Zoom</span>
          </div>
          <div className={styles.controlItem}>
            <span className={styles.controlIcon}>✋</span>
            <span>Right Click + Drag to Pan</span>
          </div>
        </div>
      </div>

      {/* Collapsible Sidebar */}
      <div className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
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
    </div>
  );
}
