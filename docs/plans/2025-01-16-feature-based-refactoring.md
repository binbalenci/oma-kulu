# Codebase Refactoring Plan: Feature-Based Architecture (LLM-Optimized) with Testing

**Date:** January 16, 2025
**Status:** Planning
**Goal:** Transform large screen files (1911, 1253, 921 lines) into a feature-based architecture with files under 300 lines, optimized for LLM understanding and maintenance. Introduce comprehensive testing for business logic alongside refactoring.

---

## 📊 Current State Analysis

### File Sizes (Critical Issues)

| File | Lines | Target | Reduction |
|------|-------|--------|-----------|
| `app/(tabs)/index.tsx` | 1,911 | 250-300 | 1,600+ lines |
| `app/(tabs)/transactions.tsx` | 1,253 | 300-400 | 850+ lines |
| `lib/database.ts` | 921 | 450-500 | 400+ lines |
| `app/(tabs)/reports.tsx` | 769 | 400-450 | 300+ lines |
| `app/(tabs)/categories.tsx` | 733 | 400-500 | 250+ lines |

**Total reduction target:** ~3,400 lines reorganized into modular structure

### Key Problems Identified

1. **Mixed Concerns** - Screens contain UI, business logic, data fetching, and state management
2. **Code Duplication** - Financial calculations repeated 3-4 times across files
3. **Tight Coupling** - Direct database calls from UI components
4. **Large State Complexity** - 10-15 state variables per screen
5. **Hard to Test** - Business logic embedded in React components
6. **Poor LLM Context** - Files too large for efficient LLM comprehension

---

## 🎯 Target Architecture: Feature-Based Organization

### Principles

1. **Feature-First Organization** - Group by business domain, not technical type
2. **LLM-Optimized Conventions** - Predictable naming, flat structure, clear boundaries
3. **Separation of Concerns** - Screens → Hooks → Services → Database
4. **Single Responsibility** - One file, one purpose (100-300 lines ideal)
5. **Documentation-Driven** - README.md in each feature folder

### Final Structure

```
oma-kulu/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx           # → import from features/budget
│   │   ├── transactions.tsx    # → import from features/transactions
│   │   ├── reports.tsx         # → import from features/reports
│   │   └── categories.tsx      # → import from features/categories
│   └── _layout.tsx
│
├── features/
│   ├── shared/                 # Shared across features
│   │   ├── README.md
│   │   ├── components/         # Generic UI (Dialog, CategoryBadge, etc.)
│   │   ├── hooks/              # useMonth, useSnackbar, useFinancialData
│   │   │   ├── useFinancialData.ts
│   │   │   └── useFinancialData.test.ts      ← Test co-located
│   │   └── services/           # Calculations, formatters, validators
│   │       ├── calculations.ts
│   │       ├── calculations.test.ts          ← Test co-located
│   │       ├── formatters.ts
│   │       ├── formatters.test.ts            ← Test co-located
│   │       ├── validators.ts
│   │       ├── validators.test.ts            ← Test co-located
│   │       ├── database-helpers.ts
│   │       └── database-helpers.test.ts      ← Test co-located
│   │
│   ├── budget/
│   │   ├── README.md           # Feature documentation + testing info
│   │   ├── components/         # Budget-specific UI (NO TESTS)
│   │   │   ├── index.ts
│   │   │   ├── CashOverviewCard.tsx
│   │   │   ├── MoneyToAssignCard.tsx
│   │   │   ├── CategoryGroup.tsx
│   │   │   ├── BudgetCard.tsx
│   │   │   ├── IncomeSection.tsx
│   │   │   └── InvoiceSection.tsx
│   │   ├── hooks/              # Budget data & state (TESTED)
│   │   │   ├── index.ts
│   │   │   ├── useBudgetData.ts
│   │   │   ├── useBudgetData.test.ts
│   │   │   ├── useBudgetForm.ts
│   │   │   ├── useBudgetForm.test.ts
│   │   │   ├── useIncomeForm.ts
│   │   │   ├── useIncomeForm.test.ts
│   │   │   ├── useTransactionCreation.ts
│   │   │   ├── useTransactionCreation.test.ts  ← CRITICAL logic
│   │   │   └── useBudgetCalculations.ts
│   │   ├── services/           # Budget calculations (TESTED)
│   │   │   ├── budgetValidation.ts
│   │   │   └── budgetValidation.test.ts
│   │   ├── types.ts            # Budget types (NO TEST)
│   │   ├── index.ts            # Public API (NO TEST)
│   │   └── screen.tsx          # Main screen (NO TEST - composition only)
│   │
│   ├── transactions/
│   │   ├── README.md
│   │   ├── components/         # UI (NO TESTS)
│   │   ├── hooks/              # Business logic (TESTED)
│   │   │   ├── useTransactionData.ts
│   │   │   ├── useTransactionData.test.ts
│   │   │   ├── useTransactionReorder.ts
│   │   │   ├── useTransactionReorder.test.ts   ← CRITICAL logic
│   │   │   ├── useTransactionFilters.ts
│   │   │   ├── useTransactionFilters.test.ts
│   │   │   ├── useTransactionForm.ts
│   │   │   └── useTransactionForm.test.ts
│   │   ├── services/           # Helpers (TESTED)
│   │   │   ├── transactionHelpers.ts
│   │   │   └── transactionHelpers.test.ts
│   │   ├── types.ts
│   │   ├── index.ts
│   │   └── screen.tsx
│   │
│   ├── reports/
│   └── categories/
│
├── lib/                        # Core infrastructure
│   ├── database.ts             # Supabase operations (cleaned up)
│   ├── database-helpers.ts     # Generic CRUD, category resolution
│   ├── types.ts                # Global types only
│   └── supabase.ts
│
├── components/                 # Legacy (will be migrated to features/shared)
│
├── jest.config.js              # Jest configuration
└── jest.setup.js               # Test setup and mocks
```

