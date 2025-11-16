# features/shared - AI Guidance

## Quick Reference

**Purpose:** Shared utilities for all features (calculations, formatters, validators, hooks)
**Tests:** 165 passing, 99%+ coverage
**Commands:** `npm test features/shared`, `npm test features/shared -- --coverage`

## Structure

```
features/shared/
├── services/     # Pure functions (calculations, formatters, validators, db-helpers)
├── hooks/        # React hooks (useFinancialData)
└── components/   # Shared UI (placeholder - add during Phase 2+)
```

## Key Rules

### 1. **When to Add Here vs Feature-Specific**
- ✅ Add here: Used by 2+ features, pure utilities, common patterns
- ❌ Keep feature-specific: Only used in one feature, feature-specific logic

### 2. **Testing Requirements**
- Services: 100% coverage target (pure functions)
- Hooks: 90%+ coverage target
- Add tests BEFORE implementation (TDD)
- Use `@jest-environment jsdom` for hook tests

### 3. **File Organization**
- Co-locate tests: `myService.ts` + `myService.test.ts`
- Always export from `index.ts`
- Max file size: 300 lines (services), 150 lines (hooks)

### 4. **Import Patterns**
```typescript
// ✅ Good: Use index exports
import { calculateMoneyToAssign } from '@/features/shared/services';

// ❌ Bad: Direct file imports
import { calculateMoneyToAssign } from '@/features/shared/services/calculations';
```

## Core Functions

### Services
- **calculations.ts**: `calculateMoneyToAssign`, `calculateActualInBank`, `calculateSpentByCategory`
- **formatters.ts**: `formatCurrency`, `formatDate`, `formatMonthKey`
- **validators.ts**: `validateAmount`, `validateCategoryName`, `validateBudgetAmount`
- **database-helpers.ts**: `getCategoryIdByName`, `resolveCategoryName`, `batchResolveCategoryIds`

### Hooks
- **useFinancialData(monthKey)**: Loads all financial data (incomes, invoices, budgets, savings, transactions, categories) with loading/error states and refresh function

## Common Tasks

### Adding New Service
```bash
1. Create features/shared/services/myService.ts
2. Create features/shared/services/myService.test.ts
3. Add export to features/shared/services/index.ts
4. Update README.md with documentation
5. Run: npm test features/shared/services/myService -- --coverage
```

### Adding New Hook
```bash
1. Create features/shared/hooks/useMyHook.ts
2. Create features/shared/hooks/useMyHook.test.ts (add @jest-environment jsdom)
3. Add export to features/shared/hooks/index.ts
4. Update README.md with documentation
5. Run: npm test features/shared/hooks/useMyHook -- --coverage
```

## Documentation Maintenance

**CRITICAL:** When making changes to this directory:
1. Update [README.md](README.md) with new functions/hooks/components
2. Update this CLAUDE.md if patterns or rules change
3. Keep test coverage stats current in README.md

## References

- **Detailed Docs:** [README.md](README.md)
- **Refactoring Plan:** [../../docs/plans/2025-01-16-feature-based-refactoring.md](../../docs/plans/2025-01-16-feature-based-refactoring.md)
- **Root Guidelines:** [../../CLAUDE.md](../../CLAUDE.md)
