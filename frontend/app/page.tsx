'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import SearchInterface from '@/components/search/SearchInterface'
import ChatInterface from '@/components/chat/ChatInterface'
import CatalogResults from '@/components/catalog/CatalogResults'
import Header from '@/components/ui/Header'
import styles from './page.module.css'

type ViewType = 'search' | 'chat' | 'catalog-results';

interface CatalogFilters {
  status: string;
  model: string;
  bodyStyle: string;
  zipCode: string;
}

export default function Home() {
  const searchParams = useSearchParams()
  const [currentView, setCurrentView] = useState<ViewType>('search')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchMode, setSearchMode] = useState<'smart' | 'catalog'>('smart')
  
  // Read mode from URL query parameter
  useEffect(() => {
    const mode = searchParams.get('mode')
    if (mode === 'catalog' || mode === 'smart') {
      setSearchMode(mode)
      setCurrentView('search')
    }
  }, [searchParams])
  const [catalogFilters, setCatalogFilters] = useState<CatalogFilters>({
    status: 'New',
    model: 'All Toyota Models',
    bodyStyle: 'All Body Styles',
    zipCode: '75080'
  })

  const handleSearch = (query: string, filters: string[]) => {
    setSearchQuery(query)
    setCurrentView('chat')
    // Here you would typically trigger the AI search
    console.log('Search query:', query, 'Filters:', filters)
  }

  const handleCatalogSearch = (filters: CatalogFilters) => {
    setCatalogFilters(filters)
    setCurrentView('catalog-results')
    console.log('Catalog search:', filters)
  }

  const handleNavigateToSearch = () => {
    setCurrentView('search');
  };

  return (
    <div className={styles.container}>
      <Header 
        activeMode={searchMode} 
        onModeChange={setSearchMode}
        onNavigateToSearch={handleNavigateToSearch}
      />
      <main className={styles.main}>
        {currentView === 'search' && (
          <SearchInterface 
            onSearch={handleSearch}
            onCatalogSearch={handleCatalogSearch}
            searchMode={searchMode}
            onModeChange={setSearchMode}
          />
        )}
        {currentView === 'chat' && (
          <ChatInterface 
            onNewSearch={handleNavigateToSearch}
            initialMessage={searchQuery}
          />
        )}
        {currentView === 'catalog-results' && (
          <CatalogResults 
            filters={catalogFilters}
            onBackToSearch={handleNavigateToSearch}
          />
        )}
      </main>
    </div>
  )
}

