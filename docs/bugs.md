# Oma Kulu - Bug Reports & Issues

This document tracks all identified issues, categorized by type with analysis, root causes, and solutions.

---

## 🔴 CRITICAL - Data/Logic Issues

### 1. Transaction Income/Expense Type Bug ✅ FIXED
- [x] **Issue**: Transaction editing always converts to expense, doesn't understand income
- **Root Cause**: In `transactions.tsx` line 118, amount is hardcoded to negative: `amount: -Math.abs(amt)`
- **Location**: `app/(tabs)/transactions.tsx:118`
- **Solution**: Added category type detection - positive amount for income categories, negative for expense categories
- **Files Modified**: `app/(tabs)/transactions.tsx` (lines 115-121, 489)
- **Priority**: HIGH - Breaks core functionality

### 2. Month Filtering Not Working in Transactions ✅ FIXED
- [x] **Issue**: Changing month in Transactions tab shows all transactions instead of filtering by selected month
- **Root Cause**: Recent transactions filter (line 84-86) doesn't include month filtering + no data refresh on month change
- **Location**: `app/(tabs)/transactions.tsx:84-86`
- **Solution**: Added month-based filtering using startOfMonth/endOfMonth + added optimized data refresh on month changes (only fetching month-dependent data)
- **Files Modified**: `app/(tabs)/transactions.tsx` (lines 19, 34-50, 77-78, 86-94), `app/(tabs)/index.tsx` (lines 44-62)
- **Priority**: HIGH - Core feature not working

### 3. "In Bank" Calculation Verification
- [ ] **Issue**: "In bank" amount might not match actual bank balance
- **Root Cause**: Calculation uses all transactions: `settings.starting_balance + transactions.reduce((sum, t) => sum + t.amount, 0)`
- **Location**: `app/(tabs)/index.tsx:156-157`
- **Hypothesis**: Logic issue - may need to exclude certain transaction types or add date filtering
- **Priority**: MEDIUM - Financial accuracy concern

### 4. Category Updates Don't Reflect in Transactions ✅ FIXED
- [x] **Issue**: Updating categories creates new ones instead of updating existing transactions
- **Root Cause**: Transaction category is stored as string, not reference to category ID + Home tab category cache not refreshing
- **Location**: Multiple files - data model issue + frontend caching issue
- **Solution**: 
  - Added foreign key constraints with ON UPDATE CASCADE in Supabase database
  - Fixed Home tab useFocusEffect to reload ALL data (incomes, invoices, budgets) that may contain CASCADE updates
- **Database Migration**: Added FK constraints to expected_incomes, expected_invoices, budgets, and transactions tables
- **Code Changes**: Enhanced Home tab useFocusEffect to refresh incomes/invoices/budgets after category updates
- **Status**: ✅ FULLY FIXED - cascade updates working + complete data refresh on tab focus  
- **Priority**: MEDIUM - Data consistency issue

---

## 🟠 HIGH - UI/UX Issues

### 5. Category Dropdown Selection Issues ✅ FIXED
- [x] **Issue**: Dropdown shows values but can't select them, bottom navigation visible through dropdown
- **Root Cause**: Z-index conflicts in `SimpleDropdown` component and parent dialogs
- **Location**: `components/ui/SimpleDropdown.tsx`, `components/ui/Dialog.tsx`, `components/ui/SimpleDialog.tsx`
- **Solution**: 
  - Restored high `zIndex` to `SimpleDropdown` container
  - Added high `zIndex` to `Dialog` and `SimpleDialog` parent containers to ensure they render above all other content
- **Files Modified**: `components/ui/SimpleDropdown.tsx`, `components/ui/Dialog.tsx`, `components/ui/SimpleDialog.tsx`
- **Priority**: HIGH - Prevents category selection

