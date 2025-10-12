// Re-export database functions for backward compatibility
export {
  deleteBudget, deleteCategory, deleteIncome, deleteInvoice, deleteTransaction, loadBudgets, loadCategories, loadIncomes, loadInvoices, loadSettings, loadTransactions, saveBudget, saveCategories, saveCategory, saveIncome, saveInvoice, saveSettings, saveTransaction,
  saveTransactions
} from "./database";

