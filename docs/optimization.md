# Performance Optimization TODO

## 🔥 CRITICAL: Excessive Network Requests on App Start

### **Observed Network Activity:**
On app startup, the following requests are being made (captured from network tab):

```
1. expected_incomes?select=*...     200  fetch  1.1 kB  111 ms
2. expected_invoices?select=*...    200  fetch  1.6 kB  132 ms
3. budgets?select=*&order=cr...     200  fetch  1.1 kB  104 ms
4. transactions?select=*&order...   200  fetch  3.4 kB  123 ms
5. expected_incomes?select=*...     200  fetch  1.1 kB  136 ms  ⚠️ DUPLICATE
6. categories?select=*&is_visib...  200  fetch  1.9 kB  129 ms
7. transactions?select=*&order...   200  fetch  3.4 kB  126 ms  ⚠️ DUPLICATE
8. budgets?select=*&order=cr...     200  fetch  1.1 kB  125 ms  ⚠️ DUPLICATE
9. transactions?select=*&order...   200  fetch  3.4 kB   99 ms  ⚠️ DUPLICATE
10. expected_invoices?select=*...   200  fetch  1.6 kB   97 ms  ⚠️ DUPLICATE
11. budgets?select=*&order=cr...    200  fetch  1.1 kB  113 ms  ⚠️ DUPLICATE
12. expected_invoices?select=*...   200  fetch  1.6 kB   83 ms  ⚠️ DUPLICATE
13. categories?select=*&is_visib... 200  fetch  1.9 kB   96 ms  ⚠️ DUPLICATE
14. expected_incomes?select=*...    200  fetch  1.1 kB  107 ms  ⚠️ DUPLICATE
15. app_settings?select=*&limit=1   200  fetch  0.9 kB   89 ms
```

### **Analysis:**

**Total Requests:** 15 requests  
**Duplicate Requests:** 9 duplicates (60% redundancy!)  
**Total Data Transfer:** ~20.3 kB (could be ~8.9 kB without duplicates)  
**Total Time:** ~1.7 seconds of cumulative request time

**Breakdown by Endpoint:**
- `expected_incomes`: 3 requests (2 duplicates) ❌
- `expected_invoices`: 3 requests (2 duplicates) ❌
- `budgets`: 3 requests (2 duplicates) ❌
- `transactions`: 3 requests (2 duplicates) ❌
- `categories`: 2 requests (1 duplicate) ❌
- `app_settings`: 1 request ✅

### **Root Causes:**

1. **Multiple Effect Hooks Firing Simultaneously**
   - Initial mount effect
   - Focus effect (fires on mount too)
   - Month change effect (fires on initial month set)
   
2. **No Request Deduplication**
   - Same queries executed multiple times in quick succession
   - No caching mechanism between effects

3. **Tab Pre-loading**
   - Both Home and Transactions tabs may be loading data simultaneously
   - No coordination between tabs for shared data (transactions, categories)

### **Impact:**

- 🐌 **Slower app startup** - 60% wasted network requests
- 💰 **Higher data costs** - Especially on mobile networks
- 🔋 **Battery drain** - Unnecessary network activity
- 🌐 **API load** - 2-3x more requests than needed on Supabase
- 📱 **Poor UX** - Longer loading times on slow connections

---

## 🚨 Current Issues: Multiple Effect Hooks

### **Problem Analysis:**
We're using multiple `useEffect` and `useFocusEffect` hooks that may be causing:
- **Redundant data fetching** - same data loaded multiple times
- **Race conditions** - multiple async calls competing  
- **Performance degradation** - unnecessary re-renders and network calls
- **Memory usage** - multiple concurrent async operations

### **Current Hook Usage:**

#### **Home Tab (`index.tsx`):**
```typescript
// 1. Initial load on mount
useEffect(() => { /* load all data */ }, [showSnackbar]);

// 2. Month changes  
useEffect(() => { /* refetch month-specific data */ }, [currentMonth]);

// 3. Focus refresh
useFocusEffect(() => { /* refresh all data */ });

// 4. Debug logging
useEffect(() => { /* log data */ }, [currentIncomes, currentInvoices, currentBudgets, categories]);
```

#### **Transactions Tab (`transactions.tsx`):**
```typescript
// 1. Month changes
useEffect(() => { /* refetch month-specific data */ }, [currentMonth]);

// 2. Focus refresh  
useFocusEffect(() => { /* refresh data */ });
```

### **Optimization Strategies:**

#### **Option A: Consolidated Data Manager**
- Single custom hook `useAppData()` to manage all data fetching
- Centralized cache with smart invalidation
- Single source of truth for data state

#### **Option B: React Query / TanStack Query**
- Replace manual caching with proven query library
- Automatic background refetching, deduplication, caching
- Built-in loading states and error handling

#### **Option C: Effect Consolidation**
- Merge overlapping effects into single hooks
- Use effect cleanup to prevent race conditions
- Smart dependency arrays to prevent unnecessary calls

### **Specific Optimizations Needed:**

1. **Deduplicate Data Fetching**
   - Month change + focus effect both fetch same data
   - Initial load + focus effect redundancy

2. **Smart Cache Invalidation**
   - Only refetch data that actually changed
   - Category updates should only refresh category-dependent data

3. **Loading State Management**
   - Prevent multiple loading states overlapping
   - Show appropriate loading indicators

4. **Memory Cleanup**
   - Cancel pending requests on unmount
   - Cleanup async operations properly

### **Performance Metrics to Track:**
- [ ] Number of concurrent API calls
- [ ] Data fetch frequency per screen
- [ ] Memory usage over time
- [ ] Screen transition performance
- [ ] Network request deduplication

### **Implementation Priority:**
1. **CRITICAL**: Fix duplicate network requests on app startup (60% waste)
2. **High**: Consolidate overlapping effects in home/transactions tabs
3. **Medium**: Implement proper loading states and race condition prevention  
4. **Low**: Consider React Query for advanced caching (future enhancement)

### **Proposed Solutions:**

#### **Immediate Fixes (Quick Wins):**
1. **Add Request Deduplication**
   - Implement simple in-memory cache with timestamps
   - Skip requests if data was fetched within last N seconds
   - Use a `Map<endpoint, {data, timestamp}>` pattern

2. **Consolidate Initial Load**
   - Remove redundant `useFocusEffect` on mount
   - Use single `useEffect` for initial data load
   - Add flag to prevent focus effect on first mount

3. **Shared Data Context**
   - Move `transactions` and `categories` to app-level context
   - Prevent multiple tabs from fetching same data
   - Single source of truth for shared resources

#### **Long-term Solutions:**
1. **React Query Integration**
   - Automatic deduplication and caching
   - Background refetching with stale-while-revalidate
   - Built-in loading/error states

2. **Optimistic Updates**
   - Update UI immediately on user actions
   - Sync with backend in background
   - Reduce perceived loading times

3. **Lazy Tab Loading**
   - Only load data for active tab
   - Defer non-visible tab data fetching
   - Load on-demand when user switches tabs

---

**Status**: 📋 TODO - Address after current critical bugs are resolved  
**Estimated Impact**: 🚀 **HUGE** - 60% reduction in network requests, faster startup, better UX  
**Risk Level**: 🟡 Medium - requires careful testing to avoid breaking existing functionality  
**Data**: Based on actual network trace showing 15 requests (9 duplicates) on app startup

