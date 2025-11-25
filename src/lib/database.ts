import { supabase } from "./supabase";
import type {
  AppSettings,
  Budget,
  Category,
  ExpectedIncome,
  ExpectedInvoice,
  ExpectedSavings,
  Transaction,
} from "./types";
import {
  getCategoryIdByName,
  resolveCategoryId,
  createCategoryMap,
  enrichWithCategoryNames,
  enrichWithMultipleCategoryNames,
  genericDelete,
} from "./database-helpers";
import logger from "@/src/utils/logger";

// ============================================================================
// Helper: Convert unknown errors to Error
// ============================================================================

function toError(error: unknown): Error {
  if (error instanceof Error) return error;
  return new Error(String(error));
}

// ============================================================================
// Expected Incomes
// ============================================================================

export async function loadIncomes(month?: string): Promise<ExpectedIncome[]> {
  try {
    let query = supabase.from("expected_incomes").select("*").order("created_at", { ascending: false });

    if (month) {
      query = query.eq("month", month);
    }

    const { data, error } = await query;

    if (error) {
      logger.databaseError(toError(error), "loadIncomes", { month });
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Enrich with category names using helper
    const categoryMap = await createCategoryMap();
    return enrichWithCategoryNames(data, categoryMap);
  } catch (error) {
    logger.databaseError(toError(error), "loadIncomes", { month });
    return [];
  }
}

export async function saveIncome(income: ExpectedIncome): Promise<boolean> {
  try {
    // Resolve category_id using helper
    const categoryId = await resolveCategoryId(income.category_id, income.category, 'income');

    if (!categoryId) {
      logger.databaseError("category_id required", "saveIncome", { income });
      return false;
    }

    // Prepare data with category_id
    const dataToSave = {
      ...income,
      category_id: categoryId,
    };

    const { error } = await supabase
      .from("expected_incomes")
      .upsert(dataToSave, { onConflict: "id" });

    if (error) {
      logger.databaseError(toError(error), "saveIncome", { income });
      return false;
    }

    return true;
  } catch (error) {
    logger.databaseError(toError(error), "saveIncome", { income });
    return false;
  }
}

export async function deleteIncome(id: string): Promise<boolean> {
  return genericDelete("expected_incomes", id, "deleteIncome");
}

// ============================================================================
// Expected Invoices
// ============================================================================

export async function loadInvoices(month?: string): Promise<ExpectedInvoice[]> {
  try {
    let query = supabase.from("expected_invoices").select("*").order("created_at", { ascending: false });

    if (month) {
      query = query.eq("month", month);
    }

    const { data, error } = await query;

    if (error) {
      logger.databaseError(toError(error), "loadInvoices", { month });
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Enrich with category names using helper
    const categoryMap = await createCategoryMap();
    return enrichWithCategoryNames(data, categoryMap);
  } catch (error) {
    logger.databaseError(toError(error), "loadInvoices", { month });
    return [];
  }
}

export async function saveInvoice(invoice: ExpectedInvoice): Promise<boolean> {
  try {
    // Resolve category_id using helper
    const categoryId = await resolveCategoryId(invoice.category_id, invoice.category, 'expense');

    if (!categoryId) {
      logger.databaseError("category_id required", "saveInvoice", { invoice });
      return false;
    }

    // Prepare data with category_id
    const dataToSave = {
      ...invoice,
      category_id: categoryId,
    };

    const { error } = await supabase
      .from("expected_invoices")
      .upsert(dataToSave, { onConflict: "id" });

    if (error) {
      logger.databaseError(toError(error), "saveInvoice", { invoice });
      return false;
    }

    return true;
  } catch (error) {
    logger.databaseError(toError(error), "saveInvoice", { invoice });
    return false;
  }
}

export async function deleteInvoice(id: string): Promise<boolean> {
  return genericDelete("expected_invoices", id, "deleteInvoice");
}

// ============================================================================
// Budgets
// ============================================================================

export async function loadBudgets(month?: string): Promise<Budget[]> {
  try {
    let query = supabase.from("budgets").select("*").order("created_at", { ascending: false });

    if (month) {
      query = query.eq("month", month);
    }

    const { data, error } = await query;

    if (error) {
      logger.databaseError(toError(error), "loadBudgets", { month });
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Enrich with category names using helper
    const categoryMap = await createCategoryMap();
    return enrichWithCategoryNames(data, categoryMap);
  } catch (error) {
    logger.databaseError(toError(error), "loadBudgets", { month });
    return [];
  }
}

export async function saveBudget(budget: Budget): Promise<boolean> {
  try {
    // Resolve category_id using helper
    const categoryId = await resolveCategoryId(budget.category_id, budget.category, 'expense');

    if (!categoryId) {
      logger.databaseError("category_id required", "saveBudget", { budget });
      return false;
    }

    // Prepare data with category_id
    const dataToSave = {
      ...budget,
      category_id: categoryId,
    };

    const { error } = await supabase
      .from("budgets")
      .upsert(dataToSave, { onConflict: "id" });

    if (error) {
      logger.databaseError(toError(error), "saveBudget", { budget });
      return false;
    }

    return true;
  } catch (error) {
    logger.databaseError(toError(error), "saveBudget", { budget });
    return false;
  }
}

export async function deleteBudget(id: string): Promise<boolean> {
  return genericDelete("budgets", id, "deleteBudget");
}

// ============================================================================
// Transactions
// ============================================================================

export async function loadTransactions(): Promise<Transaction[]> {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: false })
      .order("order_index", { ascending: true, nullsFirst: false });

    if (error) {
      logger.databaseError(toError(error), "loadTransactions", {});
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Enrich with category names using helper (supports multiple category fields)
    const categoryMap = await createCategoryMap();
    return enrichWithMultipleCategoryNames(data, categoryMap);
  } catch (error) {
    logger.databaseError(toError(error), "loadTransactions", {});
    return [];
  }
}

export async function saveTransaction(transaction: Transaction): Promise<boolean> {
  try {
    // Determine type from amount: positive = income, negative = expense
    const type = transaction.amount > 0 ? 'income' : 'expense';

    // Resolve category_id using helper
    const categoryId = await resolveCategoryId(transaction.category_id, transaction.category, type);

    if (!categoryId) {
      logger.databaseError("category_id required", "saveTransaction", { transaction });
      return false;
    }

    // Resolve uses_savings_category_id if provided
    const usesSavingsCategoryId = await resolveCategoryId(
      transaction.uses_savings_category_id,
      transaction.uses_savings_category,
      'saving'
    );

    // Prepare data with category_id
    const dataToSave = {
      ...transaction,
      category_id: categoryId,
      uses_savings_category_id: usesSavingsCategoryId || null,
    };

    const { error } = await supabase
      .from("transactions")
      .upsert(dataToSave, { onConflict: "id" });

    if (error) {
      logger.databaseError(toError(error), "saveTransaction", { transaction });
      return false;
    }

    return true;
  } catch (error) {
    logger.databaseError(toError(error), "saveTransaction", { transaction });
    return false;
  }
}

export async function deleteTransaction(id: string): Promise<boolean> {
  return genericDelete("transactions", id, "deleteTransaction");
}

export async function saveTransactions(transactions: Transaction[]): Promise<boolean> {
  try {
    // Process each transaction to ensure category_id is set
    const processedTransactions = await Promise.all(
      transactions.map(async (transaction) => {
        const type = transaction.amount > 0 ? 'income' : 'expense';

        // Resolve category_id using helper
        const categoryId = await resolveCategoryId(transaction.category_id, transaction.category, type);

        // Resolve uses_savings_category_id if provided
        const usesSavingsCategoryId = await resolveCategoryId(
          transaction.uses_savings_category_id,
          transaction.uses_savings_category,
          'saving'
        );

        return {
          ...transaction,
          category_id: categoryId || undefined,
          uses_savings_category_id: usesSavingsCategoryId || null,
        };
      })
    );

    const { error } = await supabase
      .from("transactions")
      .upsert(processedTransactions, { onConflict: "id" });

    if (error) {
      logger.databaseError(toError(error), "saveTransactions", { count: transactions.length });
      return false;
    }

    return true;
  } catch (error) {
    logger.databaseError(toError(error), "saveTransactions", { count: transactions.length });
    return false;
  }
}

// ============================================================================
// Categories
// ============================================================================

export async function loadCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_visible", true)
      .order("order_index", { ascending: true });

    if (error) {
      logger.databaseError(toError(error), "loadCategories", {});
      return [];
    }

    return data || [];
  } catch (error) {
    logger.databaseError(toError(error), "loadCategories", {});
    return [];
  }
}

