/**
 * Hook for loading reports data
 * Handles data loading, refresh, and state management for reports
 */

import logger from "@/app/utils/logger";
import {
  getActiveSavingsCategories,
  loadBudgets,
  loadCategories,
  loadSavings,
  loadTransactions,
} from "@/lib/storage";
import type {
  Budget,
  Category,
  ExpectedSavings,
  Transaction,
} from "@/lib/types";
import { useFocusEffect } from "expo-router";
import React from "react";

export interface ReportsData {
  transactions: Transaction[];
  budgets: Budget[];
  categories: Category[];
  savings: ExpectedSavings[];
  activeSavings: { category: string; balance: number; target?: number }[];
}

export interface UseReportsDataReturn {
  data: ReportsData;
  loading: boolean;
  refreshing: boolean;
  refresh: () => Promise<void>;
}

/**
 * Hook to load and manage reports data
 *
 * @param monthKey - Current month key (yyyy-MM)
 * @returns Reports data, loading states, and refresh function
 */
export function useReportsData(monthKey: string): UseReportsDataReturn {
  const [data, setData] = React.useState<ReportsData>({
    transactions: [],
    budgets: [],
    categories: [],
    savings: [],
    activeSavings: [],
  });
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const loadData = React.useCallback(async () => {
    try {
      const [txs, cats, bdgts, svgs] = await Promise.all([
        loadTransactions(),
        loadCategories(),
        loadBudgets(),
        loadSavings(),
      ]);

      const active = await getActiveSavingsCategories();

      setData({
        transactions: txs,
        budgets: bdgts,
        categories: cats,
        savings: svgs,
        activeSavings: active,
      });

      logger.dataAction("reports_data_loaded", {
        transactionsCount: txs.length,
        categoriesCount: cats.length,
        budgetsCount: bdgts.length,
        savingsCount: svgs.length,
      });
    } catch (error) {
      logger.error(error as Error, { operation: "load_reports_data" });
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on focus
  useFocusEffect(
    React.useCallback(() => {
      logger.navigationAction("ReportsScreen", { month: monthKey });
      loadData();
    }, [monthKey, loadData])
  );

  // Refresh handler
  const refresh = React.useCallback(async () => {
    setRefreshing(true);
    logger.breadcrumb("Pull-to-refresh triggered", "data_refresh");

    try {
      const [txs, cats, bdgts, svgs] = await Promise.all([
        loadTransactions(),
        loadCategories(),
        loadBudgets(),
        loadSavings(),
      ]);

      const active = await getActiveSavingsCategories();

      setData({
        transactions: txs,
        budgets: bdgts,
        categories: cats,
        savings: svgs,
        activeSavings: active,
      });

      logger.dataAction("pull_to_refresh", {
        transactionsCount: txs.length,
        categoriesCount: cats.length,
        budgetsCount: bdgts.length,
      });
    } catch (error) {
      logger.error(error as Error, { operation: "pull_to_refresh" });
    } finally {
      setRefreshing(false);
    }
  }, []);

  return { data, loading, refreshing, refresh };
}
