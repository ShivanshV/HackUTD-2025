'use client';

import { useEffect, useRef, useState } from 'react';
import { Vehicle } from '@/lib/types/chat';
import styles from './ThreeDViewer.module.css';

interface SimpleThreeDViewerProps {
  vehicle: Vehicle;
  onClose: () => void;
}

export default function SimpleThreeDViewer({ vehicle, onClose }: SimpleThreeDViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !vehicle._3d_model_url) return;

    let mounted = true;
    let scene: any, camera: any, renderer: any, controls: any, model: any;
    let animationId: number;

    const initThree = async () => {
      try {
        setLoading(true);
        
        // Dynamically import Three.js modules
        const THREE = await import('three');
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');

        if (!mounted || !containerRef.current) return;

        const container = containerRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        // Scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0); // Light gray background

        // Camera
        camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
        camera.position.set(5, 2, 5);

        // Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        renderer.shadowMap.enabled = true;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        container.appendChild(renderer.domElement);

        // Lights - Much brighter setup
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.5); // Increased from 0.5
        scene.add(ambientLight);

        // Main directional light (key light)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5); // Increased from 1
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        // Fill light from the opposite side
        const fillLight = new THREE.DirectionalLight(0xffffff, 1.5);
        fillLight.position.set(-5, 5, -5);
        scene.add(fillLight);

        // Rim light from behind
        const rimLight = new THREE.DirectionalLight(0xffffff, 1.0);
        rimLight.position.set(0, 5, -10);
        scene.add(rimLight);

        // Hemisphere light for soft ambient fill
        const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0); // Increased from 0.3
        scene.add(hemisphereLight);

        // Grid - lighter to match the new background
        const gridHelper = new THREE.GridHelper(20, 20, 0x999999, 0xcccccc);
        scene.add(gridHelper);

        // Controls
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.target.set(0, 0.5, 0);
        controls.maxPolarAngle = Math.PI / 2;

        // Load model
        const loader = new GLTFLoader();
        loader.load(
          vehicle._3d_model_url,
          (gltf: any) => {
            if (!mounted) return;
            
            model = gltf.scene;

            // Center and scale model
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());

            model.position.x = -center.x;
            model.position.y = -box.min.y;
            model.position.z = -center.z;

            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 4 / maxDim;
            model.scale.set(scale, scale, scale);

            // Enable shadows and ensure materials are properly lit
            model.traverse((child: any) => {
              if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                
                // Ensure materials display colors properly
                if (child.material) {
                  child.material.needsUpdate = true;
                  
                  // If material is too dark, brighten it
                  if (child.material.color) {
                    child.material.metalness = 0.3;
                    child.material.roughness = 0.7;
                  }
                }
              }
            });

            scene.add(model);
            setLoading(false);
          },
          (progress: any) => {
            console.log('Loading progress:', (progress.loaded / progress.total) * 100 + '%');
          },
          (error: any) => {
            console.error('Error loading model:', error);
            setError('Failed to load 3D model');
            setLoading(false);
          }
        );

        // Animation loop
        const animate = () => {
          if (!mounted) return;
          animationId = requestAnimationFrame(animate);
          
          if (controls) controls.update();
          if (model) model.rotation.y += 0.002;
          
          if (renderer && scene && camera) {
            renderer.render(scene, camera);
          }
        };
        animate();

        // Handle resize
        const handleResize = () => {
          if (!container || !camera || !renderer) return;
          const width = container.clientWidth;
          const height = container.clientHeight;
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
        };
        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
        };

      } catch (err: any) {
        console.error('Error initializing Three.js:', err);
        setError(`Failed to initialize 3D viewer: ${err.message}`);
        setLoading(false);
      }
    };

    initThree();

    return () => {
      mounted = false;
      if (animationId) cancelAnimationFrame(animationId);
      if (renderer && containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
        renderer.dispose();
      }
    };
  }, [vehicle._3d_model_url]);

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
      <div className={styles.scoreLabel}>{emoji} {label}</div>
      <div className={styles.scoreGraph}>
        <div className={styles.scoreFill}>
          <div style={{ width: `${score * 100}%` }}></div>
        </div>
        <span className={styles.scoreValue}>{(score * 100).toFixed(0)}%</span>
      </div>
    </div>
  );

  return (
    <div className={styles.viewerContainer}>
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

      <div className={styles.canvasContainer}>
        {loading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.spinner}></div>
            <p>Loading 3D model...</p>
          </div>
        )}
        {error && (
          <div className={styles.loadingOverlay}>
            <p style={{ color: '#ff4444' }}>❌ {error}</p>
          </div>
        )}
        <div ref={containerRef} style={{ width: '100%', height: '100%' }}></div>

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

      <div className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarContent}>
          <h3 className={styles.sidebarTitle}>Vehicle Analytics</h3>

          <div className={styles.analyticsSection}>
            <h4 className={styles.analyticsTitle}>💰 Pricing</h4>
            <p>MSRP: {formatPrice(vehicle.specs.pricing.base_msrp)}</p>
            <p>Est. Lease/Month: {formatPrice(vehicle.specs.pricing.est_lease_monthly)}</p>
            <p>Est. Finance/Month: {formatPrice(vehicle.specs.pricing.est_loan_monthly)}</p>
          </div>

          <div className={styles.analyticsSection}>
            <h4 className={styles.analyticsTitle}>⚡ Performance</h4>
            <p>MPG Combined: {vehicle.specs.powertrain.mpg_combined}</p>
            <p>Fuel Type: {vehicle.specs.powertrain.fuel_type}</p>
            <p>Drivetrain: {vehicle.specs.powertrain.drivetrain}</p>
            <p>Est. Range: {vehicle.specs.powertrain.est_range_miles} miles</p>
          </div>

          <div className={styles.analyticsSection}>
            <h4 className={styles.analyticsTitle}>👥 Capacity</h4>
            <p>Seating: {vehicle.specs.capacity.seats} seats</p>
            <p>Cargo Volume: {vehicle.specs.capacity.cargo_volume_l}L</p>
          </div>

          <div className={styles.analyticsSection}>
            <h4 className={styles.analyticsTitle}>⭐ Ratings</h4>
            {renderScoreBar('Eco Score', vehicle.derived_scores.eco_score, '🌿')}
            {renderScoreBar('Family Friendly', vehicle.derived_scores.family_friendly_score, '👨‍👩‍👧')}
            {renderScoreBar('City Commute', vehicle.derived_scores.city_commute_score, '🏙️')}
            {renderScoreBar('Road Trip Ready', vehicle.derived_scores.road_trip_score, '🛣️')}
            {renderScoreBar('Safety Rating', vehicle.specs.safety.crash_test_score, '🛡️')}
          </div>

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

