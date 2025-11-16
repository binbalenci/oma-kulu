/**
 * Tests for Formatting Utilities Service
 *
 * Comprehensive test suite covering all formatting functions with edge cases,
 * boundary conditions, and realistic scenarios.
 */

import {
  formatCurrency,
  formatDate,
  formatMonthKey,
  formatDecimal,
  formatTransactionAmount,
  parseCurrency,
} from "./formatters";

describe("formatCurrency", () => {
  it("should format positive numbers with default decimals (1)", () => {
    expect(formatCurrency(123.456)).toBe("€123.5");
    expect(formatCurrency(100)).toBe("€100.0");
    expect(formatCurrency(0.5)).toBe("€0.5");
  });

  it("should format negative numbers with minus sign", () => {
    expect(formatCurrency(-50)).toBe("-€50.0");
    expect(formatCurrency(-123.456)).toBe("-€123.5");
  });

  it("should handle zero", () => {
    expect(formatCurrency(0)).toBe("€0.0");
  });

  it("should format with custom decimal places", () => {
    expect(formatCurrency(123.456, 2)).toBe("€123.46");
    expect(formatCurrency(123.456, 0)).toBe("€123");
    expect(formatCurrency(123.456, 3)).toBe("€123.456");
  });

  it("should round correctly", () => {
    expect(formatCurrency(123.45, 1)).toBe("€123.5");
    expect(formatCurrency(123.44, 1)).toBe("€123.4");
    expect(formatCurrency(123.95, 1)).toBe("€124.0");
  });

  it("should handle large numbers", () => {
    expect(formatCurrency(1000000)).toBe("€1000000.0");
    expect(formatCurrency(9999999.99, 2)).toBe("€9999999.99");
  });

  it("should handle very small numbers", () => {
    expect(formatCurrency(0.01, 2)).toBe("€0.01");
    expect(formatCurrency(0.001, 3)).toBe("€0.001");
  });

  it("should handle negative zero", () => {
    expect(formatCurrency(-0)).toBe("€0.0");
  });
});

describe("formatDate", () => {
  it("should format Date objects with default format", () => {
    const date = new Date("2025-01-15T00:00:00");
    expect(formatDate(date)).toBe("Jan 15, 2025");
  });

  it("should format ISO date strings", () => {
    expect(formatDate("2025-01-15")).toBe("Jan 15, 2025");
  });

  it("should support custom format patterns", () => {
    const date = new Date("2025-01-15T00:00:00");
    expect(formatDate(date, "yyyy-MM-dd")).toBe("2025-01-15");
    expect(formatDate(date, "MMM dd")).toBe("Jan 15");
    expect(formatDate(date, "MMMM yyyy")).toBe("January 2025");
    expect(formatDate(date, "dd/MM/yyyy")).toBe("15/01/2025");
  });

  it("should handle different months", () => {
    expect(formatDate("2025-12-25", "MMM dd, yyyy")).toBe("Dec 25, 2025");
    expect(formatDate("2025-06-01", "MMMM yyyy")).toBe("June 2025");
  });

  it("should handle leap year dates", () => {
    expect(formatDate("2024-02-29", "MMM dd, yyyy")).toBe("Feb 29, 2024");
  });

  it("should handle first and last day of year", () => {
    expect(formatDate("2025-01-01", "MMM dd, yyyy")).toBe("Jan 01, 2025");
    expect(formatDate("2025-12-31", "MMM dd, yyyy")).toBe("Dec 31, 2025");
  });
});

describe("formatMonthKey", () => {
  it("should format month keys as full month name and year", () => {
    expect(formatMonthKey("2025-01")).toBe("January 2025");
    expect(formatMonthKey("2025-12")).toBe("December 2025");
  });

  it("should handle all months", () => {
    expect(formatMonthKey("2025-01")).toBe("January 2025");
    expect(formatMonthKey("2025-02")).toBe("February 2025");
    expect(formatMonthKey("2025-03")).toBe("March 2025");
    expect(formatMonthKey("2025-04")).toBe("April 2025");
    expect(formatMonthKey("2025-05")).toBe("May 2025");
    expect(formatMonthKey("2025-06")).toBe("June 2025");
    expect(formatMonthKey("2025-07")).toBe("July 2025");
    expect(formatMonthKey("2025-08")).toBe("August 2025");
    expect(formatMonthKey("2025-09")).toBe("September 2025");
    expect(formatMonthKey("2025-10")).toBe("October 2025");
    expect(formatMonthKey("2025-11")).toBe("November 2025");
    expect(formatMonthKey("2025-12")).toBe("December 2025");
  });

  it("should handle different years", () => {
    expect(formatMonthKey("2024-06")).toBe("June 2024");
    expect(formatMonthKey("2026-03")).toBe("March 2026");
  });
});

