/**
 * @jest-environment jsdom
 */

import {
  genericLoad,
  genericSave,
  genericDelete,
  getCategoryNameById,
  getCategoryIdByName,
  createCategoryMap,
  resolveCategoryId,
  enrichWithCategoryNames,
  enrichWithMultipleCategoryNames,
  batchSave,
} from "./database-helpers";
import { supabase } from "./supabase";

// Mock the supabase client
jest.mock("./supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

// Mock the logger
jest.mock("@/src/utils/logger", () => ({
  __esModule: true,
  default: {
    databaseError: jest.fn(),
  },
}));

describe("database-helpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========================================================================
  // Generic CRUD Operations
  // ========================================================================

  describe("genericLoad", () => {
    it("should load all records without month filter", async () => {
      const mockData = [
        { id: "1", name: "Test 1" },
        { id: "2", name: "Test 2" },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      const result = await genericLoad("test_table");

      expect(supabase.from).toHaveBeenCalledWith("test_table");
      expect(mockQuery.select).toHaveBeenCalledWith("*");
      expect(mockQuery.order).toHaveBeenCalledWith("created_at", { ascending: false });
      expect(result).toEqual(mockData);
    });

    it("should load records with month filter", async () => {
      const mockData = [{ id: "1", month: "2025-01" }];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      const result = await genericLoad("test_table", "2025-01");

      expect(mockQuery.eq).toHaveBeenCalledWith("month", "2025-01");
      expect(result).toEqual(mockData);
    });

    it("should handle database errors", async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "Database error" },
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      const result = await genericLoad("test_table");

      expect(result).toEqual([]);
    });

    it("should return empty array when no data", async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: null, error: null }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      const result = await genericLoad("test_table");

      expect(result).toEqual([]);
    });

    it("should use custom order settings", async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      await genericLoad("test_table", undefined, "name", true);

      expect(mockQuery.order).toHaveBeenCalledWith("name", { ascending: true });
    });
  });

  describe("genericSave", () => {
    it("should save record successfully", async () => {
      const mockQuery = {
        upsert: jest.fn().mockResolvedValue({ error: null }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      const record = { id: "1", name: "Test" };
      const result = await genericSave("test_table", record);

      expect(supabase.from).toHaveBeenCalledWith("test_table");
      expect(mockQuery.upsert).toHaveBeenCalledWith(record, { onConflict: "id" });
      expect(result).toBe(true);
    });

    it("should handle save errors", async () => {
      const mockQuery = {
        upsert: jest.fn().mockResolvedValue({ error: { message: "Save error" } }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      const record = { id: "1", name: "Test" };
      const result = await genericSave("test_table", record);

      expect(result).toBe(false);
    });

    it("should handle exceptions", async () => {
      const mockQuery = {
        upsert: jest.fn().mockRejectedValue(new Error("Exception")),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      const record = { id: "1", name: "Test" };
      const result = await genericSave("test_table", record);

      expect(result).toBe(false);
    });
  });

  describe("genericDelete", () => {
    it("should delete record successfully", async () => {
      const mockQuery = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      const result = await genericDelete("test_table", "123");

      expect(supabase.from).toHaveBeenCalledWith("test_table");
      expect(mockQuery.delete).toHaveBeenCalled();
      expect(mockQuery.eq).toHaveBeenCalledWith("id", "123");
      expect(result).toBe(true);
    });

    it("should handle delete errors", async () => {
      const mockQuery = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: { message: "Delete error" } }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      const result = await genericDelete("test_table", "123");

      expect(result).toBe(false);
    });
  });

  // ========================================================================
  // Category Resolution Helpers
  // ========================================================================

  describe("getCategoryNameById", () => {
    it("should return category name when found", async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { name: "Groceries" },
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      const result = await getCategoryNameById("uuid-123");

      expect(result).toBe("Groceries");
    });

    it("should return null when category not found", async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "Not found" },
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      const result = await getCategoryNameById("uuid-999");

      expect(result).toBeNull();
    });

    it("should handle exceptions", async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockRejectedValue(new Error("DB Error")),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      const result = await getCategoryNameById("uuid-123");

      expect(result).toBeNull();
    });
  });

  describe("getCategoryIdByName", () => {
    it("should return category ID when found", async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: "uuid-123" },
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      const result = await getCategoryIdByName("Groceries", "expense");

      expect(mockQuery.eq).toHaveBeenCalledWith("name", "Groceries");
      expect(mockQuery.eq).toHaveBeenCalledWith("type", "expense");
      expect(result).toBe("uuid-123");
    });

    it("should return null when category not found", async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "Not found" },
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      const result = await getCategoryIdByName("Unknown", "expense");

      expect(result).toBeNull();
    });

    it("should handle different category types", async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: "uuid-456" },
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      await getCategoryIdByName("Salary", "income");

      expect(mockQuery.eq).toHaveBeenCalledWith("type", "income");
    });
  });

  describe("createCategoryMap", () => {
    it("should create map of category IDs to names", async () => {
      const mockData = [
        { id: "uuid-1", name: "Groceries" },
        { id: "uuid-2", name: "Salary" },
        { id: "uuid-3", name: "Emergency Fund" },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      const result = await createCategoryMap();

      expect(result.size).toBe(3);
      expect(result.get("uuid-1")).toBe("Groceries");
      expect(result.get("uuid-2")).toBe("Salary");
      expect(result.get("uuid-3")).toBe("Emergency Fund");
    });

    it("should return empty map on error", async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "Error" },
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      const result = await createCategoryMap();

      expect(result.size).toBe(0);
    });

    it("should only select visible categories", async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: [], error: null }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      await createCategoryMap();

      expect(mockQuery.eq).toHaveBeenCalledWith("is_visible", true);
    });
  });

  describe("resolveCategoryId", () => {
    it("should return existing category_id if provided", async () => {
      const result = await resolveCategoryId("uuid-123", "Groceries", "expense");

      expect(result).toBe("uuid-123");
    });

    it("should lookup category_id from name if not provided", async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: "uuid-456" },
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      const result = await resolveCategoryId(null, "Groceries", "expense");

      expect(result).toBe("uuid-456");
    });

    it("should return null if neither ID nor name provided", async () => {
      const result = await resolveCategoryId(null, null, "expense");

      expect(result).toBeNull();
    });

    it("should handle undefined values", async () => {
      const result = await resolveCategoryId(undefined, undefined, "expense");

      expect(result).toBeNull();
    });
  });

  describe("enrichWithCategoryNames", () => {
    it("should enrich records with category names", async () => {
      const mockCategoryMap = new Map([
        ["uuid-1", "Groceries"],
        ["uuid-2", "Salary"],
      ]);

      const records = [
        { id: "1", category_id: "uuid-1", category: "", amount: 100 },
        { id: "2", category_id: "uuid-2", category: "", amount: 5000 },
      ];

      const result = await enrichWithCategoryNames(records, mockCategoryMap);

      expect(result[0].category).toBe("Groceries");
      expect(result[1].category).toBe("Salary");
    });

    it("should preserve existing category if category_id not in map", async () => {
      const mockCategoryMap = new Map([["uuid-1", "Groceries"]]);

      const records = [{ id: "1", category_id: "uuid-999", category: "Old Name", amount: 100 }];

      const result = await enrichWithCategoryNames(records, mockCategoryMap);

      expect(result[0].category).toBe("Old Name");
    });

    it("should handle records without category_id", async () => {
      const mockCategoryMap = new Map([["uuid-1", "Groceries"]]);

      const records = [{ id: "1", category: "Manual Entry", amount: 100 }];

      const result = await enrichWithCategoryNames(records, mockCategoryMap);

      expect(result[0].category).toBe("Manual Entry");
    });

    it("should load category map if not provided", async () => {
      const mockData = [{ id: "uuid-1", name: "Groceries" }];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      const records = [{ id: "1", category_id: "uuid-1", category: "", amount: 100 }];

      const result = await enrichWithCategoryNames(records);

      expect(result[0].category).toBe("Groceries");
    });
  });

  describe("enrichWithMultipleCategoryNames", () => {
    it("should enrich records with both category and savings category names", async () => {
      const mockCategoryMap = new Map([
        ["uuid-1", "Rent"],
        ["uuid-2", "Emergency Fund"],
      ]);

      const records = [
        {
          id: "1",
          category_id: "uuid-1",
          category: "",
          uses_savings_category_id: "uuid-2",
          uses_savings_category: "",
          amount: -1000,
        },
      ];

      const result = await enrichWithMultipleCategoryNames(records, mockCategoryMap);

      expect(result[0].category).toBe("Rent");
      expect(result[0].uses_savings_category).toBe("Emergency Fund");
    });

    it("should handle records without savings category", async () => {
      const mockCategoryMap = new Map([["uuid-1", "Groceries"]]);

      const records = [
        { id: "1", category_id: "uuid-1", category: "", amount: -50 },
      ];

      const result = await enrichWithMultipleCategoryNames(records, mockCategoryMap);

      expect(result[0].category).toBe("Groceries");
      // @ts-ignore - enrichWithMultipleCategoryNames adds this field
      expect(result[0].uses_savings_category).toBe("");
    });

    it("should preserve existing category names when IDs not in map", async () => {
      const mockCategoryMap = new Map();

      const records = [
        {
          id: "1",
          category_id: "uuid-999",
          category: "Old Category",
          uses_savings_category_id: "uuid-888",
          uses_savings_category: "Old Savings",
          amount: -100,
        },
      ];

      const result = await enrichWithMultipleCategoryNames(records, mockCategoryMap);

      expect(result[0].category).toBe("Old Category");
      expect(result[0].uses_savings_category).toBe("Old Savings");
    });
  });

  // ========================================================================
  // Batch Operations
  // ========================================================================

  describe("batchSave", () => {
    it("should save multiple records successfully", async () => {
      const mockQuery = {
        upsert: jest.fn().mockResolvedValue({ error: null }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      const records = [
        { id: "1", name: "Test 1" },
        { id: "2", name: "Test 2" },
        { id: "3", name: "Test 3" },
      ];

      const result = await batchSave("test_table", records);

      expect(mockQuery.upsert).toHaveBeenCalledWith(records, { onConflict: "id" });
      expect(result).toBe(true);
    });

    it("should handle batch save errors", async () => {
      const mockQuery = {
        upsert: jest.fn().mockResolvedValue({ error: { message: "Batch error" } }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      const records = [{ id: "1", name: "Test 1" }];

      const result = await batchSave("test_table", records);

      expect(result).toBe(false);
    });

    it("should handle empty arrays", async () => {
      const mockQuery = {
        upsert: jest.fn().mockResolvedValue({ error: null }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      const result = await batchSave("test_table", []);

      expect(mockQuery.upsert).toHaveBeenCalledWith([], { onConflict: "id" });
      expect(result).toBe(true);
    });
  });
});
