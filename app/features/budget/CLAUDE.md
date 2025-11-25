# features/budget - AI Guidance

**Purpose:** Main budget planning screen
**Tests:** 0 passing (mocking issues), 85%+ target
**Run:** `npm test features/budget`

## Structure
- `components/` - CategoryGroup, CashOverviewCard, MoneyToAssignCard, etc.
- `hooks/` - useBudgetData (loads all financial data)
- `screen.tsx` - Main composition (276 lines)

## Key Rules
1. **Financial Calculations:**
   - Money to assign: `expectedIncome - expectedExpenses - totalAllocated - totalSavings` (all items)
   - Actual in bank: `totalIncome - totalExpenses` (paid only, date ≤ today)
2. **Testing:** Hooks 85%+, services 100%, components 0%
3. **Mocking:** Logger must be mocked BEFORE imports in tests

## Core Components
- **CategoryGroup** (210 lines) - Collapsible group with paid toggle
- **CashOverviewCard** (260 lines) - 2-row metrics with detail popups
- **useBudgetData** (160 lines) - Loads 7 data sources, handles refresh

## Update Triggers
- New component → Update README.md
- Business logic change → Update calculations docs
- Test fix/coverage → Update test stats
