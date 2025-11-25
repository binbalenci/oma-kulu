# features/shared - AI Guidance

**Purpose:** Shared utilities for all features
**Tests:** 165 passing, 99%+ coverage
**Run:** `npm test features/shared`

## Structure
- `services/` - Pure functions (calculations, formatters, validators, db-helpers)
- `hooks/` - React hooks (useFinancialData)

## Key Rules
1. **Add here:** Used by 2+ features OR pure utility pattern
2. **Testing:** Services 100%, hooks 90%+ (TDD required)
3. **Import:** Via index exports (`@/app/features/shared/services`)

## Core Exports
- **calculations**: `calculateMoneyToAssign`, `calculateActualInBank`, `calculateSpentByCategory`
- **formatters**: `formatCurrency`, `formatDate`, `formatMonthKey`
- **validators**: `validateAmount`, `validateCategoryName`, `validateBudgetAmount`
- **database-helpers**: `getCategoryIdByName`, `resolveCategoryName`, `batchResolveCategoryIds`
- **useFinancialData(monthKey)**: Loads all data with loading/error/refresh

## Update Triggers
- New function/hook → Update README.md
- Pattern change → Update this file
- Coverage change → Update README.md stats
