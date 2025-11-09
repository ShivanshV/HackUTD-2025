'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/ui/Header';
import { Vehicle } from '@/lib/types/chat';
import { getAllVehicles } from '@/lib/api/vehicles';
import styles from './page.module.css';

// Dynamically import ThreeDViewerWrapper with no SSR
const ThreeDViewerWrapper = dynamic(() => import('@/components/3d/ThreeDViewerWrapper'), {
  ssr: false,
  loading: () => (
    <div className={styles.loading}>
      <div className={styles.spinner}></div>
      <p>Loading 3D viewer...</p>
    </div>
  ),
});

export default function ThreeDModelPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure we're only on the client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
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
        
        // Filter to show only RAV4 2024 Hybrid LE, 4Runner 2018 SR5, and Corolla 2020 L
        const vehiclesWithModels = allVehicles.filter(v => 
          v._3d_model_url && (
            (v.year === 2024 && v.model === 'RAV4 Hybrid' && v.trim === 'LE') ||
            (v.year === 2018 && v.model === '4Runner' && v.trim === 'SR5') ||
            (v.year === 2020 && v.model === 'Corolla' && v.trim === 'L')
          )
        );
        setVehicles(vehiclesWithModels);
      } catch (err) {
        console.error('Failed to load vehicles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading || !isMounted) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading 3D models...</p>
        </div>
      </div>
    );
  }

  if (selectedVehicle && isMounted) {
    return (
      <div className={styles.container}>
        <Header />
        <ThreeDViewerWrapper 
          vehicle={selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>3D Model Catalog</h1>
          <p className={styles.subtitle}>
            Explore Toyota vehicles in immersive 3D
          </p>
        </div>

        {vehicles.length === 0 ? (
          <div className={styles.noModels}>
            <span className={styles.noModelsIcon}>🎨</span>
            <h2>No 3D Models Available</h2>
            <p>Check back soon for interactive 3D vehicle models</p>
          </div>
        ) : (
          <div className={styles.catalogGrid}>
            {vehicles.map((vehicle) => (
              <div 
                key={vehicle.id} 
                className={styles.modelCard}
                onClick={() => setSelectedVehicle(vehicle)}
              >
                <div className={styles.modelPreview}>
                  <div className={styles.previewIcon}>🎨</div>
                  <div className={styles.badge3d}>3D MODEL</div>
                </div>
                <div className={styles.modelInfo}>
                  <h3 className={styles.modelName}>
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h3>
                  <p className={styles.modelTrim}>{vehicle.trim}</p>
                  <div className={styles.modelStats}>
                    <div className={styles.stat}>
                      <span className={styles.statLabel}>MSRP</span>
                      <span className={styles.statValue}>
                        {formatPrice(vehicle.specs.pricing.base_msrp)}
                      </span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.statLabel}>MPG</span>
                      <span className={styles.statValue}>
                        {vehicle.specs.powertrain.mpg_combined}
                      </span>
                    </div>
                  </div>
                  <button className={styles.viewButton}>
                    View in 3D →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

