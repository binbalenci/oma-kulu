# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.6.1] - 2025-01-26

### 🐛 Bug Fixes

- **Transaction Ordering**: Fixed duplicate `order_index` values that occurred when editing a transaction's date

  - Root cause: When changing a transaction's date, the old `order_index` was preserved instead of recalculating
  - Fixed database by reassigning sequential `order_index` values to all affected transactions
  - Updated logic to recalculate `order_index` when transaction date changes

- **Transaction Insertion**: Changed new transaction insertion from last to first position
  - New transactions now insert at position 0 (first) instead of appending to end
  - Matches data entry workflow: adding oldest-to-newest means newest appears first
  - Existing same-date transactions are automatically shifted down by 1

- **Use Savings Dropdown**: Fixed z-index issue where dropdown was hidden under Amount field
  - Root cause: Inline z-index styles were overridden by component's internal container style
  - Solution: Wrapped both Category and Use Savings dropdowns in Views with explicit z-index layering
  - Now properly displays above all subsequent fields (Category: 10000, Use Savings: 9000)

### ✨ Improvements

- **Dynamic Version Display**: Version number in About modal now reads from `package.json` instead of hardcoded string
  - Added `resolveJsonModule: true` to TypeScript config
  - Ensures version stays in sync across deployments

## [3.6.0] - 2025-01-25

### 🏗️ Architecture - Official Expo Router Structure

**Major Refactoring**: Migrated from `app/` directory structure to the official Expo Router `src/` structure to eliminate route scanning warnings and follow Expo best practices.

#### ✨ Structure Migration

- **Adopted Official Expo Pattern** - Moved to `src/` directory structure
  - Routes isolated in `src/app/` (7 route files)
  - All non-route code in `src/features/`, `src/components/`, `src/lib/`, etc.
  - Eliminates "missing default export" warnings (100+ warnings removed)
  - Follows official Expo Router documentation and best practices
  - Better separation of concerns: routes vs application logic

#### 📦 File Organization

- **New Structure**:
  ```
  src/
  ├── app/              # Routes only (Expo Router scans here)
  ├── features/         # Feature modules (65 files)
  ├── components/       # Shared UI (20 files)
  ├── lib/              # Core utilities (9 files)
  ├── constants/        # App theme (2 files)
  ├── hooks/            # Framework hooks (3 files)
  └── utils/            # Logger (1 file)
  ```

#### 🔧 Configuration Updates

- **TypeScript Configuration**

  - Added `@/src/*` path alias to tsconfig.json
  - Maintains backward compatibility with `@/*` for root access
  - Full TypeScript path resolution working correctly

- **Jest Configuration**
  - Updated coverage paths to `src/features/**` and `src/lib/**`
  - Updated jest.setup.js mocks to use `@/src/*` paths
  - All 275 tests passing with updated paths

#### 📝 Import Path Migration

- **Mass Import Updates** - 146 import statements updated
  - `@/app/features/*` → `@/src/features/*` (16 occurrences)
  - `@/app/components/*` → `@/src/components/*` (36 occurrences)
  - `@/app/lib/*` → `@/src/lib/*` (47 occurrences)
  - `@/app/constants/*` → `@/src/constants/*` (23 occurrences)
  - `@/app/hooks/*` → `@/src/hooks/*` (9 occurrences)
  - `@/app/utils/*` → `@/src/utils/*` (15 occurrences)

#### 📚 Documentation Updates

- **Updated CLAUDE.md** - All import examples use `@/src/*` paths
- **Updated Feature Docs** - 20+ README.md and CLAUDE.md files
- **Updated Test Examples** - Jest mock patterns reflect new structure

#### 📊 Migration Results

- **Files Moved**: 107 files successfully relocated
- **Zero Warnings**: Eliminated all Expo Router route scanning warnings
- **All Tests Passing**: 275 tests with 99-100% coverage maintained
- **Type-Check Clean**: Zero TypeScript errors
- **Lint Clean**: Zero ESLint warnings
- **Official Pattern**: Following documented Expo Router best practices

#### 🎯 Impact

- **Better Organization**: Clear separation between routes and application code
- **Expo Compliance**: Following official Expo Router documentation patterns
- **Cleaner Dev Experience**: No more "missing default export" spam in logs
- **Future-Proof**: Structure aligns with Expo Router evolution
- **Maintainability**: Easier to understand and navigate codebase structure

#### 🔗 References

