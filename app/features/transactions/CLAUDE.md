# features/transactions - AI Guidance

**Purpose:** Transaction management with same-date reordering
**Tests:** 29 passing, 100% coverage
**Run:** `npm test features/transactions`

## Structure
- `components/` - TransactionCard, TransactionDialog, SectionHeader, UpcomingCard
- `hooks/` - useTransactionReorder, useTransactionsData
- `services/` - transactionHelpers (sort, filter, date utils)
- `screen.tsx` - Main composition (397 lines)

## Key Rules
1. **Reordering:** Only same-date transactions can be reordered
2. **Sorting:** Always use `sortTransactionsByDateAndOrder()` (date DESC, order_index ASC)
3. **Order Index:** New = max + 1, edited = preserve, reordered = swap
4. **Testing:** Services/hooks 100%, components 0%

## Core Exports
- **sortTransactionsByDateAndOrder** - Sort for display
- **filterTransactionsByType** - Filter by income/expense
- **getMaxOrderIndexForDate** - Get next order index
- **useTransactionReorder** - Move up/down logic with validation

## Update Triggers
- New reorder logic → Update README.md + this file
- New service/hook → Update README.md
