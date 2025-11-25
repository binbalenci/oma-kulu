/**
 * Report calculation utilities
 * Pure functions for calculating category spending and savings progress
 */

import type { Budget, Category, ExpectedSavings, Transaction } from "@/src/lib/types";
import { endOfMonth, startOfMonth } from "date-fns";

export interface CategorySpending {
  category: string;
  spent: number;
  budget?: number;
}

export interface SavingsProgress {
  category: string;
  balance: number;
  target?: number;
  monthlyContributions: number;
  monthlyPayments: number;
}

/**
 * Calculate spending per category for a given month
 * Only includes expense transactions (amount < 0)
 *
 * @param transactions - All transactions
 * @param currentMonth - Current month date
 * @returns Map of category names to spent amounts
 */
export function calculateSpentByCategory(
  transactions: Transaction[],
  currentMonth: Date
): Record<string, number> {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const monthTransactions = transactions.filter((t) => {
    const d = new Date(t.date + "T00:00:00");
    return d >= monthStart && d <= monthEnd;
  });

  return monthTransactions.reduce<Record<string, number>>((acc, t) => {
    if (t.amount < 0) {
      acc[t.category] = (acc[t.category] ?? 0) + Math.abs(t.amount);
    }
    return acc;
  }, {});
}

/**
 * Combine spending data with budgets for the current month
 *
 * @param spentByCategory - Map of category names to spent amounts
 * @param budgets - All budgets
 * @param monthKey - Current month key (yyyy-MM)
 * @returns Array of category spending with budget info, sorted by spent descending
 */
export function combineSpendingWithBudgets(
  spentByCategory: Record<string, number>,
  budgets: Budget[],
  monthKey: string
): CategorySpending[] {
  const currentBudgets = budgets.filter((b) => b.month === monthKey);

  return Object.entries(spentByCategory)
    .map(([category, spent]) => {
      const budget = currentBudgets.find((b) => b.category === category);
      return {
        category,
        spent,
        budget: budget?.allocated_amount,
      };
    })
    .sort((a, b) => b.spent - a.spent);
}

/**
 * Calculate savings progress for a category
 *
 * @param category - Category name
 * @param balance - Current balance
 * @param target - Target amount (optional)
 * @param transactions - All transactions
 * @param savings - Expected savings
 * @param monthKey - Current month key (yyyy-MM)
 * @returns Savings progress with contributions and payments
 */
export function calculateSavingsProgress(
  category: string,
  balance: number,
  target: number | undefined,
  transactions: Transaction[],
  savings: ExpectedSavings[],
  monthKey: string
): SavingsProgress {
  const currentMonthSavings = savings.filter(
    (s) => s.category === category && s.month === monthKey
  );
  const monthlyContributions = currentMonthSavings.reduce(
    (sum, s) => sum + s.amount,
    0
  );

  const monthlyPayments = transactions
    .filter(
      (t) =>
        t.uses_savings_category === category && (t.savings_amount_used || 0) > 0
    )
    .reduce((sum, t) => sum + (t.savings_amount_used || 0), 0);

  return {
    category,
    balance,
    target,
    monthlyContributions,
    monthlyPayments,
  };
}

/**
 * Get progress colors based on spending progress
 *
 * @param progress - Progress value (0-1+)
 * @returns Tuple of gradient colors
 */
export function getProgressColors(
  progress: number
): readonly [string, string] {
  if (progress <= 0.5)
    return ["rgba(34, 197, 94, 0.15)", "rgba(34, 197, 94, 0.08)"] as const; // green
  if (progress <= 0.75)
    return ["rgba(251, 191, 36, 0.15)", "rgba(251, 191, 36, 0.08)"] as const; // amber
  if (progress <= 1.0)
    return ["rgba(251, 146, 60, 0.15)", "rgba(251, 146, 60, 0.08)"] as const; // orange
  return ["rgba(239, 68, 68, 0.15)", "rgba(239, 68, 68, 0.08)"] as const; // red
}

/**
 * Filter inactive savings categories
 *
 * @param allCategories - All categories
 * @param activeSavingsCategories - Active savings category names
 * @returns Array of inactive savings categories
 */
export function filterInactiveSavingsCategories(
  allCategories: Category[],
  activeSavingsCategories: string[]
): Category[] {
  const allSavingsCategories = allCategories.filter((c) => c.type === "saving");
  return allSavingsCategories.filter(
    (cat) => !activeSavingsCategories.includes(cat.name)
  );
}