---

## 🧪 Testing Strategy

### Testing Framework & Tools

**Core Dependencies (Install Now):**
- `jest` - Testing framework
- `jest-expo` - Expo preset for Jest
- `ts-jest` - TypeScript support
- `@types/jest` - TypeScript types

**Hook Testing (Install in Phase 1E):**
- `@testing-library/react` - Modern hook testing with `renderHook()`

### What Gets Tested

✅ **Services** (Pure Functions)
- Financial calculations
- Formatters
- Validators
- Database helpers
- **Target:** 100% coverage

✅ **Hooks** (Business Logic)
- Data loading hooks
- Form state hooks
- Critical business logic (transaction creation, reordering)
- **Target:** 90%+ coverage

❌ **Components** (UI)
- No component tests (too brittle, low ROI)

❌ **Screens** (Composition)
- No screen tests (just composition)

❌ **Types & Re-exports**
- No tests for type definitions or index files

### Test File Structure

**Co-located Tests (Recommended):**
```
features/shared/services/
├── calculations.ts
├── calculations.test.ts       ← Right next to source
├── formatters.ts
└── formatters.test.ts         ← Right next to source
```

**Jest Auto-Discovery:**
- Matches: `*.test.ts`, `*.test.tsx`, `*.spec.ts`, `*.spec.tsx`

### Test Configuration Files

**jest.config.js:**
```javascript
module.exports = {
  preset: 'jest-expo',
  testMatch: [
    '**/__tests__/**/*.{ts,tsx}',
    '**/*.{test,spec}.{ts,tsx}',
  ],
  collectCoverageFrom: [
    'features/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    '!**/*.test.{ts,tsx}',
    '!**/*.d.ts',
    '!**/index.ts',
    '!**/types.ts',
    '!**/*.tsx',  // Exclude components
  ],
  coverageThresholds: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
```

**jest.setup.js:**
```javascript
// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    auth: { getSession: jest.fn() },
  },
}));

// Mock Expo modules
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useSegments: jest.fn(),
}));
```

