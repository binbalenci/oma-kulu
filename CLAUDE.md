# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Oma Kulu is a React Native personal finance management app built with Expo. The app follows Apple's design standards with clean, minimal, functional design principles. It uses Supabase (PostgreSQL) for data persistence and implements a comprehensive financial planning and tracking system.

## Development Commands

### Start Development
```bash
npm start                 # Start Expo dev server
npm run ios              # Run on iOS
npm run android          # Run on Android
npm run web              # Run on web
```

### Code Quality
```bash
npm run type-check       # Run TypeScript compiler checks
npm run lint             # Run ESLint
npm run lint:check       # Lint with zero warnings allowed
npm run lint:fix         # Auto-fix linting issues
npm run check-all        # Run both type-check and lint:check
```

### Deployment
```bash
npm run predeploy:ios    # Export with source maps for iOS
npm run deploy:ios       # Deploy update via EAS
npm run predeploy:web    # Export with source maps for web
npm run deploy:web       # Deploy to web production
```

## Architecture

### Provider Hierarchy
The app uses a nested provider structure (defined in [app/_layout.tsx](app/_layout.tsx)):
```
SafeAreaProvider
└── Sentry Integration (error tracking)
    └── PaperProvider (UI components)
        └── ThemeProvider (navigation theme)
            └── MonthProvider (shared month state across tabs)
                └── SnackbarProvider (global notifications)
                    └── PasscodeGate (authentication with 24-hour session)
                        └── App Content
```

### Data Flow Architecture

**Database Layer** ([lib/database.ts](lib/database.ts)):
- Primary data access layer using Supabase client
- All CRUD operations for: categories, budgets, expected_incomes, expected_invoices, expected_savings, transactions, app_settings
- Functions follow naming convention: `load*`, `save*`, `delete*`
- Handles category name <-> UUID resolution automatically
- Returns empty arrays/defaults on error (never throws)

**Storage Layer** ([lib/storage.ts](lib/storage.ts)):
- Compatibility layer that re-exports database functions
- Exists for backward compatibility with older code
- Both imports work: `from "@/lib/database"` or `from "@/lib/storage"`

**Type Definitions** ([lib/types.ts](lib/types.ts)):
- All data model interfaces: `ExpectedIncome`, `ExpectedInvoice`, `Budget`, `ExpectedSavings`, `Transaction`, `Category`, `AppSettings`
- Categories use dual fields: `category` (name) and `category_id` (UUID) for backward compatibility
- Transactions track source via `source_type` and `source_id` (links back to expected items)

### State Management

**Month Context** ([lib/month-context.tsx](lib/month-context.tsx)):
- Shared month state synchronized across all tabs
- Access via: `const { currentMonth, setCurrentMonth } = useMonth()`
- Month changes in one tab automatically propagate to others
- Critical for maintaining consistent month view across Home, Transactions, Reports

**Session Management** ([lib/session.ts](lib/session.ts)):
- 24-hour passcode sessions using expo-secure-store
- Sessions automatically validated on app startup
- Eliminates need to re-enter passcode on every app restart

**Global Snackbar** ([components/snackbar-provider.tsx](components/snackbar-provider.tsx)):
- Centralized notification system accessible from any component
- Access via: `const { showSnackbar } = useSnackbar()`
- NEVER create local toast/snackbar state - always use this global provider

### Navigation Structure

The app uses Expo Router with file-based routing:
```
app/
├── _layout.tsx              # Root layout with all providers
├── (tabs)/                  # Tab-based navigation
│   ├── _layout.tsx         # Tab bar configuration
│   ├── index.tsx           # Home/Budget screen (default tab)
│   ├── transactions.tsx    # All transactions view
│   ├── reports.tsx         # Spending analysis
│   └── categories.tsx      # Category management
└── modal.tsx               # Modal screens
```

### Logging & Monitoring

**Logger Utility** ([app/utils/logger.ts](app/utils/logger.ts)):
- Integrated with Sentry for error tracking and performance monitoring
- Always use logger instead of console.log
- Methods:
  - `logger.navigationAction(screen, context)` - Track screen navigation
  - `logger.userAction(action, context)` - Track user interactions
  - `logger.dataAction(action, context)` - Track data operations
  - `logger.databaseSuccess(operation, context)` - Log successful DB ops
  - `logger.databaseError(error, operation, context)` - Log DB errors
  - `logger.error(error, context)` - General error logging
  - `logger.performanceWarning(operation, duration, threshold)` - Performance tracking

