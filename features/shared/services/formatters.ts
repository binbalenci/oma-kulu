/**
 * Formatting Utilities Service
 *
 * Pure functions for formatting currency, dates, and other display values.
 * All functions are stateless and side-effect free.
 *
 * @module features/shared/services/formatters
 */

import { format as dateFnsFormat } from "date-fns";

/**
 * Formats a number as currency with Euro symbol
 *
 * @param amount - The amount to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted currency string (e.g., "€123.4")
 *
 * @example
 * ```ts
 * formatCurrency(123.456)        // "€123.5"
 * formatCurrency(123.456, 2)     // "€123.46"
 * formatCurrency(-50)            // "-€50.0"
 * formatCurrency(0)              // "€0.0"
 * ```
 */
export function formatCurrency(amount: number, decimals: number = 1): string {
  const sign = amount < 0 ? "-" : "";
  const absAmount = Math.abs(amount);
  return `${sign}€${absAmount.toFixed(decimals)}`;
}

/**
 * Formats a date using date-fns format patterns
 *
 * @param date - Date to format (Date object or ISO string)
 * @param formatString - date-fns format pattern (default: "MMM dd, yyyy")
 * @returns Formatted date string
 *
 * @example
 * ```ts
 * formatDate(new Date('2025-01-15'))              // "Jan 15, 2025"
 * formatDate('2025-01-15', 'yyyy-MM-dd')          // "2025-01-15"
 * formatDate(new Date('2025-01-15'), 'MMM dd')    // "Jan 15"
 * ```
 */
export function formatDate(date: Date | string, formatString: string = "MMM dd, yyyy"): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateFnsFormat(dateObj, formatString);
}

/**
 * Formats a month key (YYYY-MM) as a human-readable month name and year
 *
 * @param monthKey - Month key in YYYY-MM format
 * @returns Formatted month string (e.g., "January 2025")
 *
 * @example
 * ```ts
 * formatMonthKey('2025-01')  // "January 2025"
 * formatMonthKey('2025-12')  // "December 2025"
 * ```
 */
export function formatMonthKey(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return dateFnsFormat(date, "MMMM yyyy");
}

/**
 * Formats a number as a string with fixed decimal places
 *
 * Useful for input fields where you need consistent decimal formatting.
 *
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted number string
 *
 * @example
 * ```ts
 * formatDecimal(123.456)        // "123.46"
 * formatDecimal(123.456, 1)     // "123.5"
 * formatDecimal(100, 2)         // "100.00"
 * ```
 */
export function formatDecimal(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}

/**
 * Formats a transaction amount with proper sign and currency
 *
 * Positive amounts are income (no sign), negative amounts are expenses (with minus sign).
 *
 * @param amount - The transaction amount (positive or negative)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted amount with sign and currency
 *
 * @example
 * ```ts
 * formatTransactionAmount(100)     // "€100.0"
 * formatTransactionAmount(-50)     // "-€50.0"
 * formatTransactionAmount(0)       // "€0.0"
 * ```
 */
export function formatTransactionAmount(amount: number, decimals: number = 1): string {
  return formatCurrency(amount, decimals);
}

/**
 * Parses a currency string back to a number
 *
 * Removes currency symbols and parses the numeric value.
 *
 * @param currencyString - Currency string to parse (e.g., "€123.45" or "-€50.0")
 * @returns Parsed number value
 *
 * @example
 * ```ts
 * parseCurrency('€123.45')    // 123.45
 * parseCurrency('-€50.0')     // -50
 * parseCurrency('100')        // 100
 * ```
 */
export function parseCurrency(currencyString: string): number {
  // Remove currency symbols and spaces, then parse
  const cleaned = currencyString.replace(/[€$,\s]/g, "");
  return parseFloat(cleaned) || 0;
}
