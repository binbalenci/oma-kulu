import logger from "@/app/utils/logger";
import { useSnackbar } from "@/components/snackbar-provider";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CustomCheckbox } from "@/components/ui/CustomCheckbox";
import { Dialog } from "@/components/ui/Dialog";
import { GradientProgressBar } from "@/components/ui/GradientProgressBar";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { SimpleDropdown } from "@/components/ui/SimpleDropdown";
import { AppTheme } from "@/constants/AppTheme";
import { useMonth } from "@/lib/month-context";
import {
  deleteBudget,
  deleteIncome,
  deleteInvoice,
  deleteSavings,
  deleteTransaction,
  getSavingsBalance,
  loadBudgets,
  loadCategories,
  loadIncomes,
  loadInvoices,
  loadSavings,
  loadTransactions,
  saveBudget,
  saveIncome,
  saveInvoice,
  saveSavings,
  saveTransaction,
} from "@/lib/storage";
import type {
  Budget,
  Category,
  ExpectedIncome,
  ExpectedInvoice,
  ExpectedSavings,
  Transaction,
} from "@/lib/types";
import Ionicons from "@react-native-vector-icons/ionicons";
import MaterialIcons from "@react-native-vector-icons/material-design-icons";
import { addMonths, endOfMonth, format, startOfMonth } from "date-fns";
import * as Crypto from "expo-crypto";
import { useFocusEffect } from "expo-router";
import React from "react";
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Button, Card, IconButton, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

function monthKey(d: Date): string {
  return format(d, "yyyy-MM");
}

