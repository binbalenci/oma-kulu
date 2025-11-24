# Categories Feature

## Purpose
Manages all category types (income, expense, saving) with CRUD operations and search functionality.

## Structure

```
categories/
├── services/           # Business logic and helpers
│   ├── categoryHelpers.ts       [TESTED - 20 tests, 20 passing]
│   └── categoryHelpers.test.ts
├── types.ts            # TypeScript types (re-exports)
├── index.ts            # Public API
└── README.md           # This file
```

## Key Services **[TESTED - 100% coverage]**

### categoryHelpers.ts
- `filterCategoriesByQuery(categories, query)` - Filter categories by search term (case-insensitive)
- `groupCategoriesByType(categories, query)` - Group and sort categories by type (income/expense/saving)
- `validateCategoryName(name)` - Check if category name is valid
- `isDuplicateCategory(name, type, categories, excludeId)` - Check for duplicate name+type combination
- `getNextOrderIndex(categories)` - Calculate next order_index for new category

## Current Implementation

The categories screen ([app/(tabs)/categories.tsx](../../app/(tabs)/categories.tsx)) is currently a self-contained component at 733 lines. It includes:

- Search functionality
- Category CRUD operations
- Form dialogs with emoji and color pickers
- Category grouping by type (Income, Expenses, Savings)
- Confirmation dialogs for deletion
- Pull-to-refresh support

## Refactoring Note

Phase 5 focused on quick wins. The categories screen is already well-structured, so we created:
- ✅ Tested helper services for common operations
- ✅ Documentation and organization
- ⏳ Future: Extract form hooks (useCategoryForm) if needed
- ⏳ Future: Extract components if reused elsewhere

## Business Logic

### Category Types
- **Income**: Money coming in (salary, freelance, etc.)
- **Expense**: Money going out (groceries, rent, etc.)
- **Saving**: Savings goals (emergency fund, vacation, etc.)

### Validation Rules
- Name cannot be empty
- Name + Type combination must be unique
- Each category has:
  - `is_visible`: Show/hide in UI
  - `budget_enabled`: Can have budget allocated
  - `order_index`: Display order within type

## Testing

- **Services**: 20 tests, 100% coverage
  - `categoryHelpers.test.ts` - All helper functions tested
- **Run Tests**: `npm test features/categories`
- **Coverage**: `npm test features/categories -- --coverage`

### Test Coverage Summary
```
Services: 20/20 passing (100%)
Total:    20 tests passing
```

## Dependencies

### Database
- `loadCategories()` - Load all categories
- `saveCategory(category)` - Create or update category
- `deleteCategory(id)` - Delete category

### UI Components
- `EmojiPickerDialog` - Emoji selection
- `IOSColorPicker` - Color selection
- `ConfirmDialog` - Delete confirmation

## Usage

```typescript
import {
  filterCategoriesByQuery,
  groupCategoriesByType,
  validateCategoryName,
  isDuplicateCategory,
  getNextOrderIndex,
} from "@/features/categories";

// Filter categories by search
const filtered = filterCategoriesByQuery(categories, "groc");

// Group by type
const { income, expense, saving } = groupCategoriesByType(categories, "");

// Validate before save
if (!validateCategoryName(name)) {
  showError("Name required");
}

// Check for duplicates
if (isDuplicateCategory(name, type, categories, editingId)) {
  showError("Category already exists");
}

// Get next order index
const orderIndex = getNextOrderIndex(categories);
```

## File Stats

| File | Lines | Status |
|------|-------|--------|
| `app/(tabs)/categories.tsx` | 733 lines | Well-structured, kept as-is |
| `features/categories/services/` | ~100 lines | NEW - Tested helpers |
| **With tests** | ~200 lines | +200 lines (tests) |

## Future Improvements

- Extract `useCategoryForm` hook for form state management
- Extract `CategoryCard` component if reused
- Add category reordering (drag & drop)
- Add category icons library beyond emojis
- Add category usage statistics