**package.json scripts:**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:shared": "jest features/shared",
    "test:budget": "jest features/budget"
  }
}
```

### Coverage Targets by Phase

| Phase | New Tests | Coverage Goal |
|-------|-----------|---------------|
| Phase 0 | Jest setup | N/A |
| Phase 1 | Shared services + hooks | 90%+ |
| Phase 2 | Budget hooks + services | 85%+ |
| Phase 3 | Database helpers | 80%+ |
| Phase 4 | Transaction hooks | 90%+ |
| Phase 5 | Reports/Categories | 80%+ |

---

## 🚀 Phase-by-Phase Execution Plan

### **Phase 0: Testing Setup** ⏱️ 1-2 hours (Prerequisite)

**Goal:** Install and configure Jest before starting refactoring

#### Tasks

1. **Install core Jest dependencies**
   ```bash
   npm install --save-dev jest jest-expo ts-jest @types/jest
   ```

2. **Create `jest.config.js`**
   - Configure for Expo + TypeScript
   - Set up coverage thresholds
   - Configure test file patterns

3. **Create `jest.setup.js`**
   - Mock Supabase client
   - Mock Expo modules (router, etc.)

4. **Add test scripts to `package.json`**
   - `test`, `test:watch`, `test:coverage`
   - Feature-specific test scripts

5. **Update `.gitignore`**
   - Add `coverage/` directory

6. **Create example test to verify setup**
   - Simple smoke test
   - Run `npm test` to verify

#### Outcomes

- ✅ Jest fully configured and working
- ✅ Can run tests with `npm test`
- ✅ Foundation ready for test-driven refactoring

---

### **Phase 1: Foundation Layer** ⏱️ Week 1 (Low Risk, High ROI)

**Goal:** Extract shared utilities used across all screens WITH comprehensive tests

#### Batches

**Batch 1A: Calculations Service** ⏱️ 2-3 hours

1. **Create folder structure**
   ```bash
   mkdir -p features/shared/{components,hooks,services}
   ```

2. **Create `features/shared/services/calculations.ts`** (~150 lines)
   - Extract from index.tsx, reports.tsx, transactions.tsx:
     - `calculateMoneyToAssign(incomes, invoices, budgets, savings)`
     - `calculateActualInBank(transactions, currentDate)`
     - `calculateSpentByCategory(transactions, categories)`
     - `calculateSavingsBalance(transactions, category)`
   - Add JSDoc comments with formulas
   - Pure functions, easy to test

3. **Create `features/shared/services/calculations.test.ts`** (~200 lines)
   ```typescript
   describe('calculateMoneyToAssign', () => {
     it('should calculate correctly with positive balance', () => {
       const incomes = [{ amount: 5000, is_paid: false }];
       const invoices = [{ amount: 2000, is_paid: false }];
       const budgets = [{ allocated: 1000 }];
       expect(calculateMoneyToAssign(incomes, invoices, budgets)).toBe(2000);
     });

     it('should handle negative balance', () => { /* ... */ });
     it('should handle empty arrays', () => { /* ... */ });
     it('should exclude paid items from expected totals', () => { /* ... */ });
   });

   describe('calculateActualInBank', () => {
     it('should only include paid transactions up to current date', () => { /* ... */ });
     it('should exclude future-dated transactions', () => { /* ... */ });
   });
   ```

4. **Verify:** Run `npm test features/shared/services/calculations`
   - Target: 100% coverage
   - All edge cases covered

**Batch 1B: Formatters Service** ⏱️ 1-2 hours

1. **Create `features/shared/services/formatters.ts`** (~100 lines)
   - Extract currency formatting utilities
   - Extract date formatting utilities
   - Consolidate repeated patterns

2. **Create `features/shared/services/formatters.test.ts`** (~150 lines)
   ```typescript
   describe('formatCurrency', () => {
     it('should format positive numbers', () => {
       expect(formatCurrency(1234.56)).toBe('$1,234.56');
     });
     it('should handle negative numbers', () => {
       expect(formatCurrency(-100)).toBe('-$100.00');
     });
     it('should handle zero', () => {
       expect(formatCurrency(0)).toBe('$0.00');
     });
   });

   describe('formatDate', () => {
     it('should format dates correctly', () => { /* ... */ });
     it('should handle invalid dates', () => { /* ... */ });
   });
   ```

3. **Verify:** Run `npm test features/shared/services/formatters`
   - Target: 100% coverage

**Batch 1C: Validators Service** ⏱️ 1-2 hours

1. **Create `features/shared/services/validators.ts`** (~100 lines)
   - Extract form validation logic
   - Budget validation
   - Transaction validation

2. **Create `features/shared/services/validators.test.ts`** (~150 lines)
   ```typescript
   describe('validateBudgetAmount', () => {
     it('should accept valid positive amounts', () => {
       expect(validateBudgetAmount(100)).toBe(true);
     });
     it('should reject negative amounts', () => {
       expect(validateBudgetAmount(-50)).toBe(false);
     });
     it('should reject zero', () => {
       expect(validateBudgetAmount(0)).toBe(false);
     });
   });
   ```

3. **Verify:** Run `npm test features/shared/services/validators`
   - Target: 100% coverage

**Batch 1D: Database Helpers** ⏱️ 2-3 hours

1. **Create `features/shared/services/database-helpers.ts`** (~150 lines)
   - Extract from database.ts:
     - Category ID resolution utilities
     - Common query patterns
     - Error handling helpers

2. **Create `features/shared/services/database-helpers.test.ts`** (~200 lines)
   ```typescript
   import { createClient } from '@supabase/supabase-js';

   jest.mock('@supabase/supabase-js');

   describe('getCategoryIdByName', () => {
     it('should return category ID when found', async () => {
       const mockSupabase = {
         from: jest.fn().mockReturnValue({
           select: jest.fn().mockReturnValue({
             eq: jest.fn().mockResolvedValue({
               data: [{ id: 'uuid-123', name: 'Groceries' }],
               error: null
             })
           })
         })
       };

       const result = await getCategoryIdByName('Groceries');
       expect(result).toBe('uuid-123');
     });

     it('should return null when category not found', async () => { /* ... */ });
     it('should handle database errors gracefully', async () => { /* ... */ });
   });
   ```

3. **Verify:** Run `npm test features/shared/services/database-helpers`
   - Target: 90%+ coverage

**Batch 1E: useFinancialData Hook** ⏱️ 2-3 hours

1. **Install hook testing library**
   ```bash
   npm install --save-dev @testing-library/react
   ```

2. **Create `features/shared/hooks/useFinancialData.ts`** (~100 lines)
   - Centralize common data loading pattern
   - Combines: loadIncomes, loadInvoices, loadBudgets, loadTransactions
   - Returns: `{ data, loading, error, refresh }`

3. **Create `features/shared/hooks/useFinancialData.test.ts`** (~150 lines)
   ```typescript
   import { renderHook, waitFor } from '@testing-library/react';
   import { useFinancialData } from './useFinancialData';

   jest.mock('@/lib/database');

   describe('useFinancialData', () => {
     it('should load data successfully', async () => {
       const { result } = renderHook(() => useFinancialData('2025-01'));

       expect(result.current.loading).toBe(true);

       await waitFor(() => {
         expect(result.current.loading).toBe(false);
       });

       expect(result.current.data).toBeDefined();
       expect(result.current.error).toBeNull();
     });

     it('should handle errors', async () => { /* ... */ });
     it('should refresh data when called', async () => { /* ... */ });
   });
   ```

4. **Verify:** Run `npm test features/shared/hooks/useFinancialData`
   - Target: 90%+ coverage

**Batch 1F: Documentation & Index Files** ⏱️ 1 hour

1. **Create `features/shared/services/index.ts`**
   ```typescript
   export * from './calculations';
   export * from './formatters';
   export * from './validators';
   export * from './database-helpers';
   ```

2. **Create `features/shared/hooks/index.ts`**
   ```typescript
   export * from './useFinancialData';
   ```

3. **Create `features/shared/components/index.ts`**
   ```typescript
   // Placeholder for future shared components
   ```

4. **Create `features/shared/README.md`**
   ```markdown
   # Shared Feature Utilities

   ## Purpose
   Common utilities, calculations, and hooks used across all features.

   ## Services
   - `calculations.ts` - Financial calculations **[TESTED - 100%]**
   - `formatters.ts` - Currency and date formatting **[TESTED - 100%]**
   - `validators.ts` - Form validation logic **[TESTED - 100%]**
   - `database-helpers.ts` - Database utilities **[TESTED - 90%]**

   ## Hooks
   - `useFinancialData.ts` - Centralized data loading **[TESTED - 90%]**

   ## Testing
   - **Unit Tests**: All services have 100% coverage
   - **Hook Tests**: useFinancialData has 90%+ coverage
   - **Run Tests**: `npm test features/shared`
   - **Coverage**: `npm test features/shared -- --coverage`

   ## Usage
   ```typescript
   import { calculateMoneyToAssign, formatCurrency } from '@/features/shared/services';
   import { useFinancialData } from '@/features/shared/hooks';
   ```

   ## When to Add Here vs Feature-Specific
   - **Add here** if used by 2+ features
   - **Keep feature-specific** if only used in one feature
   ```

#### Outcomes

- ✅ 400+ lines removed from screens
- ✅ Foundation ready for feature extraction
- ✅ No breaking changes (additive only)
- ✅ Immediate reduction in duplication
- ✅ **90%+ test coverage on all shared utilities**
- ✅ **Comprehensive test suite as foundation for future work**

---

### **Phase 2: Budget Feature Refactoring** ⏱️ Week 2 (Medium Risk, Highest Impact)

**Goal:** Refactor index.tsx (1,911 lines) → features/budget/ (~250-300 lines)

#### Tasks

1. **Create feature structure**
   ```bash
   mkdir -p features/budget/{components,hooks,services}
   touch features/budget/README.md
   ```

2. **Extract components from index.tsx:**

   **Create `CashOverviewCard.tsx` (~80 lines)**
   - "In Bank" display
   - "Expected" display
   - Props: `actualInBank`, `expectedBalance`

   **Create `MoneyToAssignCard.tsx` (~60 lines)**
   - Money to assign display
   - Uses calculation from shared services
   - Props: `moneyToAssign`

   **Create `CategoryGroup.tsx` (~120 lines)**
   - Category grouping logic
   - Expansion/collapse state
   - Props: `items`, `type`, `onItemClick`

   **Create `BudgetCard.tsx` (~80 lines)**
   - Individual budget display
   - Progress bar
   - Edit/Delete actions
   - Props: `budget`, `spent`, `onEdit`, `onDelete`

   **Create `IncomeSection.tsx` (~100 lines)**
   - Income list with grouping
   - Add/Edit forms
   - Mark as paid toggle
   - Props: `incomes`, `onAdd`, `onEdit`, `onTogglePaid`

   **Create `InvoiceSection.tsx` (~100 lines)**
   - Invoice list with grouping
   - Similar pattern to IncomeSection
   - Props: `invoices`, `onAdd`, `onEdit`, `onTogglePaid`

3. **Extract hooks:**

   **Create `useBudgetData.ts` (~80 lines)**
   ```typescript
   export function useBudgetData(monthKey: string) {
     const [budgets, setBudgets] = useState<Budget[]>([]);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
       loadBudgets(monthKey).then(setBudgets).finally(() => setLoading(false));
     }, [monthKey]);

     const refresh = useCallback(async () => {
       const data = await loadBudgets(monthKey);
       setBudgets(data);
     }, [monthKey]);

     return { budgets, loading, refresh };
   }
   ```

   **Create `useBudgetForm.ts` (~60 lines)**
   - Budget add/edit form state
   - Validation
   - Submit handler

   **Create `useIncomeForm.ts` (~60 lines)**
   - Income add/edit form state
   - Similar pattern to budget form

   **Create `useTransactionCreation.ts` (~150 lines)** ⚠️ CRITICAL
   - Extract `togglePaid` logic from index.tsx
   - Handles transaction creation from expected items
   - Savings deduction
   - Order index calculation
   ```typescript
   export function useTransactionCreation() {
     const createFromIncome = async (income) => { /* ... */ };
     const createFromInvoice = async (invoice) => { /* ... */ };
     return { createFromIncome, createFromInvoice };
   }
   ```

   **Create `useBudgetCalculations.ts` (~40 lines)**
   - Wrapper around shared calculation services
   - Budget-specific calculation logic

4. **Create `features/budget/services/budgetValidation.ts`** + tests
   - Budget-specific validation rules
   - Amount validation
   - Category validation

5. **Create `features/budget/services/budgetValidation.test.ts`**
   ```typescript
   describe('validateBudgetAllocation', () => {
     it('should validate correct budget data', () => { /* ... */ });
     it('should reject invalid amounts', () => { /* ... */ });
     it('should require category selection', () => { /* ... */ });
   });
   ```

6. **Create tests for all hooks:**
   - `useBudgetData.test.ts` - Test data loading, error handling
   - `useBudgetForm.test.ts` - Test form state, validation
   - `useIncomeForm.test.ts` - Test income form logic
   - **`useTransactionCreation.test.ts`** - **CRITICAL: Test "mark as paid" logic**
     ```typescript
     describe('useTransactionCreation', () => {
       describe('createFromIncome', () => {
         it('should create transaction with correct amount', () => { /* ... */ });
         it('should mark income as paid', () => { /* ... */ });
         it('should set correct order_index', () => { /* ... */ });
       });

       describe('createFromInvoice', () => {
         it('should deduct from savings if configured', () => { /* ... */ });
         it('should handle multiple savings categories', () => { /* ... */ });
       });
     });
     ```

7. **Run all tests and verify coverage:**
   ```bash
   npm test features/budget -- --coverage
   ```
   - Target: 85%+ coverage on hooks
   - Target: 100% coverage on budgetValidation

8. **Create `features/budget/types.ts`**
   - Budget-specific types (if any beyond global types)
   - Form data interfaces

9. **Create `features/budget/README.md`**
   ```markdown
   # Budget Feature

   ## Purpose
   Manages budget allocation, income tracking, invoice tracking, and savings goals.

   ## Key Components
   - `BudgetCard.tsx` - Displays individual budget with progress
   - `CategoryGroup.tsx` - Groups items by category
   - `CashOverviewCard.tsx` - Shows total income vs expenses
   - `MoneyToAssignCard.tsx` - Shows unallocated money

   ## Key Hooks
   - `useBudgetData()` - Loads budgets for current month **[TESTED]**
   - `useBudgetForm()` - Budget form state **[TESTED]**
   - `useIncomeForm()` - Income form state **[TESTED]**
   - `useTransactionCreation()` - Creates transactions from expected items **[TESTED - CRITICAL]**

   ## Services
   - `budgetValidation.ts` - Budget validation rules **[TESTED]**

   ## Business Logic
   - **Money to Assign** = expectedIncome - expectedExpenses - totalAllocated
   - **Actual in Bank** = totalIncome - totalExpenses (paid only, date <= today)

   ## Testing
   - **Hook Tests**: All hooks tested with 85%+ coverage
   - **Service Tests**: budgetValidation.ts tested with 100% coverage
   - **Critical Logic**: useTransactionCreation "mark as paid" logic fully tested
   - **Run Tests**: `npm test features/budget`
   - **Coverage**: `npm test features/budget -- --coverage`

   ## Dependencies
   - Shared: calculations, formatters, validators, useFinancialData
   - Database: loadBudgets, saveBudget, loadIncomes, saveIncome, loadInvoices, saveInvoice
   ```

10. **Create `features/budget/index.ts` (re-exports)**
   ```typescript
   export { default as BudgetScreen } from './screen';
   export * from './components';
   export * from './hooks';
   export * from './types';
   ```

11. **Create `features/budget/screen.tsx` (250-300 lines)**
   - Main screen component
   - Composition only (uses extracted components)
   - Minimal state (delegates to hooks)

12. **Update `app/(tabs)/index.tsx`**
   - Replace with thin wrapper:
   ```typescript
   import { BudgetScreen } from '@/features/budget';
   export default BudgetScreen;
   ```

#### Outcomes

- ✅ index.tsx: 1,911 lines → ~50 lines (wrapper) + 250 lines (screen.tsx)
- ✅ Clear component boundaries
- ✅ Reusable hooks for data and forms
- ✅ Critical "mark as paid" logic isolated and testable
- ✅ **85%+ test coverage on all business logic hooks**
- ✅ **100% test coverage on budgetValidation service**
- ✅ **CRITICAL useTransactionCreation logic fully tested**

---

### **Phase 3: Database Layer Cleanup** ⏱️ Week 3 (Medium Risk)

**Goal:** Refactor lib/database.ts (921 lines) → (~450-500 lines)

#### Tasks

1. **Create `lib/database-helpers.ts`** (~200 lines)

   **Generic CRUD pattern:**
   ```typescript
   async function genericLoad<T>(
     table: string,
     monthKey?: string
   ): Promise<T[]> {
     try {
       let query = supabase.from(table).select('*');
       if (monthKey) query = query.eq('month', monthKey);
       const { data, error } = await query;
       if (error) throw error;
       return data || [];
     } catch (error) {
       logger.databaseError(error, `load${table}`, { monthKey });
       return [];
     }
   }
   ```

   **Category resolution:**
   ```typescript
   export async function getCategoryIdByName(name: string): Promise<string | null> {
     // Single implementation used everywhere
   }

   export async function createCategoryMap(): Promise<Map<string, Category>> {
     // Single implementation
   }
   ```

2. **Refactor `lib/database.ts`**
   - Use `genericLoad` for repetitive patterns
   - Remove duplicated error handling
   - Keep table-specific complex logic
   - Use helpers for category resolution

3. **Add database operation logging**
   - Consistent logging for all operations
   - Performance tracking

4. **Create tests for database-helpers moved to lib/**
   - `lib/database-helpers.test.ts`
   - Mock Supabase client
   - Test category resolution
   - Test error handling
   ```typescript
   describe('lib/database-helpers', () => {
     it('should handle database errors gracefully', () => { /* ... */ });
     it('should resolve category IDs correctly', () => { /* ... */ });
   });
   ```

5. **Run tests and verify coverage:**
   ```bash
   npm test lib/database-helpers -- --coverage
   ```
   - Target: 80%+ coverage

#### Outcomes

- ✅ database.ts reduced by 400+ lines
- ✅ Consistent error handling
- ✅ Easier to add new tables
- ✅ Better maintainability
- ✅ **80%+ test coverage on database helpers**

---

### **Phase 4: Transactions Feature Refactoring** ⏱️ Week 4 (Medium Risk)

**Goal:** Refactor transactions.tsx (1,253 lines) → features/transactions/ (~300-400 lines)

#### Tasks

1. **Create feature structure**
   ```bash
   mkdir -p features/transactions/{components,hooks,services}
   ```

2. **Extract components:**

   **Create `TransactionList.tsx` (~100 lines)**
   - Transaction list rendering
   - Grouped by date
   - Props: `transactions`, `onEdit`, `onDelete`, `onReorder`

   **Create `TransactionItem.tsx` (~80 lines)**
   - Individual transaction display
   - Up/down arrows for reordering
   - Edit/Delete actions
   - Props: `transaction`, `canMoveUp`, `canMoveDown`, `onMove`

   **Create `UpcomingSection.tsx` (~150 lines)**
   - Upcoming incomes, invoices, savings
   - Grouped display
   - Props: `items`, `type`

   **Create `SavingsUsageCard.tsx` (~60 lines)**
   - Savings usage tracking
   - Progress display
   - Props: `category`, `spent`, `allocated`

   **Create `TransactionFilters.tsx` (~50 lines)**
   - Search input
   - Filter controls
   - Props: `onSearchChange`, `onFilterChange`

3. **Extract hooks:**

   **Create `useTransactionData.ts` (~80 lines)**
   - Load transactions for month
   - Load upcoming items
   - Refresh logic

   **Create `useTransactionReorder.ts` (~150 lines)** ⚠️ CRITICAL
   - Extract reordering logic from transactions.tsx
   - `handleMoveUp`, `handleMoveDown`
   - Order index swapping
   - Database persistence
   ```typescript
   export function useTransactionReorder(transactions: Transaction[]) {
     const moveUp = async (transaction: Transaction) => { /* ... */ };
     const moveDown = async (transaction: Transaction) => { /* ... */ };
     const canMoveUp = (transaction: Transaction) => { /* ... */ };
     const canMoveDown = (transaction: Transaction) => { /* ... */ };

     return { moveUp, moveDown, canMoveUp, canMoveDown };
   }
   ```

   **Create `useTransactionFilters.ts` (~60 lines)**
   - Search state
   - Filter state
   - Filtered results computation

   **Create `useTransactionForm.ts` (~80 lines)**
   - Add/Edit form state
   - Validation
   - Source item synchronization

4. **Create `features/transactions/services/transactionHelpers.ts`** + tests
   - Transaction sorting utilities
   - Source synchronization helpers

5. **Create `features/transactions/services/transactionHelpers.test.ts`**
   ```typescript
   describe('sortTransactionsByDateAndOrder', () => {
     it('should sort by date DESC, then order_index ASC', () => { /* ... */ });
   });
   ```

6. **Create tests for all hooks:**
   - `useTransactionData.test.ts` - Test data loading
   - **`useTransactionReorder.test.ts`** - **CRITICAL: Test reordering logic**
     ```typescript
     describe('useTransactionReorder', () => {
       describe('moveUp', () => {
         it('should swap order_index with previous same-date transaction', () => { /* ... */ });
         it('should not move if no previous same-date transaction', () => { /* ... */ });
       });

       describe('canMoveUp', () => {
         it('should return true only if previous transaction has same date', () => { /* ... */ });
       });
     });
     ```
   - `useTransactionFilters.test.ts` - Test filtering logic
   - `useTransactionForm.test.ts` - Test form state

7. **Run all tests and verify coverage:**
   ```bash
   npm test features/transactions -- --coverage
   ```
   - Target: 90%+ coverage on hooks (especially reordering logic)
   - Target: 100% coverage on transactionHelpers

8. **Create `features/transactions/README.md`**
   ```markdown
   # Transactions Feature

   ## Purpose
   Display and manage all transactions with reordering capabilities.

   ## Hooks
   - `useTransactionData()` - Load transactions **[TESTED]**
   - `useTransactionReorder()` - Reorder same-date transactions **[TESTED - CRITICAL]**
   - `useTransactionFilters()` - Search and filter **[TESTED]**
   - `useTransactionForm()` - Form state **[TESTED]**

   ## Services
   - `transactionHelpers.ts` - Sorting and sync utilities **[TESTED]**

   ## Testing
   - **Hook Tests**: All hooks tested with 90%+ coverage
   - **Critical Logic**: useTransactionReorder fully tested
   - **Run Tests**: `npm test features/transactions`
   ```

9. **Create `features/transactions/screen.tsx` (~300 lines)**
   - Use extracted components and hooks

10. **Update `app/(tabs)/transactions.tsx`**
   - Thin wrapper to features/transactions

#### Outcomes

- ✅ transactions.tsx: 1,253 lines → ~300 lines
- ✅ Reordering logic isolated
- ✅ Reusable transaction components
- ✅ Clear separation of concerns
- ✅ **90%+ test coverage on all hooks**
- ✅ **CRITICAL reordering logic fully tested**

---

### **Phase 5: Reports & Categories Features** ⏱️ Week 5 (Low Risk)

**Goal:** Quick wins by reusing extracted utilities

#### Reports Feature

1. **Create `features/reports/`**
   - Reuse calculation services from Phase 1
   - Extract category cards component
   - Extract savings tracking component

2. **Expected outcome:**
   - reports.tsx: 769 lines → ~400 lines

#### Categories Feature

1. **Create `features/categories/`**
   - Minor form extraction
   - Already relatively well-structured

2. **Expected outcome:**
   - categories.tsx: 733 lines → ~500 lines

---

## 🤖 LLM Optimization Features

### 1. Naming Conventions

**Components:**
- Pattern: `{Feature}{Type}.tsx`
- Examples: `BudgetCard.tsx`, `TransactionList.tsx`, `CategoryGroup.tsx`

**Hooks:**
- Pattern: `use{Feature}{Purpose}.ts`
- Examples: `useBudgetData.ts`, `useTransactionReorder.ts`, `useFinancialData.ts`

**Services:**
- Pattern: `{feature}{Purpose}.ts`
- Examples: `budgetCalculations.ts`, `transactionHelpers.ts`, `formatters.ts`

**Screens:**
- Always: `screen.tsx` in feature folder
- Entry: `index.tsx` in app/(tabs)/ imports from feature

### 2. README.md Template

Every feature folder gets a README with testing information:

```markdown
# {Feature} Feature

