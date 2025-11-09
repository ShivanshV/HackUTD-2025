'use client';

import { useRouter, usePathname } from 'next/navigation';
import styles from './Header.module.css';

type TabType = 'catalog' | 'smart' | 'compare' | '3d';

interface HeaderProps {
  activeMode?: 'smart' | 'catalog';
  onModeChange?: (mode: 'smart' | 'catalog') => void;
  onNavigateToSearch?: () => void;
}

export default function Header({ activeMode, onModeChange, onNavigateToSearch }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { id: 'catalog' as TabType, label: 'Catalog Search', icon: '▦', mode: 'catalog' as const },
    { id: 'smart' as TabType, label: 'Smart Search', icon: '◈', mode: 'smart' as const },
    { id: 'compare' as TabType, label: 'Compare', icon: '⇄', path: '/compare' },
    { id: '3d' as TabType, label: '3D Model', icon: '⬡', path: '/3d-model' },
  ];

  const handleTabClick = (tab: typeof tabs[number]) => {
    if ('mode' in tab && tab.mode) {
      // For Catalog Search and Smart Search
      if (onModeChange && onNavigateToSearch) {
        // If we have callbacks (on home page), use them
        onModeChange(tab.mode);
        onNavigateToSearch();
      } else {
        // If no callbacks (on other pages), navigate to home with query param
        router.push(`/?mode=${tab.mode}`);
      }
    } else if ('path' in tab && tab.path) {
      // For Compare and 3D Model, navigate to routes
      router.push(tab.path);
    }
  };

  const handleLogoClick = () => {
    if (onNavigateToSearch) {
      onNavigateToSearch();
      if (onModeChange) {
        onModeChange('smart');
      }
    } else {
      router.push('/');
    }
  };

  const isActive = (tab: typeof tabs[number]) => {
    if ('mode' in tab && tab.mode) {
      return pathname === '/' && activeMode === tab.mode;
    } else if ('path' in tab && tab.path) {
      return pathname === tab.path;
    }
    return false;
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
              className={`${styles.navTab} ${isActive(tab) ? styles.active : ''}`}
              onClick={() => handleTabClick(tab)}
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