## Key Patterns

### Loading Data Pattern
```typescript
// Load data on mount/focus with month dependency
React.useEffect(() => {
  (async () => {
    const [incomes, invoices, budgets] = await Promise.all([
      loadIncomes(monthKey),
      loadInvoices(monthKey),
      loadBudgets(monthKey),
    ]);
    setIncomes(incomes);
    setInvoices(invoices);
    setBudgets(budgets);
  })();
}, [monthKey]); // Reload when month changes
```

### Screen Structure Pattern
```typescript
export default function MyScreen() {
  const { currentMonth } = useMonth();
  const { showSnackbar } = useSnackbar();
  const [data, setData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Log navigation and load data on screen focus
  useFocusEffect(
    React.useCallback(() => {
      logger.navigationAction("MyScreen", { month: currentMonth });
      loadData();
    }, [currentMonth])
  );

  const loadData = async () => {
    const result = await loadMyData();
    setData(result);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Render with pull-to-refresh
  return (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      {/* content */}
    </ScrollView>
  );
}
```

### Database Operation Pattern
```typescript
// Save with error handling and user feedback
const handleSave = async () => {
  try {
    const success = await saveIncome(income);
    if (success) {
      logger.databaseSuccess("saveIncome", { incomeId: income.id });
      showSnackbar("Income saved successfully!");
    }
  } catch (error) {
    logger.databaseError(error, "saveIncome", { income });
    showSnackbar("Failed to save income");
  }
};
```

## Business Logic

### Financial Calculations

**"Money to assign"** (Budget screen):
- Formula: `expectedIncome - expectedExpenses - totalAllocated`
- Includes ALL expected incomes and invoices for the month (paid or unpaid)
- Represents remaining money available to allocate to budget categories

**"Actual in bank"** (Budget screen):
- Formula: `totalIncome - totalExpenses`
- Only includes PAID transactions from current month where `date <= today`
- Filters out future-dated transactions even if marked as paid
- Shows real cash position, not including future income/expenses

### Date Formats
- Month key: `yyyy-MM` (e.g., "2025-01")
- Transaction date: `yyyy-MM-dd` (ISO format)
- Display format: `format(date, "MMMM yyyy")` produces "January 2025"

### Data Relationships
- Categories are the foundational entity (income/expense/saving types)
- Expected items (incomes, invoices, savings) reference categories and belong to months
- Budgets allocate amounts to expense categories per month
- Transactions are created from expected items when marked as paid
- Transactions track their source via `source_type` and `source_id`

## Component Guidelines

### UI Components
- Use React Native Paper components for consistency
- Access theme via: `const theme = useTheme()`
- Custom UI components in [components/ui/](components/ui/)
- Follow systematic spacing: multiples of 4 (4, 8, 12, 16, 24, 32)

### Emoji System
- Categories use emojis as visual identifiers (stored in `emoji` field)
- EmojiPickerDialog component handles emoji selection
- Emojis provide modern, accessible visual cues throughout the app

### Progress Bars
Color-coded based on spending ratio:
- 0-74%: Green (#4caf50)
- 75-95%: Orange (#ff9800)
- 96%+: Red (#f44336)

## Environment Setup

Required environment variables (in `.env`):
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

## Database Schema

Supabase tables:
- `categories` - Income/expense/saving categories with emojis, colors, visibility
- `expected_incomes` - Planned income sources per month
- `expected_invoices` - Expected bills and expenses per month
- `expected_savings` - Savings goals per month
- `budgets` - Spending limits per category per month
- `transactions` - Actual financial activity (created from expected items or manually)
- `app_settings` - App configuration and user preferences

## Code Quality Standards

- TypeScript strict mode enabled
- No `any` types without justification
- Always run `npm run check-all` before committing
- Fix all linter errors and warnings immediately
- Use proper async/await with error handling
- Log all navigation, user actions, and database operations
