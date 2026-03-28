# EMBER App - Infrastructure Summary

Complete theme system, constants, context providers, and custom hooks for the EMBER community resilience React Native app with Expo.

## Files Created

### 1. theme/index.ts
Complete theme system with three resilience modes:
- **Peace Mode**: Warm amber tones (accent #d4a574, dark background)
- **Crisis Mode**: Red alert tones (accent #ef4444, dark red background)
- **Recovery Mode**: Green recovery tones (accent #22c55e, dark green background)

**Exports:**
- `AppMode` type: 'peace' | 'crisis' | 'recovery'
- `ColorSet` interface: Complete color palette per mode
- `Typography` interface: h1, h2, h3, body, caption, micro, mono styles
- `Spacing` interface: xs(4), sm(8), md(12), lg(16), xl(20), xxl(28), xxxl(40)
- `BorderRadius` interface: sm(6), md(8), lg(10), xl(12), xxl(16)
- `Theme` interface: Combines all above
- `getTheme(mode: AppMode): Theme` function
- Constants: TYPOGRAPHY, SPACING, BORDER_RADIUS

### 2. constants/index.ts
Core app constants and enums:
- **STATUS enum**: SAFE, HELP, UNKNOWN
- **RESOURCE_CATEGORY enum**: WATER, FOOD, MEDICAL, POWER, COMMS (with icons)
- **DRILL_DIFFICULTY enum**: EASY, MEDIUM, HARD (with XP rewards)
- **ACHIEVEMENT_DEFINITIONS**: 9 achievements with criteria and rarity levels
- **XP_LEVELS**: 10 levels from "Aware" to "Protector"
- **APP_INFO**: APP_NAME ('EMBER'), APP_VERSION ('1.0.0'), LICENSE ('MIT')
- **MESH_CONFIG**: maxPayloadBytes (237), defaultChannel, region
- **ENCRYPTION_CONFIG**: algorithm (AES-256-GCM), key size (32 bytes), iterations (100k)

### 3. context/AppContext.tsx
Main app state using React Context + Zustand:
- **AppState**: mode, isOnboarded, currentCommunityId, userId
- **useAppStore**: Zustand store with actions
- **AppProvider**: Context provider component
- **useApp()**: Hook to access app state and actions

### 4. context/CommunityContext.tsx
Community state management with computed values:
- **CommunityState**: members, resources, drills, plans, messages, achievements, metadata
- **CommunityComputedValues**:
  - safeCount, helpCount, unknownCount (status breakdowns)
  - criticalResources (quantity < 5)
  - drillAverage (completions per drill)
  - resHealth (percentage of resources at safe level)
  - totalXP (sum of all member XP)
- **CommunityProvider**: Wraps children with community context
- **useCommunity()**: Hook returning state + computed values + actions

### 5. hooks/useDatabase.ts
WatermelonDB integration hooks:
- `initializeDatabase(database)`: Set global database instance
- `getDatabase()`: Get database instance
- `useDatabase()`: Hook returning database
- `useCollection<T>(tableName)`: Hook returning collection
- `useQuery<T>(collection, clauses)`: Query with optional observe
- `useQueryObserve<T>(collection, clauses)`: Reactive query observer

### 6. hooks/useMembers.ts
Member management hook:
- `useMembers(communityId)`: Returns {
  - members[], safeCount, helpCount, unknownCount
  - loading, error
  - checkIn(memberId, status)
  - updateMember(memberId, updates)
  - addMember(member)
}

### 7. hooks/useResources.ts
Resource inventory management hook:
- `useResources(communityId)`: Returns {
  - resources[], byCategory, criticalItems
  - resHealth (percentage)
  - loading, error
  - updateQuantity(resourceId, quantity)
  - addResource(resource)
  - removeResource(resourceId)
}

### 8. hooks/useCrypto.ts
Cryptographic operations hook with mock implementation:
- `useCrypto()`: Returns {
  - isInitialized, loading, error
  - initialize(password)
  - encrypt(data)
  - decrypt(encrypted)
  - encryptObject<T>(obj)
  - decryptObject<T>(encrypted)
  - destroy()
}
- Mock `MockCryptoManager` for development

### 9. utils/index.ts
Comprehensive utility functions:
- **Time**: timeAgo(), formatTime(), formatDate(), formatDateTime()
- **Math**: clamp(), sum(), average(), min(), max()
- **Array**: chunk(), unique(), groupBy(), flatten(), range()
- **ID**: generateId(prefix)
- **String**: truncate(str, length)
- **Async**: sleep(ms), retry(), debounce(), throttle(), memoize()

## Type Safety

All files use full TypeScript with:
- Complete type annotations
- Generic support where applicable
- Proper error handling
- Interface exports for type reuse

## Integration Points

### Database
- Designed to work with WatermelonDB models
- Hooks ready for reactive queries
- See: db/models/ for data schema

### Crypto
- Mock implementation for development
- Ready for production CryptoManager integration
- See: crypto/ for encryption details

### Existing Models
- Context works with existing components (CheckInButton, DrillCard, etc.)
- Constants align with existing achievement/resource systems
- Theme system ready for UI component styling
