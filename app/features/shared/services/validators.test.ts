/**
 * Tests for Validation Utilities Service
 *
 * Comprehensive test suite covering all validation functions with edge cases,
 * boundary conditions, and realistic scenarios.
 */

import {
  validateNotEmpty,
  validateCategoryName,
  validateAmount,
  validateBudgetAmount,
  validateTransactionAmount,
  parseAmount,
  validateDateString,
  validateMonthKey,
  validateEmail,
} from "./validators";

describe("validateNotEmpty", () => {
  it("should return true for non-empty strings", () => {
    expect(validateNotEmpty("Hello")).toBe(true);
    expect(validateNotEmpty("Test")).toBe(true);
    expect(validateNotEmpty("a")).toBe(true);
  });

  it("should return false for empty strings", () => {
    expect(validateNotEmpty("")).toBe(false);
  });

  it("should return false for whitespace-only strings", () => {
    expect(validateNotEmpty("   ")).toBe(false);
    expect(validateNotEmpty("\t")).toBe(false);
    expect(validateNotEmpty("\n")).toBe(false);
    expect(validateNotEmpty("  \t\n  ")).toBe(false);
  });

  it("should return true for strings with whitespace around content", () => {
    expect(validateNotEmpty("  Hello  ")).toBe(true);
    expect(validateNotEmpty("\tTest\n")).toBe(true);
  });
});

describe("validateCategoryName", () => {
  it("should validate correct category names", () => {
    expect(validateCategoryName("Groceries")).toEqual({ isValid: true });
    expect(validateCategoryName("Utilities")).toEqual({ isValid: true });
    expect(validateCategoryName("A")).toEqual({ isValid: true });
  });

  it("should reject empty category names", () => {
    const result = validateCategoryName("");
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Category name cannot be empty");
  });

  it("should reject whitespace-only category names", () => {
    const result = validateCategoryName("   ");
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Category name cannot be empty");
  });

  it("should accept category names with leading/trailing whitespace", () => {
    expect(validateCategoryName("  Groceries  ")).toEqual({ isValid: true });
  });
});

describe("validateAmount", () => {
  it("should validate positive numbers", () => {
    expect(validateAmount(100)).toBe(true);
    expect(validateAmount(0.01)).toBe(true);
    expect(validateAmount(9999999)).toBe(true);
  });

  it("should validate positive number strings", () => {
    expect(validateAmount("100")).toBe(true);
    expect(validateAmount("50.5")).toBe(true);
    expect(validateAmount("0.01")).toBe(true);
  });

  it("should reject zero", () => {
    expect(validateAmount(0)).toBe(false);
    expect(validateAmount("0")).toBe(false);
  });

  it("should reject negative numbers", () => {
    expect(validateAmount(-10)).toBe(false);
    expect(validateAmount("-50")).toBe(false);
  });

  it("should reject invalid strings", () => {
    expect(validateAmount("abc")).toBe(false);
    expect(validateAmount("")).toBe(false);
    expect(validateAmount("   ")).toBe(false);
  });

  it("should reject NaN", () => {
    expect(validateAmount(NaN)).toBe(false);
  });
});

describe("validateBudgetAmount", () => {
  it("should validate positive numbers", () => {
    expect(validateBudgetAmount(100)).toEqual({ isValid: true });
    expect(validateBudgetAmount(0.01)).toEqual({ isValid: true });
    expect(validateBudgetAmount("50.5")).toEqual({ isValid: true });
  });

  it("should reject zero with specific error", () => {
    const result = validateBudgetAmount(0);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Amount must be greater than 0");
  });

  it("should reject negative numbers with specific error", () => {
    const result = validateBudgetAmount(-50);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Amount must be greater than 0");
  });

  it("should reject invalid strings with specific error", () => {
    const result = validateBudgetAmount("abc");
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Amount must be a valid number");
  });

  it("should reject empty strings", () => {
    const result = validateBudgetAmount("");
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Amount must be a valid number");
  });

  it("should reject NaN", () => {
    const result = validateBudgetAmount(NaN);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Amount must be a valid number");
  });
});

describe("validateTransactionAmount", () => {
  it("should validate positive numbers (income)", () => {
    expect(validateTransactionAmount(100)).toEqual({ isValid: true });
    expect(validateTransactionAmount("50.5")).toEqual({ isValid: true });
  });

  it("should validate negative numbers (expenses)", () => {
    expect(validateTransactionAmount(-100)).toEqual({ isValid: true });
    expect(validateTransactionAmount("-50.5")).toEqual({ isValid: true });
  });

  it("should reject zero with specific error", () => {
    const result = validateTransactionAmount(0);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Amount cannot be 0");
  });

  it("should reject invalid strings", () => {
    const result = validateTransactionAmount("abc");
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Amount must be a valid number");
  });

  it("should reject empty strings", () => {
    const result = validateTransactionAmount("");
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Amount must be a valid number");
  });

  it("should reject NaN", () => {
    const result = validateTransactionAmount(NaN);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Amount must be a valid number");
  });
});

