# features/reports - AI Guidance

## Quick Reference
**Purpose:** Spending reports and savings tracking with detailed breakdowns
**Tests:** 26 passing, 100% services coverage, 96% hooks coverage
**Commands:** `npm test features/reports`

## Key Rules
1. Services (calculations) must have 100% test coverage
2. Hooks must have 90%+ test coverage
3. Components and screen.tsx are NOT tested (composition only)
4. All business logic must be in services, not in components

## Core Functions/Hooks

### Services (reportCalculations.ts)
- `calculateSpentByCategory()` - Calculate spending per category for month
- `combineSpendingWithBudgets()` - Merge spending with budget data
- `calculateSavingsProgress()` - Calculate contributions and payments
- `getProgressColors()` - Budget progress color scheme
- `filterInactiveSavingsCategories()` - Filter inactive savings

### Hooks (useReportsData.ts)
- `useReportsData(monthKey)` - Load all data with refresh capability

## Common Tasks

### Adding New Calculation
1. Add function to `services/reportCalculations.ts`
2. Add tests to `services/reportCalculations.test.ts`
3. Run: `npm test features/reports/services`
4. Ensure 100% coverage

### Updating README
Update when:
- Adding new services/hooks
- Changing test coverage
- Modifying business logic
- Adding dependencies
