/**
 * useFinancialData Hook
 *
 * Centralized hook for loading all financial data for a given month.
 * Combines loading of incomes, invoices, budgets, savings, transactions, and categories.
 *
 * @module features/shared/hooks/useFinancialData
 */

import { useState, useEffect, useCallback } from "react";
import {
  loadIncomes,
  loadInvoices,
  loadBudgets,
  loadSavings,
  loadTransactions,
  loadCategories,
} from "@/lib/database";
import type {
  Budget,
  Category,
  ExpectedIncome,
  ExpectedInvoice,
  ExpectedSavings,
  Transaction,
} from "@/lib/types";

/**
 * Financial data returned by the hook
 */
export interface FinancialData {
  incomes: ExpectedIncome[];
  invoices: ExpectedInvoice[];
  budgets: Budget[];
  savings: ExpectedSavings[];
  transactions: Transaction[];
  categories: Category[];
}

/**
 * Return type of useFinancialData hook
 */
export interface UseFinancialDataResult {
  data: FinancialData;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * Hook for loading all financial data for a given month
 *
 * Loads incomes, invoices, budgets, savings, transactions, and categories.
 * Automatically reloads when the month changes.
 *
 * @param monthKey - Month in yyyy-MM format (optional, loads all if not provided)
 * @returns Object with data, loading state, error, and refresh function
 *
 * @example
 * const { data, loading, error, refresh } = useFinancialData('2025-01');
 *
 * if (loading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage error={error} />;
 *
 * // Use data.incomes, data.budgets, etc.
 */
export function useFinancialData(
  monthKey?: string
): UseFinancialDataResult {
  const [data, setData] = useState<FinancialData>({
    incomes: [],
    invoices: [],
    budgets: [],
    savings: [],
    transactions: [],
    categories: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [incomes, invoices, budgets, savings, transactions, categories] =
        await Promise.all([
          loadIncomes(monthKey),
          loadInvoices(monthKey),
          loadBudgets(monthKey),
          loadSavings(monthKey),
          loadTransactions(),
          loadCategories(),
        ]);

      setData({
        incomes,
        invoices,
        budgets,
        savings,
        transactions,
        categories,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to load financial data")
      );
    } finally {
      setLoading(false);
    }
  }, [monthKey]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  return { data, loading, error, refresh };
}
