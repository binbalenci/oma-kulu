# features/budget - AI Development Guide

**Status:** 🚧 Phase 2 Foundation Complete
**Tests:** 0 passing (mocking issues), 85%+ target
**Commands:** `npm test features/budget` | `npm test features/budget -- --coverage`

---

## Quick Reference

**Purpose:** Budget screen - main financial planning interface
**Coverage Target:** Hooks 85%+, Services 100%
**Key Files:** CategoryGroup.tsx, CashOverviewCard.tsx, useBudgetData.ts

---

## Core Components

### CategoryGroup.tsx (~210 lines) ✅
- Collapsible category group with items
- Shows: emoji, name, paid count, total
- Actions: toggle paid, edit, delete
- Reused by: IncomeSection, InvoiceSection

### CashOverviewCard.tsx (~260 lines) ✅
- 2-row layout: Income/Expenses/Remaining, InBank/Savings
- Clickable metrics → detail popups
- Loading state support

---

## Core Hooks

### useBudgetData.ts (~160 lines) ✅
- Loads: incomes, invoices, budgets, savings, transactions, categories, balances
- Returns: `{ data, loading, error, refresh, onRefresh }`
- Handles: initial load, month changes, focus events
- **Test Status:** Written but mocking issues

---

## Business Logic

### Financial Calculations
```typescript
// Money to Assign (uses ALL items, paid + unpaid)
moneyToAssign = expectedIncome - expectedExpenses - totalAllocated - totalSavings

// Actual in Bank (ONLY paid, date <= today)
actualInBank = totalIncome - totalExpenses
```

### Data Flow
```
Screen → useBudgetData → Database → Supabase
              ↓
      Components (UI only)
```

---

## Common Tasks

### Adding New Component
```bash
# 1. Create file
touch features/budget/components/NewComponent.tsx

# 2. Follow pattern (see CategoryGroup.tsx)
#    - Props interface
#    - JSDoc comment
#    - Styles using AppTheme
#    - Export component

# 3. Verify
npm run check-all
```

### Adding New Hook
```bash
# 1. Create hook + test
touch features/budget/hooks/useNewHook.ts
touch features/budget/hooks/useNewHook.test.ts

# 2. Add @jest-environment jsdom comment
# 3. Write hook with JSDoc
# 4. Write tests (90%+ coverage)
# 5. Verify
npm test features/budget/hooks/useNewHook.test.ts
```

### Adding New Service
```bash
# 1. Create service + test
touch features/budget/services/newService.ts
touch features/budget/services/newService.test.ts

# 2. Write pure functions (no React)
# 3. Write tests (100% coverage target)
# 4. Export from services/index.ts
```

---

## Testing Rules

### What to Test
- ✅ **Hooks:** All hooks with business logic (85%+ coverage)
- ✅ **Services:** All pure functions (100% coverage)
- ❌ **Components:** No tests (UI only, too brittle)
- ❌ **Screens:** No tests (composition only)

### Test Structure
```typescript
/**
 * @jest-environment jsdom
 */

// Mocks BEFORE imports
jest.mock('@/lib/storage');
jest.mock('@/app/utils/logger', () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
    breadcrumb: jest.fn(),
    dataAction: jest.fn(),
    performanceWarning: jest.fn(),
  },
}));

import { renderHook, waitFor } from '@testing-library/react';
import { useMyHook } from './useMyHook';

describe('useMyHook', () => {
  it('should ...', async () => {
    const { result } = renderHook(() => useMyHook());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeDefined();
  });
});
```

### Known Issues
- **Logger mock:** Must be defined in test file BEFORE imports (hoisting)
- **Act warnings:** Wrap state updates in `waitFor()` or `act()`

---

## Code Style

### Props Interface Pattern
```typescript
interface MyComponentProps {
  // Required props first
  data: MyData[];
  onAction: (item: MyData) => void;

  // Optional props last
  isLoading?: boolean;
  className?: string;
}
```

### Hook Return Pattern
```typescript
export interface UseMyHookReturn {
  data: MyData;
  loading: boolean;
  error: Error | null;
  actions: {
    save: (item: MyData) => Promise<void>;
    delete: (id: string) => Promise<void>;
  };
}
```

### Component Pattern
```typescript
/**
 * MyComponent - Brief description
 *
 * Features:
 * - Feature 1
 * - Feature 2
 */
export function MyComponent({ prop1, prop2 }: MyComponentProps) {
  // Implementation
}

const styles = StyleSheet.create({
  // Use AppTheme constants
  container: {
    padding: AppTheme.spacing.md,
    backgroundColor: AppTheme.colors.background,
  },
});
```

---

## Dependencies

### Always Use
- `AppTheme` - Never hardcode colors/spacing
- `logger` - Never use `console.log`
- Types from `@/lib/types` - Never duplicate types

### UI Components
- `react-native-paper` - Button, Card, Text, TextInput, IconButton
- `@/components/ui/*` - CustomCheckbox, LoadingSpinner, Dialog, etc.

### Database
- Import from `@/lib/storage` (re-exports from database.ts)
- All operations return empty array on error

---

## Remaining Work

### Next Batch (Option A - Components)
1. IncomeSection.tsx - List with CategoryGroup
2. InvoiceSection.tsx - List with CategoryGroup
3. BudgetCard.tsx - Progress bar + edit/delete
4. SavingsCard.tsx - Progress bar + edit/delete
5. CopyPreviousMonthCard.tsx - Empty state

### Future Batches (Hooks + Services)
1. useBudgetForm.ts - Form state + validation
2. useIncomeForm.ts - Income form state
3. **useTransactionCreation.ts** - CRITICAL toggle paid logic
4. budgetValidation.ts + tests - Validation service
5. itemTogglePaid.ts + tests - Toggle paid service
6. itemSave.ts + tests - Save items service
7. itemDelete.ts + tests - Delete items service

### Final (Integration)
1. screen.tsx - Main budget screen (composition)
2. index.ts - Barrel exports
3. types.ts - Feature-specific types
4. Update app/(tabs)/index.tsx

---

## Documentation Maintenance

**Update README.md and this CLAUDE.md when:**
- ✅ Adding new component (update Components section)
- ✅ Adding new hook (update Hooks section)
- ✅ Adding new service (update Services section)
- ✅ Changing business logic (update Business Logic)
- ✅ Tests pass/coverage changes (update Testing section)
- ✅ Completing a batch (update Remaining Work)

---

## Debug Checklist

### TypeScript Errors
```bash
npm run type-check
# Look for:
# - Missing imports
# - Wrong prop types
# - AppTheme.colors.textPrimary (NOT .text)
```

### Lint Errors
```bash
npm run lint:check
# Look for:
# - Unused imports
# - Console.log statements
# - Missing dependencies in useEffect
```

### Test Failures
```bash
npm test features/budget -- --verbose
# Look for:
# - Mock not hoisted (move before imports)
# - Act warnings (wrap in waitFor)
# - Logger not mocked (check jest.mock setup)
```

---

## Performance Notes

- **useBudgetData:** ~200-500ms load time (6 parallel queries)
- **CategoryGroup:** Virtualize if >50 items
- **CashOverviewCard:** Memoize calculations if expensive

---

**Last Updated:** 2025-01-23
**Next Update:** After fixing tests + completing next component batch
