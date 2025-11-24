# Transactions Feature

## Purpose

Display and manage all transactions with reordering capabilities, filtering, and synchronization with expected items (incomes, invoices, savings).

## Structure

```
features/transactions/
├── hooks/                          # Business logic hooks
│   ├── useTransactionReorder.ts    # Transaction reordering (CRITICAL)
│   ├── useTransactionReorder.test.ts
│   └── index.ts
├── services/                       # Helper functions
│   ├── transactionHelpers.ts       # Sorting and filtering
│   ├── transactionHelpers.test.ts
│   └── index.ts
├── types.ts                        # Transaction-specific types
├── index.ts                        # Public API
├── README.md                       # This file
└── CLAUDE.md                       # AI-optimized guide
```

## Key Hooks

### `useTransactionReorder()` **[TESTED - CRITICAL]**

Manages reordering of transactions within the same date.

**Usage:**
```typescript
const { moveUp, moveDown, canMoveUp, canMoveDown } = useTransactionReorder({
  transactions,
  setTransactions,
  showSnackbar,
});
```

**Functions:**
- `moveUp(transactionId, isIncome)` - Move transaction up in list
- `moveDown(transactionId, isIncome)` - Move transaction down in list
- `canMoveUp(transactionId, isIncome)` - Check if can move up
- `canMoveDown(transactionId, isIncome)` - Check if can move down

**Critical Logic:**
- Only allows reordering within same date
- Swaps `order_index` values
- Persists changes to database
- Shows snackbar on failure

**Test Coverage:** 100% (16 tests)

## Key Services

### `transactionHelpers.ts` **[TESTED]**

Pure functions for transaction sorting and filtering.

**Functions:**

#### `sortTransactionsByDateAndOrder(transactions)`
Sorts transactions by date DESC, then order_index ASC.

```typescript
const sorted = sortTransactionsByDateAndOrder(transactions);
```

#### `filterTransactionsByType(transactions, isIncome)`
Filters by income (amount > 0) or expense (amount < 0).

```typescript
const incomes = filterTransactionsByType(transactions, true);
const expenses = filterTransactionsByType(transactions, false);
```

#### `getMaxOrderIndexForDate(transactions, date)`
Finds maximum order_index for a specific date.

```typescript
const maxIndex = getMaxOrderIndexForDate(transactions, "2025-01-15");
const newOrderIndex = maxIndex + 1;
```

#### `hasSameDate(t1, t2)`
Checks if two transactions have the same date.

```typescript
if (hasSameDate(current, next)) {
  // Can reorder
}
```

**Test Coverage:** 100% (13 tests)

## Business Logic

### Transaction Sorting
- **Primary sort:** Date DESC (newest first)
- **Secondary sort:** order_index ASC (for same-date transactions)

### Reordering Rules
- Only same-date transactions can be reordered
- Swap order_index values between adjacent transactions
- Changes persist immediately to database
- UI disables arrows when movement not possible

### Order Index Management
- New transactions: Get max order_index for date + 1
- Edited transactions: Preserve existing order_index
- Reordered transactions: Swap order_index with adjacent item

## Testing

### Running Tests

```bash
# Run all transaction tests
npm test features/transactions

# Run specific test file
npm test features/transactions/hooks/useTransactionReorder.test.ts
npm test features/transactions/services/transactionHelpers.test.ts

# With coverage
npm test features/transactions -- --coverage
```

### Coverage Targets

- **Services (pure functions):** 100% ✅
- **Hooks:** 100% ✅ (Critical logic fully tested)
- **Components:** 0% (by design, UI only)

### Test Statistics

| File | Tests | Coverage | Status |
|------|-------|----------|--------|
| transactionHelpers.ts | 13 | 100% | ✅ |
| useTransactionReorder.ts | 16 | 100% | ✅ |

**Total:** 29 tests, 100% coverage on business logic

## Dependencies

### Internal Dependencies
- `@/lib/storage` - Database operations (saveTransactions)
- `@/lib/types` - Core types (Transaction)
- `@/app/utils/logger` - Logging
- `@/components/snackbar-provider` - User feedback

### Shared Features
- None yet (transactions feature is self-contained)

## Usage Example