export default function HomeScreen() {
  const { showSnackbar } = useSnackbar();
  const { currentMonth, setCurrentMonth } = useMonth();

  // Log navigation and refetch month-specific data when month changes
  React.useEffect(() => {
    logger.navigationAction("BudgetScreen", { month: currentMonth });

    // Refetch only month-dependent data when month changes
    (async () => {
      setIsLoadingData(true);
      try {
        const [incms, invcs, bdgts, svgs, txs, cats] = await Promise.all([
          loadIncomes(),      // needed for expected incomes by month
          loadInvoices(),     // needed for expected invoices by month
          loadBudgets(),      // needed for budgets by month
          loadSavings(),      // needed for expected savings by month
          loadTransactions(), // needed for "in bank" calc and spent amounts
          loadCategories(),   // needed for savings balance calculation
        ]);
        setIncomes(incms);
        setInvoices(invcs);
        setBudgets(bdgts);
        setSavings(svgs);
        setTransactions(txs);
        setCategories(cats);

        // Calculate savings balances for all savings categories
        const savingCategories = cats.filter(c => c.type === 'saving');
        const balances: Record<string, number> = {};
        for (const cat of savingCategories) {
          balances[cat.name] = await getSavingsBalance(cat.name);
        }
        setSavingsBalances(balances);
        // Categories and settings don't need refresh - they're month-independent
      } finally {
        setIsLoadingData(false);
      }
    })();
  }, [currentMonth]);

  // Data states
  const [incomes, setIncomes] = React.useState<ExpectedIncome[]>([]);
  const [invoices, setInvoices] = React.useState<ExpectedInvoice[]>([]);
  const [budgets, setBudgets] = React.useState<Budget[]>([]);
  const [savings, setSavings] = React.useState<ExpectedSavings[]>([]);
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [savingsBalances, setSavingsBalances] = React.useState<Record<string, number>>({});

  // UI states
  const [dialogVisible, setDialogVisible] = React.useState(false);
  const [dialogType, setDialogType] = React.useState<"income" | "invoice" | "budget" | "saving">("income");
  const [editingItem, setEditingItem] = React.useState<
    ExpectedIncome | ExpectedInvoice | Budget | ExpectedSavings | null
  >(null);
  const [itemTarget, setItemTarget] = React.useState("");
  const [itemName, setItemName] = React.useState("");
  const [itemCategory, setItemCategory] = React.useState("");
  const [itemAmount, setItemAmount] = React.useState("");
  const [itemNotes, setItemNotes] = React.useState("");
  const [invoiceUseSavings, setInvoiceUseSavings] = React.useState<string | null>(null);
  // Map to store savings preference per invoice ID
  const invoiceSavingsMap = React.useRef<Record<string, string>>({});
  
  // Validation error states
  const [categoryError, setCategoryError] = React.useState(false);
  const [amountError, setAmountError] = React.useState(false);
 
  // Category grouping states
  const [expandedCategories, setExpandedCategories] = React.useState<Set<string>>(new Set());

  // Confirmation dialog states
  const [confirmDialogVisible, setConfirmDialogVisible] = React.useState(false);
  const [itemToDelete, setItemToDelete] = React.useState<{ id: string; type: string } | null>(null);

  // Pull-to-refresh state
  const [refreshing, setRefreshing] = React.useState(false);

  // Data loading state
  const [isLoadingData, setIsLoadingData] = React.useState(true);

  // Load data on mount
  React.useEffect(() => {
    (async () => {
      logger.breadcrumb("Loading budget screen data", "data_loading");
      const startTime = Date.now();
      
      try {
        const [incms, invcs, bdgts, svgs, txs, cats] = await Promise.all([
          loadIncomes(),
          loadInvoices(),
          loadBudgets(),
          loadSavings(),
          loadTransactions(),
          loadCategories(),
        ]);
        
        setIncomes(incms);
        setInvoices(invcs);
        setBudgets(bdgts);
        setSavings(svgs);
        setTransactions(txs);
        setCategories(cats);
        
        // Calculate savings balances
        const savingCategories = cats.filter(c => c.type === 'saving');
        const balances: Record<string, number> = {};
        for (const cat of savingCategories) {
          balances[cat.name] = await getSavingsBalance(cat.name);
        }
        setSavingsBalances(balances);
        
        const duration = Date.now() - startTime;
        logger.dataAction("load_budget_data", { 
          incomesCount: incms.length,
          invoicesCount: invcs.length,
          budgetsCount: bdgts.length,
          transactionsCount: txs.length,
          categoriesCount: cats.length,
          duration 
        });
        logger.performanceWarning("load_budget_data", duration);
      } catch (error) {
        logger.error(error as Error, { operation: "load_budget_data" });
        showSnackbar("Failed to load budget data");
      }
    })();
  }, [showSnackbar]);

  // Refetch ALL data when screen comes into focus (needed for category CASCADE updates)
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        logger.breadcrumb("Refreshing home screen data on focus", "data_refresh");
        const [cats, txs, incms, invcs, bdgts, svgs] = await Promise.all([
          loadCategories(), 
          loadTransactions(),
          loadIncomes(),    // ✅ Reload incomes (may have CASCADE updates)
          loadInvoices(),   // ✅ Reload invoices (may have CASCADE updates) 
          loadBudgets(),    // ✅ Reload budgets (may have CASCADE updates)
          loadSavings()     // ✅ Reload savings (may have CASCADE updates)
        ]);
        setCategories(cats);
        setTransactions(txs);
        setIncomes(incms);      // ✅ Update incomes with fresh CASCADE data
        setInvoices(invcs);     // ✅ Update invoices with fresh CASCADE data
        setBudgets(bdgts);      // ✅ Update budgets with fresh CASCADE data
        setSavings(svgs);       // ✅ Update savings with fresh CASCADE data
        
        // Calculate savings balances
        const savingCategories = cats.filter(c => c.type === 'saving');
        const balances: Record<string, number> = {};
        for (const cat of savingCategories) {
          balances[cat.name] = await getSavingsBalance(cat.name);
        }
        setSavingsBalances(balances);
        logger.dataAction("refresh_home_focus", { 
          categoriesCount: cats.length,
          transactionsCount: txs.length,
          incomesCount: incms.length,
          invoicesCount: invcs.length,
          budgetsCount: bdgts.length
        });
      })();
    }, [])
  );

  // Pull-to-refresh handler
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    logger.breadcrumb("Pull-to-refresh triggered", "data_refresh");
    
    try {
      const [cats, txs, incms, invcs, bdgts, svgs] = await Promise.all([
        loadCategories(), 
        loadTransactions(),
        loadIncomes(),
        loadInvoices(),
        loadBudgets(),
        loadSavings()
      ]);
      
      setCategories(cats);
      setTransactions(txs);
      setIncomes(incms);
      setInvoices(invcs);
      setBudgets(bdgts);
      setSavings(svgs);
      
      // Calculate savings balances
      const savingCategories = cats.filter(c => c.type === 'saving');
      const balances: Record<string, number> = {};
      for (const cat of savingCategories) {
        balances[cat.name] = await getSavingsBalance(cat.name);
      }
      setSavingsBalances(balances);
      
      logger.dataAction("pull_to_refresh", { 
        categoriesCount: cats.length,
        transactionsCount: txs.length,
        incomesCount: incms.length,
        invoicesCount: invcs.length,
        budgetsCount: bdgts.length
      });
    } catch (error) {
      logger.error(error as Error, { operation: "pull_to_refresh" });
      showSnackbar("Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  }, [showSnackbar]);

  const curMonth = monthKey(currentMonth);
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  // Filter items for current month
  const currentIncomes = incomes.filter((i) => i.month === curMonth);
  const currentInvoices = invoices.filter((i) => i.month === curMonth);
  const currentBudgets = budgets.filter((b) => b.month === curMonth);
  const currentSavings = savings.filter((s) => s.month === curMonth);

  // Debug: Log what data we're working with
  React.useEffect(() => {
    if (currentIncomes.length > 0 || currentInvoices.length > 0 || currentBudgets.length > 0) {
      logger.info("Home tab data for rendering", {
        incomes: currentIncomes.map(i => ({ name: i.name, category: i.category })),
        invoices: currentInvoices.map(i => ({ name: i.name, category: i.category })),
        budgets: currentBudgets.map(b => ({ category: b.category })),
        availableCategories: categories.map(c => c.name)
      });
    }
  }, [currentIncomes, currentInvoices, currentBudgets, categories]);

  // Calculate month transactions
  const monthTx = transactions.filter((t) => {
    const d = new Date(t.date + "T00:00:00");
    return d >= monthStart && d <= monthEnd;
  });

  // Calculate spent per category for current month
  const spentByCategory = monthTx.reduce<Record<string, number>>((acc, t) => {
    if (t.amount < 0) {
      acc[t.category] = (acc[t.category] ?? 0) + Math.abs(t.amount);
    }
    return acc;
  }, {});

  // Calculate cash overview
  const expectedIncome = currentIncomes.reduce((sum, i) => sum + i.amount, 0);
  const expectedExpenses = currentInvoices.reduce((sum, i) => sum + i.amount, 0);
  const totalAllocated = currentBudgets.reduce((sum, b) => sum + b.allocated_amount, 0);
  const totalSavings = currentSavings.reduce((sum, s) => sum + s.amount, 0);
  const moneyToAssign = expectedIncome - expectedExpenses - totalAllocated - totalSavings;
  
  // Calculate actual "In Bank" amount for current month (only paid transactions up to today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const monthTransactions = transactions.filter((t) => {
    const d = new Date(t.date + "T00:00:00");
    return d >= monthStart && d <= monthEnd && d <= today && t.status === "paid";
  });
  
  // Calculate income portion (excluding savings contributions)
  const totalIncome = monthTransactions
    .filter(t => t.amount > 0 && t.source_type !== 'savings')
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Calculate expense portion (only count portion NOT covered by savings)
  const totalExpenses = monthTransactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => {
      const amount = Math.abs(t.amount);
      const savingsUsed = t.savings_amount_used || 0;
      // Only count portion from income (not covered by savings)
      return sum + (amount - savingsUsed);
    }, 0);
  
  const actualInBank = totalIncome - totalExpenses;
  
  // Calculate total savings balances
  const totalSavingsBalance = Object.values(savingsBalances).reduce((sum, b) => sum + b, 0);

  // Check if all sections are empty
  const allEmpty =
    currentIncomes.length === 0 && currentInvoices.length === 0 && currentBudgets.length === 0;

  // Group incomes by category
  const incomesByCategory = currentIncomes.reduce<Record<string, ExpectedIncome[]>>(
    (acc, income) => {
      if (!acc[income.category]) {
        acc[income.category] = [];
      }
      acc[income.category].push(income);
      return acc;
    },
    {}
  );

  // Group invoices by category
  const invoicesByCategory = currentInvoices.reduce<Record<string, ExpectedInvoice[]>>(
    (acc, invoice) => {
      if (!acc[invoice.category]) {
        acc[invoice.category] = [];
      }
      acc[invoice.category].push(invoice);
      return acc;
    },
    {}
  );

  const openAddDialog = (type: "income" | "invoice" | "budget" | "saving") => {
    setDialogType(type);
    setEditingItem(null);
    setItemName("");
    setItemCategory("");
    setItemAmount("");
    setItemNotes("");
    setItemTarget("");
    setInvoiceUseSavings(null);
    setDialogVisible(true);
  };

  const openEditDialog = (type: "income" | "invoice" | "budget" | "saving", item: any) => {
    setDialogType(type);
    setEditingItem(item);
    setItemName(type === "budget" || type === "saving" ? "" : item.name === item.category ? "" : item.name);
    setItemCategory(item.category);
    const amountValue = type === "budget" ? item.allocated_amount : item.amount;
    setItemAmount(Number(amountValue).toFixed(2));
    setItemNotes(item.notes || "");
    if (type === "saving") {
      // Check if there's an existing target for this category (from other months)
      const existingSavings = savings.find(s => s.category === item.category && s.target);
      const targetValue = item.target || existingSavings?.target;
      setItemTarget(targetValue ? Number(targetValue).toFixed(2) : "");
    } else {
      setItemTarget("");
    }
    // Load savings preference for invoices
    if (type === "invoice") {
      setInvoiceUseSavings(invoiceSavingsMap.current[item.id] || null);
    } else {
      setInvoiceUseSavings(null);
    }
    setDialogVisible(true);
  };

  const togglePaid = async (type: "income" | "invoice" | "saving", item: ExpectedIncome | ExpectedInvoice | ExpectedSavings) => {
    if (item.is_paid) {
      // Unmark as paid - delete the associated transaction
      const relatedTx = transactions.find(
        (t) =>
          (type === "saving" ? t.source_type === "savings" : t.source_type === type) &&
          t.source_id === item.id &&
          t.category === item.category &&
          Math.abs(t.amount) === (type === "saving" ? (item as ExpectedSavings).amount : (item as ExpectedIncome | ExpectedInvoice).amount) &&
          t.status === "paid"
      );

      if (relatedTx) {
        const success = await deleteTransaction(relatedTx.id);
        if (success) {
          setTransactions((prev) => prev.filter((t) => t.id !== relatedTx.id));
        }
      }

      // Mark as unpaid
      const updatedItem = { ...item, is_paid: false, updated_at: new Date().toISOString() };

      if (type === "income") {
        const success = await saveIncome(updatedItem as ExpectedIncome);
        if (success) {
          setIncomes((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_paid: false } : i)));
          showSnackbar("Unmarked as paid!");
        }
      } else if (type === "invoice") {
        const success = await saveInvoice(updatedItem as ExpectedInvoice);
        if (success) {
          setInvoices((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_paid: false } : i)));
          showSnackbar("Unmarked as paid!");
        }
      } else if (type === "saving") {
        const success = await saveSavings(updatedItem as ExpectedSavings);
        if (success) {
          setSavings((prev) => prev.map((s) => (s.id === item.id ? { ...s, is_paid: false } : s)));
          // Update savings balance
          const balance = await getSavingsBalance((item as ExpectedSavings).category);
          setSavingsBalances((prev) => ({ ...prev, [(item as ExpectedSavings).category]: balance }));
          showSnackbar("Unmarked as paid!");
        }
      }
      return;
    }

    // Calculate savings usage for invoices
    let savingsAmountUsed = 0;
    let useSavingsCategory: string | undefined = undefined;
    if (type === "invoice") {
      const invoiceItem = item as ExpectedInvoice;
      // Check if this invoice has a savings preference stored
      const savingsCategory = invoiceSavingsMap.current[invoiceItem.id];
      if (savingsCategory && savingsBalances[savingsCategory]) {
        const availableBalance = savingsBalances[savingsCategory];
        const transactionAmount = invoiceItem.amount;
        // Use up to the available balance, capped at transaction amount
        savingsAmountUsed = Math.min(availableBalance, transactionAmount);
        useSavingsCategory = savingsCategory;
      }
    }

    // Mark as paid - create transaction
    const tx: Transaction = {
      id: Crypto.randomUUID(),
      amount: type === "income" ? item.amount : -item.amount,
      description: type === "saving" ? (item as ExpectedSavings).category : (item as ExpectedIncome | ExpectedInvoice).name,
      date: format(new Date(), "yyyy-MM-dd"),
      category: item.category,
      status: "paid",
      created_at: new Date().toISOString(),
      source_type: type === "saving" ? "savings" : type,
      source_id: item.id,
      uses_savings_category: useSavingsCategory,
      savings_amount_used: savingsAmountUsed > 0 ? savingsAmountUsed : undefined,
    };

    const txSuccess = await saveTransaction(tx);
    if (!txSuccess) {
      showSnackbar("Failed to create transaction");
      return;
    }

    setTransactions((prev) => [tx, ...prev]);
    
    // Update savings balance if savings were used
    if (savingsAmountUsed > 0 && useSavingsCategory) {
      const balance = await getSavingsBalance(useSavingsCategory);
      setSavingsBalances((prev) => ({ ...prev, [useSavingsCategory!]: balance }));
    }

    // Mark as paid
    const updatedItem = { ...item, is_paid: true, updated_at: new Date().toISOString() };

    if (type === "income") {
      const success = await saveIncome(updatedItem as ExpectedIncome);
      if (success) {
        setIncomes((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_paid: true } : i)));
        showSnackbar("Marked as paid!");
      } else {
        showSnackbar("Failed to update income");
      }
    } else if (type === "invoice") {
      const success = await saveInvoice(updatedItem as ExpectedInvoice);
      if (success) {
        setInvoices((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_paid: true } : i)));
        showSnackbar("Marked as paid!");
      } else {
        showSnackbar("Failed to update invoice");
      }
    } else if (type === "saving") {
      const success = await saveSavings(updatedItem as ExpectedSavings);
      if (success) {
        setSavings((prev) => prev.map((s) => (s.id === item.id ? { ...s, is_paid: true } : s)));
        // Update savings balance
        const balance = await getSavingsBalance((item as ExpectedSavings).category);
        setSavingsBalances((prev) => ({ ...prev, [(item as ExpectedSavings).category]: balance }));
        showSnackbar("Marked as paid!");
      } else {
        showSnackbar("Failed to update savings");
      }
    }
  };

  const handleSaveItem = async () => {
    // Check for missing required fields
    const hasEmptyCategory = !itemCategory;
    const hasEmptyAmount = !itemAmount;
    
    setCategoryError(hasEmptyCategory);
    setAmountError(hasEmptyAmount);

    if (hasEmptyCategory || hasEmptyAmount) {
      return false;
    }

    const amt = parseFloat(itemAmount.replace(",", "."));
    if (isNaN(amt)) {
      showSnackbar("Invalid amount entered");
      return false;
    }

    const selectedCategory = categories.find((c) => c.name === itemCategory);
    if (!selectedCategory) {
      showSnackbar("Category not found");
      return false;
    }

    try {
      if (dialogType === "income") {
        const income: ExpectedIncome = {
          id: editingItem?.id || Crypto.randomUUID(),
          name: itemName || itemCategory, // Use category name if name is empty
          category: itemCategory,
          amount: amt,
          month: curMonth,
          is_paid: (editingItem as ExpectedIncome)?.is_paid || false,
          notes: itemNotes || undefined,
          created_at: editingItem?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        const success = await saveIncome(income);
        if (success) {
          setIncomes((prev) => {
            const next = prev.filter((i) => i.id !== income.id);
            next.push(income);
            return next;
          });
          showSnackbar("Income saved successfully!");
        } else {
          showSnackbar("Failed to save income");
          return false;
        }
      } else if (dialogType === "invoice") {
        const invoice: ExpectedInvoice = {
          id: editingItem?.id || Crypto.randomUUID(),
          name: itemName || itemCategory, // Use category name if name is empty
          category: itemCategory,
          amount: amt,
          month: curMonth,
          is_paid: (editingItem as ExpectedInvoice)?.is_paid || false,
          notes: itemNotes || undefined,
          created_at: editingItem?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        const success = await saveInvoice(invoice);
        if (success) {
          setInvoices((prev) => {
            const next = prev.filter((i) => i.id !== invoice.id);
            next.push(invoice);
            return next;
          });
          // Store savings preference in a map (invoice id -> savings category)
          if (invoiceUseSavings) {
            invoiceSavingsMap.current[invoice.id] = invoiceUseSavings;
          } else {
            delete invoiceSavingsMap.current[invoice.id];
          }
          showSnackbar("Invoice saved successfully!");
        } else {
          showSnackbar("Failed to save invoice");
          return false;
        }
      } else if (dialogType === "budget") {
        const budget: Budget = {
          id: editingItem?.id || Crypto.randomUUID(),
          category: itemCategory,
          allocated_amount: amt,
          month: curMonth,
          notes: itemNotes || undefined,
          created_at: editingItem?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        const success = await saveBudget(budget);
        if (success) {
          setBudgets((prev) => {
            const next = prev.filter((b) => b.id !== budget.id);
            next.push(budget);
            return next;
          });
          showSnackbar("Budget saved successfully!");
        } else {
          showSnackbar("Failed to save budget");
          return false;
        }
      } else if (dialogType === "saving") {
        const targetValue = itemTarget ? parseFloat(itemTarget.replace(",", ".")) : undefined;
        const saving: ExpectedSavings = {
          id: editingItem?.id || Crypto.randomUUID(),
          category: itemCategory,
          amount: amt,
          month: curMonth,
          target: targetValue && !isNaN(targetValue) ? targetValue : undefined,
          is_paid: (editingItem as ExpectedSavings)?.is_paid || false,
          notes: itemNotes || undefined,
          created_at: editingItem?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        const success = await saveSavings(saving);
        if (success) {
          setSavings((prev) => {
            const next = prev.filter((s) => s.id !== saving.id);
            next.push(saving);
            return next;
          });
          // Update savings balance for this category
          const balance = await getSavingsBalance(saving.category);
          setSavingsBalances((prev) => ({ ...prev, [saving.category]: balance }));
          showSnackbar("Savings saved successfully!");
        } else {
          showSnackbar("Failed to save savings");
          return false;
        }
      }
      setDialogVisible(false); // Manually close on success
      return true;
    } catch (error) {
      console.error("Error saving item:", error);
      showSnackbar("Error saving item. Please try again.");
      return false;
    }
  };

  const handleDeleteItem = (type: "income" | "invoice" | "budget" | "saving", id: string) => {
    setItemToDelete({ id, type });
    setConfirmDialogVisible(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    let success = false;
    if (itemToDelete.type === "income") {
      success = await deleteIncome(itemToDelete.id);
      if (success) {
        setIncomes((prev) => prev.filter((i) => i.id !== itemToDelete.id));
        showSnackbar("Income deleted!");
      }
    } else if (itemToDelete.type === "invoice") {
      success = await deleteInvoice(itemToDelete.id);
      if (success) {
        setInvoices((prev) => prev.filter((i) => i.id !== itemToDelete.id));
        showSnackbar("Invoice deleted!");
      }
    } else if (itemToDelete.type === "budget") {
      success = await deleteBudget(itemToDelete.id);
      if (success) {
        setBudgets((prev) => prev.filter((b) => b.id !== itemToDelete.id));
        showSnackbar("Budget deleted!");
      }
    } else if (itemToDelete.type === "saving") {
      success = await deleteSavings(itemToDelete.id);
      if (success) {
        setSavings((prev) => prev.filter((s) => s.id !== itemToDelete.id));
        showSnackbar("Savings deleted!");
      }
    }
    if (!success) {
      showSnackbar("Failed to delete item");
    }
    setItemToDelete(null);
  };

  const copyPreviousMonth = async () => {
    const prevMonth = monthKey(addMonths(currentMonth, -1));
    const [prevIncomes, prevInvoices, prevBudgets] = await Promise.all([
      loadIncomes(prevMonth),
      loadInvoices(prevMonth),
      loadBudgets(prevMonth),
    ]);

    let count = 0;

    // Copy incomes
    for (const income of prevIncomes) {
      const newIncome = { ...income, id: Crypto.randomUUID(), month: curMonth, is_paid: false };
      const success = await saveIncome(newIncome);
      if (success) {
        setIncomes((prev) => [...prev, newIncome]);
        count++;
      }
    }

    // Copy invoices
    for (const invoice of prevInvoices) {
      const newInvoice = { ...invoice, id: Crypto.randomUUID(), month: curMonth, is_paid: false };
      const success = await saveInvoice(newInvoice);
      if (success) {
        setInvoices((prev) => [...prev, newInvoice]);
        count++;
      }
    }

    // Copy budgets
    for (const budget of prevBudgets) {
      const newBudget = { ...budget, id: Crypto.randomUUID(), month: curMonth };
      const success = await saveBudget(newBudget);
      if (success) {
        setBudgets((prev) => [...prev, newBudget]);
        count++;
      }
    }

    showSnackbar(`Copied ${count} items from ${format(addMonths(currentMonth, -1), "MMMM yyyy")}`);
  };

  const toggleCategoryExpansion = (category: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const getCategoryInfo = (categoryName: string) => {
    const info = categories.find((c) => c.name === categoryName);
    // Debug: Log category lookup for troubleshooting
    if (!info) {
      // Get stack trace to see where this is being called from
      const stack = new Error().stack;
      logger.warning(`Category not found: ${categoryName}`, { 
        availableCategories: categories.map(c => c.name),
        categoriesCount: categories.length,
        callStack: stack?.split('\n').slice(0, 5) // First 5 lines of stack
      });
    }
    return info;
  };

  const renderCategoryGroup = (
    categoryName: string,
    items: (ExpectedIncome | ExpectedInvoice)[],
    type: "income" | "invoice"
  ) => {
    const categoryInfo = getCategoryInfo(categoryName);
    const isExpanded = expandedCategories.has(categoryName);
    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
    const paidCount = items.filter((item) => item.is_paid).length;

    return (
      <Card key={categoryName} style={styles.categoryCard}>
        <TouchableOpacity
          onPress={() => toggleCategoryExpansion(categoryName)}
          style={styles.categoryHeader}
        >
          <View style={styles.categoryHeaderLeft}>
            <View
              style={[
                styles.categoryIcon,
                { backgroundColor: categoryInfo?.color || AppTheme.colors.primary },
              ]}
            >
              {categoryInfo?.emoji ? (
                <Text style={styles.categoryEmoji}>{categoryInfo.emoji}</Text>
              ) : (
                <MaterialIcons name="folder" size={20} color={AppTheme.colors.textInverse} />
              )}
            </View>
            <View style={styles.categoryInfo}>
              <Text variant="titleMedium" style={styles.categoryName}>
                {categoryName}
              </Text>
              <Text variant="bodySmall" style={styles.categorySubtext}>
                {paidCount}/{items.length} paid • €{totalAmount.toFixed(1)}
              </Text>
            </View>
          </View>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={AppTheme.colors.textSecondary}
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.categoryItems}>
            {items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <CustomCheckbox
                  status={item.is_paid ? "checked" : "unchecked"}
                  onPress={() => togglePaid(type, item)}
                />
                <View style={styles.itemInfo}>
                  <Text
                    variant="bodyLarge"
                    style={[styles.itemName, item.is_paid && styles.itemPaid]}
                  >
                    {item.name}
                  </Text>
                  {item.notes && (
                    <Text variant="bodySmall" style={styles.itemNotes}>
                      {item.notes}
                    </Text>
                  )}
                </View>
                <Text
                  variant="bodyLarge"
                  style={[styles.itemAmount, item.is_paid && styles.itemPaid]}
                >
                  €{item.amount.toFixed(1)}
                </Text>
                <View style={styles.itemActions}>
                  <IconButton
                    icon="pencil"
                    size={16}
                    onPress={() => openEditDialog(type, item)}
                    style={styles.actionButton}
                  />
                  <IconButton
                    icon="delete"
                    size={16}
                    onPress={() => handleDeleteItem(type, item.id)}
                    style={styles.actionButton}
                  />
                </View>
              </View>
            ))}
          </View>
        )}
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.monthSelector}>
          <IconButton
            icon="chevron-left"
            size={24}
            onPress={() =>
              setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
            }
          />
          <Text variant="headlineSmall" style={styles.monthText}>
            {format(currentMonth, "MMMM yyyy")}
          </Text>
          <IconButton
            icon="chevron-right"
            size={24}
            onPress={() =>
              setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
            }
          />
        </View>
        <View style={styles.headerActions}>
          <IconButton icon="bell-outline" size={24} />
          <IconButton icon="account-circle-outline" size={24} />
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Cash Overview - Two Row Layout */}
        <View style={styles.overviewCompact}>
          {/* Row 1: Income, Expenses, Remaining */}
          <View style={styles.overviewRow}>
            {/* Expected Income */}
            <View style={styles.overviewCompactItem}>
              <View style={styles.overviewItemHeader}>
                <Ionicons name="trending-up" size={14} color={AppTheme.colors.success} />
                <Text variant="labelSmall" style={styles.overviewCompactLabel}>
                  Income
                </Text>
              </View>
              {isLoadingData ? (
                <LoadingSpinner size="small" />
              ) : (
                <Text variant="bodyMedium" style={styles.positiveAmount}>
                  €{expectedIncome.toFixed(1)}
                </Text>
              )}
            </View>

            <View style={styles.overviewDivider} />

            {/* Expected Expenses */}
            <View style={styles.overviewCompactItem}>
              <View style={styles.overviewItemHeader}>
                <Ionicons name="trending-down" size={14} color={AppTheme.colors.error} />
                <Text variant="labelSmall" style={styles.overviewCompactLabel}>
                  Expenses
                </Text>
              </View>
              {isLoadingData ? (
                <LoadingSpinner size="small" />
              ) : (
                <Text variant="bodyMedium" style={styles.negativeAmount}>
                  €{expectedExpenses.toFixed(1)}
                </Text>
              )}
            </View>

            <View style={styles.overviewDivider} />

            {/* Remaining to Budget */}
            <View style={styles.overviewCompactItem}>
              <View style={styles.overviewItemHeader}>
                <Ionicons name="add-circle" size={14} color={AppTheme.colors.warning} />
                <Text variant="labelSmall" style={styles.overviewCompactLabel}>
                  Remaining
                </Text>
              </View>
              {isLoadingData ? (
                <LoadingSpinner size="small" />
              ) : (
                <Text variant="bodyMedium" style={styles.neutralAmount}>
                  €{moneyToAssign.toFixed(1)}
                </Text>
              )}
            </View>
          </View>

          {/* Row Divider */}
          <View style={styles.overviewRowDivider} />

          {/* Row 2: In Bank, Savings Balances */}
          <View style={styles.overviewRow}>
            {/* In Bank */}
            <View style={styles.overviewCompactItem}>
              <View style={styles.overviewItemHeader}>
                <Ionicons name="wallet" size={14} color={AppTheme.colors.primary} />
                <Text variant="labelSmall" style={styles.overviewCompactLabel}>
                  In Bank
                </Text>
              </View>
              {isLoadingData ? (
                <LoadingSpinner size="small" />
              ) : (
                <Text variant="bodyMedium" style={styles.neutralAmount}>
                  €{actualInBank.toFixed(1)}
                </Text>
              )}
            </View>

            <View style={styles.overviewDivider} />

            {/* Savings Balances */}
            <View style={styles.overviewCompactItem}>
              <View style={styles.overviewItemHeader}>
                <Ionicons name="wallet-outline" size={14} color={AppTheme.colors.secondary} />
                <Text variant="labelSmall" style={styles.overviewCompactLabel}>
                  Savings
                </Text>
              </View>
              {isLoadingData ? (
                <LoadingSpinner size="small" />
              ) : (
                <Text variant="bodyMedium" style={styles.neutralAmount}>
                  €{totalSavingsBalance.toFixed(1)}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Copy Previous Month */}
        {allEmpty && (
          <Card style={styles.copyCard}>
            <Card.Content>
              <View style={styles.copyContent}>
                <Ionicons name="copy-outline" size={32} color={AppTheme.colors.primary} />
                <Text variant="titleMedium" style={styles.copyTitle}>
                  Start Fresh or Copy Previous Month
                </Text>
                <Text variant="bodyMedium" style={styles.copySubtitle}>
                  Copy all items from {format(addMonths(currentMonth, -1), "MMMM yyyy")} to get
                  started quickly
                </Text>
                <Button
                  mode="contained"
                  onPress={copyPreviousMonth}
                  style={styles.copyButton}
                  icon="content-copy"
                >
                  Copy Previous Month
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Expected Incomes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitle}>
              <Ionicons name="trending-up" size={24} color={AppTheme.colors.success} />
              <Text variant="headlineSmall" style={styles.sectionTitleText}>
                Expected Incomes
              </Text>
            </View>
            <Button
              mode="contained"
              onPress={() => openAddDialog("income")}
              style={styles.addButton}
              icon="plus"
            >
              Add Income
            </Button>
          </View>

          {isLoadingData ? (
            <LoadingSpinner message="Loading incomes..." />
          ) : Object.keys(incomesByCategory).length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <Ionicons name="trending-up-outline" size={48} color={AppTheme.colors.textMuted} />
                <Text variant="bodyLarge" style={styles.emptyText}>
                  No expected incomes yet. Tap + to add one.
                </Text>
              </Card.Content>
            </Card>
          ) : (
            <View style={styles.categoryList}>
              {Object.entries(incomesByCategory).map(([categoryName, items]) =>
                renderCategoryGroup(categoryName, items, "income")
              )}
            </View>
          )}
        </View>

        {/* Expected Invoices */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitle}>
              <Ionicons name="trending-down" size={24} color={AppTheme.colors.error} />
              <Text variant="headlineSmall" style={styles.sectionTitleText}>
                Expected Invoices
              </Text>
            </View>
            <Button
              mode="contained"
              onPress={() => openAddDialog("invoice")}
              style={styles.addButton}
              icon="plus"
            >
              Add Invoice
            </Button>
          </View>

          {isLoadingData ? (
            <LoadingSpinner message="Loading invoices..." />
          ) : Object.keys(invoicesByCategory).length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <Ionicons
                  name="trending-down-outline"
                  size={48}
                  color={AppTheme.colors.textMuted}
                />
                <Text variant="bodyLarge" style={styles.emptyText}>
                  No expected invoices yet. Tap + to add one.
                </Text>
              </Card.Content>
            </Card>
          ) : (
            <View style={styles.categoryList}>
              {Object.entries(invoicesByCategory).map(([categoryName, items]) =>
                renderCategoryGroup(categoryName, items, "invoice")
              )}
            </View>
          )}
        </View>

        {/* Budgets */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitle}>
              <Ionicons name="pie-chart" size={24} color={AppTheme.colors.primary} />
              <Text variant="headlineSmall" style={styles.sectionTitleText}>
                Budgets
              </Text>
            </View>
            <Button
              mode="contained"
              onPress={() => openAddDialog("budget")}
              style={styles.addButton}
              icon="plus"
            >
              Add Budget
            </Button>
          </View>

          {isLoadingData ? (
            <LoadingSpinner message="Loading budgets..." />
          ) : currentBudgets.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <Ionicons name="pie-chart-outline" size={48} color={AppTheme.colors.textMuted} />
                <Text variant="bodyLarge" style={styles.emptyText}>
                  No budgets yet. Tap + to add one.
                </Text>
              </Card.Content>
            </Card>
          ) : (
            <View style={styles.budgetList}>
              {currentBudgets.map((budget) => {
                const categoryInfo = getCategoryInfo(budget.category);
                const spent = spentByCategory[budget.category] || 0;
                const progress = budget.allocated_amount > 0 ? spent / budget.allocated_amount : 0;

                return (
                  <Card key={budget.id} style={styles.budgetCard}>
                    <Card.Content>
                      <View style={styles.budgetHeader}>
                        <View style={styles.budgetInfo}>
                          <View
                            style={[
                              styles.budgetIcon,
                              { backgroundColor: categoryInfo?.color || AppTheme.colors.primary },
                            ]}
                          >
                            {categoryInfo?.emoji ? (
                              <Text style={styles.budgetEmoji}>{categoryInfo.emoji}</Text>
                            ) : (
                              <MaterialIcons
                                name="folder"
                                size={20}
                                color={AppTheme.colors.textInverse}
                              />
                            )}
                          </View>
                          <View>
                            <Text variant="titleMedium" style={styles.budgetCategory}>
                              {budget.category}
                            </Text>
                            {budget.notes && (
                              <Text variant="bodySmall" style={styles.budgetNotes}>
                                {budget.notes}
                              </Text>
                            )}
                          </View>
                        </View>
                        <View style={styles.budgetActions}>
                          <IconButton
                            icon="pencil"
                            size={16}
                            onPress={() => openEditDialog("budget", budget)}
                          />
                          <IconButton
                            icon="delete"
                            size={16}
                            onPress={() => handleDeleteItem("budget", budget.id)}
                          />
                        </View>
                      </View>
                      <GradientProgressBar
                        progress={progress}
                        allocated={budget.allocated_amount}
                        spent={spent}
                        height={12}
                      />
                    </Card.Content>
                  </Card>
                );
              })}
            </View>
          )}
        </View>

        {/* Savings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitle}>
              <Ionicons name="wallet" size={24} color={AppTheme.colors.secondary} />
              <Text variant="headlineSmall" style={styles.sectionTitleText}>
                Savings
              </Text>
            </View>
            <Button
              mode="contained"
              onPress={() => openAddDialog("saving")}
              style={styles.addButton}
              icon="plus"
            >
              Add Savings
            </Button>
          </View>

          {isLoadingData ? (
            <LoadingSpinner message="Loading savings..." />
          ) : currentSavings.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <Ionicons
                  name="wallet-outline"
                  size={48}
                  color={AppTheme.colors.textMuted}
                />
                <Text variant="bodyLarge" style={styles.emptyText}>
                  No savings yet. Tap + to add one.
                </Text>
              </Card.Content>
            </Card>
          ) : (
            <View style={styles.budgetList}>
              {currentSavings.map((saving) => {
                const categoryInfo = getCategoryInfo(saving.category);
                const balance = savingsBalances[saving.category] || 0;
                const progress = saving.target && saving.target > 0 ? balance / saving.target : 0;

                return (
                  <Card key={saving.id} style={styles.budgetCard}>
                    <Card.Content>
                      <View style={styles.budgetHeader}>
                        <View style={styles.budgetInfo}>
                          <View
                            style={[
                              styles.budgetIcon,
                              { backgroundColor: categoryInfo?.color || AppTheme.colors.secondary },
                            ]}
                          >
                            {categoryInfo?.emoji ? (
                              <Text style={styles.budgetEmoji}>{categoryInfo.emoji}</Text>
                            ) : (
                              <MaterialIcons
                                name="folder"
                                size={20}
                                color={AppTheme.colors.textInverse}
                              />
                            )}
                          </View>
                          <View>
                            <Text variant="titleMedium" style={styles.budgetCategory}>
                              {saving.category}
                            </Text>
                            <Text variant="bodySmall" style={styles.budgetNotes}>
                              Balance: €{balance.toFixed(1)}
                              {saving.target && saving.target > 0 && ` | Target: €${saving.target.toFixed(1)}`}
                              {" | Monthly: €" + saving.amount.toFixed(1)}
                            </Text>
                            {saving.notes && (
                              <Text variant="bodySmall" style={styles.budgetNotes}>
                                {saving.notes}
                              </Text>
                            )}
                          </View>
                        </View>
                        <View style={styles.budgetActions}>
                          <CustomCheckbox
                            status={saving.is_paid ? "checked" : "unchecked"}
                            onPress={() => togglePaid("saving", saving)}
                            color={AppTheme.colors.success}
                          />
                          <IconButton
                            icon="pencil"
                            size={16}
                            onPress={() => openEditDialog("saving", saving)}
                          />
                          <IconButton
                            icon="delete"
                            size={16}
                            onPress={() => handleDeleteItem("saving", saving.id)}
                          />
                        </View>
                      </View>
                      {saving.target && saving.target > 0 && (
                        <GradientProgressBar
                          progress={progress}
                          allocated={saving.target}
                          spent={balance}
                          height={12}
                        />
                      )}
                    </Card.Content>
                  </Card>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add/Edit Dialog */}
      <Dialog
        visible={dialogVisible}
        onDismiss={() => {
          setDialogVisible(false);
          setCategoryError(false);
          setAmountError(false);
        }}
        title={`${editingItem ? "Edit" : "Add"} ${
          dialogType === "income" ? "Income" : dialogType === "invoice" ? "Invoice" : dialogType === "saving" ? "Savings" : "Budget"
        }`}
        onSave={handleSaveItem}
        hasUnsavedChanges={!!(itemName || itemAmount || itemCategory || itemNotes || itemTarget || invoiceUseSavings)}
      >
        <View style={styles.dialogContent}>
          <SimpleDropdown
            label=""
            value={itemCategory}
            onValueChange={(value) => {
              setItemCategory(value);
              setCategoryError(false);
            }}
            data={categories
              .filter((c) => c.is_visible && (
                (dialogType === "income" && c.type === "income") || 
                (dialogType === "saving" && c.type === "saving") ||
                (dialogType !== "income" && dialogType !== "saving" && c.type === "expense")
              ))
              .map((cat) => ({ id: cat.name, name: cat.name, emoji: cat.emoji, color: cat.color }))}
            placeholder="Select category *"
            style={styles.input}
            error={categoryError}
          />

          {dialogType === "saving" && (
            <TextInput
              label="Target (optional)"
              value={itemTarget}
              onChangeText={setItemTarget}
              keyboardType="decimal-pad"
              placeholder="0.00"
              style={styles.input}
              left={<TextInput.Affix text="€" />}
            />
          )}

          {/* Use Savings dropdown - only show for invoice dialog */}
          {dialogType === "invoice" && (() => {
            const availableSavings = Object.entries(savingsBalances)
              .filter(([_, balance]) => balance > 0)
              .map(([catName, balance]) => ({
                id: catName,
                name: `${catName} (€${balance.toFixed(1)})`,
                emoji: categories.find(c => c.name === catName)?.emoji,
                color: categories.find(c => c.name === catName)?.color,
              }));
            
            if (availableSavings.length > 0) {
              return (
                <SimpleDropdown
                  label="Use Savings (optional)"
                  value={invoiceUseSavings || ""}
                  onValueChange={(value) => {
                    setInvoiceUseSavings(value || null);
                  }}
                  data={[
                    { id: "", name: "None", emoji: undefined, color: undefined },
                    ...availableSavings,
                  ]}
                  placeholder="None"
                  style={styles.input}
                />
              );
            }
            return null;
          })()}

          <TextInput
            label={<Text style={{ color: amountError ? 'red' : AppTheme.colors.textSecondary }}>Amount <Text style={{color: 'red'}}>*</Text></Text>}
            value={itemAmount}
            onChangeText={(value) => {
              setItemAmount(value);
              setAmountError(false);
            }}
            keyboardType="decimal-pad"
            placeholder="0.00"
            style={styles.input}
            left={<TextInput.Affix text="€" />}
          />

          {dialogType !== "budget" && dialogType !== "saving" && (
            <TextInput
              label="Name (optional)"
              value={itemName}
              onChangeText={setItemName}
              placeholder={`Uses ${dialogType} category if empty`}
              style={styles.input}
            />
          )}

          <TextInput
            label="Notes (optional)"
            value={itemNotes}
            onChangeText={setItemNotes}
            placeholder="Additional notes"
            multiline
            numberOfLines={3}
            style={styles.input}
          />
        </View>
      </Dialog>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        visible={confirmDialogVisible}
        onDismiss={() => setConfirmDialogVisible(false)}
        onConfirm={confirmDelete}
        title={`Delete ${itemToDelete?.type || "Item"}`}
        message={`Are you sure you want to delete this ${
          itemToDelete?.type || "item"
        }? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: AppTheme.spacing.lg,
    paddingVertical: AppTheme.spacing.lg,
    backgroundColor: AppTheme.colors.card,
    ...AppTheme.shadows.sm,
  },
  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: AppTheme.spacing.sm,
  },
  monthText: {
    fontWeight: AppTheme.typography.fontWeight.semibold,
    color: AppTheme.colors.textPrimary,
  },
  headerActions: {
    flexDirection: "row",
    gap: AppTheme.spacing.xs,
  },
  content: {
    flex: 1,
    padding: AppTheme.spacing.lg,
  },
  overviewCompact: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: 12,
    padding: AppTheme.spacing.md,
    marginBottom: AppTheme.spacing.xl,
    ...AppTheme.shadows.md,
  },
  overviewRow: {
    flexDirection: "row",
  },
  overviewRowDivider: {
    height: 1,
    backgroundColor: AppTheme.colors.border,
    marginVertical: AppTheme.spacing.sm,
  },
  overviewCompactItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  overviewItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  overviewCompactLabel: {
    color: AppTheme.colors.textSecondary,
    fontSize: 11,
    fontWeight: AppTheme.typography.fontWeight.medium,
  },
  overviewDivider: {
    width: 1,
    backgroundColor: AppTheme.colors.border,
    marginVertical: AppTheme.spacing.xs,
  },
  positiveAmount: {
    color: AppTheme.colors.success,
    fontWeight: AppTheme.typography.fontWeight.bold,
  },
  negativeAmount: {
    color: AppTheme.colors.error,
    fontWeight: AppTheme.typography.fontWeight.bold,
  },
  neutralAmount: {
    color: AppTheme.colors.textPrimary,
    fontWeight: AppTheme.typography.fontWeight.bold,
  },
  copyCard: {
    marginBottom: AppTheme.spacing.xl,
    ...AppTheme.shadows.md,
  },
  copyContent: {
    alignItems: "center",
    paddingVertical: AppTheme.spacing.lg,
  },
  copyTitle: {
    marginTop: AppTheme.spacing.md,
    marginBottom: AppTheme.spacing.sm,
    fontWeight: AppTheme.typography.fontWeight.semibold,
    color: AppTheme.colors.textPrimary,
  },
  copySubtitle: {
    textAlign: "center",
    color: AppTheme.colors.textSecondary,
    marginBottom: AppTheme.spacing.lg,
  },
  copyButton: {
    backgroundColor: AppTheme.colors.primary,
  },
  section: {
    marginBottom: AppTheme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: AppTheme.spacing.lg,
  },
  sectionTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: AppTheme.spacing.sm,
  },
  sectionTitleText: {
    fontWeight: AppTheme.typography.fontWeight.semibold,
    color: AppTheme.colors.textPrimary,
  },
  addButton: {
    backgroundColor: AppTheme.colors.primary,
  },
  emptyCard: {
    ...AppTheme.shadows.sm,
  },
  emptyContent: {
    alignItems: "center",
    paddingVertical: AppTheme.spacing.xl,
  },
  emptyText: {
    marginTop: AppTheme.spacing.md,
    textAlign: "center",
    color: AppTheme.colors.textSecondary,
  },
  categoryList: {
    gap: AppTheme.spacing.md,
  },
  categoryCard: {
    ...AppTheme.shadows.sm,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: AppTheme.spacing.lg,
  },
  categoryHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: AppTheme.spacing.md,
  },
  categoryEmoji: {
    fontSize: 20,
    color: AppTheme.colors.textInverse,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontWeight: AppTheme.typography.fontWeight.semibold,
    color: AppTheme.colors.textPrimary,
  },
  categorySubtext: {
    color: AppTheme.colors.textSecondary,
    marginTop: 2,
  },
  categoryItems: {
    paddingHorizontal: AppTheme.spacing.lg,
    paddingBottom: AppTheme.spacing.lg,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: AppTheme.spacing.sm,
    gap: AppTheme.spacing.sm,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontWeight: AppTheme.typography.fontWeight.medium,
    color: AppTheme.colors.textPrimary,
  },
  itemPaid: {
    opacity: 0.6,
  },
  itemNotes: {
    color: AppTheme.colors.textSecondary,
    marginTop: 2,
  },
  itemAmount: {
    fontWeight: AppTheme.typography.fontWeight.semibold,
    color: AppTheme.colors.textPrimary,
  },
  itemActions: {
    flexDirection: "row",
    gap: AppTheme.spacing.xs,
  },
  actionButton: {
    margin: 0,
  },
  budgetList: {
    gap: AppTheme.spacing.md,
  },
  budgetCard: {
    ...AppTheme.shadows.sm,
  },
  budgetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: AppTheme.spacing.md,
  },
  budgetInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  budgetIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: AppTheme.spacing.md,
  },
  budgetEmoji: {
    fontSize: 20,
    color: AppTheme.colors.textInverse,
  },
  budgetCategory: {
    fontWeight: AppTheme.typography.fontWeight.semibold,
    color: AppTheme.colors.textPrimary,
  },
  budgetNotes: {
    color: AppTheme.colors.textSecondary,
    marginTop: 2,
  },
  budgetActions: {
    flexDirection: "row",
  },
  dialogContent: {
    gap: AppTheme.spacing.lg,
  },
  input: {
    backgroundColor: AppTheme.colors.background,
  },
});