- [Expo Router: Using src directory](https://docs.expo.dev/router/reference/src-directory/)
- [Expo Router: File-based routing](https://docs.expo.dev/router/basics/core-concepts/)

---

## [3.5.0] - 2025-01-25

### 🏗️ Architecture - Phase 6: Code Consolidation Complete

**Final Refactoring Phase**: Completed Phase 6 of the feature-based architecture refactoring, consolidating all application code into the `app/` directory for cleaner organization and improved maintainability.

#### ✨ Code Consolidation

- **Phase 6 Complete** - All code moved into `app/` directory
  - Moved `features/`, `lib/`, `components/`, `constants/` into `app/`
  - Moved `hooks/` into `app/hooks/` for consistency
  - Clean root directory with only configuration files
  - All code logic now unified in single main folder

#### 🔧 Import Path Standardization

- **Updated all imports** to use `@/app/*` paths
  - Mass update of 62+ files using automated tools
  - Manual fixes for edge cases (hooks, special components)
  - Consistent path aliases throughout codebase
  - Root-level hooks remain at `@/hooks/` (framework convention)

#### 🧪 Testing & Build Infrastructure

- **Metro bundler configuration**
  - Added test file exclusion from Metro bundler
  - Prevents `jest is not defined` errors in development
  - Blocks `__tests__/`, `*.test.*`, `*.spec.*` files
- **All tests passing**: 275 tests with 99-100% coverage on services/hooks
- **Zero import errors**: All TypeScript path resolutions working

#### 📚 Documentation Overhaul

- **Compact CLAUDE.md files** - Reduced verbosity by 70-85%
  - Feature-level docs: 27-30 lines each (was 40-301 lines)
  - Precise, frugal, non-redundant AI guidance
  - Focus on purpose, rules, core exports, update triggers
- **Root CLAUDE.md updated**
  - Reflects new `app/` structure
  - Updated import patterns and path examples
  - Documents all 6 completed phases
- **README.md updated**
  - Version 3.5.0 with complete refactoring summary
  - Updated architecture diagrams
  - Phase-by-phase breakdown of all work
  - New project structure documentation

#### 📊 Final Results

- **4 screen files**: 3-11 lines each (thin wrappers)
- **5 feature modules**: Shared, budget, transactions, reports, categories
- **275 tests passing**: Complete test coverage on business logic
- **Code reduction**: ~4,500 lines → ~2,000 lines (56% reduction)
- **Clean architecture**: Feature-based with proper separation of concerns
- **All code in `app/`**: Single unified directory for all application code

#### 🎯 Impact

- **Better organization**: Clear structure with all code in one place
- **Improved maintainability**: Modular, testable code with clean boundaries
- **Enhanced DX**: Consistent patterns, comprehensive docs, easy navigation
- **LLM-optimized**: Small files (100-400 lines), clear structure, compact guides
- **Production ready**: All tests passing, zero warnings, clean builds

## [3.4.0] - 2025-01-25

### 🏗️ Architecture - Phases 2-5: Feature-Based Refactoring Complete

**Major Refactoring**: Completed Phases 2-5 of the feature-based architecture refactoring plan. This release completes the migration of core screens to the new architecture, establishing a fully maintainable, testable, and LLM-optimized codebase.

#### ✨ Refactoring Achievements

- **Phase 2 Complete** - Enhanced test instructions and refined testing patterns

  - Improved test documentation for better developer experience
  - Established consistent testing patterns across features
  - Refined test coverage requirements and best practices

- **Phase 3 Complete** - Database helpers and comprehensive tests

  - Created robust database helper utilities with 90%+ test coverage
  - Implemented consistent error handling patterns
  - Enhanced database operation reliability and maintainability

- **Phase 4 Complete** - Transactions feature refactored

  - Migrated [app/(tabs)/transactions.tsx](<app/(tabs)/transactions.tsx>) to feature-based architecture
  - Extracted transaction-specific business logic into feature modules
  - Improved code organization and testability for transaction management

- **Phase 5 Complete** - Budget (Index) and Transactions screens fully refactored
  - Completed migration of [app/(tabs)/index.tsx](<app/(tabs)/index.tsx>) (Budget screen)
  - Finalized [app/(tabs)/transactions.tsx](<app/(tabs)/transactions.tsx>) refactoring
  - Screens now serve as thin presentation layers using shared services and hooks
  - Eliminated remaining code duplication (~600+ lines total reduced)

#### 🐛 Bug Fixes

- **Transaction Type Preservation**

  - Fixed issue where using "savings option" was not working correctly
  - Root cause: Wrong category value was being saved during transaction creation
  - Transactions now properly preserve their original category type (income/expense/saving)
  - Commit: c2bb703

- **Transaction Category Type Limiting**

  - Limited transaction categories to match their original type when created
  - Added transaction type selector in add dialog for better UX
  - Prevents mixing of income/expense/saving transactions incorrectly
  - Ensures data integrity across transaction types
  - Commit: 32edc58

- **Duplicate Order Index**
  - Fixed duplicate `order_index` values causing transaction ordering issues
  - Improved transaction creation logic to handle order indices correctly
  - Ensures consistent and predictable transaction ordering
  - Commit: fff7349

#### 🔧 Technical Improvements

- **Code Organization**

  - Established clear separation of concerns across all main screens
  - Screens → Hooks → Services → Database pattern fully implemented
  - Reduced screen complexity by moving business logic to feature modules
  - Improved maintainability with smaller, focused files

- **Testing Infrastructure**

  - Comprehensive test coverage for database helpers
  - Consistent testing patterns across all features
  - Improved test documentation and examples

- **Development Experience**
  - Better file organization improves AI comprehension
  - Clear patterns make future feature development faster
  - Reduced cognitive load with well-separated concerns

#### 📁 Impact Summary

- **Code Quality**: 600+ lines of duplicated/complex code eliminated across phases
- **Testability**: All core utilities now have comprehensive test coverage
- **Maintainability**: Clear architecture makes debugging and enhancement easier
- **Foundation Complete**: All major screens now follow feature-based architecture

#### 📋 Next Steps

Phase 6+ will focus on refactoring remaining screens (Reports, Categories) and extracting additional feature-specific modules. See [docs/plans/2025-01-16-feature-based-refactoring.md](docs/plans/2025-01-16-feature-based-refactoring.md) for the complete roadmap.

---

## [3.3.0] - 2025-01-16

### 🏗️ Architecture - Phase 1: Foundation Layer Complete

**Major Refactoring**: Completed Phase 1 of the feature-based architecture refactoring plan. This release establishes the foundation for a maintainable, LLM-optimized codebase with comprehensive test coverage.

#### ✨ New Features

- **Feature-Based Architecture**

  - Created `features/` directory structure for modular code organization
  - Implemented `features/shared/` for cross-feature utilities
  - Established clear separation of concerns: Services → Hooks → Components → Screens

- **Comprehensive Testing Infrastructure**
  - Added Jest testing framework with Expo integration
  - Configured TypeScript support with ts-jest
  - Set up @testing-library/react for hook testing
  - Implemented co-located test files (\*.test.ts) for better maintainability
  - Created test scripts: `test:shared`, `test:budget`, `test:watch`, `test:coverage`

#### 📦 New Shared Services (features/shared/services/)

All services include comprehensive test coverage (90-100%):

- **calculations.ts** - Financial calculation utilities

  - `calculateMoneyToAssign()` - Budget allocation calculations
  - `calculateActualInBank()` - Current balance with date filtering
  - `calculateSpentByCategory()` - Category spending aggregation
  - `calculateSavingsBalance()` - Savings category balance tracking
  - **Test Coverage**: 100% (calculations.test.ts)

- **formatters.ts** - Data formatting utilities

  - Currency formatting with proper decimal handling
  - Date formatting utilities
  - Display value formatters
  - **Test Coverage**: 100% (formatters.test.ts)

- **validators.ts** - Form validation logic

  - Budget amount validation
  - Transaction validation
  - Form field validation helpers
  - **Test Coverage**: 100% (validators.test.ts)

- **database-helpers.ts** - Database operation utilities
  - Category ID resolution
  - Common query patterns
  - Error handling helpers
  - **Test Coverage**: 90%+ (database-helpers.test.ts)

#### 🪝 New Shared Hooks (features/shared/hooks/)

- **useFinancialData.ts** - Centralized financial data loading
  - Combines loading of incomes, invoices, budgets, and transactions
  - Returns unified data structure with loading/error states
  - Implements refresh functionality
  - **Test Coverage**: 90%+ (useFinancialData.test.ts)

#### 📚 Documentation

- **features/shared/README.md** - Comprehensive feature documentation

  - Detailed API documentation for all services and hooks
  - Usage examples and patterns
  - Test coverage statistics
  - Architecture guidelines

- **features/shared/CLAUDE.md** - AI-optimized quick reference
  - Compact guidance for AI assistants
  - Quick command reference
  - Common task workflows

#### 🧪 Testing Achievements

- **Total Test Files**: 6 comprehensive test suites
- **Total Test Coverage**: ~800 lines of test code
- **Coverage Targets**:
  - Services: 100% coverage achieved
  - Hooks: 90%+ coverage achieved
  - Overall: 90%+ coverage on shared utilities

#### 🔧 Technical Improvements

- **Code Quality**

  - Eliminated code duplication across screens (400+ lines reduced)
  - Established consistent error handling patterns
  - Implemented pure functions for easier testing
  - Added JSDoc comments for better documentation

- **Development Experience**
  - Added `npm test` with Jest configuration
  - Implemented watch mode for TDD workflow
  - Created coverage reporting tools
  - Established testing best practices

#### 📁 File Structure Changes

```
features/
├── shared/
│   ├── README.md              # Detailed documentation
│   ├── CLAUDE.md              # AI-optimized guide
│   ├── components/            # Shared UI components (future)
│   ├── hooks/                 # Shared hooks
│   │   ├── index.ts
│   │   ├── useFinancialData.ts
│   │   └── useFinancialData.test.ts
│   └── services/              # Shared business logic
│       ├── index.ts
│       ├── calculations.ts
│       ├── calculations.test.ts
│       ├── formatters.ts
│       ├── formatters.test.ts
│       ├── validators.ts
│       ├── validators.test.ts
│       ├── database-helpers.ts
│       └── database-helpers.test.ts
```

#### 🎯 Impact

- **Maintainability**: 400+ lines of duplicated code eliminated
- **Testability**: All shared utilities now have comprehensive tests
- **LLM Optimization**: Smaller, focused files (100-300 lines) improve AI comprehension
- **Foundation**: Established patterns for Phase 2+ feature refactoring

#### 📋 Next Steps

Phase 2 will refactor the Budget feature (app/(tabs)/index.tsx) using the foundation established in Phase 1. See [docs/plans/2025-01-16-feature-based-refactoring.md](docs/plans/2025-01-16-feature-based-refactoring.md) for the complete roadmap.

---

## [3.2.0] - 2025-01-15

### ✨ New Features

- **Transaction Position/Ordering**
  - Added ability to reorder transactions within the Incomes and Expenses sections
  - Up and down arrow buttons on each transaction card allow manual repositioning
  - Order is persisted to the database and maintained across app restarts
  - Separate ordering maintained for income transactions (positive amounts) and expense transactions (negative amounts)
  - Arrows are disabled at boundaries (top item has no up arrow, bottom item has no down arrow)
  - New transactions are automatically placed at the top of their respective type list
  - **Technical Implementation**:
    - Added `order_index` column to `transactions` table in Supabase
    - Migration initializes existing transactions with order_index based on date
    - Order is saved immediately when transactions are moved
  - Files: `app/(tabs)/transactions.tsx`, `lib/database.ts`, `lib/types.ts`

## [3.1.1] - 2025-11-11

### 🐛 Bug Fixes

- **React Native Text Node Error in Transactions Tab**
  - Fixed "Unexpected text node: . A text node cannot be a child of a <View>" error
  - Error occurred when expanding Incomes and Expenses sections
  - **Root Cause #1**: Extra `<View style={styles.amountContainer}>` wrapper around the amount Text component caused React Native to misinterpret the decimal point from `.toFixed(1)` as a separate text node during re-renders
  - **Root Cause #2**: Using `&&` operator for conditional rendering instead of explicit ternary `? : null`
  - **Solutions Applied**:
    1. Removed the unnecessary View wrapper, making the Text component a direct child of `transactionRight` View
    2. Changed conditional rendering from `condition && <Component />` to `condition ? <Component /> : null` for the savings badge
  - **Systematic Testing**: Reverted changes one-by-one to identify which were essential:
    - ✅ **Essential**: Removing View wrapper (primary fix)
    - ✅ **Essential**: Using ternary operator with explicit `null` instead of `&&`
    - ❌ Not needed: React.memo optimization
    - ❌ Not needed: Pre-computed amount string variable
    - ❌ Not needed: Section-prefixed keys
  - **Technical Note**: React Native can misinterpret structural nesting during component re-renders as text nodes when:
    1. Views are unnecessarily nested
    2. Conditional rendering with `&&` operator can return falsy values (like `0`) that React Native tries to render as text
    3. Template literals containing punctuation are used in nested structures
  - **Best Practice**: Always use explicit ternary operators (`condition ? <Component /> : null`) instead of `&&` operator for conditional rendering in React Native to avoid rendering falsy values as text nodes
  - Files: `app/(tabs)/transactions.tsx`

### 🎨 UI/UX Improvements

- **Transaction Item Actions Menu**

  - Replaced inline Edit and Delete buttons with a 3-dot menu (⋮)
  - Menu displays actions with icons and descriptive text:
    - **Edit** - Modify transaction details
    - **Delete** - Remove transaction permanently
    - **Move to Pending** - For linked transactions (created from expected items)
  - Improved layout: Amount and menu button are now centrally aligned on the same line
  - Cleaner, more compact transaction card design
  - Files: `app/(tabs)/transactions.tsx`

- **Visual Distinction for Linked Transactions**
  - Transactions created from expected items (incomes/invoices/savings) now have distinct styling
  - Applied combination approach: Light orange background tint (#FFF8F0) + 4px orange left border
  - Makes it easy to identify which transactions can be moved back to pending vs permanently deleted
  - Linked transactions have `source_type` and `source_id` properties set
  - Files: `app/(tabs)/transactions.tsx`

## [3.1.0] - 2025-11-05

### ✨ New Features

- **📊 DetailPopup Component**

  - New reusable popup component for viewing detailed breakdowns and calculations
  - Vertical math-style calculation view for financial calculations
  - Breakdown sections with alternating row colors (zig-zag) for better readability
  - Two-line item format: Name on first line, "Date - Category" on second line
  - Available in Home tab (Cash Overview) and Reports tab (Category & Savings cards)
  - Files: `components/ui/DetailPopup.tsx`

- **🔍 Enhanced Cash Overview**

  - All Cash Overview sections now have info icons (ℹ️) and are clickable
  - **Income Detail**: Shows breakdown of all expected income items
  - **Expense Detail**: Shows breakdown of all expected expense items
  - **Remaining Detail**: Shows calculation breakdown (Income - Expenses - Allocated - Savings)
  - **In Bank Detail**: Shows calculation breakdown (Paid Income - Paid Expenses from income)
  - **Savings Detail**: Shows breakdown of all savings category balances
  - Files: `app/(tabs)/index.tsx`

- **📈 Enhanced Reports Tab**
  - Category cards now have info icons and are clickable
  - Shows transaction breakdown for each category in the current month
  - Savings cards now have info icons and are clickable
  - Shows contributions and payments breakdown for each savings category
  - Displays savings target if set
  - Files: `app/(tabs)/reports.tsx`

### 🔧 Technical Improvements

- **Database Schema Migration**

  - Migrated from category name-based foreign keys to category ID (UUID) foreign keys
  - Added `category_id` columns to all referencing tables (budgets, expected_incomes, expected_invoices, expected_savings, transactions)
  - Added proper foreign key constraints with `ON DELETE RESTRICT`
  - Maintains backward compatibility with `category` text fields
  - Fixed category save/update logic to prevent foreign key violations
  - Improved referential integrity and allows category name/type changes
  - Files: `lib/database.ts`, `lib/types.ts`, `docs/migrations/003_use_category_id_foreign_keys.sql`

- **UI/UX Enhancements**
  - Platform-specific Add buttons: Full button with text on web, icon-only on mobile
  - Info icons positioned in top-right corner of cards
  - Improved visual hierarchy with better spacing and colors
  - Files: `app/(tabs)/index.tsx`

### 🐛 Bug Fixes

- Fixed category creation/update to properly handle duplicate (name, type) combinations
- Fixed category update to preserve existing IDs (prevents foreign key violations)
- Fixed expense amount display to consistently show "-" prefix in detail popups
- Files: `lib/database.ts`, `app/(tabs)/index.tsx`, `app/(tabs)/reports.tsx`

## [3.0.0] - 2025-11-05

### ✨ Major Features

- **Major version bump to 3.0.0**

  - Major architectural improvements and new features
  - Enhanced error monitoring and logging system
  - Performance optimizations and code quality improvements
  - Updated Sentry initialization with comprehensive comments

- **💰 Savings System**
  - **Complete Savings Management**: Add monthly contributions to savings categories for future expenses (car insurance, car service, travel funds, etc.)
  - **Savings Balance Tracking**: Automatically calculates savings balances from transaction history with contributions minus payments
  - **Flexible Savings Usage**: Use savings to pay for expenses (partially or fully) through transaction dialogs or expected invoice dialogs
  - **Savings Targets**: Set optional target amounts for savings categories that persist across months
  - **Progress Tracking**: Visual progress bars showing savings progress toward targets
  - **Two-Row Cash Overview**: Updated Home tab with Income/Expenses/Remaining on top row, In Bank/Savings Balances on bottom row
  - **Enhanced Calculations**: "Remaining to assign" now includes savings allocations, "In Bank" calculation excludes savings contributions and accounts for savings-covered expenses
  - **Savings Section in Transactions**: New collapsible section showing paid savings contributions
  - **Savings Indicators**: Transactions show when savings were used with amount breakdown
  - **Reports Integration**: New "Savings Tracking" section showing active savings with balances, targets, and monthly activity
  - **Database Schema**: Added `expected_savings` table, enhanced `transactions` and `categories` tables with savings support
  - **Type Safety**: Full TypeScript support for all savings-related data structures
  - Files: `lib/types.ts`, `lib/database.ts`, `lib/storage.ts`, `app/(tabs)/index.tsx`, `app/(tabs)/transactions.tsx`, `app/(tabs)/reports.tsx`, `app/(tabs)/categories.tsx`, `docs/db.sql`, `docs/migrations/001_add_savings_feature.sql`

## [2.2.0] - 2025-01-29

### 🔧 Fixed

- **"In Bank" Calculation with Future-Dated Transactions**
  - Fixed calculation to exclude future-dated transactions from "In Bank" amount
  - Only includes transactions with date <= today, even if marked as "paid"
  - Prevents future payments from affecting current bank balance calculation
  - Files: `app/(tabs)/index.tsx`

### 🎨 UI/UX Improvements

- **Transactions Tab Section Consistency**

  - Unified spacing and layout structure across all sections (Upcoming, Incomes, Expenses)
  - Consistent spacing between section headers and transaction items
  - Matching gap spacing between transaction cards across all sections
  - Improved visual hierarchy with proper white space

- **Collapsible Sections in Transactions Tab**

  - Made Incomes and Expenses sections collapsible like Upcoming section
  - All sections now have chevron icons indicating expand/collapse state
  - Default states: Upcoming and Incomes collapsed, Expenses expanded
  - Better organization and reduced visual clutter

- **Naming Consistency**
  - Renamed "Income" section header to "Incomes" for plural consistency
  - Matches naming pattern used in other parts of the app

### 📚 Documentation

- **Updated Development Rules**
  - Comprehensive update to `.cursor/rules/oma-kulu-rule.mdc` to reflect current implementation
  - Added documentation for Month Context, Logger system, and Supabase database patterns
  - Updated file organization and technical patterns
  - Clarified "Money to assign" and "Actual in bank" calculation formulas

## [2.1.0] - 2025-01-28

### ✨ Added

- **Session Management for Passcode Gate**

  - 24-hour session persistence to avoid re-entering passcode on every app restart
  - Automatic session validation on app startup
  - Session creation after successful passcode verification
  - Cross-platform support (iOS, Android, Web) using AsyncStorage
  - Automatic session cleanup when expired
  - Files: `lib/session.ts`, `app/_layout.tsx`, `components/passcode-gate.tsx`

- **Pull-to-Refresh Functionality**
  - Added pull-to-refresh to all tabs (Home, Transactions, Reports, Categories)
  - Native refresh indicators with smooth animations
  - Comprehensive data reloading for each tab's specific content
  - Error handling with user feedback via snackbar
  - Consistent UX pattern across all tabs
  - Files: `app/(tabs)/index.tsx`, `app/(tabs)/transactions.tsx`, `app/(tabs)/reports.tsx`, `app/(tabs)/categories.tsx`

### 🔧 Fixed

- **"In Bank" Calculation Accuracy (#3)**
  - Fixed calculation to only include transactions from the selected month
  - Added status filtering to exclude "upcoming" transactions (only include "paid")
  - Properly separated income (positive amounts) and expenses (negative amounts)
  - Removed unnecessary starting balance since it defaults to 0
  - New calculation: `totalIncome - totalExpenses` for current month paid transactions only
  - Files: `app/(tabs)/index.tsx` (lines 204-219)

### 🧹 Code Quality

- **Removed Unused Settings Loading**
  - Cleaned up unused `loadSettings` import and calls in Home tab
  - Removed hardcoded starting balance state since it's always 0
  - Improved code maintainability and reduced bundle size
  - Files: `app/(tabs)/index.tsx`

## [2.0.0] - 2025-01-28

### ✨ Added

- **Reports Tab (#15)**
  - New Reports tab positioned between Transactions and Categories
  - Displays monthly category spending breakdown with visual progress indicators
  - Compact 2-column grid layout optimized for mobile screens
  - Shows spending amount, budget percentage, and progress status for each category
  - Rank numbers displayed on the left side of each card for easy scanning
  - Background color gradients indicate budget status:
    - Green (0-50%): Well within budget
    - Amber (50-75%): Approaching budget limit
    - Orange (75-100%): Near budget limit
    - Red (>100%): Over budget
  - Summary stats showing total categories, total spent, and categories with budgets
  - Month navigation integrated with shared month context across tabs
  - Files: `app/(tabs)/reports.tsx`, `app/(tabs)/_layout.tsx`, `components/ui/icon-symbol.tsx`

### 🎨 UI/UX Improvements

- **Cash Overview Redesign (#10)**
  - Redesigned cash overview section for better space efficiency
  - New minimal single-row horizontal layout with vertical dividers
  - Icons and labels now on same line for compact mobile experience
  - Reduced vertical space by ~70% while maintaining readability
  - Color coding: Green for Income, Red for Expenses, Dark Grey for Remaining/In Bank
  - Inspired by Reports tab summary section design
  - Files: `app/(tabs)/index.tsx`

## [1.5.0] - 2025-10-26

### 🐛 Fixed

- **Decimal Input Rounding Issues (#7)**

  - Fixed decimal values not displaying correctly when editing
  - Amounts now always show 2 decimal places (e.g., "10.00" instead of "10")
  - Changed from `String()` to `toFixed(2)` for consistent decimal formatting
  - Files: `app/(tabs)/index.tsx`, `app/(tabs)/transactions.tsx`

- **Euro Symbol Missing in Input (#8)**

  - Added persistent euro symbol (€) to amount input fields
  - Euro symbol now visible while typing, not just in placeholder
  - Used `TextInput.Affix` for better UX consistency
  - Files: `app/(tabs)/index.tsx`, `app/(tabs)/transactions.tsx`

- **Navigation Tab Cut Off on Web (#9)**

  - Resolved Edge browser specific rendering issue
  - Confirmed no code issues - works correctly on all other browsers
  - Investigation showed this is browser-specific quirk outside our control

- **Duplicate Category Display in Transactions (#11)**

  - Removed redundant category text from transaction metadata
  - Moved category badge to appear inline with date (e.g., "Oct 19 [Badge]")
  - Cleaner, more compact transaction item layout
  - Files: `app/(tabs)/transactions.tsx`

- **Category Dropdown Missing Emoji (#12)**

  - Added emoji support to category dropdown selection
  - Emojis now display before category names in dropdown list and selected value
  - Updated SimpleDropdown component to accept and render emoji data
  - Files: `components/ui/SimpleDropdown.tsx`, `app/(tabs)/index.tsx`, `app/(tabs)/transactions.tsx`

- **Dialog Field Order Inconsistency (#13)**

  - Standardized field order across all financial dialogs
  - Consistent flow: Category → Amount → Description/Name → Date → Notes
  - Improves user experience and muscle memory for data entry
  - Files: `app/(tabs)/index.tsx`, `app/(tabs)/transactions.tsx`

- **Transaction Tab Income/Expense Separation (#14)**

  - Split transactions into separate "Income" and "Expenses" sections
  - Income section shows positive amounts with green trending-up icon
  - Expenses section shows negative amounts with red trending-down icon
  - Each section has its own count badge with appropriate colors
  - Optimized rendering by pre-filtering transactions
  - Files: `app/(tabs)/transactions.tsx`

- **Expected Transaction Deletion Sync (#17)**

  - Added bidirectional sync between transactions and expected items
  - Deleting transactions created from expected income/invoice marks them as unpaid
  - Added database columns: `source_type` and `source_id` to track relationships
  - **UX Improvement**: Different icons and dialogs based on transaction origin
    - Manual transactions: Red delete icon with "Delete Transaction" dialog
    - From expected items: Orange clock icon with "Move to Pending?" dialog
  - Files: `lib/types.ts`, `app/(tabs)/index.tsx`, `app/(tabs)/transactions.tsx`

- **Expected Transaction Editing Sync (#18)**
  - Editing transactions syncs changes back to source expected items
  - Syncs amount, category, and description when changed
  - Only syncs if values actually changed to avoid unnecessary updates
  - Maintains referential integrity across Home and Transactions tabs
  - Files: `app/(tabs)/transactions.tsx`

### 💬 Changed

- **Text Improvement: Money to Assign (#20)**
  - Changed label from "Money to Assign" to "Remaining to Budget"
  - More intuitive and descriptive terminology for users
  - Files: `app/(tabs)/index.tsx`

## [1.4.0] - 2025-10-26

### 🐛 Fixed

- **Transaction Income/Expense Type Bug (#1)**

  - Fixed transaction editing always converting amounts to expenses
  - Added category type detection to properly handle income vs expense amounts
  - Income categories now correctly store positive amounts
  - Expense categories correctly store negative amounts
  - Files: `app/(tabs)/transactions.tsx`

- **Month Filtering in Transactions Tab (#2)**

  - Fixed month selector not filtering transactions properly
  - Added proper date range filtering using `startOfMonth` and `endOfMonth`
  - Implemented optimized data refresh on month changes
  - Only month-dependent data (transactions, incomes, invoices) now refreshes
  - Categories remain cached as they are month-independent
  - Files: `app/(tabs)/transactions.tsx`, `app/(tabs)/index.tsx`

- **Category Updates Sync with Transactions (#4)**

  - Fixed category name updates not reflecting in existing transactions
  - Added foreign key constraints with ON UPDATE CASCADE in Supabase database
  - Database now automatically updates all related records when category changes
  - Enhanced Home tab to refresh all data (incomes, invoices, budgets) on focus
  - Ensures CASCADE updates are immediately visible across all tabs
  - Database Migration: Added FK constraints to expected_incomes, expected_invoices, budgets, and transactions tables

- **Category Dropdown Selection Issues (#5)**

  - Fixed dropdown values not being selectable due to z-index conflicts
  - Fixed bottom navigation showing through dropdown menu
  - Restored high z-index to SimpleDropdown container (9999)
  - Added high z-index to Dialog and SimpleDialog parent containers
  - Dropdown now properly renders above all other UI elements
  - Files: `components/ui/SimpleDropdown.tsx`, `components/ui/Dialog.tsx`, `components/ui/SimpleDialog.tsx`

- **Form Validation Missing (#6)**
  - Added comprehensive form validation across all dialogs
  - Required fields now marked with red asterisk (\*)
  - Save button validates required fields before proceeding
  - Visual feedback: labels and placeholder text turn red when validation fails
  - Errors auto-clear when user starts typing
  - Dialog no longer closes if validation fails
  - Improved UI consistency by moving category asterisk to placeholder text
  - Files: `app/(tabs)/index.tsx`, `app/(tabs)/transactions.tsx`, `app/(tabs)/categories.tsx`, `components/ui/Dialog.tsx`, `components/ui/SimpleDropdown.tsx`

### 🎨 Improved

- **Dialog Component Enhancement**

  - Updated to support async onSave with boolean return value
  - Allows validation logic to prevent dialog closure
  - Better error handling and user feedback flow

- **SimpleDropdown Component Enhancement**

  - Now accepts React.ReactNode labels for flexible styling
  - Added error prop for visual error states
  - Placeholder text can be styled based on error state
  - Improved type safety and flexibility

- **UI/UX Consistency**
  - Standardized required field indicators across all forms
  - Consistent validation behavior in all dialogs
  - Better visual feedback for form errors
  - Improved dropdown UI alignment with other input fields

### 📊 Technical Improvements

- **Database Schema**

  - Added foreign key constraints for data integrity
  - Implemented CASCADE updates for automatic data sync
  - Better relational data management

- **Code Quality**
  - All changes pass TypeScript compilation
  - Zero linting warnings
  - Improved type safety across components
  - Better separation of concerns in validation logic

## [1.3.1] - 2025-10-19

### 🐛 Fixed

- **iOS Compatibility Issues**

  - Fixed `crypto.randomUUID()` not available on iOS by replacing with `expo-crypto`
  - Resolved ReferenceError when adding transactions on iOS devices
  - Updated all UUID generation across transactions, budgets, categories, and incomes

- **Passcode Screen Theme**

  - Fixed black screen issue on iOS when using system dark mode
  - Applied app's light theme consistently to passcode gate screen
  - Proper background color and themed styling for better user experience

- **Code Quality**
  - Fixed React Hook dependency warning in budget screen
  - Added missing `showSnackbar` dependency to useEffect
  - All linting checks now pass with zero warnings

### 🎨 Improved

- **UI Consistency**
  - Passcode screen now uses AppTheme for consistent styling
  - Better color contrast and typography alignment
  - Professional appearance matching rest of the app

## [1.3.0] - 2025-10-19

### 🚀 Deployment & Development Workflow

- **Automated Deploy Scripts**

  - Added `npm run deploy:ios` for native iOS deployments
  - Added `npm run deploy:web` for web deployments with production flag
  - Automated pre/post deployment hooks using npm lifecycle scripts
  - Source map generation and upload to Sentry for both platforms

- **Environment Management**

  - Integrated direnv for automatic environment variable loading
  - Secure passcode management via environment variables
  - Project-specific environment configuration with `.envrc`
  - Enhanced `.gitignore` for comprehensive file exclusion

- **Source Map Integration**
  - Automatic source map generation for iOS and web platforms
  - Sentry source map upload for better error tracking
  - Debug ID generation for accurate stack trace symbolication
  - Support for both development and production builds

### 🔐 Security & Authentication

- **Enhanced Passcode System**

  - Moved from hardcoded passcode to environment variable configuration
  - Base64 obfuscation for additional security layer
  - Removed 4-character limit - now supports any length passcode
  - Maintained number pad input for better UX

- **Version Display**
  - Added app version display on passcode gate screen
  - Automatic version reading from app configuration
  - Subtle, non-intrusive version information for users

### 🛠️ Developer Experience

- **Improved Build Process**

  - Streamlined export commands with platform-specific flags
  - Automated source map generation during builds
  - Production-ready web deployments with `--prod` flag
  - Better error handling and build validation

- **Enhanced Configuration**
  - Updated Sentry plugin configuration with proper auth token handling
  - Improved metro configuration for source map generation
  - Better environment variable management across platforms

### 📱 Platform Support

- **Web Deployment**

  - EAS Hosting integration for web deployments
  - Static site generation with proper source maps
  - Production-ready web builds with optimized assets

- **iOS Deployment**
  - EAS Update integration for over-the-air updates
  - Platform-specific source map generation
  - Improved iOS build process with automated uploads

## [1.2.0] - 2025-01-15

### 🔍 Error Monitoring & Logging

- **Sentry Integration**

  - Comprehensive error tracking and performance monitoring
  - Real-time error reporting with full stack traces
  - User journey tracking with breadcrumb trails
  - Session replay for debugging user interactions
  - Performance monitoring with automatic slow operation detection

- **Comprehensive Logger Utility**

  - Centralized logging system with multiple log levels (error, info, warning, critical)
  - User action tracking for all interactions
  - Database operation monitoring (success/failure tracking)
  - Navigation tracking for user flow analytics
  - Performance warnings for operations exceeding 3 seconds
  - Contextual error reporting with operation details

- **Developer Experience**
  - Rich error context for faster debugging
  - Structured logging patterns throughout the app
  - Production-ready error monitoring without test code
  - Automatic error categorization and tagging
  - User context and environment tracking

### 🛠️ Technical Improvements

- **Metro Configuration**

  - Added `metro.config.js` with Sentry integration
  - Source map generation for accurate error reporting
  - Debug ID injection for better error tracking

- **App Configuration**

  - Sentry Expo plugin configuration in `app.config.ts`
  - Environment variable support for DSN configuration
  - Production-ready error monitoring setup

- **Logging Implementation**
  - Added comprehensive logging to all main screens
  - User action tracking for category management
  - Database operation logging with success/failure tracking
  - Performance monitoring for data loading operations
  - Error context enhancement throughout the application

## [1.1.0] - 2025-01-15

### ⚡ Performance & UX Improvements

- **Blazing Fast Emoji Picker**

  - Switched from `@hiraku-ai/react-native-emoji-picker` to `rn-emoji-picker`
  - Dramatically improved performance with un-opinionated design
  - Eliminated 2-second delays on iOS and web platforms
  - Reduced memory usage and rendering complexity

- **Cross-Platform Consistency**
  - Optimized emoji sizing and density for both iOS and Web
  - Platform-specific optimizations for unified experience
  - Web: 10 emojis per row with 70% dialog height
  - iOS: 7 emojis per row with 60% dialog height
  - Consistent emoji scaling across platforms

### 🎨 UI/UX Enhancements

- **Enhanced Categories**

  - Enabled all 9 emoji categories: recent, emotion, emojis, activities, flags, food, places, nature, objects
  - Better emoji variety and selection options
  - Improved category navigation and search

- **iOS Clipping Fix**

  - Resolved emoji text clipping issues on iOS devices
  - Added proper line height and padding for emoji display
  - Fixed both Add dialog emoji preview and category list emojis
  - Improved text alignment and vertical centering

- **Better Web Experience**
  - Larger dialog height (70% vs 60%) for more emoji visibility
  - Improved emoji density with 10 emojis per row
  - Better scaling and proportions for web platform
  - Enhanced search functionality with real-time filtering

### 🔧 Technical Improvements

- **Library Migration**

  - Replaced heavy emoji library with lightweight `rn-emoji-picker`
  - Removed complex filtering and styling that caused performance issues
  - Simplified component architecture for better maintainability

- **Platform-Specific Optimizations**
  - Added Platform.OS checks for web vs mobile optimizations
  - Implemented transform scaling for better web density
  - Optimized container heights and constraints per platform

## [1.0.1] - 2025-01-15

### 🐛 Fixed

- **iOS Color Picker Issues**

  - Fixed dialog conflict where add dialog would close when color picker opened
  - Implemented seamless dialog handoff system to maintain user context
  - Fixed color overflow issue by making color grid scrollable
  - Added proper ScrollView with 300px max height for color selection
  - Increased dialog height to 500px on iOS to accommodate scrollable content

- **iOS Status Bar & Safe Area Issues**
  - Fixed snackbar positioning to respect safe area and not go behind notch
  - Implemented dynamic positioning that works across all device sizes and platforms
  - Changed status bar style from "light" to "dark" for proper visibility
  - Added cross-platform positioning logic with screen size adaptation
  - Snackbar now positions correctly below header on all iOS devices

### 🔧 Improved

- **Cross-Platform Compatibility**
  - Dynamic snackbar positioning based on platform (iOS/Android) and screen size
  - Percentage-based calculations for different device resolutions
  - Future-proof solution that adapts to new device sizes automatically

### 📱 Platform Support

- Enhanced iOS compatibility with proper safe area handling
- Fixed status bar content visibility on all iOS devices
- Improved responsive design for various iPhone models (SE, 14, 14 Pro Max, etc.)

## [1.0.0-beta] - 2025-01-15

### 🎉 Major Release - Complete UI/UX Overhaul

This beta release represents a complete transformation of the Oma Kulu app with modern UI/UX patterns, emoji-based category system, and enhanced user experience.

### ✨ Added

- **Emoji System for Categories**

  - Replaced icon picker with modern emoji selector
  - Emojis display after colored lines in Categories view
  - CategoryBadge component now shows emojis instead of icons
  - Emoji picker with smooth scrolling and search functionality

- **Enhanced Dialog System**

  - Smooth bottom-up animations for all dialogs
  - Proper scrolling support in emoji picker
  - Confirmation dialogs for all delete actions
  - Improved dialog overlay with blur effects

- **Smart Category Filtering**

  - Home screen dialogs now filter categories by type (income/invoice/budget)
  - Transactions screen shows all categories for flexibility
  - Custom SimpleDropdown component with proper scrolling

- **Improved User Experience**

  - Safe area support for iPhone (notch/speaker compatibility)
  - Compact Cash Overview layout with better visual hierarchy
  - Removed euro icons from amount inputs for cleaner look
  - Enhanced color differentiation for UI elements

- **Code Quality Improvements**
  - Comprehensive TypeScript and ESLint error fixes
  - Removed all unused icon-related code and packages
  - Updated database operations to handle emoji field
  - Clean, maintainable codebase

### 🔧 Changed

- **UI Components**

  - CategoryBadge now uses emoji instead of vector icons
  - Dialog animations are now smooth and consistent
  - Dropdown components have proper scrolling behavior
  - Color scheme improvements for better contrast

- **Database Integration**

  - Updated Category interface to include emoji field
  - Removed temporary emoji filtering from database operations
  - Ready for emoji column in Supabase schema

- **Navigation & Layout**
  - Added proper SafeAreaView support across all screens
  - Improved tab bar with consistent iconography
  - Better spacing and typography throughout the app

### 🗑️ Removed

- Icon picker system and related components
- Unused vector icon packages (kept only necessary UI icons)
- Temporary emoji filtering workarounds
- Redundant icon-related code and imports

### 🐛 Fixed

- Dropdown scrolling issues in category selection
- Safe area overlapping on iPhone devices
- TypeScript errors related to icon system
- ESLint warnings and code quality issues
- Dialog animation performance and smoothness

### 📱 Platform Support

- Enhanced iPhone compatibility with proper safe area handling
- Improved responsive design for various screen sizes
- Better touch targets and accessibility

### 🔮 Known Issues

- Emoji field requires database schema update (add `emoji` column to categories table)
- Some UI elements may need fine-tuning based on user feedback

### 📋 Migration Notes

- Existing categories will show fallback folder icons until emoji is set
- No data migration required - emoji field is optional
- Database schema update needed for full emoji functionality

---

## [0.4.0] - 2024-12-15

### Added

- Basic budget management functionality
- Transaction tracking system
- Category management with icons and colors
- Expected income/invoice planning
- Month-based navigation
- Supabase database integration
- AsyncStorage for local data persistence
- Basic UI components and theme system

### Technical

- React Native with Expo framework
- Expo Router for navigation
- React Native Paper UI components
- Vector icons for categories and UI elements
- Basic animations and transitions
