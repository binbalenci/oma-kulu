import type { Transaction } from "@/src/lib/types";
import {
  filterTransactionsByType,
  getMaxOrderIndexForDate,
  hasSameDate,
  sortTransactionsByDateAndOrder,
} from "./transactionHelpers";

describe("transactionHelpers", () => {
  const createTestTransaction = (id: string, date: string, amount: number, order_index?: number): Transaction => ({
    id,
    date,
    amount,
    description: "Test",
    category: "Test",
    status: "paid",
    created_at: new Date().toISOString(),
    ...(order_index !== undefined && { order_index }),
  });

  describe("sortTransactionsByDateAndOrder", () => {
    it("should sort by date descending (newest first)", () => {
      const transactions: Transaction[] = [
        createTestTransaction("1", "2025-01-15", 100, 0),
        createTestTransaction("2", "2025-01-20", 200, 0),
        createTestTransaction("3", "2025-01-10", 300, 0),
      ];

      const sorted = sortTransactionsByDateAndOrder(transactions);

      expect(sorted[0].id).toBe("2"); // 2025-01-20
      expect(sorted[1].id).toBe("1"); // 2025-01-15
      expect(sorted[2].id).toBe("3"); // 2025-01-10
    });

    it("should sort by order_index ascending for same date", () => {
      const transactions: Transaction[] = [
        createTestTransaction("1", "2025-01-15", 100, 2),
        createTestTransaction("2", "2025-01-15", 200, 0),
        createTestTransaction("3", "2025-01-15", 300, 1),
      ];

      const sorted = sortTransactionsByDateAndOrder(transactions);

      expect(sorted[0].order_index).toBe(0); // id: 2
      expect(sorted[1].order_index).toBe(1); // id: 3
      expect(sorted[2].order_index).toBe(2); // id: 1
    });

    it("should handle transactions with missing order_index", () => {
      const transactions: Transaction[] = [
        createTestTransaction("1", "2025-01-15", 100),
        createTestTransaction("2", "2025-01-15", 200, 1),
      ];

      const sorted = sortTransactionsByDateAndOrder(transactions);

      expect(sorted[0].id).toBe("1"); // order_index treated as 0
      expect(sorted[1].id).toBe("2");
    });

    it("should not mutate original array", () => {
      const transactions: Transaction[] = [
        createTestTransaction("1", "2025-01-15", 100, 0),
        createTestTransaction("2", "2025-01-20", 200, 0),
      ];

      const sorted = sortTransactionsByDateAndOrder(transactions);

      expect(sorted).not.toBe(transactions);
      expect(transactions[0].id).toBe("1"); // Original unchanged
    });
  });

  describe("filterTransactionsByType", () => {
    const transactions: Transaction[] = [
      createTestTransaction("1", "2025-01-15", 100, 0),
      createTestTransaction("2", "2025-01-15", -50, 0),
      createTestTransaction("3", "2025-01-15", -30, 0),
      createTestTransaction("4", "2025-01-15", 200, 0),
    ];

    it("should filter income transactions (amount > 0)", () => {
      const incomes = filterTransactionsByType(transactions, true);

      expect(incomes).toHaveLength(2);
      expect(incomes[0].id).toBe("1");
      expect(incomes[1].id).toBe("4");
      expect(incomes.every((t) => t.amount > 0)).toBe(true);
    });

    it("should filter expense transactions (amount < 0)", () => {
      const expenses = filterTransactionsByType(transactions, false);

      expect(expenses).toHaveLength(2);
      expect(expenses[0].id).toBe("2");
      expect(expenses[1].id).toBe("3");
      expect(expenses.every((t) => t.amount < 0)).toBe(true);
    });

    it("should return empty array when no matches", () => {
      const onlyIncomes: Transaction[] = [createTestTransaction("1", "2025-01-15", 100, 0)];

      const expenses = filterTransactionsByType(onlyIncomes, false);
      expect(expenses).toHaveLength(0);
    });
  });

  describe("getMaxOrderIndexForDate", () => {
    it("should return maximum order_index for specific date", () => {
      const transactions: Transaction[] = [
        createTestTransaction("1", "2025-01-15", 100, 2),
        createTestTransaction("2", "2025-01-15", 200, 5),
        createTestTransaction("3", "2025-01-15", 300, 3),
        createTestTransaction("4", "2025-01-16", 400, 10),
      ];

      const maxIndex = getMaxOrderIndexForDate(transactions, "2025-01-15");

      expect(maxIndex).toBe(5);
    });

    it("should return -1 when no transactions for date", () => {
      const transactions: Transaction[] = [createTestTransaction("1", "2025-01-15", 100, 0)];

      const maxIndex = getMaxOrderIndexForDate(transactions, "2025-01-20");

      expect(maxIndex).toBe(-1);
    });

    it("should handle transactions with missing order_index", () => {
      const transactions: Transaction[] = [
        createTestTransaction("1", "2025-01-15", 100),
        createTestTransaction("2", "2025-01-15", 200, 3),
      ];

      const maxIndex = getMaxOrderIndexForDate(transactions, "2025-01-15");

      expect(maxIndex).toBe(3);
    });

    it("should return -1 for empty array", () => {
      const maxIndex = getMaxOrderIndexForDate([], "2025-01-15");
      expect(maxIndex).toBe(-1);
    });
  });

  describe("hasSameDate", () => {
    it("should return true for transactions with same date", () => {
      const t1 = createTestTransaction("1", "2025-01-15", 100, 0);
      const t2 = createTestTransaction("2", "2025-01-15", 200, 1);

      expect(hasSameDate(t1, t2)).toBe(true);
    });

    it("should return false for transactions with different dates", () => {
      const t1 = createTestTransaction("1", "2025-01-15", 100, 0);
      const t2 = createTestTransaction("2", "2025-01-16", 200, 0);

      expect(hasSameDate(t1, t2)).toBe(false);
    });
  });
});
