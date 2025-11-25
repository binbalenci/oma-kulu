/**
 * Financial Calculations Service
 *
 * Pure functions for calculating financial metrics used across the application.
 * All functions are stateless and side-effect free, making them easy to test.
 *
 * @module features/shared/services/calculations
 */

import type { Budget, ExpectedIncome, ExpectedInvoice, ExpectedSavings, Transaction } from "@/app/lib/types";

/**
 * Calculates money remaining to assign to budget categories
 *
 * Formula: expectedIncome - expectedExpenses - totalAllocated - totalSavings
 *
 * @param incomes - Expected incomes for the month
 * @param invoices - Expected invoices (expenses) for the month
 * @param budgets - Current budget allocations
 * @param savings - Expected savings contributions for the month
 * @returns Money available to assign (can be negative if over-allocated)
 *
 * @example
 * ```ts
 * const moneyToAssign = calculateMoneyToAssign(
 *   [{ amount: 5000 }],  // $5000 expected income
 *   [{ amount: 2000 }],  // $2000 expected expenses
 *   [{ allocated_amount: 1500 }],  // $1500 budgeted
 *   [{ amount: 500 }]    // $500 savings goal
 * );
 * // Returns: 1000 (5000 - 2000 - 1500 - 500)
 * ```
 */
export function calculateMoneyToAssign(
  incomes: Pick<ExpectedIncome, "amount">[],
  invoices: Pick<ExpectedInvoice, "amount">[],
  budgets: Pick<Budget, "allocated_amount">[],
  savings: Pick<ExpectedSavings, "amount">[]
): number {
  const expectedIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const expectedExpenses = invoices.reduce((sum, i) => sum + i.amount, 0);
  const totalAllocated = budgets.reduce((sum, b) => sum + b.allocated_amount, 0);
  const totalSavings = savings.reduce((sum, s) => sum + s.amount, 0);

  return expectedIncome - expectedExpenses - totalAllocated - totalSavings;
}

/**
 * Calculates actual "In Bank" amount for current month
 *
 * Only includes PAID transactions from current month where date <= today.
 * Filters out future-dated transactions even if marked as paid.
 * Excludes savings contributions from income (source_type !== 'savings').
 * Expenses only count portion NOT covered by savings.
 *
 * Formula: totalIncome - totalExpenses (paid only, date <= today)
 *
 * @param transactions - All transactions
 * @param monthStart - Start date of the month
 * @param monthEnd - End date of the month
 * @param currentDate - Today's date (defaults to now)
 * @returns Actual cash in bank
 *
 * @example
 * ```ts
 * const actualInBank = calculateActualInBank(
 *   transactions,
 *   new Date('2025-01-01'),
 *   new Date('2025-01-31'),
 *   new Date('2025-01-15')
 * );
 * // Only includes paid transactions from Jan 1-15
 * ```
 */
export function calculateActualInBank(
  transactions: Pick<Transaction, "date" | "amount" | "status" | "source_type" | "savings_amount_used">[],
  monthStart: Date,
  monthEnd: Date,
  currentDate: Date = new Date()
): number {
  // Normalize currentDate to midnight for comparison
  const today = new Date(currentDate);
  today.setHours(0, 0, 0, 0);

  // Filter transactions: current month, paid, date <= today
  const monthTransactions = transactions.filter((t) => {
    const transactionDate = new Date(t.date + "T00:00:00");
    return (
      transactionDate >= monthStart &&
      transactionDate <= monthEnd &&
      transactionDate <= today &&
      t.status === "paid"
    );
  });

  // Calculate income (excluding savings contributions)
  const totalIncome = monthTransactions
    .filter((t) => t.amount > 0 && t.source_type !== "savings")
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate expenses (only count portion NOT covered by savings)
  const totalExpenses = monthTransactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => {
      const amount = Math.abs(t.amount);
      const savingsUsed = t.savings_amount_used || 0;
      // Only count portion from income (not covered by savings)
      return sum + (amount - savingsUsed);
    }, 0);

  return totalIncome - totalExpenses;
}

/**
 * Calculates amount spent per category for a given set of transactions
 *
 * Only includes expense transactions (amount < 0).
 * Returns a map of category names to total spent amounts (absolute values).
 *
 * @param transactions - Transactions to analyze
 * @returns Object mapping category names to amounts spent
 *
 * @example
 * ```ts
 * const spent = calculateSpentByCategory([
 *   { category: 'Groceries', amount: -100 },
 *   { category: 'Groceries', amount: -50 },
 *   { category: 'Utilities', amount: -200 },
 *   { category: 'Income', amount: 5000 }  // Ignored (positive)
 * ]);
 * // Returns: { 'Groceries': 150, 'Utilities': 200 }
 * ```
 */
export function calculateSpentByCategory(
  transactions: Pick<Transaction, "category" | "amount">[]
): Record<string, number> {
  return transactions.reduce<Record<string, number>>((acc, t) => {
    if (t.amount < 0) {
      acc[t.category] = (acc[t.category] ?? 0) + Math.abs(t.amount);
    }
    return acc;
  }, {});
}

/**
 * Calculates total of savings balances
 *
 * @param savingsBalances - Object mapping category names to balance amounts
 * @returns Total of all savings balances
 *
 * @example
 * ```ts
 * const total = calculateTotalSavingsBalance({
 *   'Emergency Fund': 1000,
 *   'Vacation': 500,
 *   'Car Fund': 2000
 * });
 * // Returns: 3500
 * ```
 */
export function calculateTotalSavingsBalance(savingsBalances: Record<string, number>): number {
  return Object.values(savingsBalances).reduce((sum, b) => sum + b, 0);
}
