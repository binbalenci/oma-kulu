# features/transactions - AI Guidance

## Quick Reference

**Purpose:** Transaction display and management with reordering
**Tests:** 29 passing, 100% coverage on services & hooks
**Commands:** `npm test features/transactions`

## Key Rules

1. **Reordering:** Only same-date transactions can be reordered
2. **Sorting:** Always `sortTransactionsByDateAndOrder()` before display
3. **Order Index:** New = max + 1, Edited = preserve, Reorder = swap
4. **Filtering:** Use `isIncome` parameter (true = amount > 0, false = amount < 0)
5. **Testing:** Services and hooks must be tested, components are not

## Core Services & Hooks

### Services (transactionHelpers.ts)
- `sortTransactionsByDateAndOrder(transactions)` - Sort by date DESC, order_index ASC
- `filterTransactionsByType(transactions, isIncome)` - Filter income/expense
- `getMaxOrderIndexForDate(transactions, date)` - Get max order_index for date
- `hasSameDate(t1, t2)` - Check if same date

### Hooks
- `useTransactionReorder({ transactions, setTransactions, showSnackbar })` - **CRITICAL**
  - `moveUp(id, isIncome)` - Move transaction up
  - `moveDown(id, isIncome)` - Move transaction down
  - `canMoveUp(id, isIncome)` - Check if can move up
  - `canMoveDown(id, isIncome)` - Check if can move down

## Common Tasks

### Using Reorder Hook
```typescript
const { moveUp, moveDown, canMoveUp, canMoveDown } = useTransactionReorder({
  transactions,
  setTransactions,
  showSnackbar,
});

// In UI:
<IconButton
  disabled={!canMoveUp(t.id, t.amount > 0)}
  onPress={() => moveUp(t.id, t.amount > 0)}
/>
```

### Creating New Transaction
```typescript
import { getMaxOrderIndexForDate } from "@/features/transactions";

const maxIndex = getMaxOrderIndexForDate(transactions, newDate);
const transaction = { ...data, order_index: maxIndex + 1 };
```

### Displaying Transactions
```typescript
import { sortTransactionsByDateAndOrder, filterTransactionsByType } from "@/features/transactions";

const expenses = sortTransactionsByDateAndOrder(
  filterTransactionsByType(transactions, false)
);
```

## Testing Requirements

- **Services:** 100% coverage (pure functions)
- **Hooks:** 100% coverage (business logic)
- **Components:** 0% coverage (UI only)

## Documentation Maintenance

Update README.md and this CLAUDE.md when:
- Adding new hooks or services
- Changing reordering logic
- Modifying test coverage
- Adding new business rules

---

**Status:** Phase 4 complete (services & core hooks)
**Coverage:** 100% on implemented features