### 6. Form Validation Missing ✅ FIXED
- [x] **Issue**: Add dialog allows saving without amount/category, shows toast but no visual cues
- **Root Cause**: No visual validation indicators in forms
- **Location**: Multiple dialog components
- **Solution**: 
  - Added red asterisk (*) to all required fields (Category, Amount, Category Name)
  - Implemented validation on Save button press - prevents dialog from closing if required fields are empty
  - Added visual feedback - field labels and placeholder text turn red when validation fails
  - Auto-clear errors when user starts typing in a field
  - Updated `Dialog` component to support async onSave with boolean return value
  - Updated `SimpleDropdown` to accept React.ReactNode labels and error prop
  - Moved category asterisk to placeholder text for better UI consistency
- **Files Modified**: 
  - `app/(tabs)/index.tsx` - Added validation for Category and Amount in Income/Invoice/Budget dialogs
  - `app/(tabs)/transactions.tsx` - Added validation for Category and Amount
  - `app/(tabs)/categories.tsx` - Added validation for Category Name
  - `components/ui/Dialog.tsx` - Updated to handle async onSave with boolean return
  - `components/ui/SimpleDropdown.tsx` - Updated to accept React.ReactNode labels and error prop
- **Status**: ✅ FULLY FIXED - validation working with visual feedback across all forms
- **Priority**: HIGH - Poor UX

### 7. Decimal Input Rounding Issues
- [ ] **Issue**: Decimal values round up, .0 shows but entering decimals doesn't work properly
- **Root Cause**: Number parsing and display logic
- **Location**: Amount input fields across dialogs
- **Hypothesis**: Frontend - number formatting and parsing logic
- **Priority**: MEDIUM - Accuracy in financial data

### 8. Euro Symbol Missing in Input
- [ ] **Issue**: Shows € symbol in placeholder but not when entering values
- **Root Cause**: Input formatting doesn't preserve currency symbol
- **Location**: TextInput components for amounts
- **Hypothesis**: Frontend - need to add currency formatting to inputs
- **Priority**: LOW - UX enhancement

### 9. Navigation Tab Cut Off on Web
- [ ] **Issue**: Bottom navigation partially cut off on certain screen resolutions
- **Root Cause**: CSS styling or safe area issues on web platform
- **Location**: `app/(tabs)/_layout.tsx` or styling
- **Hypothesis**: Frontend - platform-specific styling issue
- **Priority**: MEDIUM - Platform compatibility

### 10. Cash Overview Takes Too Much Space
- [ ] **Issue**: Cash overview section too large in Home tab
- **Root Cause**: Layout and spacing design in overview card
- **Location**: `app/(tabs)/index.tsx:591-653`
- **Hypothesis**: Frontend - need to optimize layout and spacing
- **Priority**: LOW - UI optimization

### 11. Duplicate Category Display in Transactions
- [ ] **Issue**: Category shown on left (badge) and bottom (plain text) - redundant
- **Root Cause**: Transaction item layout shows category twice
- **Location**: `app/(tabs)/transactions.tsx:182-225`
- **Hypothesis**: Frontend - remove redundant category display
- **Priority**: LOW - UI cleanup

### 12. Category Dropdown Missing Emoji
- [ ] **Issue**: Category dropdown should display emoji alongside names
- **Root Cause**: SimpleDropdown doesn't render emoji from category data
- **Location**: `components/ui/SimpleDropdown.tsx:70-85`
- **Hypothesis**: Frontend - need to modify dropdown item rendering
- **Priority**: MEDIUM - UX improvement

### 13. Dialog Field Order Inconsistency
- [ ] **Issue**: Dialog fields in different orders across forms
- **Root Cause**: Inconsistent form layout in different dialogs
- **Location**: Multiple dialog implementations
- **Hypothesis**: Frontend - standardize field order
- **Priority**: LOW - Consistency

---

## 🟡 MEDIUM - Missing Features

### 14. Transaction Tab Needs Income/Expense Sections
- [ ] **Issue**: Transaction tab should have separate Income and Expense sections
- **Root Cause**: Current design shows all transactions together
- **Location**: `app/(tabs)/transactions.tsx`
- **Hypothesis**: Frontend - need to add section separation logic
- **Priority**: MEDIUM - Feature enhancement

