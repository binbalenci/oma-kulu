# features/reports - AI Guidance

**Purpose:** Spending reports and savings tracking
**Tests:** 26 passing, 100% services, 96% hooks
**Run:** `npm test features/reports`

## Structure
- `components/` - CategoryCard, SavingsCard
- `hooks/` - useReportsData (loads all data)
- `services/` - reportCalculations (all business logic)
- `screen.tsx` - Main composition (330 lines)

## Key Rules
1. **Testing:** Services 100%, hooks 90%+, components 0%
2. **Business Logic:** Must be in services, not components
3. **Calculations:** Use shared `calculateSpentByCategory` from features/shared

## Core Exports
- **calculateSpentByCategory** - Per-category spending
- **combineSpendingWithBudgets** - Merge spending + budget data
- **calculateSavingsProgress** - Contributions + payments
- **getProgressColors** - Budget progress colors (green/orange/red)
- **useReportsData(monthKey)** - Load all data with refresh

## Update Triggers
- New calculation → Update README.md
- Coverage change → Update test stats
