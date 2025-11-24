# features/categories - AI Guidance

## Quick Reference
**Purpose:** Category CRUD operations with search and validation
**Tests:** 20 passing, 100% services coverage
**Commands:** `npm test features/categories`

## Key Rules
1. Services (helpers) must have 100% test coverage
2. Name + Type combination must be unique
3. Category names cannot be empty/whitespace
4. Always validate before saving

## Core Functions

### Services (categoryHelpers.ts)
- `filterCategoriesByQuery()` - Case-insensitive search
- `groupCategoriesByType()` - Group and sort by type
- `validateCategoryName()` - Check if name is valid
- `isDuplicateCategory()` - Check for name+type duplicates
- `getNextOrderIndex()` - Calculate next order_index

## Common Tasks

### Adding New Helper
1. Add function to `services/categoryHelpers.ts`
2. Add tests to `services/categoryHelpers.test.ts`
3. Run: `npm test features/categories/services`
4. Ensure 100% coverage

### Validation Flow
```typescript
// Before saving
if (!validateCategoryName(name)) {
  return "Name required";
}
if (isDuplicateCategory(name, type, categories, editingId)) {
  return "Category already exists";
}
```

## Documentation Maintenance
Update README.md and this CLAUDE.md when:
- Adding new helper functions
- Changing validation rules
- Updating test coverage
- Modifying business logic
