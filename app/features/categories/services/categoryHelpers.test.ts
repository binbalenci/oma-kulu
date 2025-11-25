/**
 * @jest-environment jsdom
 */

import type { Category } from "@/app/lib/types";
import {
  filterCategoriesByQuery,
  getNextOrderIndex,
  groupCategoriesByType,
  isDuplicateCategory,
  validateCategoryName,
} from "./categoryHelpers";

describe("categoryHelpers", () => {
  const mockCategories: Category[] = [
    {
      id: "1",
      name: "Groceries",
      type: "expense",
      color: "#FF0000",
      emoji: "🛒",
      order_index: 0,
      is_visible: true,
    },
    {
      id: "2",
      name: "Salary",
      type: "income",
      color: "#00FF00",
      emoji: "💰",
      order_index: 0,
      is_visible: true,
    },
    {
      id: "3",
      name: "Transport",
      type: "expense",
      color: "#0000FF",
      emoji: "🚗",
      order_index: 1,
      is_visible: true,
    },
    {
      id: "4",
      name: "Emergency Fund",
      type: "saving",
      color: "#FFFF00",
      emoji: "🏦",
      order_index: 0,
      is_visible: true,
    },
  ];

  describe("filterCategoriesByQuery", () => {
    it("should return all categories when query is empty", () => {
      const result = filterCategoriesByQuery(mockCategories, "");
      expect(result).toHaveLength(4);
    });

    it("should filter categories by name (case-insensitive)", () => {
      const result = filterCategoriesByQuery(mockCategories, "groc");
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Groceries");
    });

    it("should handle uppercase queries", () => {
      const result = filterCategoriesByQuery(mockCategories, "SALARY");
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Salary");
    });

    it("should return empty array when no matches", () => {
      const result = filterCategoriesByQuery(mockCategories, "xyz");
      expect(result).toHaveLength(0);
    });

    it("should match partial names", () => {
      const result = filterCategoriesByQuery(mockCategories, "er");
      expect(result.length).toBeGreaterThan(0);
      expect(result.some((c) => c.name === "Groceries")).toBe(true);
    });
  });

  describe("groupCategoriesByType", () => {
    it("should group categories by type", () => {
      const result = groupCategoriesByType(mockCategories);

      expect(result.income).toHaveLength(1);
      expect(result.expense).toHaveLength(2);
      expect(result.saving).toHaveLength(1);
    });

    it("should sort categories by order_index", () => {
      const result = groupCategoriesByType(mockCategories);

      expect(result.expense[0].name).toBe("Groceries"); // order_index: 0
      expect(result.expense[1].name).toBe("Transport"); // order_index: 1
    });

    it("should filter and group when query provided", () => {
      const result = groupCategoriesByType(mockCategories, "a");

      // Should match "Salary" and "Transport" (both contain 'a')
      expect(result.income.some((c) => c.name === "Salary")).toBe(true);
      expect(result.expense.some((c) => c.name === "Transport")).toBe(true);
      // Groceries doesn't contain 'a', so should not be in expense results
      expect(result.expense.every((c) => c.name.toLowerCase().includes("a"))).toBe(true);
    });

    it("should handle empty categories array", () => {
      const result = groupCategoriesByType([]);

      expect(result.income).toHaveLength(0);
      expect(result.expense).toHaveLength(0);
      expect(result.saving).toHaveLength(0);
    });
  });

  describe("validateCategoryName", () => {
    it("should return true for valid names", () => {
      expect(validateCategoryName("Groceries")).toBe(true);
      expect(validateCategoryName("A")).toBe(true);
      expect(validateCategoryName("  Valid Name  ")).toBe(true);
    });

    it("should return false for empty or whitespace-only names", () => {
      expect(validateCategoryName("")).toBe(false);
      expect(validateCategoryName("   ")).toBe(false);
      expect(validateCategoryName("\t\n")).toBe(false);
    });
  });

  describe("isDuplicateCategory", () => {
    it("should return true for duplicate name and type", () => {
      const result = isDuplicateCategory(
        "Groceries",
        "expense",
        mockCategories
      );
      expect(result).toBe(true);
    });

    it("should return false for same name but different type", () => {
      const result = isDuplicateCategory(
        "Groceries",
        "income",
        mockCategories
      );
      expect(result).toBe(false);
    });

    it("should be case-insensitive", () => {
      const result = isDuplicateCategory(
        "GROCERIES",
        "expense",
        mockCategories
      );
      expect(result).toBe(true);
    });

    it("should exclude specified ID", () => {
      const result = isDuplicateCategory(
        "Groceries",
        "expense",
        mockCategories,
        "1"
      );
      expect(result).toBe(false);
    });

    it("should return false for unique names", () => {
      const result = isDuplicateCategory(
        "New Category",
        "expense",
        mockCategories
      );
      expect(result).toBe(false);
    });
  });

  describe("getNextOrderIndex", () => {
    it("should return 0 for empty categories", () => {
      const result = getNextOrderIndex([]);
      expect(result).toBe(0);
    });

    it("should return max order_index + 1", () => {
      const result = getNextOrderIndex(mockCategories);
      // Max order_index is 1, so next should be 2
      expect(result).toBe(2);
    });

    it("should handle categories with undefined order_index", () => {
      const categoriesWithUndefined: Category[] = [
        {
          id: "1",
          name: "Test",
          type: "expense",
          color: "#000",
          emoji: "📁",
          is_visible: true,
        },
      ];

      const result = getNextOrderIndex(categoriesWithUndefined);
      expect(result).toBe(1);
    });

    it("should handle mix of defined and undefined order_index", () => {
      const mixedCategories: Category[] = [
        ...mockCategories,
        {
          id: "5",
          name: "No Index",
          type: "expense",
          color: "#000",
          emoji: "📁",
          is_visible: true,
        },
      ];

      const result = getNextOrderIndex(mixedCategories);
      expect(result).toBe(2); // Max is still 1
    });
  });
});