export async function saveCategory(category: Category): Promise<boolean> {
  try {
    // First, check if the category.id exists in the database (to determine if this is an edit)
    let isEditing = false;
    if (category.id) {
      const { data: existingById, error: idCheckError } = await supabase
        .from("categories")
        .select("id")
        .eq("id", category.id)
        .maybeSingle();

      if (idCheckError) {
        logger.databaseError(idCheckError, "saveCategory", { step: "check ID", category });
        return false;
      }

      isEditing = !!existingById;
    }

    // Check if a category with the same (name, type) already exists
    const { data: existingByNameType, error: checkError } = await supabase
      .from("categories")
      .select("id")
      .eq("name", category.name)
      .eq("type", category.type)
      .maybeSingle();

    if (checkError) {
      logger.databaseError(checkError, "saveCategory", { step: "check duplicate", category });
      return false;
    }

    // If editing: update the existing category
    if (isEditing) {
      // Keep the existing ID to maintain foreign key relationships
      const { id, ...categoryWithoutId } = category;
      const { error } = await supabase
        .from("categories")
        .update(categoryWithoutId)
        .eq("id", category.id);

      if (error) {
        logger.databaseError(toError(error), "saveCategory", { step: "update", category });
        return false;
      }
      return true;
    }

    // If creating: check for duplicate (name, type) - this should fail
    if (existingByNameType) {
      logger.databaseError("duplicate category", "saveCategory", {
        name: category.name,
        type: category.type,
        existingId: existingByNameType.id,
      });
      return false;
    }

    // Otherwise, insert new category
    const { error } = await supabase
      .from("categories")
      .insert(category);

    if (error) {
      logger.databaseError(toError(error), "saveCategory", { step: "insert", category });
      return false;
    }

    return true;
  } catch (error) {
    logger.databaseError(toError(error), "saveCategory", { category });
    return false;
  }
}

