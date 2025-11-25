# Oma Kulu - AI Development Guide

**Stack:** React Native + Expo + Supabase (PostgreSQL) + TypeScript
**Design:** Apple-inspired minimal finance app

---

## 🚀 Quick Commands

```bash
npm start              # Expo dev
npm run check-all      # Type-check + lint (zero warnings required)
npm test              # Run all tests (275 passing)
npm test src/features/[name]  # Run feature tests
```

---

## 🏗️ Architecture

### File Structure
```
src/
├── app/              # Routes only (Expo Router)
│   ├── (tabs)/       # Thin wrappers (3-11 lines) → features/*/screen.tsx
│   ├── _layout.tsx   # Root layout
│   └── modal.tsx     # Modal route
├── features/         # Feature modules (shared, budget, transactions, reports, categories)
│   └── [name]/
│       ├── components/   # UI components (no tests)
│       ├── hooks/        # React hooks (90%+ coverage)
│       ├── services/     # Pure functions (100% coverage)
│       ├── screen.tsx    # Main screen (composition only)
│       ├── index.ts      # Barrel exports
│       ├── README.md     # Detailed docs
│       └── CLAUDE.md     # Compact AI guide
├── lib/              # Core: database.ts, types.ts, supabase.ts, storage.ts
├── components/       # Shared UI (legacy, migrating to features/)
├── constants/        # AppTheme, theme
├── hooks/            # Framework hooks (useColorScheme, useThemeColor)
└── utils/            # Logger, utilities
```

### Data Flow
```
Tab Wrapper → Feature Screen → Hook → Service → Database
                              ↓
                         Components (UI only)
```

**Rule:** Code only depends on layers below, never above.

---

## 📋 Critical Patterns

### 1. Imports (src/ Structure)
```typescript
// ✅ All code in src/ (routes in src/app/, logic in src/features/, etc.)
import { calculateMoneyToAssign } from '@/src/features/shared/services';
import { BudgetScreen } from '@/src/features/budget';
import { supabase } from '@/src/lib/supabase';
import { Category } from '@/src/lib/types';
import { AppTheme } from '@/src/constants/AppTheme';
import logger from '@/src/utils/logger';

// Framework hooks
import { useColorScheme } from '@/src/hooks/use-color-scheme';
```

### 2. Global State
```typescript
const { currentMonth } = useMonth();         // Month state (shared)
const { showSnackbar } = useSnackbar();      // Toasts (global)
```

### 3. Logging (Required)
```typescript
logger.navigationAction("ScreenName", context);  // NOT console.log
logger.userAction("buttonClick", context);
logger.databaseError(error, "saveIncome", context);
```

### 4. Data Loading
```typescript
// ✅ Use feature hooks
const { data, loading, error, refresh } = useFinancialData(currentMonth);
```

---

## 💰 Business Logic

### Financial Calculations
- **Money to assign:** `expectedIncome - expectedExpenses - totalAllocated - totalSavings` (all items)
- **Actual in bank:** `totalIncome - totalExpenses` (paid only, date ≤ today)

### Date Formats
- Month key: `yyyy-MM` ("2025-01")
- Transaction date: `yyyy-MM-dd` (ISO)
- Display: `"January 2025"`

### Data Model
- Categories → Expected items (incomes/invoices/savings) → Budgets → Transactions
- Dual fields: `category` (name, legacy) + `category_id` (UUID, current)
- Transactions: `source_type` + `source_id` link to expected items

---

## 🧪 Testing Rules

### Coverage Targets
- **Services:** 100% (pure functions)
- **Hooks:** 90%+ (business logic)
- **Components/Screens:** 0% (UI only, too brittle)

### Test Setup
- Co-locate: `myFile.ts` + `myFile.test.ts`
- Hook tests: Add `@jest-environment jsdom` at top
- Mocks: Must be BEFORE imports (hoisting)

### Example
```typescript
/**
 * @jest-environment jsdom
 */
jest.mock('@/src/lib/storage');  // BEFORE imports

import { renderHook } from '@testing-library/react';
import { useMyHook } from './useMyHook';

describe('useMyHook', () => {
  it('should load data', async () => {
    const { result } = renderHook(() => useMyHook());
    expect(result.current.loading).toBe(true);
  });
});
```

---

## 📁 Documentation

**RULE:** Every `src/features/[name]/` directory has:
1. **README.md** - Detailed docs with function signatures + examples
2. **CLAUDE.md** - Compact AI guide (purpose, rules, core exports, update triggers)

**Update triggers:**
- New function/component → Update README.md
- Pattern/rule change → Update CLAUDE.md
- Coverage change → Update test stats

---

## 🎨 UI Guidelines

- **Components:** React Native Paper + custom components
- **Spacing:** Multiples of 4 (use `AppTheme.spacing.*`)
- **Colors:** Use `AppTheme.colors.*` (NOT hardcoded)
- **Progress bars:** Green (0-74%), Orange (75-95%), Red (96%+)

---

## 🔧 Special Features

### Transaction Reordering
- Only same-date transactions can be reordered
- Sort: `sortTransactionsByDateAndOrder()` (date DESC, order_index ASC)
- New: `order_index = max + 1`, Reordered: swap values

---

## 📦 Database Tables

- `categories` - Foundation (income/expense/saving types)
- `expected_incomes` / `expected_invoices` / `expected_savings` - Per-month planning
- `budgets` - Spending limits per category/month
- `transactions` - Actual financial activity
- `app_settings` - App config

---

## ✅ Code Quality Checklist

- [ ] `npm run check-all` passes (zero warnings)
- [ ] All tests pass with required coverage
- [ ] Used `logger.*` (NOT `console.log`)
- [ ] Updated `README.md` + `CLAUDE.md` in changed dirs
- [ ] No `any` types without justification
- [ ] Imports use `@/src/*` paths (NOT `@/*`)

---

## 📚 References

- **Feature Docs:** See `src/features/*/README.md` files
- **Refactoring Plan:** `docs/plans/2025-01-16-feature-based-refactoring.md`
- **App Spec:** `docs/APP_SPEC.md`
