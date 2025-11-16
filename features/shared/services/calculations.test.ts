/**
 * Tests for Financial Calculations Service
 *
 * Comprehensive test suite covering all calculation functions with edge cases,
 * boundary conditions, and realistic scenarios.
 */

import {
  calculateMoneyToAssign,
  calculateActualInBank,
  calculateSpentByCategory,
  calculateTotalSavingsBalance,
} from "./calculations";

describe("calculateMoneyToAssign", () => {
  it("should calculate correctly with positive balance", () => {
    const incomes = [{ amount: 5000 }];
    const invoices = [{ amount: 2000 }];
    const budgets = [{ allocated_amount: 1000 }];
    const savings = [{ amount: 500 }];

    const result = calculateMoneyToAssign(incomes, invoices, budgets, savings);

    // 5000 - 2000 - 1000 - 500 = 1500
    expect(result).toBe(1500);
  });

  it("should handle negative balance (over-allocated)", () => {
    const incomes = [{ amount: 3000 }];
    const invoices = [{ amount: 1000 }];
    const budgets = [{ allocated_amount: 2500 }];
    const savings = [{ amount: 1000 }];

    const result = calculateMoneyToAssign(incomes, invoices, budgets, savings);

    // 3000 - 1000 - 2500 - 1000 = -1500
    expect(result).toBe(-1500);
  });

  it("should handle zero result (perfectly balanced)", () => {
    const incomes = [{ amount: 5000 }];
    const invoices = [{ amount: 2000 }];
    const budgets = [{ allocated_amount: 2000 }];
    const savings = [{ amount: 1000 }];

    const result = calculateMoneyToAssign(incomes, invoices, budgets, savings);

    // 5000 - 2000 - 2000 - 1000 = 0
    expect(result).toBe(0);
  });

  it("should handle empty arrays", () => {
    const result = calculateMoneyToAssign([], [], [], []);

    expect(result).toBe(0);
  });

  it("should handle multiple items in each category", () => {
    const incomes = [{ amount: 3000 }, { amount: 2000 }, { amount: 1000 }];
    const invoices = [{ amount: 500 }, { amount: 300 }];
    const budgets = [
      { allocated_amount: 1000 },
      { allocated_amount: 500 },
      { allocated_amount: 200 },
    ];
    const savings = [{ amount: 400 }, { amount: 100 }];

    const result = calculateMoneyToAssign(incomes, invoices, budgets, savings);

    // (3000 + 2000 + 1000) - (500 + 300) - (1000 + 500 + 200) - (400 + 100)
    // = 6000 - 800 - 1700 - 500 = 3000
    expect(result).toBe(3000);
  });

  it("should handle zero amounts", () => {
    const incomes = [{ amount: 0 }];
    const invoices = [{ amount: 0 }];
    const budgets = [{ allocated_amount: 0 }];
    const savings = [{ amount: 0 }];

    const result = calculateMoneyToAssign(incomes, invoices, budgets, savings);

    expect(result).toBe(0);
  });

  it("should handle missing expenses (only income)", () => {
    const incomes = [{ amount: 5000 }];
    const invoices: any[] = [];
    const budgets: any[] = [];
    const savings: any[] = [];

    const result = calculateMoneyToAssign(incomes, invoices, budgets, savings);

    expect(result).toBe(5000);
  });

  it("should handle missing income (only expenses)", () => {
    const incomes: any[] = [];
    const invoices = [{ amount: 2000 }];
    const budgets = [{ allocated_amount: 1000 }];
    const savings = [{ amount: 500 }];

    const result = calculateMoneyToAssign(incomes, invoices, budgets, savings);

    // 0 - 2000 - 1000 - 500 = -3500
    expect(result).toBe(-3500);
  });
});

