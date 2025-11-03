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

    return data || [];
  } catch (error) {
    console.error("Error loading incomes:", error);
    return [];
  }
}

export async function saveIncome(income: ExpectedIncome): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("expected_incomes")
      .upsert(income, { onConflict: "id" });

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

    return data || [];
  } catch (error) {
    console.error("Error loading invoices:", error);
    return [];
  }
}

export async function saveInvoice(invoice: ExpectedInvoice): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("expected_invoices")
      .upsert(invoice, { onConflict: "id" });

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

    return data || [];
  } catch (error) {
    console.error("Error loading budgets:", error);
    return [];
  }
}

export async function saveBudget(budget: Budget): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("budgets")
      .upsert(budget, { onConflict: "id" });

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
      .order("date", { ascending: false });

    if (error) {
      console.error("Error loading transactions:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error loading transactions:", error);
    return [];
  }
}

export async function saveTransaction(transaction: Transaction): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("transactions")
      .upsert(transaction, { onConflict: "id" });

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
    const { error } = await supabase
      .from("transactions")
      .upsert(transactions, { onConflict: "id" });

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
    const { error } = await supabase
      .from("categories")
      .upsert(category, { onConflict: "id" });

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

    return data || [];
  } catch (error) {
    console.error("Error loading savings:", error);
    return [];
  }
}

export async function saveSavings(savings: ExpectedSavings): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("expected_savings")
      .upsert(savings, { onConflict: "id" });

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
    // Load all transactions to calculate balance
    const { data: transactions, error } = await supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.error("Error loading transactions for savings balance:", error);
      return 0;
    }

    if (!transactions) {
      return 0;
    }

    // Calculate contributions: transactions where source_type = 'savings' and category matches
    const contributions = transactions
      .filter((t) => t.source_type === "savings" && t.category === category)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Calculate payments: transactions where uses_savings_category matches and savings_amount_used > 0
    const payments = transactions
      .filter((t) => t.uses_savings_category === category && (t.savings_amount_used || 0) > 0)
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
    // Load all savings categories
    const { data: categories, error: categoriesError } = await supabase
      .from("categories")
      .select("name")
      .eq("type", "saving");

    if (categoriesError || !categories) {
      console.error("Error loading savings categories:", categoriesError);
      return [];
    }

    // Load all transactions
    const { data: transactions, error: transactionsError } = await supabase
      .from("transactions")
      .select("*");

    if (transactionsError) {
      console.error("Error loading transactions for active savings:", transactionsError);
      return [];
    }

    // Load latest target for each category from expected_savings
    const { data: savingsItems, error: savingsError } = await supabase
      .from("expected_savings")
      .select("category, target")
      .not("target", "is", null)
      .order("created_at", { ascending: false });

    if (savingsError) {
      console.error("Error loading savings targets:", savingsError);
    }

    // Build a map of category -> latest target
    const targetMap = new Map<string, number>();
    if (savingsItems) {
      for (const item of savingsItems) {
        if (item.target && !targetMap.has(item.category)) {
          targetMap.set(item.category, item.target);
        }
      }
    }

    // Calculate balance for each category
    const result: Array<{ category: string; balance: number; target?: number }> = [];

    for (const cat of categories) {
      const contributions = (transactions || [])
        .filter((t) => t.source_type === "savings" && t.category === cat.name)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const payments = (transactions || [])
        .filter((t) => t.uses_savings_category === cat.name && (t.savings_amount_used || 0) > 0)
        .reduce((sum, t) => sum + (t.savings_amount_used || 0), 0);

      const balance = Math.max(0, contributions - payments);

      // Only include categories with balance > 0
      if (balance > 0) {
        result.push({
          category: cat.name,
          balance,
          target: targetMap.get(cat.name),
        });
      }
    }

    return result;
  } catch (error) {
    console.error("Error getting active savings categories:", error);
    return [];
  }
}

