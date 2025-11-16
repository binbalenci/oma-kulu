# Codebase Refactoring Plan: Feature-Based Architecture (LLM-Optimized)

**Date:** January 16, 2025
**Status:** Planning
**Goal:** Transform large screen files (1911, 1253, 921 lines) into a feature-based architecture with files under 300 lines, optimized for LLM understanding and maintenance.

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
│   │   └── services/           # Calculations, formatters, validators
│   │
│   ├── budget/
│   │   ├── README.md           # Feature documentation
│   │   ├── components/         # Budget-specific UI
│   │   │   ├── index.ts
│   │   │   ├── CashOverviewCard.tsx
│   │   │   ├── MoneyToAssignCard.tsx
│   │   │   ├── CategoryGroup.tsx
│   │   │   ├── BudgetCard.tsx
│   │   │   ├── IncomeSection.tsx
│   │   │   └── InvoiceSection.tsx
│   │   ├── hooks/              # Budget data & state
│   │   │   ├── index.ts
│   │   │   ├── useBudgetData.ts
│   │   │   ├── useBudgetForm.ts
│   │   │   ├── useIncomeForm.ts
│   │   │   ├── useTransactionCreation.ts
│   │   │   └── useBudgetCalculations.ts
│   │   ├── services/           # Budget calculations
│   │   │   └── budgetValidation.ts
│   │   ├── types.ts            # Budget types
│   │   ├── index.ts            # Public API (re-exports)
│   │   └── screen.tsx          # Main screen (250-300 lines)
│   │
│   ├── transactions/
│   │   ├── README.md
│   │   ├── components/
│   │   │   ├── TransactionList.tsx
│   │   │   ├── TransactionItem.tsx
│   │   │   ├── UpcomingSection.tsx
│   │   │   ├── SavingsUsageCard.tsx
│   │   │   └── TransactionFilters.tsx
│   │   ├── hooks/
│   │   │   ├── useTransactionData.ts
│   │   │   ├── useTransactionReorder.ts
│   │   │   ├── useTransactionFilters.ts
│   │   │   └── useTransactionForm.ts
│   │   ├── services/
│   │   │   └── transactionHelpers.ts
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
└── components/                 # Legacy (will be migrated to features/shared)
```

---

## 🚀 Phase-by-Phase Execution Plan

### **Phase 1: Foundation Layer** ⏱️ Week 1 (Low Risk, High ROI)

**Goal:** Extract shared utilities used across all screens

#### Tasks

1. **Create folder structure**
   ```bash
   mkdir -p features/shared/{components,hooks,services}
   ```

2. **Create `features/shared/services/calculations.ts`**
   - Extract from index.tsx, reports.tsx, transactions.tsx:
     - `calculateMoneyToAssign(incomes, invoices, budgets, savings)`
     - `calculateActualInBank(transactions, currentDate)`
     - `calculateSpentByCategory(transactions, categories)`
     - `calculateSavingsBalance(transactions, category)`
   - Add JSDoc comments with formulas
   - Pure functions, easy to test

3. **Create `features/shared/services/formatters.ts`**
   - Extract currency formatting utilities
   - Extract date formatting utilities
   - Consolidate repeated patterns

4. **Create `features/shared/services/validators.ts`**
   - Extract form validation logic
   - Budget validation
   - Transaction validation

5. **Create `features/shared/hooks/useFinancialData.ts`**
   - Centralize common data loading pattern
   - Combines: loadIncomes, loadInvoices, loadBudgets, loadTransactions
   - Returns: `{ data, loading, error, refresh }`

6. **Create `features/shared/services/database-helpers.ts`**
   - Extract from database.ts:
     - Category ID resolution utilities
     - Common query patterns
     - Error handling helpers

7. **Create `features/shared/README.md`**
   - Document shared utilities
   - Usage examples
   - When to add vs when to keep feature-specific

#### Outcomes

- ✅ 400+ lines removed from screens
- ✅ Foundation ready for feature extraction
- ✅ No breaking changes (additive only)
- ✅ Immediate reduction in duplication

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

4. **Create `features/budget/services/budgetValidation.ts`**
   - Budget-specific validation rules
   - Amount validation
   - Category validation

5. **Create `features/budget/types.ts`**
   - Budget-specific types (if any beyond global types)
   - Form data interfaces

6. **Create `features/budget/README.md`**
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
   - `useBudgetData()` - Loads budgets for current month
   - `useTransactionCreation()` - Creates transactions from expected items

   ## Business Logic
   - **Money to Assign** = expectedIncome - expectedExpenses - totalAllocated
   - **Actual in Bank** = totalIncome - totalExpenses (paid only, date <= today)
   ```

7. **Create `features/budget/index.ts` (re-exports)**
   ```typescript
   export { default as BudgetScreen } from './screen';
   export * from './components';
   export * from './hooks';
   export * from './types';
   ```

8. **Create `features/budget/screen.tsx` (250-300 lines)**
   - Main screen component
   - Composition only (uses extracted components)
   - Minimal state (delegates to hooks)

9. **Update `app/(tabs)/index.tsx`**
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

#### Outcomes

- ✅ database.ts reduced by 400+ lines
- ✅ Consistent error handling
- ✅ Easier to add new tables
- ✅ Better maintainability

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

4. **Create `features/transactions/services/transactionHelpers.ts`**
   - Transaction sorting utilities
   - Source synchronization helpers

5. **Create `features/transactions/README.md`**

6. **Create `features/transactions/screen.tsx` (~300 lines)**
   - Use extracted components and hooks

7. **Update `app/(tabs)/transactions.tsx`**
   - Thin wrapper to features/transactions

#### Outcomes

- ✅ transactions.tsx: 1,253 lines → ~300 lines
- ✅ Reordering logic isolated
- ✅ Reusable transaction components
- ✅ Clear separation of concerns

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

Every feature folder gets a README:

```markdown
# {Feature} Feature

## Purpose
{1-2 sentence description}

## Key Components
- `ComponentA.tsx` - {description}
- `ComponentB.tsx` - {description}

## Key Hooks
- `useFeatureData()` - {description}
- `useFeatureForm()` - {description}

## Business Logic
- {Key formula or rule}
- {Key calculation}

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

- ✅ No file over 500 lines
- ✅ All features have README.md
- ✅ All calculations in shared services (no duplication)
- ✅ All data fetching in hooks (not in components)
- ✅ Clear dependency direction (enforced by linter if possible)
- ✅ JSDoc on all exported functions

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

| Phase | Duration | Risk Level | Impact |
|-------|----------|------------|--------|
| Phase 1: Foundation | 1 week | Low | High |
| Phase 2: Budget | 1 week | Medium | Very High |
| Phase 3: Database | 1 week | Medium | High |
| Phase 4: Transactions | 1 week | Medium | High |
| Phase 5: Reports & Categories | 1 week | Low | Medium |

**Total:** 5 weeks

---

## 🎯 Next Steps

1. **Review and approve this plan**
2. **Start Phase 1** - Create foundation layer
3. **Validate Phase 1** - Ensure no breaking changes
4. **Proceed to Phase 2** - Budget feature refactoring
5. **Iterate** - Continue through phases

---

## 📚 References

- **Current Documentation:** [CLAUDE.md](../../CLAUDE.md)
- **App Spec:** [APP_SPEC.md](../APP_SPEC.md)
- **Roadmap:** [ROADMAP.md](../ROADMAP.md)

---

**Last Updated:** January 16, 2025
**Status:** Awaiting approval