export async function saveCategories(categories: Category[]): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("categories")
      .upsert(categories, { onConflict: "id" });

    if (error) {
      logger.databaseError(toError(error), "saveCategories", { count: categories.length });
      return false;
    }

    return true;
  } catch (error) {
    logger.databaseError(toError(error), "saveCategories", { count: categories.length });
    return false;
  }
}

export async function deleteCategory(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) {
      // Check if it's a foreign key constraint violation
      if (error.code === "23503") {
        logger.databaseError(toError(error), "deleteCategory", {
          id,
          error: "foreign key constraint: category still referenced",
        });
      } else {
        logger.databaseError(toError(error), "deleteCategory", { id });
      }
      return false;
    }

    return true;
  } catch (error) {
    logger.databaseError(toError(error), "deleteCategory", { id });
    return false;
  }
}

// ============================================================================
// App Settings
// ============================================================================

export async function loadSettings(): Promise<AppSettings> {
  try {
    const { data, error } = await supabase
      .from("app_settings")
      .select("*")
      .limit(1)
      .single();

    if (error) {
      // If no settings exist, return default
      if (error.code === "PGRST116") {
        return { starting_balance: 0 };
      }
      logger.databaseError(toError(error), "loadSettings", {});
      return { starting_balance: 0 };
    }

    return data || { starting_balance: 0 };
  } catch (error) {
    logger.databaseError(toError(error), "loadSettings", {});
    return { starting_balance: 0 };
  }
}

export async function saveSettings(settings: AppSettings): Promise<boolean> {
  try {
    // First try to get existing settings
    const { data: existing } = await supabase
      .from("app_settings")
      .select("id")
      .limit(1)
      .single();

    if (existing?.id) {
      // Update existing
      const { error } = await supabase
        .from("app_settings")
        .update(settings)
        .eq("id", existing.id);

      if (error) {
        logger.databaseError(toError(error), "saveSettings", { step: "update", settings });
        return false;
      }
    } else {
      // Insert new
      const { error } = await supabase
        .from("app_settings")
        .insert([{ ...settings, id: 1 }]);

      if (error) {
        logger.databaseError(toError(error), "saveSettings", { step: "insert", settings });
        return false;
      }
    }

    return true;
  } catch (error) {
    logger.databaseError(toError(error), "saveSettings", { settings });
    return false;
  }
}

// ============================================================================
// Expected Savings
// ============================================================================

