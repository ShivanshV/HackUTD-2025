'use client';

import { useRouter, usePathname } from 'next/navigation';
import styles from './Header.module.css';

type TabType = 'catalog' | 'smart' | 'compare' | '3d';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { id: 'catalog' as TabType, label: 'Catalog Search', icon: '▦', path: '/catalog' },
    { id: 'smart' as TabType, label: 'Smart Search', icon: '◈', path: '/' },
    { id: 'compare' as TabType, label: 'Compare', icon: '⇄', path: '/compare' },
    { id: '3d' as TabType, label: '3D Model', icon: '⬡', path: '/3d-model' },
  ];

  const handleTabClick = (path: string) => {
    router.push(path);
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
              className={`${styles.navTab} ${pathname === tab.path ? styles.active : ''}`}
              onClick={() => handleTabClick(tab.path)}
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