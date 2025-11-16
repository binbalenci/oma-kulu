# Oma Kulu - AI Development Guide

**Stack:** React Native + Expo + Supabase (PostgreSQL) + TypeScript
**Design:** Apple-inspired minimal finance app

---

## 🚀 Quick Commands

```bash
# Development
npm start              # Expo dev
npm run check-all      # Type-check + lint (zero warnings required)
npm test              # Run tests

# Testing
npm test features/shared                    # Run feature tests
npm test path/to/file.test.ts -- --coverage # With coverage
```

---

## 🏗️ Architecture

### File Structure
```
app/(tabs)/           # Screens: index.tsx (budget), transactions.tsx, reports.tsx, categories.tsx
features/             # Feature-based modules (Phase 1: shared/ complete, Phase 2+: budget/, transactions/, etc.)
  shared/             # Utilities for all features (calculations, formatters, validators, hooks)
lib/                  # Core: database.ts, types.ts, supabase.ts
components/           # UI components (legacy, migrating to features/)
```

### Data Flow
```
Screen → Hook → Service → Database
       ↓
     Components (presentation only)
```

**Rule:** Code only depends on layers below, never above.

### Key Files
- `lib/database.ts` - All CRUD (load*, save*, delete*), returns empty on error
- `lib/types.ts` - All data models (ExpectedIncome, Budget, Transaction, etc.)
- `features/shared/` - Reusable utilities (see `features/shared/CLAUDE.md`)

---

## 📋 Critical Patterns

### 1. Month State (Global)
```typescript
const { currentMonth } = useMonth();  // Shared across all tabs
```

### 2. Snackbar (Global)
```typescript
const { showSnackbar } = useSnackbar();  // NEVER create local toasts
```

### 3. Logging (Required)
```typescript
logger.navigationAction("ScreenName", context);  // NOT console.log
logger.userAction("buttonClick", context);
logger.databaseError(error, "saveIncome", context);
```

### 4. Data Loading
```typescript
// ✅ Use shared hook (Phase 1+)
const { data, loading, error, refresh } = useFinancialData(currentMonth);

// Old pattern (pre-Phase 1):
const [incomes, setIncomes] = useState([]);
useEffect(() => { loadIncomes(monthKey).then(setIncomes); }, [monthKey]);
```

---

## 💰 Business Logic

### Financial Calculations
- **Money to assign:** `expectedIncome - expectedExpenses - totalAllocated` (all items, paid/unpaid)
- **Actual in bank:** `totalIncome - totalExpenses` (only PAID, date <= today)

### Date Formats
- Month key: `yyyy-MM` ("2025-01")
- Transaction date: `yyyy-MM-dd` (ISO)
- Display: `"January 2025"`

### Data Model
- Categories (foundation) → Expected items (incomes/invoices/savings) → Budgets → Transactions
- Dual fields: `category` (name, legacy) + `category_id` (UUID, current)
- Transactions track source: `source_type` + `source_id`

---

## 🧪 Testing Rules

### Coverage Targets
- **Services (pure functions):** 100%
- **Hooks:** 90%+
- **Components:** No tests (UI only)

### Test Setup
- Co-locate tests: `myService.ts` + `myService.test.ts`
- Hook tests: Add `@jest-environment jsdom` at top
- Use `@testing-library/react` with `renderHook`

### Example
```typescript
// myService.test.ts
describe('myFunction', () => {
  it('should handle edge case', () => {
    expect(myFunction(input)).toBe(expected);
  });
});
```

---

## 📁 Scoped Documentation (CRITICAL)

**RULE:** Every feature directory (`features/shared/`, `features/budget/`, etc.) MUST have:

### 1. `README.md` (User-facing)
- Detailed documentation
- Function signatures + examples
- Test coverage stats
- Architecture notes

### 2. `CLAUDE.md` (AI-facing - THIS FILE'S FORMAT)
- Super compact, AI-optimized
- Key rules + patterns only
- Quick reference commands
- Common tasks

### When Creating New Feature Directory
```bash
# ALWAYS create both:
1. features/new-feature/README.md      # Detailed docs
2. features/new-feature/CLAUDE.md      # Compact AI guide (follow THIS file's format)
3. Update root docs/plans/ if architectural
```

### Documentation Maintenance (CRITICAL)
**When making changes:**
1. ✅ Update local `README.md` with new functions/components/coverage
2. ✅ Update local `CLAUDE.md` if rules/patterns change
3. ✅ Keep examples current with actual code
4. ✅ Update coverage stats after adding tests

**Template for feature CLAUDE.md:**
```markdown
# features/[name] - AI Guidance

## Quick Reference
**Purpose:** [1 line]
**Tests:** [X passing, Y% coverage]
**Commands:** npm test features/[name]

## Key Rules
1. [Rule 1]
2. [Rule 2]

## Core Functions/Hooks/Components
- [List with 1-line descriptions]

## Common Tasks
### Adding New [X]
[Step-by-step commands]

## Documentation Maintenance
Update README.md and this CLAUDE.md when:
- [Triggers]
```

---

## 🎨 UI Guidelines

- **Components:** React Native Paper only
- **Spacing:** Multiples of 4 (4, 8, 12, 16, 24, 32)
- **Theme:** `const theme = useTheme()`
- **Emojis:** Categories use emoji identifiers
- **Progress bars:** Green (0-74%), Orange (75-95%), Red (96%+)

---

## 🔧 Special Features

### Transaction Reordering
- Up/down arrows for same-date transactions only
- Persisted via `order_index` field
- Sort: `ORDER BY date DESC, order_index ASC`

---

## 📦 Database Tables

- `categories` - Income/expense/saving types (foundation)
- `expected_incomes` / `expected_invoices` / `expected_savings` - Per-month planning
- `budgets` - Spending limits per category/month
- `transactions` - Actual financial activity
- `app_settings` - App config

---

## ✅ Code Quality Checklist

- [ ] `npm run check-all` passes (zero warnings)
- [ ] All tests pass with required coverage
- [ ] Used `logger.*` instead of `console.log`
- [ ] Updated `README.md` in changed directories
- [ ] Updated `CLAUDE.md` if patterns changed
- [ ] No `any` types without justification

---

## 📚 References

- **Detailed Docs:** See individual `features/*/README.md` files
- **Refactoring Plan:** `docs/plans/2025-01-16-feature-based-refactoring.md`
- **App Spec:** `docs/APP_SPEC.md`
