# Shared Feature Utilities

**Purpose:** Common utilities, calculations, hooks, and services used across all features.

**Status:** ✅ Phase 1 Complete (Batches 1A-1F)

---

## 📁 Structure

```
features/shared/
├── README.md              # This file
├── components/            # Shared UI components (placeholder)
│   └── index.ts
├── hooks/                 # Shared React hooks
│   ├── index.ts
│   ├── useFinancialData.ts       [TESTED - 100%]
│   └── useFinancialData.test.ts
└── services/              # Business logic and utilities
    ├── index.ts
    ├── calculations.ts           [TESTED - 100%]
    ├── calculations.test.ts
    ├── formatters.ts             [TESTED - 100%]
    ├── formatters.test.ts
    ├── validators.ts             [TESTED - 97.61%]
    ├── validators.test.ts
    ├── database-helpers.ts       [TESTED - 100%]
    └── database-helpers.test.ts
```

---

## 🧪 Testing

### Test Statistics

- **Total Tests:** 165 passing
- **Coverage:** 99.25% statements, 97.97% branches, 100% functions

### Test Commands

```bash
# Run all shared feature tests
npm test features/shared

# Run with coverage report
npm test features/shared -- --coverage

# Run specific service tests
npm test features/shared/services/calculations
npm test features/shared/services/formatters
npm test features/shared/services/validators
npm test features/shared/services/database-helpers

# Run hook tests
npm test features/shared/hooks/useFinancialData

# Watch mode for development
npm test features/shared -- --watch
```

### Coverage Targets

| File | Statements | Branches | Functions | Lines |
|------|-----------|----------|-----------|-------|
| calculations.ts | 100% | 100% | 100% | 100% |
| formatters.ts | 100% | 100% | 100% | 100% |
| validators.ts | 97.61% | 97.67% | 100% | 97.61% |
| database-helpers.ts | 100% | 96.96% | 100% | 100% |
| useFinancialData.ts | 100% | 100% | 100% | 100% |

---

## 📦 Services

### calculations.ts

**Purpose:** Financial calculations used across the application.

**Functions:**

- `calculateMoneyToAssign(incomes, invoices, budgets, savings?)` - Calculate remaining money to allocate to budget categories
  - Formula: `expectedIncome - expectedExpenses - totalAllocated`
  - Returns: `number`

- `calculateActualInBank(transactions, currentDate)` - Calculate actual cash in bank
  - Formula: Sum of paid transactions where `date <= currentDate`
  - Returns: `number`

- `calculateSpentByCategory(transactions, categories)` - Calculate spending per category
  - Returns: `Record<string, number>` (category name → amount spent)

- `calculateSavingsBalance(transactions, category)` - Calculate savings balance for a category
  - Formula: `contributions - payments`
  - Returns: `number`

**Example:**

```typescript
import { calculateMoneyToAssign } from '@/features/shared/services';

const moneyToAssign = calculateMoneyToAssign(
  incomes,
  invoices,
  budgets,
  savings
);
```

---

### formatters.ts

**Purpose:** Consistent formatting for currency, dates, and numbers.

**Functions:**

- `formatCurrency(amount)` - Format number as currency
  - Example: `1234.56 → "$1,234.56"`
  - Handles negative numbers: `-100 → "-$100.00"`

- `formatDate(date)` - Format date string
  - Example: `"2025-01-15" → "Jan 15, 2025"`

- `formatMonth(monthKey)` - Format month key
  - Example: `"2025-01" → "January 2025"`

- `formatPercent(ratio)` - Format ratio as percentage
  - Example: `0.75 → "75%"`

**Example:**

```typescript
import { formatCurrency, formatMonth } from '@/features/shared/services';

const display = formatCurrency(1500); // "$1,500.00"
const monthDisplay = formatMonth("2025-01"); // "January 2025"
```

---

### validators.ts

**Purpose:** Input validation for forms and data.

**Functions:**

- `validateAmount(amount)` - Validate monetary amount
  - Returns: `{ valid: boolean; error?: string }`

- `validateBudgetAllocation(amount, category)` - Validate budget allocation
  - Checks: amount > 0, category exists

- `validateTransactionData(transaction)` - Validate transaction fields
  - Checks: required fields, valid date, valid category

- `validateCategoryName(name)` - Validate category name
  - Checks: not empty, length < 50, no special characters

**Example:**

```typescript
import { validateAmount } from '@/features/shared/services';

const result = validateAmount(amount);
if (!result.valid) {
  showError(result.error);
}
```

---

### database-helpers.ts

**Purpose:** Category resolution and database utilities.

**Functions:**

- `getCategoryNameById(categoryId)` - Convert UUID to name
  - Returns: `Promise<string | null>`

- `getCategoryIdByName(name, type)` - Convert name + type to UUID
  - Returns: `Promise<string | null>`

- `createCategoryIdToNameMap()` - Create ID → name map
  - Returns: `Promise<Map<string, string>>`

- `createCategoryNameToObjectMap()` - Create name → Category map
  - Returns: `Promise<Map<string, Category>>`

- `resolveCategoryName(item, categoryMap)` - Resolve category name in data object
  - Handles backward compatibility (category_id vs category)
  - Returns: `string`

- `resolveCategoryId(categoryName, categoryType)` - Resolve ID with validation
  - Returns: `Promise<{ success: boolean; categoryId?: string; error?: string }>`

