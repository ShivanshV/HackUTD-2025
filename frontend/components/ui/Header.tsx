'use client';

import styles from './Header.module.css';

type TabType = 'catalog' | 'smart' | 'compare' | '3d';

interface HeaderProps {
  activeMode: 'smart' | 'catalog';
  onModeChange: (mode: 'smart' | 'catalog') => void;
  onNavigateToSearch?: () => void;
}

export default function Header({ activeMode, onModeChange, onNavigateToSearch }: HeaderProps) {
  const tabs = [
    { id: 'catalog' as const, label: 'Catalog Search', icon: '📋' },
    { id: 'smart' as const, label: 'Smart Search', icon: '🤖' },
    { id: 'compare' as const, label: 'Compare', icon: '⚖️' },
    { id: '3d' as const, label: '3D Model', icon: '🎨' },
  ];

  const handleTabClick = (tabId: TabType) => {
    if (tabId === 'catalog' || tabId === 'smart') {
      onModeChange(tabId);
      // Navigate back to search page if we're on a different page
      if (onNavigateToSearch) {
        onNavigateToSearch();
      }
    }
    // Compare and 3D Model are placeholders for now
  };

  const handleLogoClick = () => {
    onModeChange('smart');
    if (onNavigateToSearch) {
      onNavigateToSearch();
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.logoContainer} onClick={handleLogoClick}>
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
              className={`${styles.navTab} ${activeMode === tab.id ? styles.active : ''}`}
              onClick={() => handleTabClick(tab.id)}
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