export async function loadSavings(month?: string): Promise<ExpectedSavings[]> {
  try {
    let query = supabase.from("expected_savings").select("*").order("created_at", { ascending: false });

    if (month) {
      query = query.eq("month", month);
    }

    const { data, error } = await query;

    if (error) {
      logger.databaseError(toError(error), "loadSavings", { month });
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Enrich with category names using helper
    const categoryMap = await createCategoryMap();
    return enrichWithCategoryNames(data, categoryMap);
  } catch (error) {
    logger.databaseError(toError(error), "loadSavings", { month });
    return [];
  }
}

export async function saveSavings(savings: ExpectedSavings): Promise<boolean> {
  try {
    // Resolve category_id using helper
    const categoryId = await resolveCategoryId(savings.category_id, savings.category, 'saving');

    if (!categoryId) {
      logger.databaseError("category_id required", "saveSavings", { savings });
      return false;
    }

    // Prepare data with category_id
    const dataToSave = {
      ...savings,
      category_id: categoryId,
    };

    const { error } = await supabase
      .from("expected_savings")
      .upsert(dataToSave, { onConflict: "id" });

    if (error) {
      logger.databaseError(toError(error), "saveSavings", { savings });
      return false;
    }

    return true;
  } catch (error) {
    logger.databaseError(toError(error), "saveSavings", { savings });
    return false;
  }
}

export async function deleteSavings(id: string): Promise<boolean> {
  return genericDelete("expected_savings", id, "deleteSavings");
}

export async function getSavingsBalance(category: string): Promise<number> {
  try {
    // Find the category_id from the category name using helper
    const categoryId = await getCategoryIdByName(category, 'saving');

    if (!categoryId) {
      logger.databaseError("category not found", "getSavingsBalance", { category });
      return 0;
    }

    // Load transactions filtered by category_id for better performance
    // We need transactions where either category_id or uses_savings_category_id matches
    const { data: transactions, error } = await supabase
      .from("transactions")
      .select("*")
      .or(`category_id.eq.${categoryId},uses_savings_category_id.eq.${categoryId}`)
      .order("date", { ascending: false });

    if (error) {
      logger.databaseError(toError(error), "getSavingsBalance", { category, categoryId });
      return 0;
    }

    if (!transactions || transactions.length === 0) {
      return 0;
    }

    // Calculate contributions: transactions where source_type = 'savings' and category_id matches
    const contributions = transactions
      .filter((t) => t.source_type === "savings" && t.category_id === categoryId)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Calculate payments: transactions where uses_savings_category_id matches and savings_amount_used > 0
    const payments = transactions
      .filter((t) => t.uses_savings_category_id === categoryId && (t.savings_amount_used || 0) > 0)
      .reduce((sum, t) => sum + (t.savings_amount_used || 0), 0);

    // Balance = contributions - payments, capped at 0
    const balance = Math.max(0, contributions - payments);
    return balance;
  } catch (error) {
    logger.databaseError(toError(error), "getSavingsBalance", { category });
    return 0;
  }
}

export async function getActiveSavingsCategories(): Promise<
  { category: string; balance: number; target?: number }[]
> {
  try {
    // Load all savings categories with IDs
    const { data: categories, error: categoriesError } = await supabase
      .from("categories")
      .select("id, name")
      .eq("type", "saving");

    if (categoriesError || !categories) {
      logger.databaseError(categoriesError, "getActiveSavingsCategories", { step: "load categories" });
      return [];
    }

    // Load all transactions (for calculating balances)
    const { data: transactions, error: transactionsError } = await supabase
      .from("transactions")
      .select("*");

    if (transactionsError) {
      logger.databaseError(transactionsError, "getActiveSavingsCategories", { step: "load transactions" });
      return [];
    }

    // Load latest target for each category from expected_savings
    // Use category_id to match, but return category name for display
    const { data: savingsItems, error: savingsError } = await supabase
      .from("expected_savings")
      .select("category_id, target")
      .not("target", "is", null)
      .order("created_at", { ascending: false });

    if (savingsError) {
      logger.databaseError(savingsError, "getActiveSavingsCategories", { step: "load targets" });
    }

    // Build a map of category_id -> latest target
    const targetMap = new Map<string, number>();
    if (savingsItems) {
      for (const item of savingsItems) {
        if (item.target && item.category_id && !targetMap.has(item.category_id)) {
          targetMap.set(item.category_id, item.target);
        }
      }
    }

    // Calculate balance for each category using category_id
    const result: { category: string; balance: number; target?: number }[] = [];

    for (const cat of categories) {
      const contributions = (transactions || [])
        .filter((t) => t.source_type === "savings" && t.category_id === cat.id)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const payments = (transactions || [])
        .filter((t) => t.uses_savings_category_id === cat.id && (t.savings_amount_used || 0) > 0)
        .reduce((sum, t) => sum + (t.savings_amount_used || 0), 0);

      const balance = Math.max(0, contributions - payments);

      // Only include categories with balance > 0
      if (balance > 0) {
        result.push({
          category: cat.name,
          balance,
          target: targetMap.get(cat.id),
        });
      }
    }

    return result;
  } catch (error) {
    logger.databaseError(toError(error), "getActiveSavingsCategories", {});
    return [];
  }
}

