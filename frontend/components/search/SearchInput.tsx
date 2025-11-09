'use client';

import React from 'react';
import styles from './SearchInput.module.css';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  zipCode: string;
  onZipCodeChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  zipCode,
  onZipCodeChange,
  onSearch,
  placeholder = 'The car I want has...'
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.gradientBorder}>
        <div className={styles.inputWrapper}>
          <div className={styles.mainInput}>
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              className={styles.textInput}
            />
          </div>
          
          <div className={styles.divider}></div>
          
          <div className={styles.zipInput}>
            <span className={styles.locationIcon}>📍</span>
            <input
              type="text"
              value={zipCode}
              onChange={(e) => onZipCodeChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="ZIP"
              className={styles.zipField}
              maxLength={5}
            />
          </div>

          <button 
            className={styles.searchButton}
            onClick={onSearch}
            aria-label="Search"
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchInput;

