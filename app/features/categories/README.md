# Categories Feature

## Purpose
Manages all category types (income, expense, saving) with CRUD operations and search functionality.

## Structure

```
categories/
├── components/         # UI components
│   ├── CategoryForm.tsx           [339 lines]
│   ├── CategoryListItem.tsx       [107 lines]
│   ├── CategoryTypeSection.tsx    [155 lines]
│   └── index.ts
├── hooks/              # Data management
│   ├── useCategoriesData.ts       [87 lines]
│   └── index.ts
├── screen.tsx          # Main screen [276 lines]
├── index.ts            # Public API
├── README.md           # This file
└── CLAUDE.md           # AI developer guide
```

## Key Components

### CategoryForm.tsx (339 lines)
Form dialog for adding/editing categories with:
- Name input with validation
- Type selector (income/expense/saving)
- Emoji and color pickers
- Visibility and budget toggles

### CategoryListItem.tsx (107 lines)
Displays individual category with:
- Color bar indicator
- Emoji icon
- Name and status badges
- Edit and delete actions

### CategoryTypeSection.tsx (155 lines)
Section component for grouped categories with:
- Section header with icon and count
- Add button for that type
- List of categories or empty state

## Key Hook

### useCategoriesData.ts (87 lines)
Manages category data loading and state:
- Initial load on mount
- Pull-to-refresh support
- Search filtering
- Type-based grouping and sorting

Returns:
- `items` - All categories
- `setItems` - Update categories state
- `query` - Current search query
- `setQuery` - Update search query
- `refreshing` - Pull-to-refresh state
- `onRefresh` - Refresh handler
- `incomeCategories` - Filtered income categories
- `expenseCategories` - Filtered expense categories
- `savingCategories` - Filtered saving categories

## Refactoring Complete ✅

**Original**: 733 lines (monolithic screen)
**After Refactoring**:
- Tab wrapper: 9 lines (99% reduction)
- Screen: 276 lines (proper component composition)
- Components: 601 lines (3 components)
- Hooks: 87 lines (1 hook)
- **Total reduction**: 62% in screen complexity

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

Currently, no tests have been written for this feature. Following the project testing philosophy:
- **Components**: No tests (UI only, by design)
- **Hooks**: Could be tested if business logic becomes complex
- **Services**: No services created yet

**Run Tests**: `npm test features/categories` (when tests are added)

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
// Import the screen (already done in app/(tabs)/categories.tsx)
import { CategoriesScreen } from "@/features/categories";

// Use the hook in other features if needed
import { useCategoriesData } from "@/features/categories";

function MyComponent() {
  const { incomeCategories, expenseCategories, savingCategories } = useCategoriesData();

  // Use the filtered and sorted categories
}

// Use individual components if needed
import { CategoryListItem, CategoryTypeSection } from "@/features/categories";
```

## File Stats

| File | Lines | Reduction |
|------|-------|-----------|
| **Original** `app/(tabs)/categories.tsx` | 733 lines | - |
| **New** `app/(tabs)/categories.tsx` | 9 lines | 99% ✅ |
| `features/categories/screen.tsx` | 276 lines | 62% reduction |
| `features/categories/components/` | 601 lines | 3 components |
| `features/categories/hooks/` | 87 lines | 1 hook |
| **Total** | 973 lines | Organized & maintainable |

## Future Improvements

- Add tests for `useCategoriesData` hook
- Extract additional hooks if form logic becomes complex
- Add category reordering (drag & drop)
- Add category icons library beyond emojis
- Add category usage statistics (where used, # of transactions)
