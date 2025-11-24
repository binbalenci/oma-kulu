// Transaction-specific types (extends global types from @/lib/types)

export interface TransactionFormData {
  amount: string;
  description: string;
  date: string;
  category: string;
  type: "income" | "expense" | "saving";
  useSavingsCategory: string | null;
}

export interface TransactionFilters {
  searchQuery: string;
  selectedCategory: string | null;
}
