import { supabase } from "./supabase";
import type {
  AppSettings,
  Budget,
  Category,
  ExpectedIncome,
  ExpectedInvoice,
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

