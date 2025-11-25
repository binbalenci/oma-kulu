/**
 * Database Helper Utilities
 *
 * Shared utilities for database operations, including category resolution
 * and common query patterns.
 *
 * @module features/shared/services/database-helpers
 */

import { supabase } from "@/src/lib/supabase";
import type { Category } from "@/src/lib/types";

/**
 * Get category name from category UUID
 *
 * @param categoryId - The category UUID
 * @returns The category name, or null if not found
 *
 * @example
 * const name = await getCategoryNameById('uuid-123');
 * // Returns: 'Groceries' or null
 */
export async function getCategoryNameById(
  categoryId: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("name")
      .eq("id", categoryId)
      .single();

    if (error || !data) {
      return null;
    }

    return data.name;
  } catch {
    return null;
  }
}

/**
 * Get category UUID from category name and type
 *
 * @param name - The category name
 * @param type - The category type (income, expense, or saving)
 * @returns The category UUID, or null if not found
 *
 * @example
 * const id = await getCategoryIdByName('Groceries', 'expense');
 * // Returns: 'uuid-123' or null
 */
export async function getCategoryIdByName(
  name: string,
  type: "income" | "expense" | "saving"
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("id")
      .eq("name", name)
      .eq("type", type)
      .single();

    if (error || !data) {
      return null;
    }

    return data.id;
  } catch {
    return null;
  }
}

/**
 * Create a map of category IDs to category names
 *
 * Useful for batch processing when you need to resolve multiple category IDs.
 *
 * @returns Map of category UUID -> category name
 *
 * @example
 * const categoryMap = await createCategoryIdToNameMap();
 * const name = categoryMap.get('uuid-123'); // 'Groceries'
 */
export async function createCategoryIdToNameMap(): Promise<
  Map<string, string>
> {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name")
      .eq("is_visible", true);

    if (error || !data) {
      return new Map();
    }

    const map = new Map<string, string>();
    data.forEach((cat) => {
      map.set(cat.id, cat.name);
    });

    return map;
  } catch {
    return new Map();
  }
}

/**
 * Create a map of category names to category objects
 *
 * Useful for quick lookups by category name.
 *
 * @returns Map of category name -> Category object
 *
 * @example
 * const categoryMap = await createCategoryNameToObjectMap();
 * const category = categoryMap.get('Groceries');
 */
export async function createCategoryNameToObjectMap(): Promise<
  Map<string, Category>
> {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_visible", true);

    if (error || !data) {
      return new Map();
    }

    const map = new Map<string, Category>();
    data.forEach((cat: Category) => {
      map.set(cat.name, cat);
    });

    return map;
  } catch {
    return new Map();
  }
}

/**
 * Resolve category name from category_id in a data object
 *
 * Handles the backward compatibility pattern where objects have both
 * `category` (name) and `category_id` (UUID) fields.
 *
 * @param item - Object with category_id and optional category fields
 * @param categoryMap - Pre-loaded map of category IDs to names
 * @returns The resolved category name
 *
 * @example
 * const categoryMap = await createCategoryIdToNameMap();
 * const item = { category_id: 'uuid-123', category: 'Old Name' };
 * const name = resolveCategoryName(item, categoryMap);
 * // Returns: 'Groceries' (from categoryMap) or 'Old Name' (fallback) or ''
 */
export function resolveCategoryName(
  item: { category_id?: string | null; category?: string },
  categoryMap: Map<string, string>
): string {
  if (item.category_id) {
    return categoryMap.get(item.category_id) || item.category || "";
  }
  return item.category || "";
}

/**
 * Resolve category ID from category name, with validation
 *
 * This is the "save" direction - converting category name to category_id
 * before persisting to database.
 *
 * @param categoryName - The category name
 * @param categoryType - The expected category type
 * @returns Object with success status and optional category_id/error
 *
 * @example
 * const result = await resolveCategoryId('Groceries', 'expense');
 * if (result.success && result.categoryId) {
 *   // Use result.categoryId
 * } else {
 *   // Handle result.error
 * }
 */
export async function resolveCategoryId(
  categoryName: string | undefined,
  categoryType: "income" | "expense" | "saving"
): Promise<
  | { success: true; categoryId: string }
  | { success: false; error: string }
> {
  if (!categoryName) {
    return { success: false, error: "Category name is required" };
  }

  const categoryId = await getCategoryIdByName(categoryName, categoryType);

  if (!categoryId) {
    return {
      success: false,
      error: `Category '${categoryName}' of type '${categoryType}' not found`,
    };
  }

  return { success: true, categoryId };
}

/**
 * Check if a category exists by name and type
 *
 * @param name - The category name
 * @param type - The category type
 * @returns True if the category exists, false otherwise
 *
 * @example
 * const exists = await categoryExists('Groceries', 'expense');
 * if (exists) {
 *   // Category exists
 * }
 */
export async function categoryExists(
  name: string,
  type: "income" | "expense" | "saving"
): Promise<boolean> {
  const categoryId = await getCategoryIdByName(name, type);
  return categoryId !== null;
}

/**
 * Batch resolve category IDs from names
 *
 * More efficient than calling getCategoryIdByName multiple times.
 * Returns a map of category names to UUIDs.
 *
 * @param names - Array of category names to resolve
 * @param type - The category type for all names
 * @returns Map of category name -> UUID (only includes found categories)
 *
 * @example
 * const nameToIdMap = await batchResolveCategoryIds(['Groceries', 'Rent'], 'expense');
 * const groceriesId = nameToIdMap.get('Groceries');
 */
export async function batchResolveCategoryIds(
  names: string[],
  type: "income" | "expense" | "saving"
): Promise<Map<string, string>> {
  try {
    if (names.length === 0) {
      return new Map();
    }

    const { data, error } = await supabase
      .from("categories")
      .select("id, name")
      .eq("type", type)
      .in("name", names);

    if (error || !data) {
      return new Map();
    }

    const map = new Map<string, string>();
    data.forEach((cat) => {
      map.set(cat.name, cat.id);
    });

    return map;
  } catch {
    return new Map();
  }
}