describe("calculateActualInBank", () => {
  const monthStart = new Date("2025-01-01T00:00:00");
  const monthEnd = new Date("2025-01-31T23:59:59");

  it("should only include paid transactions up to current date", () => {
    const currentDate = new Date("2025-01-15T00:00:00");
    const transactions = [
      { date: "2025-01-10", amount: 5000, status: "paid" as const, source_type: undefined, savings_amount_used: 0 },
      { date: "2025-01-20", amount: 3000, status: "paid" as const, source_type: undefined, savings_amount_used: 0 }, // Future (excluded)
      { date: "2025-01-12", amount: -100, status: "paid" as const, source_type: undefined, savings_amount_used: 0 },
    ];

    const result = calculateActualInBank(transactions, monthStart, monthEnd, currentDate);

    // Only Jan 10 and Jan 12 transactions: 5000 - 100 = 4900
    expect(result).toBe(4900);
  });

  it("should exclude future-dated transactions even if marked as paid", () => {
    const currentDate = new Date("2025-01-15T00:00:00");
    const transactions = [
      { date: "2025-01-10", amount: 5000, status: "paid" as const, source_type: undefined, savings_amount_used: 0 },
      { date: "2025-01-25", amount: 3000, status: "paid" as const, source_type: undefined, savings_amount_used: 0 }, // Future
      { date: "2025-01-30", amount: -500, status: "paid" as const, source_type: undefined, savings_amount_used: 0 }, // Future
    ];

    const result = calculateActualInBank(transactions, monthStart, monthEnd, currentDate);

    expect(result).toBe(5000);
  });

  it("should exclude unpaid transactions", () => {
    const currentDate = new Date("2025-01-15T00:00:00");
    const transactions = [
      { date: "2025-01-10", amount: 5000, status: "paid" as const, source_type: undefined, savings_amount_used: 0 },
      { date: "2025-01-12", amount: 3000, status: "upcoming" as const, source_type: undefined, savings_amount_used: 0 }, // Unpaid
      { date: "2025-01-12", amount: -100, status: "paid" as const, source_type: undefined, savings_amount_used: 0 },
    ];

    const result = calculateActualInBank(transactions, monthStart, monthEnd, currentDate);

    // Only paid: 5000 - 100 = 4900
    expect(result).toBe(4900);
  });

  it("should exclude savings contributions from income", () => {
    const currentDate = new Date("2025-01-15T00:00:00");
    const transactions = [
      { date: "2025-01-10", amount: 5000, status: "paid" as const, source_type: undefined, savings_amount_used: 0 },
      { date: "2025-01-11", amount: 1000, status: "paid" as const, source_type: "savings" as const, savings_amount_used: 0 }, // Savings (excluded)
      { date: "2025-01-12", amount: -100, status: "paid" as const, source_type: undefined, savings_amount_used: 0 },
    ];

    const result = calculateActualInBank(transactions, monthStart, monthEnd, currentDate);

    // Only non-savings income: 5000 - 100 = 4900
    expect(result).toBe(4900);
  });

  it("should only count expense portion NOT covered by savings", () => {
    const currentDate = new Date("2025-01-15T00:00:00");
    const transactions = [
      { date: "2025-01-10", amount: 5000, status: "paid" as const, source_type: undefined, savings_amount_used: 0 },
      { date: "2025-01-12", amount: -500, status: "paid" as const, source_type: undefined, savings_amount_used: 300 }, // $300 from savings
      { date: "2025-01-13", amount: -200, status: "paid" as const, source_type: undefined, savings_amount_used: 0 },
    ];

    const result = calculateActualInBank(transactions, monthStart, monthEnd, currentDate);

    // Income: 5000
    // Expenses: (500 - 300) + 200 = 400
    // Result: 5000 - 400 = 4600
    expect(result).toBe(4600);
  });

  it("should handle transactions outside the month range", () => {
    const currentDate = new Date("2025-01-15T00:00:00");
    const transactions = [
      { date: "2024-12-31", amount: 5000, status: "paid" as const, source_type: undefined, savings_amount_used: 0 }, // Previous month
      { date: "2025-01-10", amount: 3000, status: "paid" as const, source_type: undefined, savings_amount_used: 0 },
      { date: "2025-02-01", amount: 2000, status: "paid" as const, source_type: undefined, savings_amount_used: 0 }, // Next month
      { date: "2025-01-12", amount: -100, status: "paid" as const, source_type: undefined, savings_amount_used: 0 },
    ];

    const result = calculateActualInBank(transactions, monthStart, monthEnd, currentDate);

    // Only Jan 10 and Jan 12: 3000 - 100 = 2900
    expect(result).toBe(2900);
  });

  it("should handle empty transactions", () => {
    const currentDate = new Date("2025-01-15T00:00:00");
    const result = calculateActualInBank([], monthStart, monthEnd, currentDate);

    expect(result).toBe(0);
  });

  it("should use current date if not provided", () => {
    const transactions = [
      { date: "2025-01-10", amount: 5000, status: "paid" as const, source_type: undefined, savings_amount_used: 0 },
      { date: "2025-01-12", amount: -100, status: "paid" as const, source_type: undefined, savings_amount_used: 0 },
    ];

    const result = calculateActualInBank(transactions, monthStart, monthEnd);

    // Should use current date (will vary based on when test runs)
    expect(typeof result).toBe("number");
  });

  it("should handle negative balance", () => {
    const currentDate = new Date("2025-01-15T00:00:00");
    const transactions = [
      { date: "2025-01-10", amount: 1000, status: "paid" as const, source_type: undefined, savings_amount_used: 0 },
      { date: "2025-01-12", amount: -2000, status: "paid" as const, source_type: undefined, savings_amount_used: 0 },
    ];

    const result = calculateActualInBank(transactions, monthStart, monthEnd, currentDate);

    expect(result).toBe(-1000);
  });

  it("should handle complex mix of income and expenses with savings", () => {
    const currentDate = new Date("2025-01-20T00:00:00");
    const transactions = [
      { date: "2025-01-05", amount: 5000, status: "paid" as const, source_type: "income" as const, savings_amount_used: 0 },
      { date: "2025-01-06", amount: 500, status: "paid" as const, source_type: "savings" as const, savings_amount_used: 0 }, // Excluded
      { date: "2025-01-10", amount: -300, status: "paid" as const, source_type: undefined, savings_amount_used: 100 }, // $100 from savings
      { date: "2025-01-12", amount: -500, status: "paid" as const, source_type: undefined, savings_amount_used: 500 }, // Fully from savings
      { date: "2025-01-15", amount: -200, status: "paid" as const, source_type: undefined, savings_amount_used: 0 },
      { date: "2025-01-25", amount: 3000, status: "paid" as const, source_type: undefined, savings_amount_used: 0 }, // Future (excluded)
    ];

    const result = calculateActualInBank(transactions, monthStart, monthEnd, currentDate);

    // Income: 5000
    // Expenses: (300 - 100) + (500 - 500) + 200 = 400
    // Result: 5000 - 400 = 4600
    expect(result).toBe(4600);
  });
});

