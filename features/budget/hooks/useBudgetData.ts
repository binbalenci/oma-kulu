/**
 * @jest-environment jsdom
 */
import {
  loadBudgets,
  loadCategories,
  loadIncomes,
  loadInvoices,
  loadSavings,
  loadTransactions,
  getSavingsBalance,
} from "@/lib/storage";
import type {
  Budget,
  Category,
  ExpectedIncome,
  ExpectedInvoice,
  ExpectedSavings,
  Transaction,
} from "@/lib/types";
import { useCallback, useEffect, useState } from "react";

export interface BudgetData {
  incomes: ExpectedIncome[];
  invoices: ExpectedInvoice[];
  budgets: Budget[];
  savings: ExpectedSavings[];
  transactions: Transaction[];
  categories: Category[];
  savingsBalances: Record<string, number>;
}

export interface UseBudgetDataReturn {
  data: BudgetData;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  onRefresh: () => Promise<void>;
}

/**
 * useBudgetData - Consolidated hook for loading all budget-related data
 *
 * Handles:
 * - Initial data loading
 * - Month change reloading
 * - Focus event reloading
 * - Pull-to-refresh
 * - Savings balance calculation
 * - Error handling and logging
 *
 * @returns {UseBudgetDataReturn} Data, loading state, and refresh functions
 *
 * @example
 * ```typescript
 * const { data, loading, refresh } = useBudgetData();
 *
 * // Access data
 * const { incomes, budgets, categories } = data;
 *
 * // Refresh manually
 * await refresh();
 * ```
 */
export function useBudgetData(): UseBudgetDataReturn {
  const [data, setData] = useState<BudgetData>({
    incomes: [],
    invoices: [],
    budgets: [],
    savings: [],
    transactions: [],
    categories: [],
    savingsBalances: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadAllData = useCallback(async () => {
    try {
      setError(null);

      const [incms, invcs, bdgts, svgs, txs, cats] = await Promise.all([
        loadIncomes(),
        loadInvoices(),
        loadBudgets(),
        loadSavings(),
        loadTransactions(),
        loadCategories(),
      ]);

      // Calculate savings balances for all savings categories
      const savingCategories = cats.filter((c) => c.type === "saving");
      const balances: Record<string, number> = {};
      for (const cat of savingCategories) {
        balances[cat.name] = await getSavingsBalance(cat.name);
      }

      setData({
        incomes: incms,
        invoices: invcs,
        budgets: bdgts,
        savings: svgs,
        transactions: txs,
        categories: cats,
        savingsBalances: balances,
      });
    } catch (err) {
      const loadError = err as Error;
      setError(loadError);
      throw loadError;
    }
  }, []);

  // Initial load
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await loadAllData();
      } finally {
        setLoading(false);
      }
    })();
  }, [loadAllData]);

  // Refresh function for manual refresh
  const refresh = useCallback(async () => {
    await loadAllData();
  }, [loadAllData]);

  // Refresh function for pull-to-refresh (with loading state)
  const onRefresh = useCallback(async () => {
    setLoading(true);
    try {
      await loadAllData();
    } finally {
      setLoading(false);
    }
  }, [loadAllData]);

  return {
    data,
    loading,
    error,
    refresh,
    onRefresh,
  };
}
