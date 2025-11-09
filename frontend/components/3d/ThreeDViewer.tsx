'use client';

import { Suspense, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Vehicle } from '@/lib/types/chat';
import styles from './ThreeDViewer.module.css';

// Dynamically import Canvas to avoid SSR issues
const Canvas = dynamic(
  () => import('@react-three/fiber').then((mod) => mod.Canvas),
  { ssr: false }
);

const OrbitControls = dynamic(
  () => import('@react-three/drei').then((mod) => mod.OrbitControls),
  { ssr: false }
);

const PerspectiveCamera = dynamic(
  () => import('@react-three/drei').then((mod) => mod.PerspectiveCamera),
  { ssr: false }
);

const Environment = dynamic(
  () => import('@react-three/drei').then((mod) => mod.Environment),
  { ssr: false }
);

const Grid = dynamic(
  () => import('@react-three/drei').then((mod) => mod.Grid),
  { ssr: false }
);

const ModelLoader = dynamic(() => import('./ModelLoader'), { ssr: false });

interface ThreeDViewerProps {
  vehicle: Vehicle;
  onClose: () => void;
}

export default function ThreeDViewer({ vehicle, onClose }: ThreeDViewerProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Don't render anything until mounted on client
  if (!mounted) {
    return (
      <div className={styles.viewerContainer}>
        <div className={styles.topBar}>
          <button className={styles.backButton} onClick={onClose}>
            ← Back to Catalog
          </button>
          <div className={styles.vehicleTitle}>
            <h2>{vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}</h2>
          </div>
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

  return (
    <div className={styles.viewerContainer}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <button className={styles.backButton} onClick={onClose}>
          ← Back to Catalog
        </button>
        <div className={styles.vehicleTitle}>
          <h2>{vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}</h2>
        </div>
        <button 
          className={styles.sidebarToggle}
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
        {mounted && typeof window !== 'undefined' && (
          <Canvas shadows>
          <PerspectiveCamera makeDefault position={[5, 2, 5]} fov={50} />
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={20}
            maxPolarAngle={Math.PI / 2}
          />
          
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          <directionalLight position={[-10, 10, -5]} intensity={0.5} />
          <hemisphereLight intensity={0.3} />
          
          {/* Environment */}
          <Environment preset="sunset" />
          
          {/* Grid */}
          <Grid 
            args={[20, 20]}
            cellSize={1}
            cellThickness={0.5}
            cellColor="#6f6f6f"
            sectionSize={5}
            sectionThickness={1}
            sectionColor="#9d4b4b"
            fadeDistance={30}
            fadeStrength={1}
            followCamera={false}
            infiniteGrid={true}
          />
          
          {/* Model */}
          <Suspense fallback={null}>
            <ModelLoader 
              url={vehicle._3d_model_url || ''}
              onLoadStart={() => setLoading(true)}
              onLoadEnd={() => setLoading(false)}
            />
          </Suspense>
        </Canvas>
        )}

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
          
          {/* Pricing Section */}
          <div className={styles.dataSection}>
            <h4 className={styles.sectionTitle}>💰 Pricing</h4>
            <div className={styles.dataGrid}>
              <div className={styles.dataItem}>
                <span className={styles.dataLabel}>Base MSRP</span>
                <span className={styles.dataValue}>
                  {formatPrice(vehicle.specs.pricing.base_msrp)}
                </span>
              </div>
              <div className={styles.dataItem}>
                <span className={styles.dataLabel}>Est. Lease/Month</span>
                <span className={styles.dataValue}>
                  {formatPrice(vehicle.specs.pricing.est_lease_monthly)}
                </span>
              </div>
              <div className={styles.dataItem}>
                <span className={styles.dataLabel}>Est. Finance/Month</span>
                <span className={styles.dataValue}>
                  {formatPrice(vehicle.specs.pricing.est_loan_monthly)}
                </span>
              </div>
            </div>
          </div>

          {/* Performance Section */}
          <div className={styles.dataSection}>
            <h4 className={styles.sectionTitle}>⚡ Performance</h4>
            <div className={styles.dataGrid}>
              <div className={styles.dataItem}>
                <span className={styles.dataLabel}>MPG Combined</span>
                <span className={styles.dataValue}>
                  {vehicle.specs.powertrain.mpg_combined}
                </span>
              </div>
              <div className={styles.dataItem}>
                <span className={styles.dataLabel}>Fuel Type</span>
                <span className={styles.dataValue}>
                  {vehicle.specs.powertrain.fuel_type}
                </span>
              </div>
              <div className={styles.dataItem}>
                <span className={styles.dataLabel}>Drivetrain</span>
                <span className={styles.dataValue}>
                  {vehicle.specs.powertrain.drivetrain}
                </span>
              </div>
              <div className={styles.dataItem}>
                <span className={styles.dataLabel}>Range</span>
                <span className={styles.dataValue}>
                  {vehicle.specs.powertrain.est_range_miles} mi
                </span>
              </div>
            </div>
          </div>

          {/* Capacity Section */}
          <div className={styles.dataSection}>
            <h4 className={styles.sectionTitle}>👥 Capacity</h4>
            <div className={styles.dataGrid}>
              <div className={styles.dataItem}>
                <span className={styles.dataLabel}>Seating</span>
                <span className={styles.dataValue}>
                  {vehicle.specs.capacity.seats} seats
                </span>
              </div>
              <div className={styles.dataItem}>
                <span className={styles.dataLabel}>Cargo Space</span>
                <span className={styles.dataValue}>
                  {vehicle.specs.capacity.cargo_volume_l}L
                </span>
              </div>
            </div>
          </div>

          {/* Ratings Section */}
          <div className={styles.dataSection}>
            <h4 className={styles.sectionTitle}>⭐ Ratings</h4>
            <div className={styles.ratingBars}>
              <div className={styles.ratingItem}>
                <span className={styles.ratingLabel}>Eco Score</span>
                <div className={styles.ratingBar}>
                  <div 
                    className={styles.ratingFill}
                    style={{ width: `${vehicle.derived_scores.eco_score * 100}%` }}
                  ></div>
                </div>
                <span className={styles.ratingValue}>
                  {(vehicle.derived_scores.eco_score * 100).toFixed(0)}%
                </span>
              </div>
              <div className={styles.ratingItem}>
                <span className={styles.ratingLabel}>Family Friendly</span>
                <div className={styles.ratingBar}>
                  <div 
                    className={styles.ratingFill}
                    style={{ width: `${vehicle.derived_scores.family_friendly_score * 100}%` }}
                  ></div>
                </div>
                <span className={styles.ratingValue}>
                  {(vehicle.derived_scores.family_friendly_score * 100).toFixed(0)}%
                </span>
              </div>
              <div className={styles.ratingItem}>
                <span className={styles.ratingLabel}>City Commute</span>
                <div className={styles.ratingBar}>
                  <div 
                    className={styles.ratingFill}
                    style={{ width: `${vehicle.derived_scores.city_commute_score * 100}%` }}
                  ></div>
                </div>
                <span className={styles.ratingValue}>
                  {(vehicle.derived_scores.city_commute_score * 100).toFixed(0)}%
                </span>
              </div>
              <div className={styles.ratingItem}>
                <span className={styles.ratingLabel}>Road Trip</span>
                <div className={styles.ratingBar}>
                  <div 
                    className={styles.ratingFill}
                    style={{ width: `${vehicle.derived_scores.road_trip_score * 100}%` }}
                  ></div>
                </div>
                <span className={styles.ratingValue}>
                  {(vehicle.derived_scores.road_trip_score * 100).toFixed(0)}%
                </span>
              </div>
              <div className={styles.ratingItem}>
                <span className={styles.ratingLabel}>Safety</span>
                <div className={styles.ratingBar}>
                  <div 
                    className={styles.ratingFill}
                    style={{ width: `${vehicle.specs.safety.crash_test_score * 100}%` }}
                  ></div>
                </div>
                <span className={styles.ratingValue}>
                  {(vehicle.specs.safety.crash_test_score * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          {/* Safety Features */}
          <div className={styles.dataSection}>
            <h4 className={styles.sectionTitle}>🛡️ Safety</h4>
            <div className={styles.featureList}>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>
                  {vehicle.specs.safety.has_tss ? '✓' : '✗'}
                </span>
                <span>Toyota Safety Sense {vehicle.specs.safety.tss_version}</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>✓</span>
                <span>{vehicle.specs.safety.airbags} Airbags</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

