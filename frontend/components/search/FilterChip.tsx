'use client';

import React from 'react';
import styles from './FilterChip.module.css';

interface FilterChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const FilterChip: React.FC<FilterChipProps> = ({ 
  label, 
  active = false, 
  onClick 
}) => {
  return (
    <button
      className={`${styles.chip} ${active ? styles.active : ''}`}
      onClick={onClick}
    >
      <span className={styles.icon}>🔄</span>
      <span className={styles.label}>{label}</span>
      <button 
        className={styles.closeButton}
        onClick={(e) => {
          e.stopPropagation();
          if (onClick) onClick();
        }}
        aria-label="Remove filter"
      >
        ×
      </button>
    </button>
  );
};

export default FilterChip;

