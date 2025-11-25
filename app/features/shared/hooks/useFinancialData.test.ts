/**
 * useFinancialData Hook Tests
 *
 * Comprehensive test suite for the useFinancialData hook.
 * Tests data loading, error handling, and refresh functionality.
 *
 * @jest-environment jsdom
 */

import { renderHook, waitFor } from "@testing-library/react";
import { useFinancialData } from "./useFinancialData";
import {
  loadIncomes,
  loadInvoices,
  loadBudgets,
  loadSavings,
  loadTransactions,
  loadCategories,
} from "@/app/lib/database";
import type {
  Budget,
  Category,
  ExpectedIncome,
  ExpectedInvoice,
  ExpectedSavings,
  Transaction,
} from "@/app/lib/types";

// Mock the database module
jest.mock("@/app/lib/database", () => ({
  loadIncomes: jest.fn(),
  loadInvoices: jest.fn(),
  loadBudgets: jest.fn(),
  loadSavings: jest.fn(),
  loadTransactions: jest.fn(),
  loadCategories: jest.fn(),
}));

describe("useFinancialData", () => {
  // Sample test data
  const mockIncomes: ExpectedIncome[] = [
    {
      id: "income-1",
      name: "January Salary",
      month: "2025-01",
      category: "Salary",
      category_id: "cat-income-1",
      amount: 5000,
      is_paid: false,
      created_at: "2025-01-01T00:00:00Z",
    },
  ];

  const mockInvoices: ExpectedInvoice[] = [
    {
      id: "invoice-1",
      name: "January Rent",
      month: "2025-01",
      category: "Rent",
      category_id: "cat-expense-1",
      amount: 1200,
      is_paid: false,
      created_at: "2025-01-01T00:00:00Z",
    },
  ];

  const mockBudgets: Budget[] = [
    {
      id: "budget-1",
      month: "2025-01",
      category: "Groceries",
      category_id: "cat-expense-2",
      allocated_amount: 500,
      created_at: "2025-01-01T00:00:00Z",
    },
  ];

  const mockSavings: ExpectedSavings[] = [
    {
      id: "saving-1",
      month: "2025-01",
      category: "Emergency Fund",
      category_id: "cat-saving-1",
      amount: 500,
      target: 10000,
      is_paid: false,
      created_at: "2025-01-01T00:00:00Z",
    },
  ];

  const mockTransactions: Transaction[] = [
    {
      id: "tx-1",
      date: "2025-01-15",
      category: "Groceries",
      category_id: "cat-expense-2",
      amount: -50,
      description: "Weekly shopping",
      status: "paid",
      created_at: "2025-01-15T00:00:00Z",
      order_index: 0,
    },
  ];

  const mockCategories: Category[] = [
    {
      id: "cat-income-1",
      name: "Salary",
      type: "income",
      emoji: "💰",
      color: "#00ff00",
      is_visible: true,
      order_index: 0,
    },
    {
      id: "cat-expense-1",
      name: "Rent",
      type: "expense",
      emoji: "🏠",
      color: "#ff0000",
      is_visible: true,
      order_index: 1,
    },
  ];

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default successful responses
    (loadIncomes as jest.Mock).mockResolvedValue(mockIncomes);
    (loadInvoices as jest.Mock).mockResolvedValue(mockInvoices);
    (loadBudgets as jest.Mock).mockResolvedValue(mockBudgets);
    (loadSavings as jest.Mock).mockResolvedValue(mockSavings);
    (loadTransactions as jest.Mock).mockResolvedValue(mockTransactions);
    (loadCategories as jest.Mock).mockResolvedValue(mockCategories);
  });

  describe("initial data loading", () => {
    it("should load all financial data successfully", async () => {
      const { result } = renderHook(() => useFinancialData("2025-01"));

      // Initially should be loading
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Verify all data is loaded
      expect(result.current.data.incomes).toEqual(mockIncomes);
      expect(result.current.data.invoices).toEqual(mockInvoices);
      expect(result.current.data.budgets).toEqual(mockBudgets);
      expect(result.current.data.savings).toEqual(mockSavings);
      expect(result.current.data.transactions).toEqual(mockTransactions);
      expect(result.current.data.categories).toEqual(mockCategories);
      expect(result.current.error).toBeNull();
    });

    it("should call load functions with month parameter", async () => {
      const monthKey = "2025-01";
      renderHook(() => useFinancialData(monthKey));

      await waitFor(() => {
        expect(loadIncomes).toHaveBeenCalledWith(monthKey);
        expect(loadInvoices).toHaveBeenCalledWith(monthKey);
        expect(loadBudgets).toHaveBeenCalledWith(monthKey);
        expect(loadSavings).toHaveBeenCalledWith(monthKey);
        expect(loadTransactions).toHaveBeenCalledWith();
        expect(loadCategories).toHaveBeenCalledWith();
      });
    });

    it("should work without month parameter", async () => {
      renderHook(() => useFinancialData());

      await waitFor(() => {
        expect(loadIncomes).toHaveBeenCalledWith(undefined);
        expect(loadInvoices).toHaveBeenCalledWith(undefined);
        expect(loadBudgets).toHaveBeenCalledWith(undefined);
        expect(loadSavings).toHaveBeenCalledWith(undefined);
      });
    });

    it("should initialize with empty data", () => {
      const { result } = renderHook(() => useFinancialData("2025-01"));

      // Before loading completes, data should be empty
      expect(result.current.data.incomes).toEqual([]);
      expect(result.current.data.invoices).toEqual([]);
      expect(result.current.data.budgets).toEqual([]);
      expect(result.current.data.savings).toEqual([]);
      expect(result.current.data.transactions).toEqual([]);
      expect(result.current.data.categories).toEqual([]);
    });
  });

  describe("error handling", () => {
    it("should handle error when loading incomes fails", async () => {
      const error = new Error("Failed to load incomes");
      (loadIncomes as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useFinancialData("2025-01"));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toEqual(error);
      expect(result.current.data.incomes).toEqual([]);
    });

    it("should handle error when loading budgets fails", async () => {
      const error = new Error("Database connection failed");
      (loadBudgets as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useFinancialData("2025-01"));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toEqual(error);
    });

    it("should handle non-Error objects thrown", async () => {
      (loadTransactions as jest.Mock).mockRejectedValue("String error");

      const { result } = renderHook(() => useFinancialData("2025-01"));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.error?.message).toBe("Failed to load financial data");
    });

    it("should clear previous error on successful reload", async () => {
      // First load fails
      const error = new Error("Network error");
      (loadIncomes as jest.Mock).mockRejectedValueOnce(error);

      const { result } = renderHook(() => useFinancialData("2025-01"));

      await waitFor(() => {
        expect(result.current.error).toEqual(error);
      });

      // Fix the mock and refresh
      (loadIncomes as jest.Mock).mockResolvedValue(mockIncomes);
      await result.current.refresh();

      await waitFor(() => {
        expect(result.current.error).toBeNull();
        expect(result.current.data.incomes).toEqual(mockIncomes);
      });
    });
  });

  describe("refresh functionality", () => {
    it("should reload data when refresh is called", async () => {
      const { result } = renderHook(() => useFinancialData("2025-01"));

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Clear mock calls from initial load
      jest.clearAllMocks();

      // Update mock data
      const newIncomes: ExpectedIncome[] = [
        {
          id: "income-2",
          name: "January Bonus",
          month: "2025-01",
          category: "Bonus",
          category_id: "cat-income-2",
          amount: 1000,
          is_paid: false,
          created_at: "2025-01-15T00:00:00Z",
        },
      ];
      (loadIncomes as jest.Mock).mockResolvedValue(newIncomes);

      // Call refresh
      await result.current.refresh();

      // Verify data was reloaded
      await waitFor(() => {
        expect(result.current.data.incomes).toEqual(newIncomes);
      });

      expect(loadIncomes).toHaveBeenCalledWith("2025-01");
    });

    it("should set loading state during refresh", async () => {
      const { result } = renderHook(() => useFinancialData("2025-01"));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Make the refresh slow
      (loadIncomes as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve(mockIncomes), 100))
      );

      const refreshPromise = result.current.refresh();

      // Should be loading
      await waitFor(() => {
        expect(result.current.loading).toBe(true);
      });

      await refreshPromise;

      // Should finish loading
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe("month change handling", () => {
    it("should reload data when month changes", async () => {
      const { result, rerender } = renderHook(
        ({ monthKey }) => useFinancialData(monthKey),
        {
          initialProps: { monthKey: "2025-01" },
        }
      );

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Clear mock calls
      jest.clearAllMocks();

      // Change month
      rerender({ monthKey: "2025-02" });

      // Verify data is reloaded with new month
      await waitFor(() => {
        expect(loadIncomes).toHaveBeenCalledWith("2025-02");
        expect(loadInvoices).toHaveBeenCalledWith("2025-02");
        expect(loadBudgets).toHaveBeenCalledWith("2025-02");
        expect(loadSavings).toHaveBeenCalledWith("2025-02");
      });
    });

    it("should not reload if month stays the same", async () => {
      const { result, rerender } = renderHook(
        ({ monthKey }) => useFinancialData(monthKey),
        {
          initialProps: { monthKey: "2025-01" },
        }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Clear mock calls from initial load
      jest.clearAllMocks();

      // Rerender with same month
      rerender({ monthKey: "2025-01" });

      // Should not reload
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(loadIncomes).not.toHaveBeenCalled();
    });
  });

  describe("data structure", () => {
    it("should return all required fields", async () => {
      const { result } = renderHook(() => useFinancialData("2025-01"));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Verify structure
      expect(result.current).toHaveProperty("data");
      expect(result.current).toHaveProperty("loading");
      expect(result.current).toHaveProperty("error");
      expect(result.current).toHaveProperty("refresh");

      expect(result.current.data).toHaveProperty("incomes");
      expect(result.current.data).toHaveProperty("invoices");
      expect(result.current.data).toHaveProperty("budgets");
      expect(result.current.data).toHaveProperty("savings");
      expect(result.current.data).toHaveProperty("transactions");
      expect(result.current.data).toHaveProperty("categories");
    });

    it("should have refresh as a stable function reference", async () => {
      const { result, rerender } = renderHook(() => useFinancialData("2025-01"));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const refreshFn1 = result.current.refresh;

      // Trigger rerender
      rerender();

      const refreshFn2 = result.current.refresh;

      // Refresh function should be stable across rerenders
      expect(refreshFn1).toBe(refreshFn2);
    });
  });

  describe("concurrent data loading", () => {
    it("should load all data in parallel", async () => {
      const loadTimes: number[] = [];

      // Mock each function to record when it's called
      (loadIncomes as jest.Mock).mockImplementation(async () => {
        loadTimes.push(Date.now());
        await new Promise((resolve) => setTimeout(resolve, 10));
        return mockIncomes;
      });

      (loadInvoices as jest.Mock).mockImplementation(async () => {
        loadTimes.push(Date.now());
        await new Promise((resolve) => setTimeout(resolve, 10));
        return mockInvoices;
      });

      (loadBudgets as jest.Mock).mockImplementation(async () => {
        loadTimes.push(Date.now());
        await new Promise((resolve) => setTimeout(resolve, 10));
        return mockBudgets;
      });

      renderHook(() => useFinancialData("2025-01"));

      await waitFor(() => {
        expect(loadTimes.length).toBe(3);
      });

      // All functions should be called at approximately the same time (within 5ms)
      const maxDiff = Math.max(...loadTimes) - Math.min(...loadTimes);
      expect(maxDiff).toBeLessThan(5);
    });
  });
});
