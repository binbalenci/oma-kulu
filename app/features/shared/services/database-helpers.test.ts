/**
 * Database Helper Utilities Tests
 *
 * Comprehensive test suite for database helper functions.
 * Tests category resolution, mapping utilities, and error handling.
 */

import {
  getCategoryNameById,
  getCategoryIdByName,
  createCategoryIdToNameMap,
  createCategoryNameToObjectMap,
  resolveCategoryName,
  resolveCategoryId,
  categoryExists,
  batchResolveCategoryIds,
} from "./database-helpers";
import { supabase } from "@/app/lib/supabase";
import type { Category } from "@/app/lib/types";

// Mock the supabase client
jest.mock("@/app/lib/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe("database-helpers", () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getCategoryNameById", () => {
    it("should return category name when found", async () => {
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { name: "Groceries" },
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock) = mockFrom;

      const result = await getCategoryNameById("uuid-123");
      expect(result).toBe("Groceries");
      expect(mockFrom).toHaveBeenCalledWith("categories");
    });

    it("should return null when category not found", async () => {
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: "Not found" },
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock) = mockFrom;

      const result = await getCategoryNameById("uuid-nonexistent");
      expect(result).toBeNull();
    });

    it("should return null when database returns error", async () => {
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: "Database error" },
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock) = mockFrom;

      const result = await getCategoryNameById("uuid-error");
      expect(result).toBeNull();
    });

    it("should handle exceptions gracefully", async () => {
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockRejectedValue(new Error("Network error")),
          }),
        }),
      });

      (supabase.from as jest.Mock) = mockFrom;

      const result = await getCategoryNameById("uuid-exception");
      expect(result).toBeNull();
    });
  });

  describe("getCategoryIdByName", () => {
    it("should return category ID when found by name and type", async () => {
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { id: "uuid-123" },
                error: null,
              }),
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock) = mockFrom;

      const result = await getCategoryIdByName("Groceries", "expense");
      expect(result).toBe("uuid-123");
    });

    it("should return null when category not found", async () => {
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: "Not found" },
              }),
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock) = mockFrom;

      const result = await getCategoryIdByName("Nonexistent", "expense");
      expect(result).toBeNull();
    });

    it("should handle database errors gracefully", async () => {
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: "Database error" },
              }),
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock) = mockFrom;

      const result = await getCategoryIdByName("Test", "income");
      expect(result).toBeNull();
    });

    it("should handle exceptions gracefully", async () => {
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockRejectedValue(new Error("Network error")),
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock) = mockFrom;

      const result = await getCategoryIdByName("Test", "saving");
      expect(result).toBeNull();
    });
  });

  describe("createCategoryIdToNameMap", () => {
    it("should create map of category IDs to names", async () => {
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [
              { id: "uuid-1", name: "Groceries" },
              { id: "uuid-2", name: "Salary" },
              { id: "uuid-3", name: "Emergency Fund" },
            ],
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock) = mockFrom;

      const map = await createCategoryIdToNameMap();
      expect(map.size).toBe(3);
      expect(map.get("uuid-1")).toBe("Groceries");
      expect(map.get("uuid-2")).toBe("Salary");
      expect(map.get("uuid-3")).toBe("Emergency Fund");
    });

    it("should return empty map when no categories found", async () => {
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock) = mockFrom;

      const map = await createCategoryIdToNameMap();
      expect(map.size).toBe(0);
    });

    it("should return empty map on database error", async () => {
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: { message: "Database error" },
          }),
        }),
      });

      (supabase.from as jest.Mock) = mockFrom;

      const map = await createCategoryIdToNameMap();
      expect(map.size).toBe(0);
    });

    it("should handle exceptions gracefully", async () => {
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockRejectedValue(new Error("Network error")),
        }),
      });

      (supabase.from as jest.Mock) = mockFrom;

      const map = await createCategoryIdToNameMap();
      expect(map.size).toBe(0);
    });
  });

  describe("createCategoryNameToObjectMap", () => {
    const mockCategories: Category[] = [
      {
        id: "uuid-1",
        name: "Groceries",
        type: "expense",
        emoji: "🛒",
        color: "#ff0000",
        is_visible: true,
        order_index: 0,
      },
      {
        id: "uuid-2",
        name: "Salary",
        type: "income",
        emoji: "💰",
        color: "#00ff00",
        is_visible: true,
        order_index: 1,
      },
    ];

    it("should create map of category names to objects", async () => {
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: mockCategories,
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock) = mockFrom;

      const map = await createCategoryNameToObjectMap();
      expect(map.size).toBe(2);

      const groceries = map.get("Groceries");
      expect(groceries).toBeDefined();
      expect(groceries?.id).toBe("uuid-1");
      expect(groceries?.type).toBe("expense");
      expect(groceries?.emoji).toBe("🛒");

      const salary = map.get("Salary");
      expect(salary).toBeDefined();
      expect(salary?.id).toBe("uuid-2");
      expect(salary?.type).toBe("income");
    });

    it("should return empty map when no categories found", async () => {
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock) = mockFrom;

      const map = await createCategoryNameToObjectMap();
      expect(map.size).toBe(0);
    });

    it("should return empty map on database error", async () => {
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: { message: "Database error" },
          }),
        }),
      });

      (supabase.from as jest.Mock) = mockFrom;

      const map = await createCategoryNameToObjectMap();
      expect(map.size).toBe(0);
    });

    it("should handle exceptions gracefully", async () => {
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockRejectedValue(new Error("Network error")),
        }),
      });

      (supabase.from as jest.Mock) = mockFrom;

      const map = await createCategoryNameToObjectMap();
      expect(map.size).toBe(0);
    });
  });

  describe("resolveCategoryName", () => {
    it("should resolve category name from category_id using map", () => {
      const categoryMap = new Map([
        ["uuid-1", "Groceries"],
        ["uuid-2", "Salary"],
      ]);

      const item = { category_id: "uuid-1", category: "Old Name" };
      const name = resolveCategoryName(item, categoryMap);
      expect(name).toBe("Groceries");
    });

    it("should use fallback category name when ID not in map", () => {
      const categoryMap = new Map([["uuid-1", "Groceries"]]);

      const item = { category_id: "uuid-unknown", category: "Fallback Name" };
      const name = resolveCategoryName(item, categoryMap);
      expect(name).toBe("Fallback Name");
    });

    it("should return empty string when neither ID nor name available", () => {
      const categoryMap = new Map([["uuid-1", "Groceries"]]);

      const item = { category_id: "uuid-unknown" };
      const name = resolveCategoryName(item, categoryMap);
      expect(name).toBe("");
    });

    it("should use category name when no category_id present", () => {
      const categoryMap = new Map([["uuid-1", "Groceries"]]);

      const item = { category: "Direct Name" };
      const name = resolveCategoryName(item, categoryMap);
      expect(name).toBe("Direct Name");
    });

    it("should handle null category_id", () => {
      const categoryMap = new Map([["uuid-1", "Groceries"]]);

      const item = { category_id: null, category: "Name" };
      const name = resolveCategoryName(item, categoryMap);
      expect(name).toBe("Name");
    });
  });

  describe("resolveCategoryId", () => {
    it("should resolve category ID successfully", async () => {
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { id: "uuid-123" },
                error: null,
              }),
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock) = mockFrom;

      const result = await resolveCategoryId("Groceries", "expense");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.categoryId).toBe("uuid-123");
      }
    });

    it("should return error when category name is undefined", async () => {
      const result = await resolveCategoryId(undefined, "expense");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Category name is required");
      }
    });

    it("should return error when category not found", async () => {
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: "Not found" },
              }),
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock) = mockFrom;

      const result = await resolveCategoryId("Nonexistent", "expense");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("not found");
        expect(result.error).toContain("Nonexistent");
        expect(result.error).toContain("expense");
      }
    });
  });

  describe("categoryExists", () => {
    it("should return true when category exists", async () => {
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { id: "uuid-123" },
                error: null,
              }),
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock) = mockFrom;

      const exists = await categoryExists("Groceries", "expense");
      expect(exists).toBe(true);
    });

    it("should return false when category does not exist", async () => {
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: "Not found" },
              }),
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock) = mockFrom;

      const exists = await categoryExists("Nonexistent", "expense");
      expect(exists).toBe(false);
    });

    it("should return false on database error", async () => {
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockRejectedValue(new Error("Database error")),
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock) = mockFrom;

      const exists = await categoryExists("Test", "income");
      expect(exists).toBe(false);
    });
  });

  describe("batchResolveCategoryIds", () => {
    it("should resolve multiple category IDs at once", async () => {
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({
              data: [
                { id: "uuid-1", name: "Groceries" },
                { id: "uuid-2", name: "Rent" },
              ],
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock) = mockFrom;

      const map = await batchResolveCategoryIds(
        ["Groceries", "Rent"],
        "expense"
      );
      expect(map.size).toBe(2);
      expect(map.get("Groceries")).toBe("uuid-1");
      expect(map.get("Rent")).toBe("uuid-2");
    });

    it("should return empty map for empty input", async () => {
      const map = await batchResolveCategoryIds([], "expense");
      expect(map.size).toBe(0);
    });

    it("should only include found categories in result", async () => {
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({
              data: [{ id: "uuid-1", name: "Groceries" }],
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock) = mockFrom;

      const map = await batchResolveCategoryIds(
        ["Groceries", "Nonexistent"],
        "expense"
      );
      expect(map.size).toBe(1);
      expect(map.get("Groceries")).toBe("uuid-1");
      expect(map.has("Nonexistent")).toBe(false);
    });

    it("should return empty map on database error", async () => {
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({
              data: null,
              error: { message: "Database error" },
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock) = mockFrom;

      const map = await batchResolveCategoryIds(["Test"], "income");
      expect(map.size).toBe(0);
    });

    it("should handle exceptions gracefully", async () => {
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            in: jest.fn().mockRejectedValue(new Error("Network error")),
          }),
        }),
      });

      (supabase.from as jest.Mock) = mockFrom;

      const map = await batchResolveCategoryIds(["Test"], "saving");
      expect(map.size).toBe(0);
    });
  });
});
