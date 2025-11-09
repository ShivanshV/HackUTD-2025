'use client';

import React from 'react';
import styles from './CarSuggestions.module.css';

interface Car {
  id: string;
  name: string;
  year: number;
  price: string;
  image?: string;
  type: string;
  mpg?: string;
}

interface CarSuggestionsProps {
  cars?: Car[];
  onViewDetails?: (carId: string) => void;
}

const CarSuggestions: React.FC<CarSuggestionsProps> = ({ cars, onViewDetails }) => {
  const defaultCars: Car[] = [
    {
      id: '1',
      name: 'Toyota Camry',
      year: 2024,
      price: '$28,400',
      type: 'Sedan',
      mpg: '28/39 MPG',
      image: '/cars/camry-2024.jpg' // Local image from public folder
    },
    {
      id: '2',
      name: 'Toyota RAV4',
      year: 2024,
      price: '$35,800',
      type: 'SUV',
      mpg: '27/35 MPG',
      image: '/cars/rav4-2024.jpg' // Local image from public folder
    },
    {
      id: '3',
      name: 'Toyota Prius',
      year: 2024,
      price: '$34,500',
      type: 'Hybrid',
      mpg: '54/50 MPG',
      image: '/cars/prius-2024.jpg' // Local image from public folder
    }
  ];

  const displayCars = cars || defaultCars;

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <h3 className={styles.title}>Suggested Vehicles</h3>
        <p className={styles.subtitle}>Based on your preferences</p>
      </div>

      <div className={styles.carsList}>
        {displayCars.map((car) => (
          <div key={car.id} className={styles.carCard}>
            <div className={styles.carImage}>
              {car.image ? (
                <img 
                  src={car.image} 
                  alt={`${car.year} ${car.name}`}
                  className={styles.carImageImg}
                />
              ) : (
                <div className={styles.imagePlaceholder}>🚗</div>
              )}
            </div>
            <div className={styles.carInfo}>
              <h4 className={styles.carName}>{car.year} {car.name}</h4>
              <p className={styles.carType}>{car.type}</p>
              {car.mpg && <p className={styles.carMpg}>{car.mpg}</p>}
              <p className={styles.carPrice}>{car.price}</p>
              <button 
                className={styles.viewButton}
                onClick={() => onViewDetails && onViewDetails(car.id)}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <button className={styles.viewAllButton}>View All Matches</button>
      </div>
    </div>
  );
};

export default CarSuggestions;