describe("calculateSpentByCategory", () => {
  it("should calculate spent amounts by category", () => {
    const transactions = [
      { category: "Groceries", amount: -100 },
      { category: "Groceries", amount: -50 },
      { category: "Utilities", amount: -200 },
      { category: "Transport", amount: -75 },
    ];

    const result = calculateSpentByCategory(transactions);

    expect(result).toEqual({
      Groceries: 150,
      Utilities: 200,
      Transport: 75,
    });
  });

  it("should ignore positive amounts (income)", () => {
    const transactions = [
      { category: "Salary", amount: 5000 },
      { category: "Groceries", amount: -100 },
      { category: "Freelance", amount: 1000 },
      { category: "Utilities", amount: -200 },
    ];

    const result = calculateSpentByCategory(transactions);

    expect(result).toEqual({
      Groceries: 100,
      Utilities: 200,
    });
  });

  it("should handle empty transactions", () => {
    const result = calculateSpentByCategory([]);

    expect(result).toEqual({});
  });

  it("should handle single category", () => {
    const transactions = [
      { category: "Groceries", amount: -100 },
      { category: "Groceries", amount: -50 },
      { category: "Groceries", amount: -25 },
    ];

    const result = calculateSpentByCategory(transactions);

    expect(result).toEqual({
      Groceries: 175,
    });
  });

  it("should handle zero amounts", () => {
    const transactions = [
      { category: "Groceries", amount: -100 },
      { category: "Utilities", amount: 0 }, // Zero (ignored)
      { category: "Transport", amount: -50 },
    ];

    const result = calculateSpentByCategory(transactions);

    expect(result).toEqual({
      Groceries: 100,
      Transport: 50,
    });
  });

  it("should convert negative amounts to positive", () => {
    const transactions = [{ category: "Groceries", amount: -150.75 }];

    const result = calculateSpentByCategory(transactions);

    expect(result).toEqual({
      Groceries: 150.75,
    });
  });

  it("should handle mixed positive and negative amounts", () => {
    const transactions = [
      { category: "Groceries", amount: -100 },
      { category: "Groceries", amount: 50 }, // Income (ignored)
      { category: "Groceries", amount: -75 },
      { category: "Utilities", amount: -200 },
      { category: "Utilities", amount: 100 }, // Income (ignored)
    ];

    const result = calculateSpentByCategory(transactions);

    expect(result).toEqual({
      Groceries: 175,
      Utilities: 200,
    });
  });
});

describe("calculateTotalSavingsBalance", () => {
  it("should calculate total of all savings balances", () => {
    const balances = {
      "Emergency Fund": 1000,
      Vacation: 500,
      "Car Fund": 2000,
    };

    const result = calculateTotalSavingsBalance(balances);

    expect(result).toBe(3500);
  });

  it("should handle empty object", () => {
    const result = calculateTotalSavingsBalance({});

    expect(result).toBe(0);
  });

  it("should handle single balance", () => {
    const balances = {
      "Emergency Fund": 1500,
    };

    const result = calculateTotalSavingsBalance(balances);

    expect(result).toBe(1500);
  });

  it("should handle zero balances", () => {
    const balances = {
      "Emergency Fund": 0,
      Vacation: 0,
    };

    const result = calculateTotalSavingsBalance(balances);

    expect(result).toBe(0);
  });

  it("should handle negative balances", () => {
    const balances = {
      "Emergency Fund": 1000,
      Vacation: -200, // Overdrawn
      "Car Fund": 500,
    };

    const result = calculateTotalSavingsBalance(balances);

    expect(result).toBe(1300);
  });

  it("should handle decimal amounts", () => {
    const balances = {
      "Emergency Fund": 1234.56,
      Vacation: 789.12,
      "Car Fund": 456.78,
    };

    const result = calculateTotalSavingsBalance(balances);

    expect(result).toBeCloseTo(2480.46, 2);
  });
});