describe("formatDecimal", () => {
  it("should format with default 2 decimal places", () => {
    expect(formatDecimal(123.456)).toBe("123.46");
    expect(formatDecimal(100)).toBe("100.00");
  });

  it("should format with custom decimal places", () => {
    expect(formatDecimal(123.456, 1)).toBe("123.5");
    expect(formatDecimal(123.456, 0)).toBe("123");
    expect(formatDecimal(123.456, 3)).toBe("123.456");
  });

  it("should handle zero", () => {
    expect(formatDecimal(0)).toBe("0.00");
    expect(formatDecimal(0, 1)).toBe("0.0");
  });

  it("should handle negative numbers", () => {
    expect(formatDecimal(-50.5)).toBe("-50.50");
    expect(formatDecimal(-123.456, 1)).toBe("-123.5");
  });

  it("should round correctly", () => {
    // JavaScript toFixed rounding behavior
    expect(formatDecimal(123.446, 2)).toBe("123.45");
    expect(formatDecimal(123.454, 2)).toBe("123.45");
    expect(formatDecimal(123.456, 2)).toBe("123.46");
  });

  it("should pad with zeros", () => {
    expect(formatDecimal(5, 2)).toBe("5.00");
    expect(formatDecimal(5.1, 2)).toBe("5.10");
  });
});

describe("formatTransactionAmount", () => {
  it("should format positive amounts (income)", () => {
    expect(formatTransactionAmount(100)).toBe("€100.0");
    expect(formatTransactionAmount(50.5)).toBe("€50.5");
  });

  it("should format negative amounts (expenses) with minus sign", () => {
    expect(formatTransactionAmount(-100)).toBe("-€100.0");
    expect(formatTransactionAmount(-50.5)).toBe("-€50.5");
  });

  it("should handle zero", () => {
    expect(formatTransactionAmount(0)).toBe("€0.0");
  });

  it("should support custom decimal places", () => {
    expect(formatTransactionAmount(123.456, 2)).toBe("€123.46");
    expect(formatTransactionAmount(-50.95, 2)).toBe("-€50.95");
  });

  it("should round correctly for display", () => {
    expect(formatTransactionAmount(123.45, 1)).toBe("€123.5");
    expect(formatTransactionAmount(-99.94, 1)).toBe("-€99.9");
  });
});

describe("parseCurrency", () => {
  it("should parse currency strings with Euro symbol", () => {
    expect(parseCurrency("€123.45")).toBe(123.45);
    expect(parseCurrency("€100")).toBe(100);
    expect(parseCurrency("€0.5")).toBe(0.5);
  });

  it("should parse negative amounts", () => {
    expect(parseCurrency("-€50.0")).toBe(-50);
    expect(parseCurrency("-€123.45")).toBe(-123.45);
  });

  it("should parse plain numbers without symbols", () => {
    expect(parseCurrency("123.45")).toBe(123.45);
    expect(parseCurrency("100")).toBe(100);
  });

  it("should handle dollar signs", () => {
    expect(parseCurrency("$123.45")).toBe(123.45);
    expect(parseCurrency("$100")).toBe(100);
  });

  it("should remove commas (thousands separators)", () => {
    expect(parseCurrency("€1,234.56")).toBe(1234.56);
    expect(parseCurrency("$10,000")).toBe(10000);
  });

  it("should handle spaces", () => {
    expect(parseCurrency("€ 123.45")).toBe(123.45);
    expect(parseCurrency("€123 .45")).toBe(123.45);
  });

  it("should return 0 for invalid strings", () => {
    expect(parseCurrency("")).toBe(0);
    expect(parseCurrency("abc")).toBe(0);
    expect(parseCurrency("€€€")).toBe(0);
  });

  it("should handle zero", () => {
    expect(parseCurrency("€0")).toBe(0);
    expect(parseCurrency("0")).toBe(0);
  });

  it("should parse decimals correctly", () => {
    expect(parseCurrency("€0.01")).toBe(0.01);
    expect(parseCurrency("€999.99")).toBe(999.99);
  });
});
