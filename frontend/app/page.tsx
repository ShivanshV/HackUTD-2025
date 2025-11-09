'use client'

import { useState, useEffect, useCallback } from 'react'
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

const STORAGE_KEY = 'toyota_chat_session';

export default function Home() {
  const searchParams = useSearchParams()
  const [currentView, setCurrentView] = useState<ViewType>('search')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchMode, setSearchMode] = useState<'smart' | 'catalog'>('smart')
  const [hasCheckedSession, setHasCheckedSession] = useState(false)
  
  // Helper function to check if we should show chat view
  // Use useCallback to memoize it and avoid unnecessary re-renders
  const shouldShowChatView = useCallback((mode: 'smart' | 'catalog'): boolean => {
    if (mode !== 'smart') return false;
    
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const session = JSON.parse(stored);
        return session.chatHistory && session.chatHistory.length > 0;
      }
    } catch (error) {
      console.error('Failed to check chat session:', error);
    }
    return false;
  }, []);

  // Page reload detection - ONLY runs on the very first page load
  // CRITICAL: This effect should NEVER clear suggested.json automatically
  // suggested.json should ONLY be cleared when user clicks "New search"
  useEffect(() => {
    // Use a persistent sessionStorage flag that survives route navigation
    // This ensures we only check for reloads once per browser session
    const RELOAD_CHECK_FLAG = 'toyota_reload_checked_v2';
    
    try {
      // Check if we've already done the reload check
      const hasChecked = sessionStorage.getItem(RELOAD_CHECK_FLAG);
      
      if (hasChecked === 'checked') {
        // Already checked - this is route navigation, preserve everything
        console.log('✅ Route navigation detected - preserving session and suggested.json');
        return;
      }
      
      // This is the first time checking - mark it immediately
      sessionStorage.setItem(RELOAD_CHECK_FLAG, 'checked');
      
      // Now check if this was a true page reload
      const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      const isReload = navEntries.length > 0 
        ? navEntries[0].type === 'reload'
        : (performance as any).navigation?.type === 1;
      
      if (isReload) {
        // True page reload (F5/Ctrl+R) - clear session only
        console.log('🔄 True page reload detected - clearing session (suggested.json preserved)');
        sessionStorage.removeItem(STORAGE_KEY);
        // Keep the flag so we don't check again on next navigation
        // It will be cleared when tab closes (sessionStorage clears)
      } else {
        // First page load (not reload) - preserve everything
        console.log('📍 First page load - preserving session and suggested.json');
      }
    } catch (error) {
      // On any error, preserve everything to be safe
      console.error('❌ Error in reload detection:', error);
      console.log('⚠️ Preserving session and suggested.json due to error');
    }
  }, []); // Empty deps - only runs once on mount

  // Initialize view based on URL and session on mount
  // This runs every time the component mounts (including when navigating back from other routes)
  useEffect(() => {
    const mode = searchParams.get('mode') || 'smart';
    const effectiveMode = (mode === 'catalog' || mode === 'smart') ? mode : 'smart';
    setSearchMode(effectiveMode);
    
    // If we're in smart mode and have a session, restore chat view
    // This ensures session is restored when navigating back from Compare page
    if (effectiveMode === 'smart' && shouldShowChatView('smart')) {
      setCurrentView('chat');
      console.log('✅ Restored chat view from session');
    } else if (!hasCheckedSession) {
      // Only set to 'search' on first check to avoid overriding navigation
      setCurrentView('search');
    }
    
    if (!hasCheckedSession) {
      setHasCheckedSession(true);
    }
  }, [searchParams, shouldShowChatView, hasCheckedSession]);

  // Handle URL mode changes (only when URL actually changes, not on programmatic navigation)
  // This is mainly for when user navigates from other pages via URL
  useEffect(() => {
    if (!hasCheckedSession) return; // Wait for initial check
    
    const mode = searchParams.get('mode');
    if (mode === 'catalog' || mode === 'smart') {
      setSearchMode(prevMode => {
        // If mode hasn't changed, don't update view (it's already set by handleNavigateToSearch)
        if (prevMode === mode) {
          return prevMode;
        }
        
        // Mode is changing via URL - update view accordingly
        if (mode === 'catalog') {
          // Catalog mode always shows search view
          setCurrentView('search');
        } else if (mode === 'smart') {
          // Smart mode - check if we should restore chat
          if (shouldShowChatView('smart')) {
            setCurrentView('chat');
            console.log('✅ Restored chat view when switching to smart mode via URL');
          } else {
            setCurrentView('search');
          }
        }
        
        return mode;
      });
    }
  }, [searchParams, hasCheckedSession])
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
    console.log('🔍 handleCatalogSearch called with filters:', filters);
    // Always create a new filters object to ensure React detects the change
    setCatalogFilters({ ...filters });
    setCurrentView('catalog-results');
    console.log('✅ Navigated to catalog-results view');
  }
  
  const handleBackToCatalogSearch = () => {
    console.log('🔙 handleBackToCatalogSearch called, current searchMode:', searchMode);
    // When going back from catalog results, always go to search view in catalog mode
    if (searchMode === 'catalog') {
      setCurrentView('search');
      console.log('✅ Navigated back to catalog search view');
    } else {
      // Fallback to general navigation handler
      handleNavigateToSearch('catalog');
    }
  }

  const handleNavigateToSearch = (targetMode?: 'smart' | 'catalog') => {
    console.log('🔍 handleNavigateToSearch called with targetMode:', targetMode, 'current searchMode:', searchMode, 'currentView:', currentView);
    
    // CRITICAL: If targetMode is explicitly 'catalog', ALWAYS go to search view (ignore any saved session)
    // This must be checked FIRST before any other logic
    if (targetMode === 'catalog') {
      console.log('📍 CATALOG MODE: Setting view to search, mode to catalog');
      // Use a function form to ensure state updates happen correctly
      setSearchMode('catalog');
      setCurrentView('search');
      console.log('✅ Successfully navigated to catalog search view');
      return;
    }
    
    // For smart mode (explicit or inferred), check if there's a saved chat session
    const isSmartMode = targetMode === 'smart' || (!targetMode && searchMode === 'smart');
    
    if (isSmartMode) {
      try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (stored) {
          const session = JSON.parse(stored);
          // If there's a chat history, restore to chat view
          if (session.chatHistory && session.chatHistory.length > 0) {
            setSearchMode('smart');
            setCurrentView('chat');
            console.log('✅ Navigated to chat view (session exists)');
            return;
          }
        }
      } catch (error) {
        console.error('Failed to check chat session:', error);
      }
      // No session found - go to search view
      setSearchMode('smart');
      setCurrentView('search');
      console.log('📍 Navigating to smart search view (no session)');
      return;
    }
    
    // Fallback - go to search view
    setCurrentView('search');
    if (targetMode) {
      setSearchMode(targetMode);
    }
    console.log('📍 Navigating to search view (fallback)');
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
            initialQuery={searchQuery}
          />
        )}
        {currentView === 'catalog-results' && (
          <CatalogResults 
            filters={catalogFilters}
            onBackToSearch={handleBackToCatalogSearch}
          />
        )}
      </main>
    </div>
  )
}

