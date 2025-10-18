import logger from "@/app/utils/logger";
import { useSnackbar } from "@/components/snackbar-provider";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Dialog } from "@/components/ui/Dialog";
import { GradientProgressBar } from "@/components/ui/GradientProgressBar";
import { SimpleDropdown } from "@/components/ui/SimpleDropdown";
import { AppTheme } from "@/constants/AppTheme";
import { useMonth } from "@/lib/month-context";
import {
  deleteBudget,
  deleteIncome,
  deleteInvoice,
  deleteTransaction,
  loadBudgets,
  loadCategories,
  loadIncomes,
  loadInvoices,
  loadSettings,
  loadTransactions,
  saveBudget,
  saveIncome,
  saveInvoice,
  saveTransaction,
} from "@/lib/storage";
import type { Budget, Category, ExpectedIncome, ExpectedInvoice, Transaction } from "@/lib/types";
import Ionicons from "@react-native-vector-icons/ionicons";
import MaterialIcons from "@react-native-vector-icons/material-design-icons";
import { addMonths, endOfMonth, format, startOfMonth } from "date-fns";
import { useFocusEffect } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Button, Card, Checkbox, IconButton, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

function monthKey(d: Date): string {
  return format(d, "yyyy-MM");
}

export default function HomeScreen() {
  const { showSnackbar } = useSnackbar();
  const { currentMonth, setCurrentMonth } = useMonth();

  // Log navigation
  React.useEffect(() => {
    logger.navigationAction("BudgetScreen", { month: currentMonth });
  }, [currentMonth]);

  // Data states
  const [incomes, setIncomes] = React.useState<ExpectedIncome[]>([]);
  const [invoices, setInvoices] = React.useState<ExpectedInvoice[]>([]);
  const [budgets, setBudgets] = React.useState<Budget[]>([]);
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [settings, setSettings] = React.useState({ starting_balance: 0 });

  // UI states
  const [dialogVisible, setDialogVisible] = React.useState(false);
  const [dialogType, setDialogType] = React.useState<"income" | "invoice" | "budget">("income");
  const [editingItem, setEditingItem] = React.useState<
    ExpectedIncome | ExpectedInvoice | Budget | null
  >(null);
  const [itemName, setItemName] = React.useState("");
  const [itemCategory, setItemCategory] = React.useState("");
  const [itemAmount, setItemAmount] = React.useState("");
  const [itemNotes, setItemNotes] = React.useState("");

  // Category grouping states
  const [expandedCategories, setExpandedCategories] = React.useState<Set<string>>(new Set());

  // Confirmation dialog states
  const [confirmDialogVisible, setConfirmDialogVisible] = React.useState(false);
  const [itemToDelete, setItemToDelete] = React.useState<{ id: string; type: string } | null>(null);

  // Load data on mount
  React.useEffect(() => {
    (async () => {
      logger.breadcrumb("Loading budget screen data", "data_loading");
      const startTime = Date.now();
      
      try {
        const [incms, invcs, bdgts, txs, cats, sttngs] = await Promise.all([
          loadIncomes(),
          loadInvoices(),
          loadBudgets(),
          loadTransactions(),
          loadCategories(),
          loadSettings(),
        ]);
        
        setIncomes(incms);
        setInvoices(invcs);
        setBudgets(bdgts);
        setTransactions(txs);
        setCategories(cats);
        setSettings({
          starting_balance: sttngs.starting_balance || 0,
        });
        
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
  }, []);

  // Refetch categories and transactions when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const [cats, txs] = await Promise.all([loadCategories(), loadTransactions()]);
        setCategories(cats);
        setTransactions(txs);
      })();
    }, [])
  );

  const curMonth = monthKey(currentMonth);
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  // Filter items for current month
  const currentIncomes = incomes.filter((i) => i.month === curMonth);
  const currentInvoices = invoices.filter((i) => i.month === curMonth);
  const currentBudgets = budgets.filter((b) => b.month === curMonth);

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
  const moneyToAssign = expectedIncome - expectedExpenses - totalAllocated;
  const actualInBank =
    settings.starting_balance + transactions.reduce((sum, t) => sum + t.amount, 0);

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

  const openAddDialog = (type: "income" | "invoice" | "budget") => {
    setDialogType(type);
    setEditingItem(null);
    setItemName("");
    setItemCategory("");
    setItemAmount("");
    setItemNotes("");
    setDialogVisible(true);
  };

  const openEditDialog = (type: "income" | "invoice" | "budget", item: any) => {
    setDialogType(type);
    setEditingItem(item);
    setItemName(type === "budget" ? "" : item.name === item.category ? "" : item.name);
    setItemCategory(item.category);
    setItemAmount(String(type === "budget" ? item.allocated_amount : item.amount));
    setItemNotes(item.notes || "");
    setDialogVisible(true);
  };

  const togglePaid = async (type: "income" | "invoice", item: ExpectedIncome | ExpectedInvoice) => {
    if (item.is_paid) {
      // Unmark as paid - delete the associated transaction
      const relatedTx = transactions.find(
        (t) =>
          t.description === item.name &&
          t.category === item.category &&
          Math.abs(t.amount) === item.amount &&
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
      } else {
        const success = await saveInvoice(updatedItem as ExpectedInvoice);
        if (success) {
          setInvoices((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_paid: false } : i)));
          showSnackbar("Unmarked as paid!");
        }
      }
      return;
    }

    // Mark as paid - create transaction
    const tx: Transaction = {
      id: crypto.randomUUID(),
      amount: type === "income" ? item.amount : -item.amount,
      description: item.name,
      date: format(new Date(), "yyyy-MM-dd"),
      category: item.category,
      status: "paid",
      created_at: new Date().toISOString(),
    };

    const txSuccess = await saveTransaction(tx);
    if (!txSuccess) {
      showSnackbar("Failed to create transaction");
      return;
    }

    setTransactions((prev) => [tx, ...prev]);

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
    } else {
      const success = await saveInvoice(updatedItem as ExpectedInvoice);
      if (success) {
        setInvoices((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_paid: true } : i)));
        showSnackbar("Marked as paid!");
      } else {
        showSnackbar("Failed to update invoice");
      }
    }
  };

  const handleSaveItem = async () => {
    const amount = parseFloat(itemAmount);
    if (Number.isNaN(amount) || amount <= 0) {
      showSnackbar("Please enter a valid amount");
      return;
    }

    if (!itemCategory) {
      showSnackbar("Please select a category");
      return;
    }

    const id = editingItem?.id || crypto.randomUUID();
    const now = new Date().toISOString();

    if (dialogType === "income") {
      const income: ExpectedIncome = {
        id,
        name: itemName || itemCategory, // Use category name if name is empty
        category: itemCategory,
        amount,
        month: curMonth,
        is_paid: (editingItem as ExpectedIncome)?.is_paid || false,
        notes: itemNotes || undefined,
        created_at: editingItem?.created_at || now,
        updated_at: now,
      };
      const success = await saveIncome(income);
      if (success) {
        setIncomes((prev) => {
          const next = prev.filter((i) => i.id !== id);
          next.push(income);
          return next;
        });
        showSnackbar(editingItem ? "Income updated!" : "Income added!");
        setDialogVisible(false);
      } else {
        showSnackbar("Failed to save income");
      }
    } else if (dialogType === "invoice") {
      const invoice: ExpectedInvoice = {
        id,
        name: itemName || itemCategory, // Use category name if name is empty
        category: itemCategory,
        amount,
        month: curMonth,
        is_paid: (editingItem as ExpectedInvoice)?.is_paid || false,
        notes: itemNotes || undefined,
        created_at: editingItem?.created_at || now,
        updated_at: now,
      };
      const success = await saveInvoice(invoice);
      if (success) {
        setInvoices((prev) => {
          const next = prev.filter((i) => i.id !== id);
          next.push(invoice);
          return next;
        });
        showSnackbar(editingItem ? "Invoice updated!" : "Invoice added!");
        setDialogVisible(false);
      } else {
        showSnackbar("Failed to save invoice");
      }
    } else if (dialogType === "budget") {
      const budget: Budget = {
        id,
        category: itemCategory,
        allocated_amount: amount,
        month: curMonth,
        notes: itemNotes || undefined,
        created_at: editingItem?.created_at || now,
        updated_at: now,
      };
      const success = await saveBudget(budget);
      if (success) {
        setBudgets((prev) => {
          const next = prev.filter((b) => b.id !== id);
          next.push(budget);
          return next;
        });
        showSnackbar(editingItem ? "Budget updated!" : "Budget added!");
        setDialogVisible(false);
      } else {
        showSnackbar("Failed to save budget");
      }
    }
  };

  const handleDeleteItem = (type: "income" | "invoice" | "budget", id: string) => {
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
      const newIncome = { ...income, id: crypto.randomUUID(), month: curMonth, is_paid: false };
      const success = await saveIncome(newIncome);
      if (success) {
        setIncomes((prev) => [...prev, newIncome]);
        count++;
      }
    }

    // Copy invoices
    for (const invoice of prevInvoices) {
      const newInvoice = { ...invoice, id: crypto.randomUUID(), month: curMonth, is_paid: false };
      const success = await saveInvoice(newInvoice);
      if (success) {
        setInvoices((prev) => [...prev, newInvoice]);
        count++;
      }
    }

    // Copy budgets
    for (const budget of prevBudgets) {
      const newBudget = { ...budget, id: crypto.randomUUID(), month: curMonth };
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
    return categories.find((c) => c.name === categoryName);
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
                <Checkbox
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Cash Overview */}
        <Card style={styles.overviewCard}>
          <Card.Content>
            <Text variant="labelMedium" style={styles.overviewLabel}>
              CASH OVERVIEW
            </Text>

            {/* Top Row: Expected Income, Expected Expenses, Money to Assign */}
            <View style={styles.overviewTopRow}>
              <View style={styles.overviewItem}>
                <Ionicons name="trending-up" size={20} color={AppTheme.colors.success} />
                <Text variant="bodySmall" style={styles.overviewLabel}>
                  Expected Income
                </Text>
                <Text variant="titleMedium" style={styles.positiveAmount}>
                  €{expectedIncome.toFixed(1)}
                </Text>
              </View>
              <View style={styles.overviewItem}>
                <Ionicons name="trending-down" size={20} color={AppTheme.colors.error} />
                <Text variant="bodySmall" style={styles.overviewLabel}>
                  Expected Expenses
                </Text>
                <Text variant="titleMedium" style={styles.negativeAmount}>
                  €{expectedExpenses.toFixed(1)}
                </Text>
              </View>
              <View style={styles.overviewItem}>
                <Ionicons name="add-circle" size={20} color={AppTheme.colors.warning} />
                <Text variant="bodySmall" style={styles.overviewLabel}>
                  Money to Assign
                </Text>
                <Text
                  variant="titleMedium"
                  style={[
                    styles.overviewAmount,
                    moneyToAssign >= 0 ? styles.positiveAmount : styles.negativeAmount,
                  ]}
                >
                  €{moneyToAssign.toFixed(1)}
                </Text>
              </View>
            </View>

            {/* Bottom Row: In Bank */}
            <View style={styles.overviewBottomRow}>
              <View style={styles.overviewItem}>
                <Ionicons name="wallet" size={20} color={AppTheme.colors.primary} />
                <Text variant="bodySmall" style={styles.overviewLabel}>
                  In Bank
                </Text>
                <Text
                  variant="headlineSmall"
                  style={[
                    styles.overviewAmount,
                    actualInBank >= 0 ? styles.positiveAmount : styles.negativeAmount,
                  ]}
                >
                  €{actualInBank.toFixed(1)}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

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

          {Object.keys(incomesByCategory).length === 0 ? (
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

          {Object.keys(invoicesByCategory).length === 0 ? (
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

          {currentBudgets.length === 0 ? (
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
      </ScrollView>

      {/* Add/Edit Dialog */}
      <Dialog
        visible={dialogVisible}
        onDismiss={() => setDialogVisible(false)}
        title={`${editingItem ? "Edit" : "Add"} ${
          dialogType === "income" ? "Income" : dialogType === "invoice" ? "Invoice" : "Budget"
        }`}
        onSave={handleSaveItem}
        hasUnsavedChanges={!!(itemName || itemAmount || itemCategory || itemNotes)}
      >
        <View style={styles.dialogContent}>
          {dialogType !== "budget" && (
            <TextInput
              label="Name (optional)"
              value={itemName}
              onChangeText={setItemName}
              placeholder={`Uses ${dialogType} category if empty`}
              style={styles.input}
            />
          )}

          <SimpleDropdown
            label="Category"
            value={itemCategory}
            onValueChange={setItemCategory}
            data={categories
              .filter((c) => c.is_visible && (
                (dialogType === "income" && c.type === "income") || 
                (dialogType !== "income" && c.type === "expense")
              ))
              .map((cat) => ({ id: cat.name, name: cat.name }))}
            placeholder="Select category"
            style={styles.input}
          />

          <TextInput
            label="Amount"
            value={itemAmount}
            onChangeText={setItemAmount}
            keyboardType="decimal-pad"
            placeholder="€0.0"
            style={styles.input}
          />

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
  overviewCard: {
    marginBottom: AppTheme.spacing.xl,
    ...AppTheme.shadows.md,
  },
  overviewLabel: {
    color: AppTheme.colors.textSecondary,
    marginBottom: AppTheme.spacing.lg,
    fontWeight: AppTheme.typography.fontWeight.medium,
  },
  overviewTopRow: {
    flexDirection: "row",
    gap: AppTheme.spacing.md,
    marginBottom: AppTheme.spacing.lg,
  },
  overviewBottomRow: {
    flexDirection: "row",
    paddingTop: AppTheme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: AppTheme.colors.border,
  },
  overviewItem: {
    flex: 1,
    alignItems: "center",
    gap: AppTheme.spacing.xs,
  },
  overviewAmount: {
    fontWeight: AppTheme.typography.fontWeight.bold,
    marginTop: AppTheme.spacing.xs,
  },
  positiveAmount: {
    color: AppTheme.colors.success,
  },
  negativeAmount: {
    color: AppTheme.colors.error,
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