### 15. Report Tab Missing
- [ ] **Issue**: Need Report tab between transactions and categories showing monthly category breakdown
- **Root Cause**: Feature not implemented
- **Location**: New file needed
- **Hypothesis**: Frontend - new tab implementation with category grouping
- **Priority**: MEDIUM - New feature

### 16. Enhanced Category Selection UI
- [ ] **Issue**: Need top 10 most used categories with emoji and color in selection
- **Root Cause**: Current quick select doesn't show usage stats or visual elements
- **Location**: Category selection components
- **Hypothesis**: Frontend/Backend - need usage tracking and enhanced UI
- **Priority**: LOW - UX enhancement

---

## 🟢 LOW - Transaction Flow Issues

### 17. Expected Transaction Deletion Sync
- [ ] **Issue**: Deleting transactions created from expected items should mark them as unpaid in Home
- **Root Cause**: No bidirectional sync between transactions and expected items
- **Location**: Transaction deletion logic
- **Hypothesis**: Backend logic - need to track relationship and sync states
- **Priority**: MEDIUM - Data consistency

### 18. Expected Transaction Editing Sync
- [ ] **Issue**: Editing transactions created from expected items should reflect in Home tab
- **Root Cause**: Same as above - no bidirectional sync
- **Location**: Transaction editing logic
- **Hypothesis**: Backend logic - need relationship tracking
- **Priority**: MEDIUM - Data consistency

### 19. Home Tab Data Refresh ✅ FIXED (merged with #2)
- [x] **Issue**: Home tab should re-fetch data when entering to reflect changes  
- **Root Cause**: Data might be stale when returning to tab
- **Location**: `app/(tabs)/index.tsx` focus effect
- **Solution**: Fixed as part of month filtering issue (#2) - both tabs now refresh data on month changes
- **Files Modified**: See issue #2
- **Priority**: LOW - Data freshness

### 20. Money to Assign Text Change
- [ ] **Issue**: Change "Money to assign" to "Remaining to budget"
- **Root Cause**: Text label preference
- **Location**: `app/(tabs)/index.tsx:620`
- **Hypothesis**: Frontend - simple text change
- **Priority**: LOW - Copy improvement

---

## 📊 Implementation Priority

### Phase 1 - Critical Fixes (Week 1)
1. Fix transaction income/expense type bug (#1)
2. Fix month filtering in transactions (#2)
3. Fix category dropdown selection issues (#5)
4. Add form validation (#6)

### Phase 2 - High Impact (Week 2)
1. Verify and fix "in bank" calculation (#3)
2. Fix decimal input handling (#7)
3. Add category emoji to dropdowns (#12)
4. Fix navigation tab cut-off (#9)

### Phase 3 - Features & UX (Week 3)
1. Add transaction income/expense sections (#14)
2. Implement Report tab (#15)
3. Fix category update sync (#4)
4. Add transaction flow sync (#17, #18)

### Phase 4 - Polish (Week 4)
1. Add euro symbol to inputs (#8)
2. Optimize cash overview layout (#10)
3. Remove duplicate category display (#11)
4. Standardize dialog field order (#13)
5. Enhance category selection UI (#16)
6. Minor text and UX improvements (#19, #20)

---

## 🔧 Technical Notes

### Testing Strategy
- [ ] Test transaction creation for both income and expense types
- [ ] Test month filtering across all tabs
- [ ] Test category CRUD operations and transaction sync
- [ ] Test form validation edge cases
- [ ] Test decimal input with various locales
- [ ] Cross-platform testing (iOS, Android, Web)

### Code Quality Requirements
- [ ] All fixes must pass linter without errors
- [ ] Add TypeScript types where missing
- [ ] Update documentation for changed features
- [ ] Add unit tests for critical logic changes

---

*Last Updated: $(date)*
*Total Issues: 20*
*Critical: 4 | High: 9 | Medium: 4 | Low: 3*

