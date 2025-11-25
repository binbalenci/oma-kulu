import logger from "@/src/utils/logger";
import {
  getSavingsBalance,
  loadCategories,
  loadIncomes,
  loadInvoices,
  loadSavings,
  loadTransactions,
} from "@/src/lib/storage";
import type { Category, ExpectedIncome, ExpectedInvoice, ExpectedSavings, Transaction } from "@/src/lib/types";
import { useCallback, useEffect, useState } from "react";

export interface TransactionsData {
  transactions: Transaction[];
  incomes: ExpectedIncome[];
  invoices: ExpectedInvoice[];
  savings: ExpectedSavings[];
  categories: Category[];
  savingsBalances: Record<string, number>;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

/**
 * Hook to load and manage transactions data
 * @returns TransactionsData object with all data and loading state
 */
export function useTransactionsData(): TransactionsData {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [incomes, setIncomes] = useState<ExpectedIncome[]>([]);
  const [invoices, setInvoices] = useState<ExpectedInvoice[]>([]);
  const [savings, setSavings] = useState<ExpectedSavings[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [savingsBalances, setSavingsBalances] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [txs, incms, invcs, svgs, cats] = await Promise.all([
        loadTransactions(),
        loadIncomes(),
        loadInvoices(),
        loadSavings(),
        loadCategories(),
      ]);

      setTransactions(txs);
      setIncomes(incms);
      setInvoices(invcs);
      setSavings(svgs);
      setCategories(cats);

      // Calculate savings balances
      const savingCategories = cats.filter((c) => c.type === "saving");
      const balances: Record<string, number> = {};
      for (const cat of savingCategories) {
        balances[cat.name] = await getSavingsBalance(cat.name);
      }
      setSavingsBalances(balances);

      logger.dataAction("transactions_data_loaded", {
        transactionsCount: txs.length,
        incomesCount: incms.length,
        invoicesCount: invcs.length,
        savingsCount: svgs.length,
        categoriesCount: cats.length,
      });
    } catch (error) {
      logger.error(error as Error, { operation: "load_transactions_data" });
    }
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await loadData();
    setIsLoading(false);
  }, [loadData]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    transactions,
    incomes,
    invoices,
    savings,
    categories,
    savingsBalances,
    isLoading,
    refresh,
  };
}
