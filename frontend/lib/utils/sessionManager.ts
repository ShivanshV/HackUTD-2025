/**
 * Session Management Utilities
 * 
 * Alternative reset strategies for smart search and suggested.json
 */

const STORAGE_KEY = 'toyota_chat_session';
const SESSION_TIMESTAMP_KEY = 'toyota_session_timestamp';
const SESSION_ID_KEY = 'toyota_session_id';

export interface SessionResetStrategy {
  name: string;
  description: string;
  shouldReset: () => boolean;
  onReset?: () => void;
}

/**
 * Strategy 1: Timestamp-based expiration
 * Reset session if it's older than X minutes
 */
export function createTimestampExpirationStrategy(maxAgeMinutes: number = 60): SessionResetStrategy {
  return {
    name: 'timestamp_expiration',
    description: `Reset session if older than ${maxAgeMinutes} minutes`,
    shouldReset: () => {
      try {
        const timestamp = sessionStorage.getItem(SESSION_TIMESTAMP_KEY);
        if (!timestamp) return false;
        
        const sessionAge = Date.now() - parseInt(timestamp, 10);
        const maxAge = maxAgeMinutes * 60 * 1000;
        
        return sessionAge > maxAge;
      } catch {
        return false;
      }
    },
    onReset: () => {
      sessionStorage.removeItem(SESSION_TIMESTAMP_KEY);
    }
  };
}

/**
 * Strategy 2: Session ID validation
 * Reset if session ID doesn't match (e.g., after browser restart)
 */
export function createSessionIdStrategy(): SessionResetStrategy {
  return {
    name: 'session_id',
    description: 'Reset if session ID changed (browser restart detected)',
    shouldReset: () => {
      try {
        const storedId = sessionStorage.getItem(SESSION_ID_KEY);
        const currentId = getOrCreateSessionId();
        
        if (!storedId) {
          // First time - set the ID
          sessionStorage.setItem(SESSION_ID_KEY, currentId);
          return false;
        }
        
        // Reset if IDs don't match (likely a new browser session)
        return storedId !== currentId;
      } catch {
        return false;
      }
    },
    onReset: () => {
      const newId = generateSessionId();
      sessionStorage.setItem(SESSION_ID_KEY, newId);
    }
  };
}

/**
 * Strategy 3: URL parameter control
 * Reset if ?reset=true is in the URL
 */
export function createUrlParameterStrategy(): SessionResetStrategy {
  return {
    name: 'url_parameter',
    description: 'Reset if ?reset=true in URL',
    shouldReset: () => {
      if (typeof window === 'undefined') return false;
      const params = new URLSearchParams(window.location.search);
      return params.get('reset') === 'true';
    },
    onReset: () => {
      // Remove the reset parameter from URL
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('reset');
        window.history.replaceState({}, '', url.toString());
      }
    }
  };
}

/**
 * Strategy 4: Manual reset only (safest)
 * Only reset when user explicitly clicks "New Search"
 */
export function createManualResetStrategy(): SessionResetStrategy {
  return {
    name: 'manual_only',
    description: 'Only reset on explicit user action',
    shouldReset: () => {
      // Never auto-reset
      return false;
    }
  };
}

/**
 * Strategy 5: Browser visibility change
 * Reset if user returns after tab was hidden for X minutes
 */
export function createVisibilityChangeStrategy(maxHiddenMinutes: number = 30): SessionResetStrategy {
  let lastHiddenTime: number | null = null;
  
  if (typeof window !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        lastHiddenTime = Date.now();
        sessionStorage.setItem('toyota_last_hidden', Date.now().toString());
      } else {
        lastHiddenTime = null;
      }
    });
  }
  
  return {
    name: 'visibility_change',
    description: `Reset if tab was hidden for more than ${maxHiddenMinutes} minutes`,
    shouldReset: () => {
      try {
        const lastHidden = sessionStorage.getItem('toyota_last_hidden');
        if (!lastHidden) return false;
        
        const hiddenDuration = Date.now() - parseInt(lastHidden, 10);
        const maxHidden = maxHiddenMinutes * 60 * 1000;
        
        if (hiddenDuration > maxHidden) {
          sessionStorage.removeItem('toyota_last_hidden');
          return true;
        }
        
        return false;
      } catch {
        return false;
      }
    }
  };
}

/**
 * Strategy 6: Combined strategy
 * Use multiple strategies together (OR logic - reset if ANY strategy says to reset)
 */
export function createCombinedStrategy(strategies: SessionResetStrategy[]): SessionResetStrategy {
  return {
    name: 'combined',
    description: `Combined: ${strategies.map(s => s.name).join(', ')}`,
    shouldReset: () => {
      return strategies.some(strategy => strategy.shouldReset());
    },
    onReset: () => {
      strategies.forEach(strategy => {
        if (strategy.onReset) {
          strategy.onReset();
        }
      });
    }
  };
}

// Helper functions
function getOrCreateSessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_ID_KEY);
    if (!id) {
      id = generateSessionId();
      sessionStorage.setItem(SESSION_ID_KEY, id);
    }
    return id;
  } catch {
    return generateSessionId();
  }
}

function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Update session timestamp (call this whenever session is used)
 */
export function updateSessionTimestamp(): void {
  try {
    sessionStorage.setItem(SESSION_TIMESTAMP_KEY, Date.now().toString());
  } catch {
    // Ignore errors
  }
}

/**
 * Clear session and suggested.json
 */
export async function clearSessionAndSuggestions(): Promise<void> {
  try {
    // Clear session storage
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(SESSION_TIMESTAMP_KEY);
    sessionStorage.removeItem('toyota_reload_checked_v2');
    sessionStorage.removeItem('toyota_last_hidden');
    
    // Clear suggested.json via API
    const { clearSuggestedVehicles } = await import('@/lib/api/vehicles');
    await clearSuggestedVehicles();
    
    console.log('✅ Cleared session and suggested.json');
  } catch (error) {
    console.error('❌ Failed to clear session:', error);
  }
}

/**
 * Check if session should be reset based on strategy
 */
export function shouldResetSession(strategy: SessionResetStrategy): boolean {
  try {
    const shouldReset = strategy.shouldReset();
    
    if (shouldReset && strategy.onReset) {
      strategy.onReset();
    }
    
    return shouldReset;
  } catch (error) {
    console.error('❌ Error checking reset strategy:', error);
    return false;
  }
}