## Purpose
{1-2 sentence description}

## Key Components
- `ComponentA.tsx` - {description}
- `ComponentB.tsx` - {description}

## Key Hooks
- `useFeatureData()` - {description} **[TESTED]**
- `useFeatureForm()` - {description} **[TESTED]**
- `useCriticalLogic()` - {description} **[TESTED - CRITICAL]**

## Services
- `featureValidation.ts` - {description} **[TESTED]**
- `featureHelpers.ts` - {description} **[TESTED]**

## Business Logic
- {Key formula or rule}
- {Key calculation}

## Testing
- **Unit Tests**: All services have {X}% coverage
- **Hook Tests**: All hooks have {X}% coverage
- **Critical Logic**: {Describe critical tested logic}
- **Run Tests**: `npm test features/{feature}`
- **Coverage**: `npm test features/{feature} -- --coverage`

## Dependencies
- Shared: {list shared components/hooks}
- Database: {list database operations}
```

### 3. Index Re-exports

Every feature has `index.ts`:

```typescript
// features/budget/index.ts
export { default as BudgetScreen } from './screen';
export * from './components';
export * from './hooks';
export * from './types';
```

Enables clean imports:
```typescript
import { BudgetScreen, useBudgetData, BudgetCard } from '@/features/budget';
```

### 4. JSDoc Comments

All exported functions have JSDoc:

```typescript
/**
 * Calculates money remaining to assign to budget categories
 *
 * Formula: expectedIncome - expectedExpenses - totalAllocated
 *
 * @param incomes - Expected incomes for the month
 * @param invoices - Expected invoices for the month
 * @param budgets - Current budget allocations
 * @returns Money available to assign
 *
 * @feature budget
 * @category calculation
 */
