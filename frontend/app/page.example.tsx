/**
 * EXAMPLE: Using Reset Strategies in page.tsx
 * 
 * This file shows how to implement different reset strategies.
 * Choose one strategy and integrate it into your actual page.tsx
 */

'use client'

import { useState, useEffect } from 'react'
import { 
  createManualResetStrategy,
  createTimestampExpirationStrategy,
  createUrlParameterStrategy,
  createCombinedStrategy,
  shouldResetSession,
  clearSessionAndSuggestions,
  updateSessionTimestamp
} from '@/lib/utils/sessionManager'

// ============================================================================
// STRATEGY 1: Manual Reset Only (Simplest - Recommended for Hackathon)
// ============================================================================
export function ExampleManualResetOnly() {
  useEffect(() => {
    // Strategy: Only reset when user clicks "New Search"
    const strategy = createManualResetStrategy();
    
    // Check on mount (will always return false, so session is preserved)
    if (shouldResetSession(strategy)) {
      clearSessionAndSuggestions();
    }
    
    // Session is always preserved unless user explicitly clicks "New Search"
  }, []);
  
  // In handleNewSearch:
  const handleNewSearch = async () => {
    await clearSessionAndSuggestions();
    // ... rest of your code
  };
}

// ============================================================================
// STRATEGY 2: Timestamp Expiration (1 hour)
// ============================================================================
export function ExampleTimestampExpiration() {
  useEffect(() => {
    // Strategy: Reset if session is older than 1 hour
    const strategy = createTimestampExpirationStrategy(60); // 60 minutes
    
    if (shouldResetSession(strategy)) {
      clearSessionAndSuggestions();
      // Reset view to search
    } else {
      // Update timestamp to keep session alive
      updateSessionTimestamp();
      // Restore session
    }
  }, []);
  
  // Update timestamp whenever session is used
  useEffect(() => {
    updateSessionTimestamp();
  }, [/* your chat history state */]);
}

// ============================================================================
// STRATEGY 3: URL Parameter Control
// ============================================================================
export function ExampleUrlParameter() {
  useEffect(() => {
    // Strategy: Reset if ?reset=true in URL
    const strategy = createUrlParameterStrategy();
    
    if (shouldResetSession(strategy)) {
      clearSessionAndSuggestions();
      // URL parameter is automatically removed by strategy.onReset()
    }
  }, []);
  
  // User can reset by visiting: http://localhost:3000/?reset=true
}

// ============================================================================
// STRATEGY 4: Combined (Manual + Timestamp + URL)
// ============================================================================
export function ExampleCombined() {
  useEffect(() => {
    // Strategy: Reset if ANY of these conditions are true:
    // 1. Session is older than 2 hours
    // 2. User clicks "New Search" (manual)
    // 3. ?reset=true in URL
    const strategy = createCombinedStrategy([
      createTimestampExpirationStrategy(120), // 2 hours
      createManualResetStrategy(), // Manual reset always allowed
      createUrlParameterStrategy(), // URL parameter control
    ]);
    
    if (shouldResetSession(strategy)) {
      clearSessionAndSuggestions();
      // Reset view
    } else {
      updateSessionTimestamp();
      // Restore session
    }
  }, []);
}

// ============================================================================
// INTEGRATION EXAMPLE: Replace your current reload detection
// ============================================================================
export function ExampleIntegration() {
  const [currentView, setCurrentView] = useState('search');
  const [hasCheckedSession, setHasCheckedSession] = useState(false);
  
  // Replace your current reload detection useEffect with this:
  useEffect(() => {
    if (hasCheckedSession) return;
    
    // Choose your strategy (RECOMMENDED: Manual + Timestamp)
    const strategy = createCombinedStrategy([
      createTimestampExpirationStrategy(120), // 2 hours
      createManualResetStrategy(),
    ]);
    
    // Check if session should be reset
    const shouldReset = shouldResetSession(strategy);
    
    if (shouldReset) {
      console.log('🔄 Session expired or reset requested - clearing');
      clearSessionAndSuggestions();
      setCurrentView('search');
    } else {
      console.log('✅ Session valid - preserving');
      updateSessionTimestamp();
      // Restore session if it exists
      // ... your session restoration logic
    }
    
    setHasCheckedSession(true);
  }, [hasCheckedSession]);
  
  // Update timestamp whenever chat history changes
  useEffect(() => {
    // Update timestamp to keep session alive
    updateSessionTimestamp();
  }, [/* your chatHistory state */]);
  
  // Manual reset handler
  const handleNewSearch = async () => {
    await clearSessionAndSuggestions();
    setCurrentView('search');
    // ... rest of your code
  };
}

// ============================================================================
// QUICK START: Copy this into your page.tsx
// ============================================================================
/*
// 1. Import at the top
import { 
  createManualResetStrategy,
  createTimestampExpirationStrategy,
  createCombinedStrategy,
  shouldResetSession,
  clearSessionAndSuggestions,
  updateSessionTimestamp
} from '@/lib/utils/sessionManager';

// 2. Replace your reload detection useEffect:
useEffect(() => {
  if (hasCheckedSession) return;
  
  // Choose strategy (Option A: Manual only)
  const strategy = createManualResetStrategy();
  
  // Option B: Manual + 2 hour expiration
  // const strategy = createCombinedStrategy([
  //   createTimestampExpirationStrategy(120),
  //   createManualResetStrategy(),
  // ]);
  
  if (shouldResetSession(strategy)) {
    clearSessionAndSuggestions();
    setCurrentView('search');
  } else {
    updateSessionTimestamp();
    // Restore session...
  }
  
  setHasCheckedSession(true);
}, [hasCheckedSession]);

// 3. Update handleNewSearch in ChatInterface:
const handleNewSearch = async () => {
  await clearSessionAndSuggestions();
  // ... rest of code
};

// 4. Update timestamp when session is used (in ChatInterface):
useEffect(() => {
  updateSessionTimestamp();
}, [chatHistory]);
*/

