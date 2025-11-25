import type { Transaction } from "@/src/lib/types";

/**
 * Sorts transactions by date (descending) and order_index (ascending)
 *
 * Primary sort: date DESC (newest first)
 * Secondary sort: order_index ASC (for same-date transactions)
 *
 * @param transactions - Array of transactions to sort
 * @returns Sorted array of transactions
 *
 * @feature transactions
 * @category helpers
 */
export function sortTransactionsByDateAndOrder(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort((a, b) => {
    // Sort by date first (descending - newest first)
    const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateCompare !== 0) return dateCompare;

    // Then by order_index (ascending - lower values first for same date)
    return (a.order_index ?? 0) - (b.order_index ?? 0);
  });
}

/**
 * Filters transactions by type (income or expense)
 *
 * @param transactions - Array of transactions to filter
 * @param isIncome - If true, returns only income (amount > 0), else expenses (amount < 0)
 * @returns Filtered array of transactions
 *
 * @feature transactions
 * @category helpers
 */
export function filterTransactionsByType(transactions: Transaction[], isIncome: boolean): Transaction[] {
  return transactions.filter((t) => (isIncome ? t.amount > 0 : t.amount < 0));
}

/**
 * Calculates the maximum order_index for transactions on a specific date
 *
 * Used when creating new transactions to append them to the end of same-date list
 *
 * @param transactions - Array of transactions to search
 * @param date - Date to filter by (yyyy-MM-dd format)
 * @returns Maximum order_index for that date, or -1 if no transactions on that date
 *
 * @feature transactions
 * @category helpers
 */
export function getMaxOrderIndexForDate(transactions: Transaction[], date: string): number {
  const sameDateTransactions = transactions.filter((t) => t.date === date);
  return sameDateTransactions.reduce((max, t) => Math.max(max, t.order_index ?? -1), -1);
}

/**
 * Checks if two transactions are on the same date
 *
 * @param t1 - First transaction
 * @param t2 - Second transaction
 * @returns True if both transactions have the same date
 *
 * @feature transactions
 * @category helpers
 */
export function hasSameDate(t1: Transaction, t2: Transaction): boolean {
  return t1.date === t2.date;
}