- `categoryExists(name, type)` - Check if category exists
  - Returns: `Promise<boolean>`

- `batchResolveCategoryIds(names, type)` - Batch resolve multiple IDs
  - More efficient than calling `getCategoryIdByName` multiple times
  - Returns: `Promise<Map<string, string>>`

**Example:**

```typescript
import { getCategoryIdByName, resolveCategoryName } from '@/features/shared/services';

// Get category ID
const categoryId = await getCategoryIdByName('Groceries', 'expense');

// Resolve category name from data object
const categoryMap = await createCategoryIdToNameMap();
const name = resolveCategoryName(item, categoryMap);
```

---

## 🎣 Hooks

### useFinancialData.ts

**Purpose:** Centralized data loading for all financial data.

**Returns:**

```typescript
{
  data: {
    incomes: ExpectedIncome[];
    invoices: ExpectedInvoice[];
    budgets: Budget[];
    savings: ExpectedSavings[];
    transactions: Transaction[];
    categories: Category[];
  };
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}
```

**Features:**

- Loads all financial data in parallel
- Automatically reloads when month changes
- Provides loading and error states
- Includes refresh function for manual reload

**Example:**

```typescript
import { useFinancialData } from '@/features/shared/hooks';

function BudgetScreen() {
  const { data, loading, error, refresh } = useFinancialData(currentMonth);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  // Use data.incomes, data.budgets, etc.
  return (
    <View>
      <Button onPress={refresh}>Refresh</Button>
      {/* ... */}
    </View>
  );
}
```

---

## 🎨 Components

No shared components yet. Shared UI components will be added here during Phase 2-5 as features are extracted.

---

## 📖 Usage Guidelines

### When to Add Here vs Feature-Specific

**Add to `features/shared/`:**
- ✅ Used by 2+ features
- ✅ Pure utility functions (no feature-specific logic)
- ✅ Common data loading patterns
- ✅ Shared validation rules
- ✅ Common formatters and calculations

**Keep feature-specific:**
- ❌ Only used in one feature
- ❌ Contains feature-specific business logic
- ❌ Tightly coupled to a specific screen

### Import Patterns

```typescript
// ✅ Good: Import from index files
import { calculateMoneyToAssign, formatCurrency } from '@/features/shared/services';
import { useFinancialData } from '@/features/shared/hooks';

// ❌ Avoid: Direct file imports (bypasses index exports)
import { calculateMoneyToAssign } from '@/features/shared/services/calculations';
```

---

## 🏗️ Architecture

### Dependency Direction

```
Screens (composition)
  ↓ uses
Components (presentation)
  ↓ uses
Hooks (state & data)
  ↓ uses
Services (business logic)
  ↓ uses
Database (data access)
```

**Rule:** Code can only depend on layers below, never above.

### File Size Guidelines

| Type | Target | Max |
|------|--------|-----|
| Services | 100-200 lines | 300 |
| Hooks | 30-100 lines | 150 |
| Components | 50-150 lines | 200 |

---

## 🚀 Performance

### Optimizations

1. **Parallel Data Loading** - `useFinancialData` uses `Promise.all()` to load all data concurrently
2. **Batch Operations** - `batchResolveCategoryIds` loads multiple IDs in one query
3. **Memoized Maps** - Category maps cached for batch processing
4. **Stable Function References** - Hook callbacks use `useCallback` for stability

### Best Practices

- Use `batchResolveCategoryIds` instead of multiple `getCategoryIdByName` calls
- Preload category maps when processing multiple items
- Leverage `useFinancialData` hook instead of individual load calls

---

## 🔄 Migration Notes

### Replacing Direct Database Calls

**Before:**
```typescript
const [incomes, setIncomes] = useState([]);
const [budgets, setBudgets] = useState([]);

useEffect(() => {
  loadIncomes(month).then(setIncomes);
  loadBudgets(month).then(setBudgets);
}, [month]);
```

**After:**
```typescript
const { data } = useFinancialData(month);
// Use data.incomes, data.budgets directly
```

### Replacing Duplicated Calculations

**Before:**
```typescript
// In multiple files:
const total = incomes.reduce((sum, i) => sum + (i.is_paid ? 0 : i.amount), 0);
```

**After:**
```typescript
import { calculateMoneyToAssign } from '@/features/shared/services';
const moneyToAssign = calculateMoneyToAssign(incomes, invoices, budgets);
```

---

## 📝 Contributing

### Adding New Utilities

1. Create the implementation file in appropriate folder
2. Create comprehensive tests (target: 90%+ coverage)
3. Add export to index.ts
4. Update this README with documentation
5. Run tests and ensure all pass

### Testing Requirements

- **Services:** 100% coverage target (pure functions)
- **Hooks:** 90%+ coverage target
- **All tests must pass:** `npm test features/shared`

---

## 📚 References

- **Main Plan:** [docs/plans/2025-01-16-feature-based-refactoring.md](../../docs/plans/2025-01-16-feature-based-refactoring.md)
- **App Spec:** [docs/APP_SPEC.md](../../docs/APP_SPEC.md)
- **Codebase Guide:** [CLAUDE.md](../../CLAUDE.md)

---

**Last Updated:** January 16, 2025
**Phase 1 Status:** ✅ Complete (Batches 1A-1F)
**Next Phase:** Phase 2 - Budget Feature Refactoring
