// Re-export database functions for backward compatibility
export {
  deleteBudget, deleteCategory, deleteIncome, deleteInvoice, deleteSavings, deleteTransaction, getActiveSavingsCategories, getSavingsBalance, loadBudgets, loadCategories, loadIncomes, loadInvoices, loadSavings, loadSettings, loadTransactions, saveBudget, saveCategories, saveCategory, saveIncome, saveInvoice, saveSavings, saveSettings, saveTransaction,
  saveTransactions
} from "./database";

