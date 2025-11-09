# Reset Strategies for Smart Search and Suggested.json

## Overview
This document describes alternative reset strategies for managing the smart search session and suggested.json file.

## Available Strategies

### 1. **Timestamp-based Expiration** ⏰
**Description**: Reset session if it's older than X minutes (default: 60 minutes)

**Pros**:
- Prevents stale sessions
- Automatic cleanup
- Configurable timeout

**Cons**:
- May reset active sessions
- Requires timestamp tracking

**Usage**:
```typescript
import { createTimestampExpirationStrategy, shouldResetSession } from '@/lib/utils/sessionManager';

const strategy = createTimestampExpirationStrategy(60); // 60 minutes
if (shouldResetSession(strategy)) {
  await clearSessionAndSuggestions();
}
```

---

### 2. **Session ID Validation** 🆔
**Description**: Reset if session ID doesn't match (detects browser restart/new tab)

**Pros**:
- Reliable browser restart detection
- Simple implementation
- Works across tabs

**Cons**:
- Doesn't detect page reloads
- May not work in all scenarios

**Usage**:
```typescript
const strategy = createSessionIdStrategy();
if (shouldResetSession(strategy)) {
  await clearSessionAndSuggestions();
}
```

---

### 3. **URL Parameter Control** 🔗
**Description**: Reset if `?reset=true` is in the URL

**Pros**:
- User-controlled
- Easy to trigger
- Can be bookmarked

**Cons**:
- Requires URL manipulation
- Not automatic

**Usage**:
```typescript
const strategy = createUrlParameterStrategy();
if (shouldResetSession(strategy)) {
  await clearSessionAndSuggestions();
}
```

**Example URL**: `http://localhost:3000/?mode=smart&reset=true`

---

### 4. **Manual Reset Only** 👤
**Description**: Only reset when user explicitly clicks "New Search"

**Pros**:
- Most reliable
- User has full control
- No unexpected resets

**Cons**:
- Requires user action
- Session persists across reloads

**Usage**:
```typescript
const strategy = createManualResetStrategy();
// Never auto-resets - only manual
```

---

### 5. **Browser Visibility Change** 👁️
**Description**: Reset if user returns after tab was hidden for X minutes (default: 30 minutes)

**Pros**:
- Detects user abandonment
- Prevents stale sessions
- User-friendly

**Cons**:
- May reset if user switches tabs briefly
- Requires visibility API

**Usage**:
```typescript
const strategy = createVisibilityChangeStrategy(30); // 30 minutes
if (shouldResetSession(strategy)) {
  await clearSessionAndSuggestions();
}
```

---

### 6. **Combined Strategy** 🔀
**Description**: Use multiple strategies together (reset if ANY strategy says to reset)

**Pros**:
- Most flexible
- Can combine best features
- Comprehensive coverage

**Cons**:
- More complex
- May be too aggressive

**Usage**:
```typescript
const strategy = createCombinedStrategy([
  createTimestampExpirationStrategy(60),
  createSessionIdStrategy(),
  createUrlParameterStrategy(),
]);

if (shouldResetSession(strategy)) {
  await clearSessionAndSuggestions();
}
```

---

## Recommended Approach

### Option A: Manual Reset + Timestamp Expiration (Recommended)
```typescript
// Reset if session is older than 2 hours OR user clicks "New Search"
const strategy = createCombinedStrategy([
  createTimestampExpirationStrategy(120), // 2 hours
  createManualResetStrategy(), // Always allow manual reset
]);
```

### Option B: Manual Reset + URL Parameter
```typescript
// Reset on manual action OR ?reset=true in URL
const strategy = createCombinedStrategy([
  createManualResetStrategy(),
  createUrlParameterStrategy(),
]);
```

### Option C: Manual Reset Only (Simplest)
```typescript
// Only reset when user explicitly clicks "New Search"
const strategy = createManualResetStrategy();
```

---

## Implementation Example

```typescript
// In page.tsx or ChatInterface.tsx
import { 
  createTimestampExpirationStrategy, 
  createManualResetStrategy,
  createCombinedStrategy,
  shouldResetSession,
  clearSessionAndSuggestions,
  updateSessionTimestamp
} from '@/lib/utils/sessionManager';

// On component mount
useEffect(() => {
  // Create your chosen strategy
  const strategy = createCombinedStrategy([
    createTimestampExpirationStrategy(120), // 2 hours
    createManualResetStrategy(),
  ]);
  
  // Check if session should be reset
  if (shouldResetSession(strategy)) {
    clearSessionAndSuggestions();
    // Reset view to search
    setCurrentView('search');
  } else {
    // Update timestamp to keep session alive
    updateSessionTimestamp();
    // Restore session if it exists
    restoreSession();
  }
}, []);

// Update timestamp whenever session is used
useEffect(() => {
  updateSessionTimestamp();
}, [chatHistory]);
```

---

## Choosing the Right Strategy

| Use Case | Recommended Strategy |
|----------|---------------------|
| **Hackathon/Demo** | Manual Reset Only |
| **Production (Short sessions)** | Timestamp Expiration (30-60 min) |
| **Production (Long sessions)** | Manual Reset + Timestamp (2+ hours) |
| **Testing/Debugging** | URL Parameter Control |
| **User-friendly** | Visibility Change (30 min) |
| **Maximum Control** | Combined (Manual + Timestamp + URL) |

---

## Migration Guide

To switch from current approach to a new strategy:

1. Import the strategy utilities
2. Replace reload detection logic with strategy check
3. Update session restoration logic
4. Test with different scenarios

Example migration:
```typescript
// OLD: Reload detection
useEffect(() => {
  const isReload = /* complex reload detection */;
  if (isReload) {
    clearSession();
  }
}, []);

// NEW: Strategy-based
useEffect(() => {
  const strategy = createTimestampExpirationStrategy(60);
  if (shouldResetSession(strategy)) {
    clearSessionAndSuggestions();
  }
}, []);
```