export function calculateMoneyToAssign(
  incomes: ExpectedIncome[],
  invoices: ExpectedInvoice[],
  budgets: Budget[]
): number {
  // ...
}
```

### 5. Dependency Direction

Clear, enforceable flow:

```
Screens (composition)
  ↓ uses
Components (presentation)
  ↓ uses
Hooks (state & data)
  ↓ uses
Services (business logic)
  ↓ uses
Database (data access)
```

**Rule:** Code can only depend on layers below, never above

### 6. Flat Structure

Max 3 levels deep:
```
✅ features/budget/components/BudgetCard.tsx
❌ features/budget/ui/components/cards/BudgetCard.tsx
```

---

## 📊 Success Metrics

### File Size Targets

| File Type | Target Range | Max |
|-----------|-------------|-----|
| Screen components | 200-300 lines | 400 |
| Feature components | 50-150 lines | 200 |
| Hooks | 30-100 lines | 150 |
| Services | 100-200 lines | 300 |

### Quality Metrics

**Code Organization:**
- ✅ No file over 500 lines
- ✅ All features have README.md with testing documentation
- ✅ All calculations in shared services (no duplication)
- ✅ All data fetching in hooks (not in components)
- ✅ Clear dependency direction (enforced by linter if possible)
- ✅ JSDoc on all exported functions

**Testing Metrics:**
- ✅ All services (pure functions) have 90-100% test coverage
- ✅ All hooks with business logic have 85-90% test coverage
- ✅ Critical logic (transaction creation, reordering) has 100% coverage
- ✅ Database helpers have 80%+ coverage
- ✅ Zero component/UI tests (by design)
- ✅ All tests co-located next to source files

### Reduction Goals

| File | Before | After | Reduction |
|------|--------|-------|-----------|
| index.tsx | 1,911 | ~300 | 84% |
| transactions.tsx | 1,253 | ~350 | 72% |
| database.ts | 921 | ~500 | 46% |
| reports.tsx | 769 | ~400 | 48% |
| categories.tsx | 733 | ~500 | 32% |

**Total:** ~5,587 lines → ~2,050 lines (63% reduction)

---

## 🛡️ Risk Mitigation

### Strategy

1. **Incremental Migration**
   - Create new structure alongside existing code
   - Test thoroughly before deleting old code
   - Keep old code as backup until 100% verified

2. **No Breaking Changes in Phase 1**
   - Phase 1 is purely additive
   - Existing code continues to work
   - Can pause/reverse at any time

3. **One Feature at a Time**
   - Complete Budget feature end-to-end
   - Validate before moving to next feature
   - Each feature is independent

4. **Testing Checkpoints**
   - Manual testing after each component extraction
   - Verify all user flows work
   - Check month navigation, data refresh, form submission

### Rollback Plan

Each phase can be rolled back:
- Phase 1: Delete `features/shared/`, revert imports
- Phase 2: Delete `features/budget/`, restore old index.tsx
- Phase 3: Restore old database.ts
- Phase 4: Restore old transactions.tsx

---

## 📅 Timeline

| Phase | Duration | Risk Level | Impact | Testing |
|-------|----------|------------|--------|---------|
| Phase 0: Jest Setup | 1-2 hours | Low | Foundation | Config only |
| Phase 1: Foundation | 1 week | Low | High | 90%+ coverage |
| Phase 2: Budget | 1 week | Medium | Very High | 85%+ coverage |
| Phase 3: Database | 1 week | Medium | High | 80%+ coverage |
| Phase 4: Transactions | 1 week | Medium | High | 90%+ coverage |
| Phase 5: Reports & Categories | 1 week | Low | Medium | 80%+ coverage |

**Total:** 5 weeks + 2 hours (Jest setup)

**Test Suite Growth:**
- Phase 0: 0 tests → Jest configured
- Phase 1: ~800 lines of tests (6 test files)
- Phase 2: ~600 lines of tests (5 test files)
- Phase 3: ~200 lines of tests (1 test file)
- Phase 4: ~600 lines of tests (5 test files)
- Phase 5: ~400 lines of tests (varies)
**Total: ~2,600 lines of comprehensive tests**

---

## 🎯 Next Steps

1. **Review and approve this plan**
2. **Phase 0: Jest Setup** (1-2 hours)
   - Install: `jest`, `jest-expo`, `ts-jest`, `@types/jest`
   - Create `jest.config.js` and `jest.setup.js`
   - Add test scripts to `package.json`
   - Verify with example test
3. **Phase 1: Foundation Layer** (Start with Batch 1A)
   - Extract calculations service
   - Write comprehensive tests (100% coverage)
   - Verify tests pass: `npm test features/shared/services/calculations`
   - Continue with Batches 1B-1F
4. **Validate Phase 1**
   - All tests passing
   - 90%+ coverage on shared utilities
   - No breaking changes to existing code
5. **Proceed to Phase 2** - Budget feature refactoring with tests
6. **Iterate** - Continue through phases, building comprehensive test suite

---

## 📚 References

- **Current Documentation:** [CLAUDE.md](../../CLAUDE.md)
- **App Spec:** [APP_SPEC.md](../APP_SPEC.md)
- **Roadmap:** [ROADMAP.md](../ROADMAP.md)

---

**Last Updated:** January 16, 2025
**Status:** Ready for execution with comprehensive testing strategy
**Testing Approach:** Co-located tests, Jest + @testing-library/react, 85%+ coverage target
