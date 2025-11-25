import { supabase } from "./supabase";
import logger from "@/app/utils/logger";

// ============================================================================
// Helper: Convert unknown errors to Error
// ============================================================================

function toError(error: unknown): Error {
  if (error instanceof Error) return error;
  return new Error(String(error));
}

// ============================================================================
// Generic CRUD Operations
// ============================================================================

/**
 * Generic load function for database tables
 *
 * @param table - Table name to load from
 * @param monthKey - Optional month filter (yyyy-MM format)
 * @param orderBy - Column to order by (default: "created_at")
 * @param ascending - Sort direction (default: false)
 * @returns Array of records or empty array on error
 *
 * @category database
 */
export async function genericLoad<T>(
  table: string,
  monthKey?: string,
  orderBy: string = "created_at",
  ascending: boolean = false
): Promise<T[]> {
  try {
    let query = supabase.from(table).select("*");

    if (monthKey) {
      query = query.eq("month", monthKey);
    }

    query = query.order(orderBy, { ascending });

    const { data, error } = await query;

    if (error) {
      logger.databaseError(error, `load from ${table}`, { monthKey });
      return [];
    }

    return data || [];
  } catch (error) {
    logger.databaseError(toError(error), `load from ${table}`, { monthKey });
    return [];
  }
}

/**
 * Generic save function using upsert
 *
 * @param table - Table name to save to
 * @param record - Record to save (must have id for upsert)
 * @param context - Context for logging
 * @returns True if successful, false otherwise
 *
 * @category database
 */
export async function genericSave<T extends { id?: string }>(
  table: string,
  record: T,
  context?: string
): Promise<boolean> {
  try {
    const { error } = await supabase.from(table).upsert(record, { onConflict: "id" });

    if (error) {
      logger.databaseError(error, context || `save to ${table}`, { record });
      return false;
    }

    return true;
  } catch (error) {
    logger.databaseError(toError(error), context || `save to ${table}`, { record });
    return false;
  }
}

/**
 * Generic delete function
 *
 * @param table - Table name to delete from
 * @param id - Record ID to delete
 * @param context - Context for logging
 * @returns True if successful, false otherwise
 *
 * @category database
 */
export async function genericDelete(
  table: string,
  id: string,
  context?: string
): Promise<boolean> {
  try {
    const { error } = await supabase.from(table).delete().eq("id", id);

    if (error) {
      logger.databaseError(error, context || `delete from ${table}`, { id });
      return false;
    }

    return true;
  } catch (error) {
    logger.databaseError(toError(error), context || `delete from ${table}`, { id });
    return false;
  }
}

// ============================================================================
// Category Resolution Helpers
// ============================================================================

/**
 * Get category name from category_id
 *
 * @param categoryId - Category UUID
 * @returns Category name or null if not found
 *
 * @category database
 * @feature categories
 */
export async function getCategoryNameById(categoryId: string): Promise<string | null> {
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
 * Get category_id from category name and type
 *
 * @param name - Category name
 * @param type - Category type ('income' | 'expense' | 'saving')
 * @returns Category UUID or null if not found
 *
 * @category database
 * @feature categories
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
 * Create a map of category ID to category name
 *
 * @returns Map<categoryId, categoryName>
 *
 * @category database
 * @feature categories
 */
export async function createCategoryMap(): Promise<Map<string, string>> {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name")
      .eq("is_visible", true);

    if (error || !data) {
      logger.databaseError(error, "createCategoryMap", {});
      return new Map();
    }

    const categoryMap = new Map<string, string>();
    data.forEach((cat) => {
      categoryMap.set(cat.id, cat.name);
    });

    return categoryMap;
  } catch (error) {
    logger.databaseError(toError(error), "createCategoryMap", {});
    return new Map();
  }
}

/**
 * Resolve category_id from either category_id or category name
 *
 * @param categoryId - Optional category UUID
 * @param categoryName - Optional category name
 * @param type - Category type (required if using categoryName)
 * @returns Category UUID or null
 *
 * @category database
 * @feature categories
 */
export async function resolveCategoryId(
  categoryId: string | null | undefined,
  categoryName: string | null | undefined,
  type: "income" | "expense" | "saving"
): Promise<string | null> {
  // If category_id is already provided, return it
  if (categoryId) {
    return categoryId;
  }

  // If category name is provided, look up the ID
  if (categoryName) {
    return await getCategoryIdByName(categoryName, type);
  }

  return null;
}

/**
 * Enrich records with category names from category_id
 *
 * @param records - Array of records with category_id field
 * @param categoryMap - Optional pre-loaded category map for performance
 * @returns Array of records with category field populated
 *
 * @category database
 * @feature categories
 */
export async function enrichWithCategoryNames<
  T extends { category_id?: string; category?: string }
>(records: T[], categoryMap?: Map<string, string>): Promise<T[]> {
  // Load category map if not provided
  const map = categoryMap || (await createCategoryMap());

  return records.map((item) => ({
    ...item,
    category: item.category_id
      ? map.get(item.category_id) || item.category || ""
      : item.category || "",
  }));
}

/**
 * Enrich records with multiple category fields (category + uses_savings_category)
 *
 * Used for transactions that may reference both main category and savings category
 *
 * @param records - Array of records with category fields
 * @param categoryMap - Optional pre-loaded category map for performance
 * @returns Array of records with all category fields populated
 *
 * @category database
 * @feature categories
 */
export async function enrichWithMultipleCategoryNames<
  T extends {
    category_id?: string;
    category?: string;
    uses_savings_category_id?: string;
    uses_savings_category?: string;
  }
>(records: T[], categoryMap?: Map<string, string>): Promise<T[]> {
  // Load category map if not provided
  const map = categoryMap || (await createCategoryMap());

  return records.map((item) => ({
    ...item,
    category: item.category_id
      ? map.get(item.category_id) || item.category || ""
      : item.category || "",
    uses_savings_category: item.uses_savings_category_id
      ? map.get(item.uses_savings_category_id) || item.uses_savings_category || ""
      : item.uses_savings_category || "",
  }));
}

// ============================================================================
// Batch Operations
// ============================================================================

/**
 * Save multiple records in a single batch operation
 *
 * @param table - Table name to save to
 * @param records - Array of records to save
 * @param context - Context for logging
 * @returns True if successful, false otherwise
 *
 * @category database
 */
export async function batchSave<T extends { id?: string }>(
  table: string,
  records: T[],
  context?: string
): Promise<boolean> {
  try {
    const { error } = await supabase.from(table).upsert(records, { onConflict: "id" });

    if (error) {
      logger.databaseError(error, context || `batch save to ${table}`, {
        count: records.length,
      });
      return false;
    }

    return true;
  } catch (error) {
    logger.databaseError(toError(error), context || `batch save to ${table}`, {
      count: records.length,
    });
    return false;
  }
}
