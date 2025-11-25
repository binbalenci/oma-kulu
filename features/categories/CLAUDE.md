# features/categories - AI Guidance

## Quick Reference
**Purpose:** Category management (income/expense/saving) with CRUD and search
**Tests:** No tests yet (components only, no complex logic)
**Commands:** `npm test features/categories` (when tests added)
**Files:** 9 (wrapper) + 276 (screen) + 601 (components) + 87 (hook) = 973 lines

## Key Rules
1. Name + Type combination must be unique
2. Category names cannot be empty/whitespace
3. All categories have: `is_visible`, `budget_enabled`, `order_index`
4. Use shared components: `ConfirmDialog`, `EmojiPickerDialog`, `IOSColorPicker`
5. Always use `useCategoriesData` hook for data loading

## Core Components

### CategoryForm.tsx (339 lines)
Add/edit dialog with name, type, emoji, color, visibility, budget toggles

### CategoryListItem.tsx (107 lines)
Individual category card with color bar, emoji, status badges, actions

### CategoryTypeSection.tsx (155 lines)
Section with header, count chip, add button, category list/empty state

## Core Hook

### useCategoriesData.ts (87 lines)
Returns: items, setItems, query, setQuery, refreshing, onRefresh,
         incomeCategories, expenseCategories, savingCategories

## Common Tasks

### Adding New Component
1. Create in `components/`
2. Export from `components/index.ts`
3. Import in `screen.tsx`
4. Update README.md

### Modifying Category Form
1. Edit `CategoryForm.tsx`
2. Update props interface
3. Pass props from `screen.tsx`
4. Test form validation

### Adding Category Validation
1. Add check in `screen.tsx` `saveEdit()` function
2. Set `nameError` state for UI feedback
3. Show error via `showSnackbar()`

## Documentation Maintenance
Update README.md and this CLAUDE.md when:
- Adding new components
- Adding new hooks
- Changing validation rules
- Modifying file structure
- Adding tests
