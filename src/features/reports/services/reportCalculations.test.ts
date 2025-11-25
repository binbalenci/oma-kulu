/**
 * @jest-environment jsdom
 */

import type { Budget, Category, ExpectedSavings, Transaction } from "@/src/lib/types";
import {
  calculateSavingsProgress,
  calculateSpentByCategory,
  combineSpendingWithBudgets,
  filterInactiveSavingsCategories,
  getProgressColors,
} from "./reportCalculations";

describe("reportCalculations", () => {
  describe("calculateSpentByCategory", () => {
    it("should calculate spending for categories with expenses", () => {
      const transactions: Transaction[] = [
        {
          id: "1",
          date: "2025-01-15",
          amount: -100,
          category: "Groceries",
          description: "Food",
          created_at: "2025-01-15T00:00:00Z",
          order_index: 0,
          status: "paid",
        },
        {
          id: "2",
          date: "2025-01-16",
          amount: -50,
          category: "Groceries",
          description: "More food",
          created_at: "2025-01-16T00:00:00Z",
          order_index: 1,
          status: "paid",
        },
        {
          id: "3",
          date: "2025-01-17",
          amount: -200,
          category: "Transport",
          description: "Gas",
          created_at: "2025-01-17T00:00:00Z",
          order_index: 2,
          status: "paid",
        },
      ];

      const currentMonth = new Date("2025-01-15");
      const result = calculateSpentByCategory(transactions, currentMonth);

      expect(result).toEqual({
        Groceries: 150,
        Transport: 200,
      });
    });

    it("should ignore income transactions (positive amounts)", () => {
      const transactions: Transaction[] = [
        {
          id: "1",
          date: "2025-01-15",
          amount: -100,
          category: "Groceries",
          description: "Food",
          created_at: "2025-01-15T00:00:00Z",
          order_index: 0,
          status: "paid",
        },
        {
          id: "2",
          date: "2025-01-15",
          amount: 500,
          category: "Salary",
          description: "Income",
          created_at: "2025-01-15T00:00:00Z",
          order_index: 1,
          status: "paid",
        },
      ];

      const currentMonth = new Date("2025-01-15");
      const result = calculateSpentByCategory(transactions, currentMonth);

      expect(result).toEqual({
        Groceries: 100,
      });
      expect(result.Salary).toBeUndefined();
    });

    it("should only include transactions in current month", () => {
      const transactions: Transaction[] = [
        {
          id: "1",
          date: "2025-01-15",
          amount: -100,
          category: "Groceries",
          description: "January",
          created_at: "2025-01-15T00:00:00Z",
          order_index: 0,
          status: "paid",
        },
        {
          id: "2",
          date: "2025-02-15",
          amount: -50,
          category: "Groceries",
          description: "February",
          created_at: "2025-02-15T00:00:00Z",
          order_index: 0,
          status: "paid",
        },
      ];

      const currentMonth = new Date("2025-01-15");
      const result = calculateSpentByCategory(transactions, currentMonth);

      expect(result).toEqual({
        Groceries: 100,
      });
    });

    it("should return empty object when no expenses", () => {
      const transactions: Transaction[] = [];
      const currentMonth = new Date("2025-01-15");
      const result = calculateSpentByCategory(transactions, currentMonth);

      expect(result).toEqual({});
    });
  });

  describe("combineSpendingWithBudgets", () => {
    it("should combine spending with budget data", () => {
      const spentByCategory = {
        Groceries: 150,
        Transport: 200,
      };

      const budgets: Budget[] = [
        {
          id: "1",
          category: "Groceries",
          allocated_amount: 200,
          month: "2025-01",
          created_at: "2025-01-01T00:00:00Z",
        },
        {
          id: "2",
          category: "Transport",
          allocated_amount: 150,
          month: "2025-01",
          created_at: "2025-01-01T00:00:00Z",
        },
      ];

      const result = combineSpendingWithBudgets(
        spentByCategory,
        budgets,
        "2025-01"
      );

      expect(result).toEqual([
        { category: "Transport", spent: 200, budget: 150 },
        { category: "Groceries", spent: 150, budget: 200 },
      ]);
    });

    it("should handle categories without budgets", () => {
      const spentByCategory = {
        Groceries: 150,
        Transport: 200,
      };

      const budgets: Budget[] = [
        {
          id: "1",
          category: "Groceries",
          allocated_amount: 200,
          month: "2025-01",
          created_at: "2025-01-01T00:00:00Z",
        },
      ];

      const result = combineSpendingWithBudgets(
        spentByCategory,
        budgets,
        "2025-01"
      );

      expect(result).toEqual([
        { category: "Transport", spent: 200, budget: undefined },
        { category: "Groceries", spent: 150, budget: 200 },
      ]);
    });

    it("should sort by spent amount descending", () => {
      const spentByCategory = {
        A: 100,
        B: 300,
        C: 200,
      };

      const budgets: Budget[] = [];
      const result = combineSpendingWithBudgets(
        spentByCategory,
        budgets,
        "2025-01"
      );

      expect(result.map((r) => r.category)).toEqual(["B", "C", "A"]);
    });

    it("should filter budgets by month", () => {
      const spentByCategory = {
        Groceries: 150,
      };

      const budgets: Budget[] = [
        {
          id: "1",
          category: "Groceries",
          allocated_amount: 200,
          month: "2025-01",
          created_at: "2025-01-01T00:00:00Z",
        },
        {
          id: "2",
          category: "Groceries",
          allocated_amount: 250,
          month: "2025-02",
          created_at: "2025-02-01T00:00:00Z",
        },
      ];

      const result = combineSpendingWithBudgets(
        spentByCategory,
        budgets,
        "2025-01"
      );

      expect(result[0].budget).toBe(200);
    });
  });

  describe("calculateSavingsProgress", () => {
    it("should calculate savings progress correctly", () => {
      const transactions: Transaction[] = [
        {
          id: "1",
          date: "2025-01-15",
          amount: -100,
          category: "Groceries",
          description: "Payment",
          uses_savings_category: "Emergency",
          savings_amount_used: 50,
          created_at: "2025-01-15T00:00:00Z",
          order_index: 0,
          status: "paid",
        },
      ];

      const savings: ExpectedSavings[] = [
        {
          id: "1",
          category: "Emergency",
          amount: 200,
          month: "2025-01",
          is_paid: true,
          created_at: "2025-01-01T00:00:00Z",
        },
      ];

      const result = calculateSavingsProgress(
        "Emergency",
        1000,
        5000,
        transactions,
        savings,
        "2025-01"
      );

      expect(result).toEqual({
        category: "Emergency",
        balance: 1000,
        target: 5000,
        monthlyContributions: 200,
        monthlyPayments: 50,
      });
    });

    it("should handle no contributions or payments", () => {
      const transactions: Transaction[] = [];
      const savings: ExpectedSavings[] = [];

      const result = calculateSavingsProgress(
        "Emergency",
        500,
        undefined,
        transactions,
        savings,
        "2025-01"
      );

      expect(result).toEqual({
        category: "Emergency",
        balance: 500,
        target: undefined,
        monthlyContributions: 0,
        monthlyPayments: 0,
      });
    });

    it("should sum multiple contributions for the month", () => {
      const transactions: Transaction[] = [];
      const savings: ExpectedSavings[] = [
        {
          id: "1",
          category: "Emergency",
          amount: 100,
          month: "2025-01",
          is_paid: true,
          created_at: "2025-01-01T00:00:00Z",
        },
        {
          id: "2",
          category: "Emergency",
          amount: 150,
          month: "2025-01",
          is_paid: true,
          created_at: "2025-01-01T00:00:00Z",
        },
      ];

      const result = calculateSavingsProgress(
        "Emergency",
        1000,
        undefined,
        transactions,
        savings,
        "2025-01"
      );

      expect(result.monthlyContributions).toBe(250);
    });

    it("should sum multiple payments from savings", () => {
      const transactions: Transaction[] = [
        {
          id: "1",
          date: "2025-01-15",
          amount: -100,
          category: "Groceries",
          description: "Payment 1",
          uses_savings_category: "Emergency",
          savings_amount_used: 50,
          created_at: "2025-01-15T00:00:00Z",
          order_index: 0,
          status: "paid",
        },
        {
          id: "2",
          date: "2025-01-16",
          amount: -200,
          category: "Transport",
          description: "Payment 2",
          uses_savings_category: "Emergency",
          savings_amount_used: 75,
          created_at: "2025-01-16T00:00:00Z",
          order_index: 1,
          status: "paid",
        },
      ];

      const savings: ExpectedSavings[] = [];

      const result = calculateSavingsProgress(
        "Emergency",
        1000,
        undefined,
        transactions,
        savings,
        "2025-01"
      );

      expect(result.monthlyPayments).toBe(125);
    });
  });

  describe("getProgressColors", () => {
    it("should return green for progress <= 50%", () => {
      const result = getProgressColors(0.5);
      expect(result).toEqual([
        "rgba(34, 197, 94, 0.15)",
        "rgba(34, 197, 94, 0.08)",
      ]);
    });

    it("should return amber for progress <= 75%", () => {
      const result = getProgressColors(0.75);
      expect(result).toEqual([
        "rgba(251, 191, 36, 0.15)",
        "rgba(251, 191, 36, 0.08)",
      ]);
    });

    it("should return orange for progress <= 100%", () => {
      const result = getProgressColors(1.0);
      expect(result).toEqual([
        "rgba(251, 146, 60, 0.15)",
        "rgba(251, 146, 60, 0.08)",
      ]);
    });

    it("should return red for progress > 100%", () => {
      const result = getProgressColors(1.5);
      expect(result).toEqual([
        "rgba(239, 68, 68, 0.15)",
        "rgba(239, 68, 68, 0.08)",
      ]);
    });

    it("should handle edge cases", () => {
      expect(getProgressColors(0)).toEqual([
        "rgba(34, 197, 94, 0.15)",
        "rgba(34, 197, 94, 0.08)",
      ]);
      expect(getProgressColors(0.51)).toEqual([
        "rgba(251, 191, 36, 0.15)",
        "rgba(251, 191, 36, 0.08)",
      ]);
      expect(getProgressColors(0.76)).toEqual([
        "rgba(251, 146, 60, 0.15)",
        "rgba(251, 146, 60, 0.08)",
      ]);
    });
  });

  describe("filterInactiveSavingsCategories", () => {
    it("should filter out active savings categories", () => {
      const allCategories: Category[] = [
        {
          id: "1",
          name: "Emergency",
          type: "saving",
          color: "#000",
          emoji: "💰",
          order_index: 0,
          is_visible: true,
        },
        {
          id: "2",
          name: "Vacation",
          type: "saving",
          color: "#000",
          emoji: "✈️",
          order_index: 1,
          is_visible: true,
        },
        {
          id: "3",
          name: "Groceries",
          type: "expense",
          color: "#000",
          emoji: "🛒",
          order_index: 2,
          is_visible: true,
        },
      ];

      const activeSavingsCategories = ["Emergency"];

      const result = filterInactiveSavingsCategories(
        allCategories,
        activeSavingsCategories
      );

      expect(result).toEqual([
        {
          id: "2",
          name: "Vacation",
          type: "saving",
          color: "#000",
          emoji: "✈️",
          order_index: 1,
          is_visible: true,
        },
      ]);
    });

    it("should return all savings categories when none are active", () => {
      const allCategories: Category[] = [
        {
          id: "1",
          name: "Emergency",
          type: "saving",
          color: "#000",
          emoji: "💰",
          order_index: 0,
          is_visible: true,
        },
        {
          id: "2",
          name: "Vacation",
          type: "saving",
          color: "#000",
          emoji: "✈️",
          order_index: 1,
          is_visible: true,
        },
      ];

      const activeSavingsCategories: string[] = [];

      const result = filterInactiveSavingsCategories(
        allCategories,
        activeSavingsCategories
      );

      expect(result).toHaveLength(2);
    });

    it("should return empty array when all savings are active", () => {
      const allCategories: Category[] = [
        {
          id: "1",
          name: "Emergency",
          type: "saving",
          color: "#000",
          emoji: "💰",
          order_index: 0,
          is_visible: true,
        },
      ];

      const activeSavingsCategories = ["Emergency"];

      const result = filterInactiveSavingsCategories(
        allCategories,
        activeSavingsCategories
      );

      expect(result).toEqual([]);
    });

    it("should ignore non-saving categories", () => {
      const allCategories: Category[] = [
        {
          id: "1",
          name: "Groceries",
          type: "expense",
          color: "#000",
          emoji: "🛒",
          order_index: 0,
          is_visible: true,
        },
        {
          id: "2",
          name: "Salary",
          type: "income",
          color: "#000",
          emoji: "💵",
          order_index: 1,
          is_visible: true,
        },
      ];

      const activeSavingsCategories: string[] = [];

      const result = filterInactiveSavingsCategories(
        allCategories,
        activeSavingsCategories
      );

      expect(result).toEqual([]);
    });
  });
});
