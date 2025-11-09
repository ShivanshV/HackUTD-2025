'use client';

import { useState } from 'react';
import styles from './Header.module.css';

type TabType = 'catalog' | 'smart' | 'compare' | '3d';

export default function Header() {
  const [activeTab, setActiveTab] = useState<TabType>('smart');

  const tabs = [
    { id: 'catalog' as TabType, label: 'Catalog Search', icon: '📋' },
    { id: 'smart' as TabType, label: 'Smart Search', icon: '🤖' },
    { id: 'compare' as TabType, label: 'Compare', icon: '⚖️' },
    { id: '3d' as TabType, label: '3D Model', icon: '🎨' },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.logoContainer}>
          <div className={styles.logoBox}>
            <svg 
              className={styles.logoIcon} 
              viewBox="0 0 100 80" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Toyota ellipses logo */}
              <ellipse cx="50" cy="35" rx="22" ry="13" fill="white" stroke="white" strokeWidth="3"/>
              <ellipse cx="32" cy="50" rx="16" ry="10" fill="white" stroke="white" strokeWidth="3"/>
              <ellipse cx="68" cy="50" rx="16" ry="10" fill="white" stroke="white" strokeWidth="3"/>
              <path d="M 25 40 Q 50 25 75 40" stroke="white" strokeWidth="3" fill="none"/>
            </svg>
          </div>
          <span className={styles.logoText}>TOYOTA</span>
        </div>

        <nav className={styles.navigation}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.navTab} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className={styles.tabIcon}>{tab.icon}</span>
              <span className={styles.tabLabel}>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}