/**
 * Category helper utilities
 * Pure functions for category filtering and sorting
 */

import type { Category } from "@/src/lib/types";

/**
 * Filter categories by search query
 *
 * @param categories - All categories
 * @param query - Search query string
 * @returns Filtered categories matching the query
 */
export function filterCategoriesByQuery(
  categories: Category[],
  query: string
): Category[] {
  const lowerQuery = query.toLowerCase();
  return categories.filter((c) =>
    c.name.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Group categories by type and sort by order_index
 *
 * @param categories - All categories
 * @param query - Optional search query
 * @returns Object with income, expense, and saving arrays
 */
export function groupCategoriesByType(
  categories: Category[],
  query = ""
): {
  income: Category[];
  expense: Category[];
  saving: Category[];
} {
  const filtered = filterCategoriesByQuery(categories, query);

  return {
    income: filtered
      .filter((c) => c.type === "income")
      .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)),
    expense: filtered
      .filter((c) => c.type === "expense")
      .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)),
    saving: filtered
      .filter((c) => c.type === "saving")
      .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)),
  };
}

/**
 * Validate category name
 *
 * @param name - Category name to validate
 * @returns True if valid, false otherwise
 */
export function validateCategoryName(name: string): boolean {
  return name.trim().length > 0;
}

/**
 * Check if category name already exists for a given type
 *
 * @param name - Category name
 * @param type - Category type
 * @param categories - Existing categories
 * @param excludeId - Optional ID to exclude (for editing)
 * @returns True if duplicate exists, false otherwise
 */
export function isDuplicateCategory(
  name: string,
  type: "income" | "expense" | "saving",
  categories: Category[],
  excludeId?: string
): boolean {
  return categories.some(
    (c) =>
      c.name.toLowerCase() === name.toLowerCase() &&
      c.type === type &&
      c.id !== excludeId
  );
}

/**
 * Get next order index for new category
 *
 * @param categories - Existing categories
 * @returns Next available order index
 */
export function getNextOrderIndex(categories: Category[]): number {
  if (categories.length === 0) return 0;
  const maxIndex = Math.max(...categories.map((c) => c.order_index ?? 0));
  return maxIndex + 1;
}
