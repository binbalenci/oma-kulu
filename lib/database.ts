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

// ============================================================================
// Helper: Get category name from category_id
// ============================================================================

async function getCategoryNameById(categoryId: string): Promise<string | null> {
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
  } catch (error) {
    return null;
  }
}

// ============================================================================
// Helper: Get category_id from category name and type
// ============================================================================

async function getCategoryIdByName(name: string, type: 'income' | 'expense' | 'saving'): Promise<string | null> {
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
  } catch (error) {
    return null;
  }
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
      console.error("Error loading incomes:", error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Load all categories and create a map
    const categories = await loadCategories();
    const categoryMap = new Map<string, string>();
    categories.forEach(cat => {
      categoryMap.set(cat.id, cat.name);
    });

    // Map results to include category name from category_id
    return data.map((item: any) => ({
      ...item,
      category: item.category_id ? (categoryMap.get(item.category_id) || item.category || '') : (item.category || ''),
    }));
  } catch (error) {
    console.error("Error loading incomes:", error);
    return [];
  }
}

export async function saveIncome(income: ExpectedIncome): Promise<boolean> {
  try {
    // If category_id not provided, look it up from category name
    let categoryId: string | null | undefined = income.category_id;
    if (!categoryId && income.category) {
      categoryId = await getCategoryIdByName(income.category, 'income');
      if (!categoryId) {
        console.error("Error saving income: category not found", income.category);
        return false;
      }
    }

    if (!categoryId) {
      console.error("Error saving income: category_id is required");
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
      console.error("Error saving income:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error saving income:", error);
    return false;
  }
}

export async function deleteIncome(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("expected_incomes").delete().eq("id", id);

    if (error) {
      console.error("Error deleting income:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting income:", error);
    return false;
  }
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
      console.error("Error loading invoices:", error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Load all categories and create a map
    const categories = await loadCategories();
    const categoryMap = new Map<string, string>();
    categories.forEach(cat => {
      categoryMap.set(cat.id, cat.name);
    });

    // Map results to include category name from category_id
    return data.map((item: any) => ({
      ...item,
      category: item.category_id ? (categoryMap.get(item.category_id) || item.category || '') : (item.category || ''),
    }));
  } catch (error) {
    console.error("Error loading invoices:", error);
    return [];
  }
}

export async function saveInvoice(invoice: ExpectedInvoice): Promise<boolean> {
  try {
    // If category_id not provided, look it up from category name
    let categoryId: string | null | undefined = invoice.category_id;
    if (!categoryId && invoice.category) {
      categoryId = await getCategoryIdByName(invoice.category, 'expense');
      if (!categoryId) {
        console.error("Error saving invoice: category not found", invoice.category);
        return false;
      }
    }

    if (!categoryId) {
      console.error("Error saving invoice: category_id is required");
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
      console.error("Error saving invoice:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error saving invoice:", error);
    return false;
  }
}

export async function deleteInvoice(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("expected_invoices").delete().eq("id", id);

    if (error) {
      console.error("Error deleting invoice:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return false;
  }
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
      console.error("Error loading budgets:", error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Load all categories and create a map
    const categories = await loadCategories();
    const categoryMap = new Map<string, string>();
    categories.forEach(cat => {
      categoryMap.set(cat.id, cat.name);
    });

    // Map results to include category name from category_id
    return data.map((item: any) => ({
      ...item,
      category: item.category_id ? (categoryMap.get(item.category_id) || item.category || '') : (item.category || ''),
    }));
  } catch (error) {
    console.error("Error loading budgets:", error);
    return [];
  }
}

export async function saveBudget(budget: Budget): Promise<boolean> {
  try {
    // If category_id not provided, look it up from category name
    let categoryId: string | null | undefined = budget.category_id;
    if (!categoryId && budget.category) {
      categoryId = await getCategoryIdByName(budget.category, 'expense');
      if (!categoryId) {
        console.error("Error saving budget: category not found", budget.category);
        return false;
      }
    }

    if (!categoryId) {
      console.error("Error saving budget: category_id is required");
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
      console.error("Error saving budget:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error saving budget:", error);
    return false;
  }
}

export async function deleteBudget(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("budgets").delete().eq("id", id);

    if (error) {
      console.error("Error deleting budget:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting budget:", error);
    return false;
  }
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
      console.error("Error loading transactions:", error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Load all categories and create a map
    const categories = await loadCategories();
    const categoryMap = new Map<string, string>();
    categories.forEach(cat => {
      categoryMap.set(cat.id, cat.name);
    });

    // Map results to include category names from category_id
    return data.map((item: any) => ({
      ...item,
      category: item.category_id ? (categoryMap.get(item.category_id) || item.category || '') : (item.category || ''),
      uses_savings_category: item.uses_savings_category_id ? (categoryMap.get(item.uses_savings_category_id) || item.uses_savings_category || '') : (item.uses_savings_category || ''),
    }));
  } catch (error) {
    console.error("Error loading transactions:", error);
    return [];
  }
}

export async function saveTransaction(transaction: Transaction): Promise<boolean> {
  try {
    // If category_id not provided, look it up from category name
    let categoryId: string | null | undefined = transaction.category_id;
    if (!categoryId && transaction.category) {
      // Determine type from amount: positive = income, negative = expense
      const type = transaction.amount > 0 ? 'income' : 'expense';
      categoryId = await getCategoryIdByName(transaction.category, type);
      if (!categoryId) {
        console.error("Error saving transaction: category not found", transaction.category);
        return false;
      }
    }

    if (!categoryId) {
      console.error("Error saving transaction: category_id is required");
      return false;
    }

    // If uses_savings_category_id not provided, look it up from uses_savings_category name
    let usesSavingsCategoryId: string | null | undefined = transaction.uses_savings_category_id;
    if (!usesSavingsCategoryId && transaction.uses_savings_category) {
      usesSavingsCategoryId = await getCategoryIdByName(transaction.uses_savings_category, 'saving');
    }

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
      console.error("Error saving transaction:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error saving transaction:", error);
    return false;
  }
}

export async function deleteTransaction(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("transactions").delete().eq("id", id);

    if (error) {
      console.error("Error deleting transaction:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return false;
  }
}

export async function saveTransactions(transactions: Transaction[]): Promise<boolean> {
  try {
    // Process each transaction to ensure category_id is set
    const processedTransactions = await Promise.all(
      transactions.map(async (transaction) => {
        // If category_id not provided, look it up from category name
        let categoryId: string | null | undefined = transaction.category_id;
        if (!categoryId && transaction.category) {
          const type = transaction.amount > 0 ? 'income' : 'expense';
          categoryId = await getCategoryIdByName(transaction.category, type);
        }

        // If uses_savings_category_id not provided, look it up
        let usesSavingsCategoryId: string | null | undefined = transaction.uses_savings_category_id;
        if (!usesSavingsCategoryId && transaction.uses_savings_category) {
          usesSavingsCategoryId = await getCategoryIdByName(transaction.uses_savings_category, 'saving');
        }

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
      console.error("Error saving transactions:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error saving transactions:", error);
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
      console.error("Error loading categories:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error loading categories:", error);
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
        console.error("Error checking category by ID:", idCheckError);
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
      console.error("Error checking existing category:", checkError);
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
        console.error("Error updating category:", error);
        return false;
      }
      return true;
    }

    // If creating: check for duplicate (name, type) - this should fail
    if (existingByNameType) {
      console.error("Error: Category with name and type already exists", {
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
      console.error("Error saving category:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error saving category:", error);
    return false;
  }
}

export async function saveCategories(categories: Category[]): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("categories")
      .upsert(categories, { onConflict: "id" });

    if (error) {
      console.error("Error saving categories:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error saving categories:", error);
    return false;
  }
}

export async function deleteCategory(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) {
      console.error("Error deleting category:", error);
      // Check if it's a foreign key constraint violation
      if (error.code === "23503") {
        console.error("Cannot delete category: it is still referenced by transactions, budgets, incomes, invoices, or savings");
      }
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting category:", error);
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
      console.error("Error loading settings:", error);
      return { starting_balance: 0 };
    }

    return data || { starting_balance: 0 };
  } catch (error) {
    console.error("Error loading settings:", error);
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
        console.error("Error updating settings:", error);
        return false;
      }
    } else {
      // Insert new
      const { error } = await supabase
        .from("app_settings")
        .insert([{ ...settings, id: 1 }]);

      if (error) {
        console.error("Error inserting settings:", error);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("Error saving settings:", error);
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
      console.error("Error loading savings:", error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Load all categories and create a map
    const categories = await loadCategories();
    const categoryMap = new Map<string, string>();
    categories.forEach(cat => {
      categoryMap.set(cat.id, cat.name);
    });

    // Map results to include category name from category_id
    return data.map((item: any) => ({
      ...item,
      category: item.category_id ? (categoryMap.get(item.category_id) || item.category || '') : (item.category || ''),
    }));
  } catch (error) {
    console.error("Error loading savings:", error);
    return [];
  }
}

export async function saveSavings(savings: ExpectedSavings): Promise<boolean> {
  try {
    // If category_id not provided, look it up from category name
    let categoryId: string | null | undefined = savings.category_id;
    if (!categoryId && savings.category) {
      categoryId = await getCategoryIdByName(savings.category, 'saving');
      if (!categoryId) {
        console.error("Error saving savings: category not found", savings.category);
        return false;
      }
    }

    if (!categoryId) {
      console.error("Error saving savings: category_id is required");
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
      console.error("Error saving savings:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error saving savings:", error);
    return false;
  }
}

export async function deleteSavings(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("expected_savings").delete().eq("id", id);

    if (error) {
      console.error("Error deleting savings:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting savings:", error);
    return false;
  }
}

export async function getSavingsBalance(category: string): Promise<number> {
  try {
    // First, find the category_id from the category name
    const { data: categoryData, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("name", category)
      .eq("type", "saving")
      .single();

    if (categoryError || !categoryData) {
      console.error("Error finding savings category:", categoryError);
      return 0;
    }

    const categoryId = categoryData.id;

    // Load transactions filtered by category_id for better performance
    // We need transactions where either category_id or uses_savings_category_id matches
    const { data: transactions, error } = await supabase
      .from("transactions")
      .select("*")
      .or(`category_id.eq.${categoryId},uses_savings_category_id.eq.${categoryId}`)
      .order("date", { ascending: false });

    if (error) {
      console.error("Error loading transactions for savings balance:", error);
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
    console.error("Error calculating savings balance:", error);
    return 0;
  }
}

export async function getActiveSavingsCategories(): Promise<
  Array<{ category: string; balance: number; target?: number }>
> {
  try {
    // Load all savings categories with IDs
    const { data: categories, error: categoriesError } = await supabase
      .from("categories")
      .select("id, name")
      .eq("type", "saving");

    if (categoriesError || !categories) {
      console.error("Error loading savings categories:", categoriesError);
      return [];
    }

    // Load all transactions (for calculating balances)
    const { data: transactions, error: transactionsError } = await supabase
      .from("transactions")
      .select("*");

    if (transactionsError) {
      console.error("Error loading transactions for active savings:", transactionsError);
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
      console.error("Error loading savings targets:", savingsError);
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
    const result: Array<{ category: string; balance: number; target?: number }> = [];

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
    console.error("Error getting active savings categories:", error);
    return [];
  }
}

