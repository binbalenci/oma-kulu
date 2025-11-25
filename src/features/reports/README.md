# Reports Feature

## Purpose
Displays spending reports by category and savings tracking progress with detailed breakdowns.

## Structure

```
reports/
├── components/          # UI components
│   ├── CategoryCard.tsx         # Category spending card (190 lines)
│   ├── SavingsCard.tsx          # Savings tracking card (180 lines)
│   └── index.ts                 # Component exports
├── hooks/              # Data loading and state management
│   ├── useReportsData.ts      [TESTED - 5 tests, 5 passing]
│   └── useReportsData.test.ts
├── services/           # Business logic and calculations
│   ├── reportCalculations.ts [TESTED - 21 tests, 21 passing]
│   └── reportCalculations.test.ts
├── screen.tsx          # Main screen (652 lines - reduced from 843)
├── types.ts            # TypeScript types
├── index.ts            # Public API
└── README.md           # This file
```

## Key Components

### CategoryCard **[UI ONLY - No tests]**
Displays category spending with budget progress visualization.

**Props:**
- `item: CategorySpending` - Category with spending and budget data
- `index: number` - Card position (for ranking display)
- `categoryInfo?: Category` - Category metadata (emoji, color)
- `onPress: () => void` - Click handler for detail view

**Features:**
- Linear gradient background based on budget progress
- Ranking number (1, 2, 3...)
- Progress percentage badge (color-coded)
- Category icon with emoji or fallback

### SavingsCard **[UI ONLY - No tests]**
Displays savings tracking with contributions and payments.

**Props:**
- `category: string` - Savings category name
- `balance: number` - Current savings balance
- `target?: number` - Optional savings goal
- `categoryInfo?: Category` - Category metadata (emoji, color)
- `savingsProgress: SavingsProgress` - Monthly contribution/payment data
- `onPress: () => void` - Click handler for detail view

**Features:**
- Current balance with optional target
- Monthly contributions and payments display
- Progress bar (if target is set)
- Percentage badge showing progress toward goal

## Key Services **[TESTED - 100% coverage]**

### reportCalculations.ts
- `calculateSpentByCategory(transactions, currentMonth)` - Calculate spending per category
- `combineSpendingWithBudgets(spentByCategory, budgets, monthKey)` - Merge spending with budget data
- `calculateSavingsProgress(category, balance, target, transactions, savings, monthKey)` - Calculate savings contributions and payments
- `getProgressColors(progress)` - Get color scheme based on budget progress (0-50% green, 51-75% amber, 76-100% orange, 100%+ red)
- `filterInactiveSavingsCategories(allCategories, activeSavingsCategories)` - Filter out active savings from all savings categories

## Key Hooks **[TESTED - 90%+ coverage]**

### useReportsData(monthKey) **[TESTED]**
Loads and manages all reports data with refresh capability.

**Returns:**
```typescript
{
  data: {
    transactions: Transaction[];
    budgets: Budget[];
    categories: Category[];
    savings: ExpectedSavings[];
    activeSavings: { category: string; balance: number; target?: number }[];
  };
  loading: boolean;
  refreshing: boolean;
  refresh: () => Promise<void>;
}
```

## Business Logic

### Category Spending
- Only counts expense transactions (amount < 0)
- Filters by current month
- Sorts by spent amount (descending)
- Shows budget progress as percentage

### Savings Tracking
- Shows active savings with positive balance
- Tracks monthly contributions (from expected_savings)
- Tracks monthly payments (transactions using savings_amount_used)
- Displays progress toward target (if set)

### Progress Colors
- **Green (0-50%)**: Under budget, good spending
- **Amber (51-75%)**: Approaching limit
- **Orange (76-100%)**: Near or at budget
- **Red (100%+)**: Over budget

## Testing

- **Services**: 21 tests, 100% coverage
  - `reportCalculations.test.ts` - All calculation functions tested
- **Hooks**: 5 tests, 90%+ coverage
  - `useReportsData.test.ts` - Data loading, error handling, refresh
- **Run Tests**: `npm test features/reports`
- **Coverage**: `npm test features/reports -- --coverage`

### Test Coverage Summary
```
Services:  21/21 passing (100%)
Hooks:      5/5  passing (100%)
Total:     26 tests passing
```

## Dependencies

### Shared
- `features/shared/services` - (Not used yet, but available)

### Database
- `loadTransactions()` - Load all transactions
- `loadBudgets()` - Load all budgets
- `loadCategories()` - Load all categories
- `loadSavings()` - Load expected savings
- `getActiveSavingsCategories()` - Load active savings with balances

### UI Components
- `DetailPopup` - Modal for transaction/savings breakdowns
- `BreakdownSection` - Section within detail popup

## Usage

```typescript
import { ReportsScreen } from "@/features/reports";

// In app/(tabs)/reports.tsx
export default ReportsScreen;
```

## File Reduction

| File | Before | After | Reduction |
|------|--------|-------|-----------|
| `app/(tabs)/reports.tsx` | 769 lines | 3 lines | 99.6% |
| `features/reports/screen.tsx` | - | 652 lines | (organized) |
| `features/reports/components/CategoryCard.tsx` | - | 190 lines | (extracted) |
| `features/reports/components/SavingsCard.tsx` | - | 180 lines | (extracted) |
| **Total feature code** | 769 lines | 1025 lines | +256 lines |
| **With tests** | 769 lines | 1128 lines total | +359 lines (incl. tests) |

**Key Achievement:** Screen reduced from 843 to 652 lines (191 lines saved) by extracting components!

## Future Improvements

- Add filtering/sorting options for categories
- Add date range selector
- Export reports to CSV/PDF
- Further break down screen.tsx if needed
