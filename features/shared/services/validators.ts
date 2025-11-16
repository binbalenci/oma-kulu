/**
 * Validation Utilities Service
 *
 * Pure functions for validating user input across the application.
 * All functions return boolean values or validation results.
 *
 * @module features/shared/services/validators
 */

/**
 * Validation result type for detailed validation feedback
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates that a string is not empty after trimming whitespace
 *
 * @param value - The string to validate
 * @returns true if string has content, false if empty/whitespace-only
 *
 * @example
 * ```ts
 * validateNotEmpty('Hello')      // true
 * validateNotEmpty('   ')        // false
 * validateNotEmpty('')           // false
 * validateNotEmpty('  Hi  ')     // true (trims to 'Hi')
 * ```
 */
export function validateNotEmpty(value: string): boolean {
  return value.trim().length > 0;
}

/**
 * Validates that a category name is valid
 *
 * Category names must be non-empty after trimming.
 *
 * @param name - The category name to validate
 * @returns Validation result with error message if invalid
 *
 * @example
 * ```ts
 * validateCategoryName('Groceries')  // { isValid: true }
 * validateCategoryName('   ')        // { isValid: false, error: 'Category name cannot be empty' }
 * validateCategoryName('')           // { isValid: false, error: 'Category name cannot be empty' }
 * ```
 */
export function validateCategoryName(name: string): ValidationResult {
  if (!validateNotEmpty(name)) {
    return {
      isValid: false,
      error: "Category name cannot be empty",
    };
  }

  return { isValid: true };
}

/**
 * Validates that an amount is a valid positive number
 *
 * @param amount - The amount to validate (number or string)
 * @returns true if amount is a positive number, false otherwise
 *
 * @example
 * ```ts
 * validateAmount(100)        // true
 * validateAmount('50.5')     // true
 * validateAmount(0)          // false (must be positive)
 * validateAmount(-10)        // false (must be positive)
 * validateAmount('abc')      // false (not a number)
 * validateAmount('')         // false
 * ```
 */
export function validateAmount(amount: number | string): boolean {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  return !isNaN(numAmount) && numAmount > 0;
}

/**
 * Validates a budget amount with detailed error messages
 *
 * Budget amounts must be positive numbers.
 *
 * @param amount - The amount to validate
 * @returns Validation result with error message if invalid
 *
 * @example
 * ```ts
 * validateBudgetAmount(100)     // { isValid: true }
 * validateBudgetAmount(0)       // { isValid: false, error: 'Amount must be greater than 0' }
 * validateBudgetAmount(-50)     // { isValid: false, error: 'Amount must be greater than 0' }
 * validateBudgetAmount('abc')   // { isValid: false, error: 'Amount must be a valid number' }
 * ```
 */
export function validateBudgetAmount(amount: number | string): ValidationResult {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return {
      isValid: false,
      error: "Amount must be a valid number",
    };
  }

  if (numAmount <= 0) {
    return {
      isValid: false,
      error: "Amount must be greater than 0",
    };
  }

  return { isValid: true };
}

/**
 * Validates a transaction amount (can be positive or negative)
 *
 * Transaction amounts must be valid numbers but can be positive (income)
 * or negative (expense).
 *
 * @param amount - The amount to validate
 * @returns Validation result with error message if invalid
 *
 * @example
 * ```ts
 * validateTransactionAmount(100)      // { isValid: true }
 * validateTransactionAmount(-50)      // { isValid: true }
 * validateTransactionAmount(0)        // { isValid: false, error: 'Amount cannot be 0' }
 * validateTransactionAmount('abc')    // { isValid: false, error: 'Amount must be a valid number' }
 * ```
 */
export function validateTransactionAmount(amount: number | string): ValidationResult {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return {
      isValid: false,
      error: "Amount must be a valid number",
    };
  }

  if (numAmount === 0) {
    return {
      isValid: false,
      error: "Amount cannot be 0",
    };
  }

  return { isValid: true };
}

/**
 * Parses an amount string, handling comma as decimal separator
 *
 * Supports both comma and period as decimal separators.
 *
 * @param amountString - The amount string to parse
 * @returns Parsed number, or NaN if invalid
 *
 * @example
 * ```ts
 * parseAmount('100')        // 100
 * parseAmount('100.50')     // 100.5
 * parseAmount('100,50')     // 100.5 (European format)
 * parseAmount('abc')        // NaN
 * ```
 */
export function parseAmount(amountString: string): number {
  // Replace comma with period for European decimal format
  return parseFloat(amountString.replace(",", "."));
}

/**
 * Validates a date string in ISO format (YYYY-MM-DD)
 *
 * @param dateString - The date string to validate
 * @returns true if date is valid ISO format, false otherwise
 *
 * @example
 * ```ts
 * validateDateString('2025-01-15')   // true
 * validateDateString('2025-13-01')   // false (invalid month)
 * validateDateString('abc')          // false
 * validateDateString('01/15/2025')   // false (wrong format)
 * ```
 */
export function validateDateString(dateString: string): boolean {
  // Check basic format YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return false;
  }

  const [year, month, day] = dateString.split("-").map(Number);

  // Validate month range (1-12)
  if (month < 1 || month > 12) {
    return false;
  }

  // Validate day range (1-31)
  if (day < 1 || day > 31) {
    return false;
  }

  // Check if it's a valid date (will detect Feb 30, etc.)
  const date = new Date(dateString + "T00:00:00");
  if (isNaN(date.getTime())) {
    return false;
  }

  // Verify the date components match (JavaScript Date is lenient)
  return (
    date.getFullYear() === year &&
    date.getMonth() + 1 === month &&
    date.getDate() === day
  );
}

/**
 * Validates a month key string (YYYY-MM)
 *
 * @param monthKey - The month key to validate
 * @returns true if month key is valid format, false otherwise
 *
 * @example
 * ```ts
 * validateMonthKey('2025-01')   // true
 * validateMonthKey('2025-12')   // true
 * validateMonthKey('2025-13')   // false (invalid month)
 * validateMonthKey('25-01')     // false (wrong format)
 * ```
 */
export function validateMonthKey(monthKey: string): boolean {
  // Check basic format YYYY-MM
  const monthKeyRegex = /^\d{4}-\d{2}$/;
  if (!monthKeyRegex.test(monthKey)) {
    return false;
  }

  const [year, month] = monthKey.split("-").map(Number);

  // Validate month range (1-12)
  if (month < 1 || month > 12) {
    return false;
  }

  // Validate year (reasonable range: 2000-2100)
  if (year < 2000 || year > 2100) {
    return false;
  }

  return true;
}

/**
 * Validates an email address (basic validation)
 *
 * @param email - The email address to validate
 * @returns true if email format is valid, false otherwise
 *
 * @example
 * ```ts
 * validateEmail('user@example.com')     // true
 * validateEmail('user@domain.co.uk')    // true
 * validateEmail('invalid.email')        // false
 * validateEmail('@example.com')         // false
 * ```
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
