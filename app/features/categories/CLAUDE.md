# features/categories - AI Guidance

**Purpose:** Category CRUD with search and validation
**Tests:** 0 (components only, no complex logic)
**Run:** `npm test features/categories` (when tests added)

## Structure
- `components/` - CategoryForm (339), CategoryListItem (107), CategoryTypeSection (155)
- `hooks/` - useCategoriesData (87 lines)
- `services/` - categoryHelpers (30 lines validation)
- `screen.tsx` - Main composition (276 lines)

## Key Rules
1. **Validation:** Name + type must be unique, name cannot be empty/whitespace
2. **Fields:** All categories have `is_visible`, `budget_enabled`, `order_index`
3. **Reuse:** Use shared `ConfirmDialog`, `EmojiPickerDialog`, `IOSColorPicker`
4. **Hook:** Always use `useCategoriesData` for data loading

## Core Exports
- **CategoryForm** - Add/edit dialog with emoji/color pickers
- **CategoryListItem** - Card with color bar, badges, actions
- **CategoryTypeSection** - Section header with list/empty state
- **useCategoriesData** - Returns items, query, refresh, filtered lists
- **validateCategoryName** - Check uniqueness and emptiness

## Update Triggers
- New component/hook → Update README.md
- Validation change → Update this file + README.md
- Add tests → Update test stats