describe("parseAmount", () => {
  it("should parse standard decimal format", () => {
    expect(parseAmount("100")).toBe(100);
    expect(parseAmount("100.50")).toBe(100.5);
    expect(parseAmount("0.01")).toBe(0.01);
  });

  it("should parse European comma format", () => {
    expect(parseAmount("100,50")).toBe(100.5);
    expect(parseAmount("99,99")).toBe(99.99);
  });

  it("should handle negative amounts", () => {
    expect(parseAmount("-50")).toBe(-50);
    expect(parseAmount("-100.5")).toBe(-100.5);
    expect(parseAmount("-50,5")).toBe(-50.5);
  });

  it("should return NaN for invalid strings", () => {
    expect(isNaN(parseAmount("abc"))).toBe(true);
    expect(isNaN(parseAmount(""))).toBe(true);
  });

  it("should handle zero", () => {
    expect(parseAmount("0")).toBe(0);
    expect(parseAmount("0.0")).toBe(0);
  });

  it("should handle decimals with no leading zero", () => {
    expect(parseAmount(".5")).toBe(0.5);
    expect(parseAmount(",5")).toBe(0.5);
  });
});

describe("validateDateString", () => {
  it("should validate correct ISO date strings", () => {
    expect(validateDateString("2025-01-15")).toBe(true);
    expect(validateDateString("2025-12-31")).toBe(true);
    expect(validateDateString("2024-02-29")).toBe(true); // Leap year
  });

  it("should reject invalid date formats", () => {
    expect(validateDateString("01/15/2025")).toBe(false); // US format
    expect(validateDateString("15-01-2025")).toBe(false); // DD-MM-YYYY
    expect(validateDateString("2025/01/15")).toBe(false); // Slashes
  });

  it("should reject invalid dates", () => {
    expect(validateDateString("2025-13-01")).toBe(false); // Invalid month
    expect(validateDateString("2025-02-30")).toBe(false); // Invalid day
    expect(validateDateString("2023-02-29")).toBe(false); // Not a leap year
    expect(validateDateString("2025-00-15")).toBe(false); // Month 0
    expect(validateDateString("2025-01-32")).toBe(false); // Day 32
  });

  it("should reject malformed strings", () => {
    expect(validateDateString("abc")).toBe(false);
    expect(validateDateString("")).toBe(false);
    expect(validateDateString("2025-1-5")).toBe(false); // No padding
  });

  it("should handle edge cases", () => {
    expect(validateDateString("2025-01-01")).toBe(true); // First day of year
    expect(validateDateString("2025-12-31")).toBe(true); // Last day of year
  });
});

describe("validateMonthKey", () => {
  it("should validate correct month keys", () => {
    expect(validateMonthKey("2025-01")).toBe(true);
    expect(validateMonthKey("2025-12")).toBe(true);
    expect(validateMonthKey("2024-06")).toBe(true);
  });

  it("should reject invalid month values", () => {
    expect(validateMonthKey("2025-00")).toBe(false); // Month 0
    expect(validateMonthKey("2025-13")).toBe(false); // Month 13
  });

  it("should reject invalid formats", () => {
    expect(validateMonthKey("25-01")).toBe(false); // 2-digit year
    expect(validateMonthKey("2025-1")).toBe(false); // No padding
    expect(validateMonthKey("2025/01")).toBe(false); // Slash separator
  });

  it("should reject years outside reasonable range", () => {
    expect(validateMonthKey("1999-01")).toBe(false); // Too early
    expect(validateMonthKey("2101-01")).toBe(false); // Too late
  });

  it("should accept years within reasonable range", () => {
    expect(validateMonthKey("2000-01")).toBe(true); // Min year
    expect(validateMonthKey("2100-12")).toBe(true); // Max year
  });

  it("should reject malformed strings", () => {
    expect(validateMonthKey("abc")).toBe(false);
    expect(validateMonthKey("")).toBe(false);
    expect(validateMonthKey("2025")).toBe(false); // Missing month
  });
});

describe("validateEmail", () => {
  it("should validate correct email addresses", () => {
    expect(validateEmail("user@example.com")).toBe(true);
    expect(validateEmail("test@domain.co.uk")).toBe(true);
    expect(validateEmail("name.surname@company.org")).toBe(true);
  });

  it("should reject invalid email formats", () => {
    expect(validateEmail("invalid.email")).toBe(false); // No @
    expect(validateEmail("@example.com")).toBe(false); // No local part
    expect(validateEmail("user@")).toBe(false); // No domain
    expect(validateEmail("user @example.com")).toBe(false); // Space
  });

  it("should reject emails without TLD", () => {
    expect(validateEmail("user@domain")).toBe(false);
  });

  it("should reject empty strings", () => {
    expect(validateEmail("")).toBe(false);
  });

  it("should accept emails with subdomains", () => {
    expect(validateEmail("user@mail.example.com")).toBe(true);
  });

  it("should accept emails with plus signs", () => {
    expect(validateEmail("user+tag@example.com")).toBe(true);
  });

  it("should accept emails with numbers", () => {
    expect(validateEmail("user123@example456.com")).toBe(true);
  });
});
