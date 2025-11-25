/**
 * useCategoriesData Hook
 *
 * Manages category data loading and state:
 * - Initial load on mount
 * - Pull-to-refresh support
 * - Search filtering
 * - Type-based grouping and sorting
 */

import logger from "@/app/utils/logger";
import { loadCategories } from "@/lib/storage";
import type { Category } from "@/lib/types";
import { useCallback, useEffect, useState } from "react";

interface UseCategoriesDataReturn {
  items: Category[];
  setItems: React.Dispatch<React.SetStateAction<Category[]>>;
  query: string;
  setQuery: (query: string) => void;
  refreshing: boolean;
  onRefresh: () => Promise<void>;
  incomeCategories: Category[];
  expenseCategories: Category[];
  savingCategories: Category[];
}

export function useCategoriesData(): UseCategoriesDataReturn {
  const [items, setItems] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Initial load
  useEffect(() => {
    (async () => {
      const loadedCats = await loadCategories();
      setItems(loadedCats);
    })();
  }, []);

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    logger.breadcrumb("Pull-to-refresh triggered", "data_refresh");

    try {
      const loadedCats = await loadCategories();
      setItems(loadedCats);

      logger.dataAction("pull_to_refresh", {
        categoriesCount: loadedCats.length,
      });
    } catch (error) {
      logger.error(error as Error, { operation: "pull_to_refresh" });
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Filter and sort categories by type
  const incomeCategories = items
    .filter((c) => c.type === "income")
    .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

  const expenseCategories = items
    .filter((c) => c.type === "expense")
    .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

  const savingCategories = items
    .filter((c) => c.type === "saving")
    .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

  return {
    items,
    setItems,
    query,
    setQuery,
    refreshing,
    onRefresh,
    incomeCategories,
    expenseCategories,
    savingCategories,
  };
}
