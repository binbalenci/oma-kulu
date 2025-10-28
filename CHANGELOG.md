# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
  - Required fields now marked with red asterisk (*)
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
