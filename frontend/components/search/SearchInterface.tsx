'use client';

import React, { useState } from 'react';
import styles from './SearchInterface.module.css';
import SearchInput from './SearchInput';
import FilterChip from './FilterChip';

interface SearchInterfaceProps {
  onSearch?: (query: string, filters: string[]) => void;
}

const SearchInterface: React.FC<SearchInterfaceProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [zipCode, setZipCode] = useState('75080');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const filterOptions = [
    'Daily commuter',
    'Growing family',
    'Weekend adventurer',
    'Eco-conscious driver',
    'First-time buyer',
    'Luxury seeker',
    'City driver',
    'Road trip enthusiast'
  ];

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchQuery, activeFilters);
    }
  };

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <div className={styles.sparkle}>✨</div>
        <h1 className={styles.title}>
          Tell us about <span className={styles.gradient}>your lifestyle</span> and we'll find
          <br />
          your perfect Toyota
        </h1>
      </div>

      <div className={styles.searchSection}>
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          zipCode={zipCode}
          onZipCodeChange={setZipCode}
          onSearch={handleSearch}
          placeholder="I commute daily, have a family of 4..."
        />
        
        <p className={styles.disclaimer}>
          Our AI can make mistakes. Check important info. Do not include personal or sensitive information.
        </p>
      </div>

      <div className={styles.filtersSection}>
        <h2 className={styles.filtersTitle}>Pick up where you left off</h2>
        <div className={styles.filtersGrid}>
          {filterOptions.map((filter) => (
            <FilterChip
              key={filter}
              label={filter}
              active={activeFilters.includes(filter)}
              onClick={() => toggleFilter(filter)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchInterface;

