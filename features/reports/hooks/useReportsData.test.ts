/**
 * @jest-environment jsdom
 */

import { renderHook, waitFor } from "@testing-library/react";
import { useReportsData } from "./useReportsData";

// Mock dependencies
jest.mock("@/app/utils/logger", () => ({
  __esModule: true,
  default: {
    navigationAction: jest.fn(),
    dataAction: jest.fn(),
    error: jest.fn(),
    breadcrumb: jest.fn(),
  },
}));

jest.mock("expo-router", () => ({
  useFocusEffect: (callback: () => void) => {
    callback();
  },
}));

jest.mock("@/lib/storage", () => ({
  loadTransactions: jest.fn(),
  loadCategories: jest.fn(),
  loadBudgets: jest.fn(),
  loadSavings: jest.fn(),
  getActiveSavingsCategories: jest.fn(),
}));

import {
  getActiveSavingsCategories,
  loadBudgets,
  loadCategories,
  loadSavings,
  loadTransactions,
} from "@/lib/storage";

describe("useReportsData", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Set up default mock implementations
    (loadTransactions as jest.Mock).mockResolvedValue([
      { id: "1", amount: -100, category: "Groceries", date: "2025-01-15" },
    ]);
    (loadCategories as jest.Mock).mockResolvedValue([
      { id: "1", name: "Groceries", type: "expense" },
    ]);
    (loadBudgets as jest.Mock).mockResolvedValue([
      { id: "1", category: "Groceries", allocated_amount: 200, month: "2025-01" },
    ]);
    (loadSavings as jest.Mock).mockResolvedValue([
      { id: "1", category: "Emergency", amount: 500, month: "2025-01" },
    ]);
    (getActiveSavingsCategories as jest.Mock).mockResolvedValue([
      { category: "Emergency", balance: 1000 },
    ]);
  });

  it("should load all data successfully", async () => {
    const { result } = renderHook(() => useReportsData("2025-01"));

    // Initially loading should be true
    expect(result.current.loading).toBe(true);

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verify all data loaded
    expect(result.current.data.transactions).toHaveLength(1);
    expect(result.current.data.categories).toHaveLength(1);
    expect(result.current.data.budgets).toHaveLength(1);
    expect(result.current.data.savings).toHaveLength(1);
    expect(result.current.data.activeSavings).toHaveLength(1);
  });

  it("should call all load functions", async () => {
    const { result } = renderHook(() => useReportsData("2025-01"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(loadTransactions).toHaveBeenCalled();
    expect(loadCategories).toHaveBeenCalled();
    expect(loadBudgets).toHaveBeenCalled();
    expect(loadSavings).toHaveBeenCalled();
    expect(getActiveSavingsCategories).toHaveBeenCalled();
  });

  it("should handle errors gracefully", async () => {
    (loadTransactions as jest.Mock).mockRejectedValue(
      new Error("Load failed")
    );

    const { result } = renderHook(() => useReportsData("2025-01"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should not throw, data should be in initial state
    expect(result.current.data.transactions).toEqual([]);
  });

  it("should call refresh function successfully", async () => {
    const { result } = renderHook(() => useReportsData("2025-01"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Clear mock calls
    jest.clearAllMocks();

    // Call refresh
    await result.current.refresh();

    // Verify refresh called load functions
    expect(loadTransactions).toHaveBeenCalled();
    expect(loadCategories).toHaveBeenCalled();
    expect(loadBudgets).toHaveBeenCalled();
    expect(loadSavings).toHaveBeenCalled();
  });

  it("should handle empty data", async () => {
    (loadTransactions as jest.Mock).mockResolvedValue([]);
    (loadCategories as jest.Mock).mockResolvedValue([]);
    (loadBudgets as jest.Mock).mockResolvedValue([]);
    (loadSavings as jest.Mock).mockResolvedValue([]);
    (getActiveSavingsCategories as jest.Mock).mockResolvedValue([]);

    const { result } = renderHook(() => useReportsData("2025-01"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data.transactions).toEqual([]);
    expect(result.current.data.categories).toEqual([]);
    expect(result.current.data.budgets).toEqual([]);
    expect(result.current.data.savings).toEqual([]);
    expect(result.current.data.activeSavings).toEqual([]);
  });
});
