/**
 * @jest-environment jsdom
 */

import { renderHook, act } from "@testing-library/react";
import type { Transaction } from "@/lib/types";
import { useTransactionReorder } from "./useTransactionReorder";
import { saveTransactions } from "@/lib/storage";
import React from "react";

// Mock dependencies
jest.mock("@/lib/storage", () => ({
  saveTransactions: jest.fn(),
}));

jest.mock("@/app/utils/logger", () => ({
  default: {
    breadcrumb: jest.fn(),
    userAction: jest.fn(),
    error: jest.fn(),
    databaseSuccess: jest.fn(),
  },
  __esModule: true,
}));

describe("useTransactionReorder", () => {
  let mockShowSnackbar: jest.Mock;
  let transactions: Transaction[];
  const setTransactions = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockShowSnackbar = jest.fn();
    transactions = [];
    setTransactions.mockImplementation((updater) => {
      if (typeof updater === "function") {
        transactions = updater(transactions);
      } else {
        transactions = updater;
      }
      return transactions;
    });
    (saveTransactions as jest.Mock).mockResolvedValue(true);
  });

  const createTransaction = (
    id: string,
    date: string,
    amount: number,
    order_index: number
  ): Transaction => ({
    id,
    date,
    amount,
    description: "Test transaction",
    category: "Test",
    status: "paid",
    created_at: new Date().toISOString(),
    order_index,
  });

  describe("moveUp", () => {
    it("should swap order_index with previous same-date transaction", async () => {
      transactions = [
        createTransaction("1", "2025-01-15", -100, 0),
        createTransaction("2", "2025-01-15", -200, 1),
      ];

      const { result } = renderHook(() =>
        useTransactionReorder({
          transactions,
          setTransactions: setTransactions as any,
          showSnackbar: mockShowSnackbar,
        })
      );

      await act(async () => {
        await result.current.moveUp("2", false);
      });

      expect(setTransactions).toHaveBeenCalled();
      const t1 = transactions.find((t) => t.id === "1");
      const t2 = transactions.find((t) => t.id === "2");

      expect(t2?.order_index).toBe(0);
      expect(t1?.order_index).toBe(1);
    });

    it("should not move if already at top", async () => {
      const initialTransactions = [
        createTransaction("1", "2025-01-15", -100, 0),
        createTransaction("2", "2025-01-15", -200, 1),
      ];
      transactions = [...initialTransactions];

      const { result } = renderHook(() =>
        useTransactionReorder({
          transactions,
          setTransactions: setTransactions as any,
          showSnackbar: mockShowSnackbar,
        })
      );

      await act(async () => {
        await result.current.moveUp("1", false);
      });

      expect(transactions).toEqual(initialTransactions);
    });

    it("should not move if previous transaction has different date", async () => {
      const initialTransactions = [
        createTransaction("1", "2025-01-15", -100, 0),
        createTransaction("2", "2025-01-14", -200, 0),
      ];
      transactions = [...initialTransactions];

      const { result } = renderHook(() =>
        useTransactionReorder({
          transactions,
          setTransactions: setTransactions as any,
          showSnackbar: mockShowSnackbar,
        })
      );

      await act(async () => {
        await result.current.moveUp("2", false);
      });

      expect(transactions).toEqual(initialTransactions);
    });

    it("should call saveTransactions with swapped transactions", async () => {
      transactions = [
        createTransaction("1", "2025-01-15", -100, 0),
        createTransaction("2", "2025-01-15", -200, 1),
      ];

      const { result } = renderHook(() =>
        useTransactionReorder({
          transactions,
          setTransactions: setTransactions as any,
          showSnackbar: mockShowSnackbar,
        })
      );

      await act(async () => {
        await result.current.moveUp("2", false);
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      expect(saveTransactions).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: "1", order_index: 1 }),
          expect.objectContaining({ id: "2", order_index: 0 }),
        ])
      );
    });

    it("should show snackbar on save failure", async () => {
      (saveTransactions as jest.Mock).mockResolvedValue(false);

      transactions = [
        createTransaction("1", "2025-01-15", -100, 0),
        createTransaction("2", "2025-01-15", -200, 1),
      ];

      const { result } = renderHook(() =>
        useTransactionReorder({
          transactions,
          setTransactions: setTransactions as any,
          showSnackbar: mockShowSnackbar,
        })
      );

      await act(async () => {
        await result.current.moveUp("2", false);
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      expect(mockShowSnackbar).toHaveBeenCalledWith("Failed to save order");
    });
  });

  describe("moveDown", () => {
    it("should swap order_index with next same-date transaction", async () => {
      transactions = [
        createTransaction("1", "2025-01-15", -100, 0),
        createTransaction("2", "2025-01-15", -200, 1),
      ];

      const { result } = renderHook(() =>
        useTransactionReorder({
          transactions,
          setTransactions: setTransactions as any,
          showSnackbar: mockShowSnackbar,
        })
      );

      await act(async () => {
        await result.current.moveDown("1", false);
      });

      const t1 = transactions.find((t) => t.id === "1");
      const t2 = transactions.find((t) => t.id === "2");

      expect(t1?.order_index).toBe(1);
      expect(t2?.order_index).toBe(0);
    });

    it("should not move if already at bottom", async () => {
      const initialTransactions = [
        createTransaction("1", "2025-01-15", -100, 0),
        createTransaction("2", "2025-01-15", -200, 1),
      ];
      transactions = [...initialTransactions];

      const { result } = renderHook(() =>
        useTransactionReorder({
          transactions,
          setTransactions: setTransactions as any,
          showSnackbar: mockShowSnackbar,
        })
      );

      await act(async () => {
        await result.current.moveDown("2", false);
      });

      expect(transactions).toEqual(initialTransactions);
    });

    it("should not move if next transaction has different date", async () => {
      const initialTransactions = [
        createTransaction("1", "2025-01-15", -100, 0),
        createTransaction("2", "2025-01-14", -200, 0),
      ];
      transactions = [...initialTransactions];

      const { result } = renderHook(() =>
        useTransactionReorder({
          transactions,
          setTransactions: setTransactions as any,
          showSnackbar: mockShowSnackbar,
        })
      );

      await act(async () => {
        await result.current.moveDown("1", false);
      });

      expect(transactions).toEqual(initialTransactions);
    });
  });

  describe("canMoveUp", () => {
    it("should return true if previous transaction has same date", () => {
      transactions = [
        createTransaction("1", "2025-01-15", -100, 0),
        createTransaction("2", "2025-01-15", -200, 1),
      ];

      const { result } = renderHook(() =>
        useTransactionReorder({
          transactions,
          setTransactions: setTransactions as any,
          showSnackbar: mockShowSnackbar,
        })
      );

      expect(result.current.canMoveUp("2", false)).toBe(true);
    });

    it("should return false if at top", () => {
      transactions = [
        createTransaction("1", "2025-01-15", -100, 0),
        createTransaction("2", "2025-01-15", -200, 1),
      ];

      const { result } = renderHook(() =>
        useTransactionReorder({
          transactions,
          setTransactions: setTransactions as any,
          showSnackbar: mockShowSnackbar,
        })
      );

      expect(result.current.canMoveUp("1", false)).toBe(false);
    });

    it("should return false if previous transaction has different date", () => {
      transactions = [
        createTransaction("1", "2025-01-16", -100, 0),
        createTransaction("2", "2025-01-15", -200, 0),
      ];

      const { result } = renderHook(() =>
        useTransactionReorder({
          transactions,
          setTransactions: setTransactions as any,
          showSnackbar: mockShowSnackbar,
        })
      );

      expect(result.current.canMoveUp("2", false)).toBe(false);
    });
  });

  describe("canMoveDown", () => {
    it("should return true if next transaction has same date", () => {
      transactions = [
        createTransaction("1", "2025-01-15", -100, 0),
        createTransaction("2", "2025-01-15", -200, 1),
      ];

      const { result } = renderHook(() =>
        useTransactionReorder({
          transactions,
          setTransactions: setTransactions as any,
          showSnackbar: mockShowSnackbar,
        })
      );

      expect(result.current.canMoveDown("1", false)).toBe(true);
    });

    it("should return false if at bottom", () => {
      transactions = [
        createTransaction("1", "2025-01-15", -100, 0),
        createTransaction("2", "2025-01-15", -200, 1),
      ];

      const { result } = renderHook(() =>
        useTransactionReorder({
          transactions,
          setTransactions: setTransactions as any,
          showSnackbar: mockShowSnackbar,
        })
      );

      expect(result.current.canMoveDown("2", false)).toBe(false);
    });

    it("should return false if next transaction has different date", () => {
      transactions = [
        createTransaction("1", "2025-01-15", -100, 0),
        createTransaction("2", "2025-01-14", -200, 0),
      ];

      const { result } = renderHook(() =>
        useTransactionReorder({
          transactions,
          setTransactions: setTransactions as any,
          showSnackbar: mockShowSnackbar,
        })
      );

      expect(result.current.canMoveDown("1", false)).toBe(false);
    });
  });

  describe("income vs expense filtering", () => {
    it("should only consider income transactions when isIncome=true", () => {
      transactions = [
        createTransaction("1", "2025-01-15", 100, 0),
        createTransaction("2", "2025-01-15", 200, 1),
        createTransaction("3", "2025-01-15", -50, 0),
      ];

      const { result } = renderHook(() =>
        useTransactionReorder({
          transactions,
          setTransactions: setTransactions as any,
          showSnackbar: mockShowSnackbar,
        })
      );

      expect(result.current.canMoveDown("1", true)).toBe(true);
      expect(result.current.canMoveDown("2", true)).toBe(false);
    });

    it("should only consider expense transactions when isIncome=false", () => {
      transactions = [
        createTransaction("1", "2025-01-15", 100, 0),
        createTransaction("2", "2025-01-15", -50, 0),
        createTransaction("3", "2025-01-15", -30, 1),
      ];

      const { result } = renderHook(() =>
        useTransactionReorder({
          transactions,
          setTransactions: setTransactions as any,
          showSnackbar: mockShowSnackbar,
        })
      );

      expect(result.current.canMoveDown("2", false)).toBe(true);
      expect(result.current.canMoveDown("3", false)).toBe(false);
    });
  });
});