```typescript
import { useTransactionReorder, sortTransactionsByDateAndOrder } from "@/features/transactions";

function TransactionScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { showSnackbar } = useSnackbar();

  // Sort transactions for display
  const sortedTransactions = sortTransactionsByDateAndOrder(transactions);

  // Set up reordering
  const { moveUp, moveDown, canMoveUp, canMoveDown } = useTransactionReorder({
    transactions,
    setTransactions,
    showSnackbar,
  });

  return (
    // Render transactions with up/down arrows
    sortedTransactions.map(t => (
      <TransactionItem
        key={t.id}
        transaction={t}
        canMoveUp={canMoveUp(t.id, t.amount > 0)}
        canMoveDown={canMoveDown(t.id, t.amount > 0)}
        onMoveUp={() => moveUp(t.id, t.amount > 0)}
        onMoveDown={() => moveDown(t.id, t.amount > 0)}
      />
    ))
  );
}
```

## Common Tasks

### Adding a New Transaction

```typescript
import { getMaxOrderIndexForDate } from "@/features/transactions";

// Calculate order_index for new transaction
const sameDateTransactions = transactions.filter(t => t.date === newDate);
const maxIndex = getMaxOrderIndexForDate(transactions, newDate);
const orderIndex = maxIndex + 1;

const newTransaction = {
  ...formData,
  order_index: orderIndex,
};

await saveTransaction(newTransaction);
```

### Filtering Transactions

```typescript
import { filterTransactionsByType, sortTransactionsByDateAndOrder } from "@/features/transactions";

// Get sorted incomes
const incomes = sortTransactionsByDateAndOrder(
  filterTransactionsByType(transactions, true)
);

// Get sorted expenses
const expenses = sortTransactionsByDateAndOrder(
  filterTransactionsByType(transactions, false)
);
```

## Future Enhancements

### Potential Additions (Not Yet Implemented)

1. **useTransactionData Hook**
   - Centralize data loading for transactions
   - Handle upcoming items (incomes, invoices, savings)
   - Manage loading states

2. **useTransactionFilters Hook**
   - Search functionality
   - Category filtering
   - Date range filtering

3. **useTransactionForm Hook**
   - Form state management
   - Validation
   - Source synchronization

4. **Transaction Components**
   - TransactionList
   - TransactionItem
   - UpcomingSection
   - TransactionFilters

## Architecture Notes

### Why This Structure?

1. **Separation of Concerns**
   - Services: Pure functions, easy to test
   - Hooks: React-specific logic with state
   - Components: UI only (no business logic)

2. **Testability**
   - Services have 100% coverage (pure functions)
   - Hooks have 100% coverage (critical business logic)
   - Components untested (low ROI, high brittleness)

3. **Reusability**
   - Services can be used anywhere
   - Hooks encapsulate React patterns
   - Clear dependency direction

### Design Decisions

**Why swap order_index instead of renumbering?**
- More efficient (only 2 database updates)
- Prevents race conditions
- Simpler logic

**Why separate isIncome parameter?**
- Incomes and expenses have separate visual lists
- Users expect independent reordering
- Prevents accidental cross-type reordering

**Why persist immediately?**
- Better UX (no "save" button needed)
- Changes visible across tabs instantly
- Failure feedback immediate

## Troubleshooting

### Reordering Not Working

1. Check console for errors
2. Verify transactions have same date
3. Confirm order_index values are unique per date
4. Check database permissions

### Order Index Issues

If order_index values become corrupted:

```typescript
// Rebuild order_index for all transactions on a date
const sameDateTransactions = transactions
  .filter(t => t.date === targetDate)
  .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

const fixed = sameDateTransactions.map((t, index) => ({
  ...t,
  order_index: index,
}));

await saveTransactions(fixed);
```

## Related Documentation

- **Root Documentation:** [/CLAUDE.md](../../CLAUDE.md)
- **Refactoring Plan:** [/docs/plans/2025-01-16-feature-based-refactoring.md](../../docs/plans/2025-01-16-feature-based-refactoring.md)
- **Database Layer:** [/lib/database.ts](../../lib/database.ts)
- **Types:** [/lib/types.ts](../../lib/types.ts)

---

**Last Updated:** 2025-01-24
**Status:** Phase 4 - Services and core hooks complete, components pending
**Test Coverage:** 100% on services and hooks
