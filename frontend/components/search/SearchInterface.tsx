'use client';

import React, { useState } from 'react';
import styles from './SearchInterface.module.css';
import SearchInput from './SearchInput';
import FilterChip from './FilterChip';

interface SearchInterfaceProps {
  onSearch?: (query: string, filters: string[]) => void;
  onCatalogSearch?: (filters: {
    status: string;
    model: string;
    bodyStyle: string;
    zipCode: string;
  }) => void;
  searchMode: 'smart' | 'catalog';
  onModeChange?: (mode: 'smart' | 'catalog') => void;
}

const SearchInterface: React.FC<SearchInterfaceProps> = ({ onSearch, onCatalogSearch, searchMode, onModeChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [zipCode, setZipCode] = useState('75080');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  
  // Catalog search filters
  const [catalogStatus, setCatalogStatus] = useState('New');
  const [catalogModel, setCatalogModel] = useState('All Toyota Models');
  const [catalogBodyStyle, setCatalogBodyStyle] = useState('All Body Styles');

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
    console.log('🔍 SearchInterface handleSearch called, searchMode:', searchMode);
    if (searchMode === 'smart' && onSearch) {
      onSearch(searchQuery, activeFilters);
    } else if (searchMode === 'catalog' && onCatalogSearch) {
      const filters = {
        status: catalogStatus,
        model: catalogModel,
        bodyStyle: catalogBodyStyle,
        zipCode: zipCode
      };
      console.log('📋 Calling onCatalogSearch with filters:', filters);
      onCatalogSearch(filters);
    } else {
      console.warn('⚠️ No search handler available for mode:', searchMode);
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
      {searchMode === 'smart' ? (
        /* Smart Search - AI Lifestyle Based */
        <div className={styles.smartSearchContainer}>
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
      ) : (
        /* Catalog Search - Traditional Filters */
        <>
          <div className={styles.heroSection}>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Find your perfect <span className={styles.toyotaRed}>Toyota</span>
          </h1>
          
          {/* Search Card */}
          <div className={styles.searchCard}>
            <div className={styles.searchTabs}>
              <button className={`${styles.tab} ${styles.tabActive}`}>Buy / Lease</button>
            </div>

            <div className={styles.searchFilters}>
              <select 
                className={styles.filterSelect}
                value={catalogStatus}
                onChange={(e) => setCatalogStatus(e.target.value)}
              >
                <option>New</option>
                <option>Used</option>
                <option>Certified Pre-Owned</option>
              </select>

              <select 
                className={styles.filterSelect}
                value={catalogModel}
                onChange={(e) => setCatalogModel(e.target.value)}
              >
                <option>All Toyota Models</option>
                <option>Camry</option>
                <option>Camry Hybrid</option>
                <option>RAV4</option>
                <option>RAV4 Hybrid</option>
                <option>RAV4 Prime</option>
                <option>Prius</option>
                <option>Prius Prime</option>
                <option>Tacoma</option>
                <option>Tundra</option>
                <option>Highlander</option>
                <option>Highlander Hybrid</option>
                <option>Corolla</option>
                <option>Corolla Hybrid</option>
                <option>4Runner</option>
                <option>Sequoia</option>
                <option>Sienna</option>
              </select>

              <select 
                className={styles.filterSelect}
                value={catalogBodyStyle}
                onChange={(e) => setCatalogBodyStyle(e.target.value)}
              >
                <option>All Body Styles</option>
                <option>Sedan</option>
                <option>SUV</option>
                <option>Truck</option>
                <option>Hybrid</option>
                <option>Minivan</option>
              </select>

              <input 
                type="text" 
                className={styles.zipInput}
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="ZIP Code"
              />

              <button className={styles.searchButton} onClick={handleSearch}>
                Search
              </button>
            </div>
          </div>

          {/* AI Prompt */}
          <button className={styles.aiPrompt} onClick={() => onModeChange?.('smart')}>
            <span className={styles.aiIcon}>✨</span>
            Not sure where to start? <strong>Explore with AI</strong>
          </button>
        </div>
      </div>

      {/* Lifestyle Preferences Section */}
      <div className={styles.filtersSection}>
        <h2 className={styles.filtersTitle}>Or tell us about your lifestyle</h2>
        <p className={styles.filtersSubtitle}>We'll recommend the perfect Toyota for you</p>
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
        </>
      )}
    </div>
  );
};

export default SearchInterface;

