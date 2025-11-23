import logger from "@/app/utils/logger";
import { useSnackbar } from "@/components/snackbar-provider";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Dialog as CustomDialog } from "@/components/ui/Dialog";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { SimpleDropdown } from "@/components/ui/SimpleDropdown";
import { AppTheme } from "@/constants/AppTheme";
import { useMonth } from "@/lib/month-context";
import {
  deleteTransaction,
  getSavingsBalance,
  loadCategories,
  loadIncomes,
  loadInvoices,
  loadSavings,
  loadTransactions,
  saveIncome,
  saveInvoice,
  saveTransaction,
  saveTransactions,
} from "@/lib/storage";
import type { Category, ExpectedIncome, ExpectedInvoice, ExpectedSavings, Transaction } from "@/lib/types";
import Ionicons from "@react-native-vector-icons/ionicons";
import { endOfMonth, format, startOfMonth } from "date-fns";
import * as Crypto from "expo-crypto";
import { useFocusEffect } from "expo-router";
import React from "react";
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Card, Chip, FAB, IconButton, Menu, Searchbar, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TransactionsScreen() {
  const { showSnackbar } = useSnackbar();
  const { currentMonth, setCurrentMonth } = useMonth();
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [incomes, setIncomes] = React.useState<ExpectedIncome[]>([]);
  const [invoices, setInvoices] = React.useState<ExpectedInvoice[]>([]);
  const [savings, setSavings] = React.useState<ExpectedSavings[]>([]);
  const [savingsBalances, setSavingsBalances] = React.useState<Record<string, number>>({});

  // Log navigation and refetch month-specific data when month changes
  React.useEffect(() => {
    logger.navigationAction("TransactionsScreen", { month: currentMonth });

    // Refetch only month-dependent data when month changes
    (async () => {
      const [txs, incms, invcs, svgs, cats] = await Promise.all([
        loadTransactions(), // needed for recent transactions
        loadIncomes(), // needed for upcoming incomes
        loadInvoices(), // needed for upcoming invoices
        loadSavings(), // needed for savings items
        loadCategories(), // needed for savings balance calculation
      ]);
      setTransactions(txs);
      setIncomes(incms);
      setInvoices(invcs);
      setSavings(svgs);
      setCategories(cats);

      // Calculate savings balances
      const savingCategories = cats.filter((c) => c.type === "saving");
      const balances: Record<string, number> = {};
      for (const cat of savingCategories) {
        balances[cat.name] = await getSavingsBalance(cat.name);
      }
      setSavingsBalances(balances);
      // Categories don't need refresh - they're month-independent
    })();
  }, [currentMonth]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [upcomingExpanded, setUpcomingExpanded] = React.useState(false);
  const [savingsExpanded, setSavingsExpanded] = React.useState(false);
  const [incomeExpanded, setIncomeExpanded] = React.useState(false);
  const [expenseExpanded, setExpenseExpanded] = React.useState(true);

  // Search and filter states
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

  // Menu state for transaction actions
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);

  // Form states
  const [dialogVisible, setDialogVisible] = React.useState(false);
  const [editing, setEditing] = React.useState<Transaction | null>(null);
  const [amount, setAmount] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [date, setDate] = React.useState(format(new Date(), "yyyy-MM-dd"));
  const [category, setCategory] = React.useState("General");
  const [useSavingsCategory, setUseSavingsCategory] = React.useState<string | null>(null);

  // Validation error states
  const [categoryError, setCategoryError] = React.useState(false);
  const [amountError, setAmountError] = React.useState(false);

  // Confirmation dialog states
  const [confirmDialogVisible, setConfirmDialogVisible] = React.useState(false);
  const [itemToDelete, setItemToDelete] = React.useState<{ id: string; type: string } | null>(null);
  const [pendingDialogVisible, setPendingDialogVisible] = React.useState(false);
  const [itemToPending, setItemToPending] = React.useState<{ id: string; transaction: Transaction } | null>(null);

  // Pull-to-refresh state
  const [refreshing, setRefreshing] = React.useState(false);

  // Data loading state
  const [isLoadingData, setIsLoadingData] = React.useState(true);

  // Load data when screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        setIsLoadingData(true);
        try {
          const [txs, incms, invcs, svgs, cats] = await Promise.all([loadTransactions(), loadIncomes(), loadInvoices(), loadSavings(), loadCategories()]);
          setTransactions(txs);
          setIncomes(incms);
          setInvoices(invcs);
          setSavings(svgs);
          setCategories(cats);

          // Calculate savings balances
          const savingCategories = cats.filter((c) => c.type === "saving");
          const balances: Record<string, number> = {};
          for (const cat of savingCategories) {
            balances[cat.name] = await getSavingsBalance(cat.name);
          }
          setSavingsBalances(balances);
        } finally {
          setIsLoadingData(false);
        }
      })();
    }, [])
  );

  // Pull-to-refresh handler
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    logger.breadcrumb("Pull-to-refresh triggered", "data_refresh");

    try {
      const [txs, incms, invcs, svgs, cats] = await Promise.all([loadTransactions(), loadIncomes(), loadInvoices(), loadSavings(), loadCategories()]);

      setTransactions(txs);
      setIncomes(incms);
      setInvoices(invcs);
      setSavings(svgs);
      setCategories(cats);

      // Calculate savings balances
      const savingCategories = cats.filter((c) => c.type === "saving");
      const balances: Record<string, number> = {};
      for (const cat of savingCategories) {
        balances[cat.name] = await getSavingsBalance(cat.name);
      }
      setSavingsBalances(balances);

      logger.dataAction("pull_to_refresh", {
        transactionsCount: txs.length,
        incomesCount: incms.length,
        invoicesCount: invcs.length,
        categoriesCount: cats.length,
      });
    } catch (error) {
      logger.error(error as Error, { operation: "pull_to_refresh" });
      showSnackbar("Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  }, [showSnackbar]);

  // Filter by current month
  const currentMonthKey = format(currentMonth, "yyyy-MM");
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  // Upcoming items: unpaid incomes/invoices for current month + upcoming transactions
  const upcomingFromIncomes = incomes.filter((i) => !i.is_paid && i.month === currentMonthKey);
  const upcomingFromInvoices = invoices.filter((i) => !i.is_paid && i.month === currentMonthKey);
  const upcomingTransactions = transactions.filter((t) => t.status === "upcoming");

  // Savings items: paid savings for current month
  const paidSavings = savings.filter((s) => s.is_paid && s.month === currentMonthKey);

  // Recent: paid transactions for current month only
  const recentTransactions = transactions
    .filter((t) => {
      if (t.status !== "paid") return false;

      // Filter by current month
      const transactionDate = new Date(t.date + "T00:00:00");
      return transactionDate >= monthStart && transactionDate <= monthEnd;
    })
    .sort((a, b) => {
      // First sort by date (descending - newest first)
      const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateCompare !== 0) return dateCompare;
      // Then by order_index (ascending - lower values first) for same-date transactions
      return (a.order_index ?? 0) - (b.order_index ?? 0);
    });

  // Filter transactions based on search and filters
  const filteredTransactions = recentTransactions.filter((tx) => {
    const matchesSearch = searchQuery === "" || tx.description.toLowerCase().includes(searchQuery.toLowerCase()) || tx.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === null || tx.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Separate income and expense transactions
  const incomeTransactions = filteredTransactions.filter((t) => t.amount > 0);
  const expenseTransactions = filteredTransactions.filter((t) => t.amount < 0);

  const resetForm = () => {
    setAmount("");
    setDescription("");
    setDate(format(new Date(), "yyyy-MM-dd"));
    setCategory("General");
    setUseSavingsCategory(null);
    setEditing(null);
  };

  const handleSave = async () => {
    // Check for missing required fields
    const hasEmptyCategory = !category;
    const hasEmptyAmount = !amount;

    setCategoryError(hasEmptyCategory);
    setAmountError(hasEmptyAmount);

    if (hasEmptyCategory || hasEmptyAmount) {
      return false;
    }

    const amt = parseFloat(amount.replace(",", "."));
    if (isNaN(amt)) {
      showSnackbar("Invalid amount entered");
      return false;
    }

    // Determine if this is an income or expense based on category type
    const categoryInfo = getCategoryInfo(category);
    const isIncome = categoryInfo?.type === "income";

    // Find category_id from category name
    const categoryObj = categories.find((c) => c.name === category);
    // Find uses_savings_category_id if using savings
    const usesSavingsCategoryObj = useSavingsCategory ? categories.find((c) => c.name === useSavingsCategory && c.type === "saving") : undefined;

    // Calculate savings usage if selected
    let savingsAmountUsed = 0;
    if (useSavingsCategory && !isIncome && savingsBalances[useSavingsCategory]) {
      const availableBalance = savingsBalances[useSavingsCategory];
      const transactionAmount = Math.abs(amt);
      // Use up to the available balance, capped at transaction amount
      savingsAmountUsed = Math.min(availableBalance, transactionAmount);
    }

    // Calculate order_index: preserve when editing, append to end of same-date list for new transactions
    let orderIndex: number;
    if (editing) {
      orderIndex = editing.order_index ?? 0;
    } else {
      // Find the maximum order_index for the same date and add 1
      const sameDateTransactions = transactions.filter((t) => t.date === date);
      const maxOrderIndex = sameDateTransactions.reduce((max, t) => Math.max(max, t.order_index ?? -1), -1);
      orderIndex = maxOrderIndex + 1; // Append to end with next sequential index
    }

    const tx: Transaction = {
      id: editing?.id || Crypto.randomUUID(),
      amount: isIncome ? Math.abs(amt) : -Math.abs(amt), // Positive for income, negative for expense
      description,
      date,
      category,
      category_id: categoryObj?.id,
      status: "paid", // Only allow paid transactions
      created_at: editing?.created_at || new Date().toISOString(),
      // Preserve source fields when editing
      source_type: editing?.source_type,
      source_id: editing?.source_id,
      // Savings usage fields
      uses_savings_category: useSavingsCategory || undefined,
      uses_savings_category_id: usesSavingsCategoryObj?.id,
      savings_amount_used: savingsAmountUsed > 0 ? savingsAmountUsed : undefined,
      // Order index - appends to end of same-date transactions
      order_index: orderIndex,
    };

    const success = await saveTransaction(tx);
    if (success) {
      // Update savings balance if savings were used
      if (savingsAmountUsed > 0 && useSavingsCategory) {
        const balance = await getSavingsBalance(useSavingsCategory);
        setSavingsBalances((prev) => ({ ...prev, [useSavingsCategory]: balance }));
      }
      if (editing) {
        setTransactions((prev) => prev.map((t) => (t.id === tx.id ? tx : t)));

        // If transaction was created from an expected item, sync changes back
        if (editing.source_type && editing.source_id) {
          const amountChanged = Math.abs(tx.amount) !== Math.abs(editing.amount);
          const categoryChanged = tx.category !== editing.category;
          const descriptionChanged = tx.description !== editing.description;

          if (amountChanged || categoryChanged || descriptionChanged) {
            if (editing.source_type === "income") {
              const sourceIncome = incomes.find((i) => i.id === editing.source_id);
              if (sourceIncome) {
                const updatedIncome = {
                  ...sourceIncome,
                  amount: Math.abs(tx.amount),
                  category: tx.category,
                  name: tx.description,
                  updated_at: new Date().toISOString(),
                };
                await saveIncome(updatedIncome);
                setIncomes((prev) => prev.map((i) => (i.id === editing.source_id ? updatedIncome : i)));
              }
            } else if (editing.source_type === "invoice") {
              const sourceInvoice = invoices.find((i) => i.id === editing.source_id);
              if (sourceInvoice) {
                const updatedInvoice = {
                  ...sourceInvoice,
                  amount: Math.abs(tx.amount),
                  category: tx.category,
                  name: tx.description,
                  updated_at: new Date().toISOString(),
                };
                await saveInvoice(updatedInvoice);
                setInvoices((prev) => prev.map((i) => (i.id === editing.source_id ? updatedInvoice : i)));
              }
            }
          }
        }

        showSnackbar("Transaction updated!");
      } else {
        setTransactions((prev) => [tx, ...prev]);
        showSnackbar("Transaction added!");
      }
      resetForm();
      return true;
    } else {
      showSnackbar("Failed to save transaction");
      return false;
    }
  };

  const handleEdit = (t: Transaction) => {
    setEditing(t);
    setAmount(Math.abs(t.amount).toFixed(2));
    setDescription(t.description);
    setDate(t.date);
    setCategory(t.category);
    setUseSavingsCategory(t.uses_savings_category || null);
    setDialogVisible(true);
  };

  const handleDelete = (transaction: Transaction) => {
    // Check if transaction has a source (created from expected income/invoice)
    if (transaction.source_type && transaction.source_id) {
      // Show "Move to Pending" dialog
      setItemToPending({ id: transaction.id, transaction });
      setPendingDialogVisible(true);
    } else {
      // Show regular delete dialog for manually created transactions
      setItemToDelete({ id: transaction.id, type: "transaction" });
      setConfirmDialogVisible(true);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    const success = await deleteTransaction(itemToDelete.id);
    if (success) {
      setTransactions((prev) => prev.filter((t) => t.id !== itemToDelete.id));
      showSnackbar("Transaction deleted");
    } else {
      showSnackbar("Failed to delete transaction");
    }
    setItemToDelete(null);
  };

  const confirmMoveToPending = async () => {
    if (!itemToPending) return;

    const { transaction } = itemToPending;

    const success = await deleteTransaction(transaction.id);
    if (success) {
      setTransactions((prev) => prev.filter((t) => t.id !== transaction.id));

      // Mark the source expected item as unpaid
      if (transaction.source_type === "income") {
        const sourceIncome = incomes.find((i) => i.id === transaction.source_id);
        if (sourceIncome) {
          const updatedIncome = { ...sourceIncome, is_paid: false, updated_at: new Date().toISOString() };
          await saveIncome(updatedIncome);
          setIncomes((prev) => prev.map((i) => (i.id === transaction.source_id ? updatedIncome : i)));
        }
      } else if (transaction.source_type === "invoice") {
        const sourceInvoice = invoices.find((i) => i.id === transaction.source_id);
        if (sourceInvoice) {
          const updatedInvoice = { ...sourceInvoice, is_paid: false, updated_at: new Date().toISOString() };
          await saveInvoice(updatedInvoice);
          setInvoices((prev) => prev.map((i) => (i.id === transaction.source_id ? updatedInvoice : i)));
        }
      }

      showSnackbar("Moved back to pending");
    } else {
      showSnackbar("Failed to move to pending");
    }
    setItemToPending(null);
  };

  const getCategoryInfo = (categoryName: string) => {
    return categories.find((c) => c.name === categoryName);
  };

  const formatAmount = (amount: number) => {
    const sign = amount >= 0 ? "+" : "-";
    const color = amount >= 0 ? AppTheme.colors.success : AppTheme.colors.error;
    return (
      <Text style={[styles.amountText, { color }]}>
        {sign}€{Math.abs(amount).toFixed(1)}
      </Text>
    );
  };

  // Move transaction up in the list (only works for same-date transactions)
  const handleMoveUp = React.useCallback(
    async (transactionId: string, isIncome: boolean) => {
      // Get the current transactions outside of setState to avoid stale closure issues
      setTransactions((prev) => {
        // Get the correct filtered list sorted by date DESC, order_index ASC
        const relevantList = (isIncome ? prev.filter((t) => t.amount > 0) : prev.filter((t) => t.amount < 0)).sort((a, b) => {
          // Sort by date first (descending)
          const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
          if (dateCompare !== 0) return dateCompare;
          // Then by order_index (ascending)
          return (a.order_index ?? 0) - (b.order_index ?? 0);
        });

        const currentIndex = relevantList.findIndex((t) => t.id === transactionId);
        if (currentIndex <= 0) {
          logger.breadcrumb("Cannot move up - already at top or not found", "reorder", { transactionId, currentIndex });
          return prev; // Already at the top or not found
        }

        const itemToMove = relevantList[currentIndex];
        const itemToSwap = relevantList[currentIndex - 1];

        // Safety check: only allow reordering within the same date (arrows should prevent this, but double-check)
        if (itemToMove.date !== itemToSwap.date) {
          logger.breadcrumb("Cannot move up - different dates", "reorder", { transactionId });
          return prev; // Silently ignore - UI shouldn't allow this
        }

        // Swap order_index values
        const updatedItemToMove = { ...itemToMove, order_index: itemToSwap.order_index ?? 0 };
        const updatedItemToSwap = { ...itemToSwap, order_index: itemToMove.order_index ?? 0 };

        logger.breadcrumb("Swapping transactions", "reorder", {
          moveId: itemToMove.id,
          moveOldIndex: itemToMove.order_index,
          moveNewIndex: updatedItemToMove.order_index,
          swapId: itemToSwap.id,
          swapOldIndex: itemToSwap.order_index,
          swapNewIndex: updatedItemToSwap.order_index,
        });

        // Persist to database (fire and forget, but log errors)
        saveTransactions([updatedItemToMove, updatedItemToSwap]).then((success) => {
          if (!success) {
            logger.error(new Error("Failed to save transaction order"), { operation: "move_transaction_up", transactionId, isIncome });
            showSnackbar("Failed to save order");
          } else {
            logger.databaseSuccess("update_transaction_order", { transactionId, isIncome, direction: "up" });
          }
        });

        // Create new array with swapped positions - ensure we create new object references
        const newTransactions = prev.map((t) => {
          if (t.id === itemToMove.id) return updatedItemToMove;
          if (t.id === itemToSwap.id) return updatedItemToSwap;
          return t;
        });

        logger.breadcrumb("Returning new transaction array", "reorder", { prevLength: prev.length, newLength: newTransactions.length });
        return newTransactions;
      });
      logger.userAction("move_transaction_up", { transactionId, isIncome });
    },
    [showSnackbar]
  );

  // Move transaction down in the list (only works for same-date transactions)
  const handleMoveDown = React.useCallback(
    async (transactionId: string, isIncome: boolean) => {
      // Get the current transactions outside of setState to avoid stale closure issues
      setTransactions((prev) => {
        // Get the correct filtered list sorted by date DESC, order_index ASC
        const relevantList = (isIncome ? prev.filter((t) => t.amount > 0) : prev.filter((t) => t.amount < 0)).sort((a, b) => {
          // Sort by date first (descending)
          const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
          if (dateCompare !== 0) return dateCompare;
          // Then by order_index (ascending)
          return (a.order_index ?? 0) - (b.order_index ?? 0);
        });

        const currentIndex = relevantList.findIndex((t) => t.id === transactionId);
        if (currentIndex < 0 || currentIndex >= relevantList.length - 1) {
          logger.breadcrumb("Cannot move down - already at bottom or not found", "reorder", { transactionId, currentIndex, listLength: relevantList.length });
          return prev; // Already at bottom or not found
        }

        const itemToMove = relevantList[currentIndex];
        const itemToSwap = relevantList[currentIndex + 1];

        // Safety check: only allow reordering within the same date (arrows should prevent this, but double-check)
        if (itemToMove.date !== itemToSwap.date) {
          logger.breadcrumb("Cannot move down - different dates", "reorder", { transactionId });
          return prev; // Silently ignore - UI shouldn't allow this
        }

        // Swap order_index values
        const updatedItemToMove = { ...itemToMove, order_index: itemToSwap.order_index ?? 0 };
        const updatedItemToSwap = { ...itemToSwap, order_index: itemToMove.order_index ?? 0 };

        logger.breadcrumb("Swapping transactions", "reorder", {
          moveId: itemToMove.id,
          moveOldIndex: itemToMove.order_index,
          moveNewIndex: updatedItemToMove.order_index,
          swapId: itemToSwap.id,
          swapOldIndex: itemToSwap.order_index,
          swapNewIndex: updatedItemToSwap.order_index,
        });

        // Persist to database (fire and forget, but log errors)
        saveTransactions([updatedItemToMove, updatedItemToSwap]).then((success) => {
          if (!success) {
            logger.error(new Error("Failed to save transaction order"), { operation: "move_transaction_down", transactionId, isIncome });
            showSnackbar("Failed to save order");
          } else {
            logger.databaseSuccess("update_transaction_order", { transactionId, isIncome, direction: "down" });
          }
        });

        // Create new array with swapped positions - ensure we create new object references
        const newTransactions = prev.map((t) => {
          if (t.id === itemToMove.id) return updatedItemToMove;
          if (t.id === itemToSwap.id) return updatedItemToSwap;
          return t;
        });

        logger.breadcrumb("Returning new transaction array", "reorder", { prevLength: prev.length, newLength: newTransactions.length });
        return newTransactions;
      });
      logger.userAction("move_transaction_down", { transactionId, isIncome });
    },
    [showSnackbar]
  );

  const renderTransactionItem = (item: Transaction, index: number, totalCount: number, isIncome: boolean) => {
    const categoryInfo = getCategoryInfo(item.category);
    const isMenuOpen = openMenuId === item.id;
    const isLinkedTransaction = item.source_type && item.source_id;

    // Get the relevant list to check for same-date neighbors
    const relevantList = isIncome ? incomeTransactions : expenseTransactions;
    const prevItem = index > 0 ? relevantList[index - 1] : null;
    const nextItem = index < totalCount - 1 ? relevantList[index + 1] : null;

    // Only show arrows if adjacent item has the same date
    const canMoveUp = prevItem && prevItem.date === item.date;
    const canMoveDown = nextItem && nextItem.date === item.date;
    const showAnyArrow = canMoveUp || canMoveDown;

    return (
      <Card style={[styles.transactionCard, isLinkedTransaction && styles.linkedTransactionCard]}>
        <Card.Content style={styles.transactionContent}>
          {/* Reorder arrows - only show when reordering is possible */}
          {showAnyArrow && (
            <>
              <View style={styles.reorderButtons}>
                {canMoveUp && (
                  <TouchableOpacity onPress={() => handleMoveUp(item.id, isIncome)} style={[styles.reorderButtonContainer]} activeOpacity={0.6}>
                    <Ionicons style={styles.reorderButtonUp} name="chevron-up" size={24} color={AppTheme.colors.textSecondary} />
                  </TouchableOpacity>
                )}

                {/* Horizontal divider between arrows - only show if both arrows present */}
                {canMoveUp && canMoveDown && <View style={styles.horizontalDivider} />}

                {canMoveDown && (
                  <TouchableOpacity onPress={() => handleMoveDown(item.id, isIncome)} style={styles.reorderButtonContainer} activeOpacity={0.6}>
                    <Ionicons style={styles.reorderButtonDown} name="chevron-down" size={24} color={AppTheme.colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Vertical divider */}
              <View style={styles.verticalDivider} />
            </>
          )}

          <View style={styles.transactionLeft}>
            <View style={styles.transactionInfo}>
              <Text variant="bodyLarge" style={styles.transactionDescription}>
                {item.description}
              </Text>
              <View style={styles.transactionMetaRow}>
                <Text variant="bodySmall" style={styles.transactionMeta}>
                  {format(new Date(item.date), "MMM dd")}
                </Text>
                <View style={styles.categoryBadgeContainer}>
                  <CategoryBadge category={item.category} emoji={categoryInfo?.emoji} color={categoryInfo?.color || AppTheme.colors.primary} size="sm" />
                </View>
              </View>
            </View>
          </View>

          <View style={styles.transactionRight}>
            <View style={styles.amountAndMenuRow}>
              {formatAmount(item.amount)}
              <Menu visible={isMenuOpen} onDismiss={() => setOpenMenuId(null)} anchor={<IconButton icon="dots-vertical" size={20} onPress={() => setOpenMenuId(item.id)} style={styles.menuButton} />}>
                <Menu.Item
                  leadingIcon="pencil"
                  onPress={() => {
                    setOpenMenuId(null);
                    handleEdit(item);
                  }}
                  title="Edit"
                />
                <Menu.Item
                  leadingIcon={item.source_type && item.source_id ? "clock-outline" : "delete"}
                  onPress={() => {
                    setOpenMenuId(null);
                    handleDelete(item);
                  }}
                  title={item.source_type && item.source_id ? "Move to Pending" : "Delete"}
                />
              </Menu>
            </View>
            {item.uses_savings_category && item.savings_amount_used && item.savings_amount_used > 0 ? (
              <TouchableOpacity style={styles.savingsBadge}>
                <Ionicons name="wallet" size={14} color={AppTheme.colors.secondary} />
                <Text variant="bodySmall" style={styles.savingsBadgeText}>
                  {`€${item.savings_amount_used.toFixed(1)} from ${item.uses_savings_category}`}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderUpcomingItem = (item: ExpectedIncome | ExpectedInvoice | ExpectedSavings | Transaction, type: "income" | "invoice" | "transaction" | "saving") => {
    const categoryInfo = getCategoryInfo(item.category);
    const isIncome = type === "income" || (type === "transaction" && item.amount > 0);
    const amount = "amount" in item ? item.amount : (item as Transaction).amount;

    return (
      <Card key={`${type}-${item.id}`} style={styles.upcomingCard}>
        <Card.Content style={styles.upcomingContent}>
          <View style={styles.upcomingLeft}>
            <CategoryBadge category={item.category} emoji={categoryInfo?.emoji} color={categoryInfo?.color || AppTheme.colors.primary} size="sm" />
            <View style={styles.upcomingInfo}>
              <Text variant="bodyLarge" style={styles.upcomingDescription}>
                {type === "saving" ? (item as ExpectedSavings).category : "name" in item ? item.name : (item as Transaction).description}
              </Text>
              <Text variant="bodySmall" style={styles.upcomingMeta}>
                {item.category} • {type === "income" ? "Expected Income" : type === "invoice" ? "Expected Invoice" : type === "saving" ? "Savings" : "Upcoming"}
              </Text>
            </View>
          </View>

          <View style={styles.upcomingRight}>
            {formatAmount(isIncome ? amount : -amount)}
            <Chip mode="outlined" compact style={styles.statusChip} textStyle={styles.statusChipText}>
              Pending
            </Chip>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const totalUpcoming = upcomingFromIncomes.length + upcomingFromInvoices.length + upcomingTransactions.length;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.monthSelector}>
          <IconButton icon="chevron-left" size={24} onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} />
          <Text variant="headlineSmall" style={styles.monthText}>
            {format(currentMonth, "MMMM yyyy")}
          </Text>
          <IconButton icon="chevron-right" size={24} onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} />
        </View>
        <View style={styles.headerActions}>
          <IconButton icon="bell-outline" size={24} />
          <IconButton icon="account-circle-outline" size={24} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {/* Search and Filters */}
        <View style={styles.searchSection}>
          <Searchbar placeholder="Search transactions..." value={searchQuery} onChangeText={setSearchQuery} style={styles.searchBar} icon="magnify" />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips} contentContainerStyle={styles.filterChipsContent}>
            <Chip
              mode={selectedCategory === null ? "flat" : "outlined"}
              onPress={() => setSelectedCategory(null)}
              style={[styles.filterChip, selectedCategory === null && { backgroundColor: AppTheme.colors.chip }]}
              textStyle={selectedCategory === null ? { color: AppTheme.colors.chipText } : undefined}
            >
              All Categories
            </Chip>
            {categories
              .filter((c) => c.is_visible)
              .map((cat) => (
                <Chip
                  key={cat.id}
                  mode={selectedCategory === cat.name ? "flat" : "outlined"}
                  onPress={() => setSelectedCategory(cat.name)}
                  style={[styles.filterChip, selectedCategory === cat.name && { backgroundColor: AppTheme.colors.chip }]}
                  textStyle={selectedCategory === cat.name ? { color: AppTheme.colors.chipText } : undefined}
                >
                  {cat.name}
                </Chip>
              ))}
          </ScrollView>
        </View>

        {/* Upcoming Section */}
        <TouchableOpacity onPress={() => setUpcomingExpanded(!upcomingExpanded)} style={styles.sectionHeader}>
          <View style={styles.sectionTitle}>
            <Ionicons name="time-outline" size={24} color={AppTheme.colors.warning} />
            <Text variant="headlineSmall" style={styles.sectionTitleText}>
              Upcoming
            </Text>
            {totalUpcoming > 0 && (
              <Chip mode="flat" compact style={[styles.countChip, { backgroundColor: AppTheme.colors.accent }]} textStyle={{ color: AppTheme.colors.textInverse }}>
                {totalUpcoming}
              </Chip>
            )}
          </View>
          <Ionicons name={upcomingExpanded ? "chevron-up" : "chevron-down"} size={20} color={AppTheme.colors.textSecondary} />
        </TouchableOpacity>

        {upcomingExpanded && (
          <View style={styles.upcomingSection}>
            {isLoadingData ? (
              <LoadingSpinner message="Loading upcoming items..." />
            ) : totalUpcoming === 0 ? (
              <Card style={styles.emptyCard}>
                <Card.Content style={styles.emptyContent}>
                  <Ionicons name="time-outline" size={AppTheme.spacing["4xl"]} color={AppTheme.colors.textMuted} />
                  <Text variant="bodyLarge" style={styles.emptyText}>
                    No upcoming items
                  </Text>
                </Card.Content>
              </Card>
            ) : (
              <View style={styles.upcomingList}>
                {upcomingFromIncomes.map((income) => renderUpcomingItem(income, "income"))}
                {upcomingFromInvoices.map((invoice) => renderUpcomingItem(invoice, "invoice"))}
                {upcomingTransactions.map((tx) => renderUpcomingItem(tx, "transaction"))}
              </View>
            )}
          </View>
        )}

        {/* Savings Section */}
        <TouchableOpacity onPress={() => setSavingsExpanded(!savingsExpanded)} style={styles.sectionHeader}>
          <View style={styles.sectionTitle}>
            <Ionicons name="wallet" size={24} color={AppTheme.colors.secondary} />
            <Text variant="headlineSmall" style={styles.sectionTitleText}>
              Savings
            </Text>
            {paidSavings.length > 0 && (
              <Chip mode="flat" compact style={[styles.countChip, { backgroundColor: AppTheme.colors.secondary }]} textStyle={{ color: AppTheme.colors.textInverse }}>
                {paidSavings.length}
              </Chip>
            )}
          </View>
          <Ionicons name={savingsExpanded ? "chevron-up" : "chevron-down"} size={20} color={AppTheme.colors.textSecondary} />
        </TouchableOpacity>

        {savingsExpanded && (
          <View style={styles.upcomingSection}>
            {isLoadingData ? (
              <LoadingSpinner message="Loading savings..." />
            ) : paidSavings.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Card.Content style={styles.emptyContent}>
                  <Ionicons name="wallet-outline" size={AppTheme.spacing["4xl"]} color={AppTheme.colors.textMuted} />
                  <Text variant="bodyLarge" style={styles.emptyText}>
                    No paid savings items this month
                  </Text>
                </Card.Content>
              </Card>
            ) : (
              <View style={styles.upcomingList}>{paidSavings.map((saving) => renderUpcomingItem(saving, "saving"))}</View>
            )}
          </View>
        )}

        {/* Incomes Section */}
        <TouchableOpacity onPress={() => setIncomeExpanded(!incomeExpanded)} style={styles.sectionHeader}>
          <View style={styles.sectionTitle}>
            <Ionicons name="trending-up" size={24} color={AppTheme.colors.success} />
            <Text variant="headlineSmall" style={styles.sectionTitleText}>
              Incomes
            </Text>
            {incomeTransactions.length > 0 && (
              <Chip mode="flat" compact style={[styles.countChip, { backgroundColor: AppTheme.colors.success }]} textStyle={{ color: AppTheme.colors.textInverse }}>
                {incomeTransactions.length}
              </Chip>
            )}
          </View>
          <Ionicons name={incomeExpanded ? "chevron-up" : "chevron-down"} size={20} color={AppTheme.colors.textSecondary} />
        </TouchableOpacity>

        {incomeExpanded && (
          <View style={styles.transactionSection}>
            {isLoadingData ? (
              <LoadingSpinner message="Loading income transactions..." />
            ) : incomeTransactions.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Card.Content style={styles.emptyContent}>
                  <Ionicons name="trending-up" size={48} color={AppTheme.colors.textMuted} />
                  <Text variant="bodyLarge" style={styles.emptyText}>
                    {searchQuery || selectedCategory ? "No income transactions match your filters" : "No income transactions yet"}
                  </Text>
                </Card.Content>
              </Card>
            ) : (
              <View style={styles.transactionList}>
                {incomeTransactions.map((item, index) => (
                  <React.Fragment key={item.id}>{renderTransactionItem(item, index, incomeTransactions.length, true)}</React.Fragment>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Expenses Section */}
        <TouchableOpacity onPress={() => setExpenseExpanded(!expenseExpanded)} style={styles.sectionHeader}>
          <View style={styles.sectionTitle}>
            <Ionicons name="trending-down" size={24} color={AppTheme.colors.error} />
            <Text variant="headlineSmall" style={styles.sectionTitleText}>
              Expenses
            </Text>
            {expenseTransactions.length > 0 && (
              <Chip mode="flat" compact style={[styles.countChip, { backgroundColor: AppTheme.colors.error }]} textStyle={{ color: AppTheme.colors.textInverse }}>
                {expenseTransactions.length}
              </Chip>
            )}
          </View>
          <Ionicons name={expenseExpanded ? "chevron-up" : "chevron-down"} size={20} color={AppTheme.colors.textSecondary} />
        </TouchableOpacity>

        {expenseExpanded && (
          <View style={styles.transactionSection}>
            {isLoadingData ? (
              <LoadingSpinner message="Loading expense transactions..." />
            ) : expenseTransactions.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Card.Content style={styles.emptyContent}>
                  <Ionicons name="trending-down" size={48} color={AppTheme.colors.textMuted} />
                  <Text variant="bodyLarge" style={styles.emptyText}>
                    {searchQuery || selectedCategory ? "No expense transactions match your filters" : "No expense transactions yet"}
                  </Text>
                </Card.Content>
              </Card>
            ) : (
              <View style={styles.transactionList}>
                {expenseTransactions.map((item, index) => (
                  <React.Fragment key={item.id}>{renderTransactionItem(item, index, expenseTransactions.length, false)}</React.Fragment>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <FAB
        style={[styles.fab, { backgroundColor: AppTheme.colors.primary }]}
        icon="plus"
        onPress={() => {
          resetForm();
          setDialogVisible(true);
        }}
      />

      {/* Add/Edit Dialog */}
      <CustomDialog
        visible={dialogVisible}
        onDismiss={() => {
          setDialogVisible(false);
          setCategoryError(false);
          setAmountError(false);
        }}
        title={`${editing ? "Edit" : "Add"} Transaction`}
        onSave={handleSave}
        hasUnsavedChanges={!!(amount || description || category || useSavingsCategory)}
      >
        <View style={styles.dialogContent}>
          <SimpleDropdown
            label=""
            value={category}
            onValueChange={(value) => {
              setCategory(value);
              setCategoryError(false);
            }}
            data={categories.filter((c) => c.is_visible).map((cat) => ({ id: cat.name, name: cat.name, emoji: cat.emoji, color: cat.color }))}
            placeholder="Select category *"
            style={styles.input}
            error={categoryError}
          />

          {/* Use Savings dropdown - only show for expense categories */}
          {(() => {
            const selectedCategoryInfo = categories.find((c) => c.name === category);
            const isExpenseCategory = selectedCategoryInfo?.type === "expense";
            const availableSavings = Object.entries(savingsBalances)
              .filter(([_, balance]) => balance > 0)
              .map(([catName, balance]) => ({
                id: catName,
                name: `${catName} (€${balance.toFixed(1)})`,
                emoji: categories.find((c) => c.name === catName)?.emoji,
                color: categories.find((c) => c.name === catName)?.color,
              }));

            if (isExpenseCategory && availableSavings.length > 0) {
              return (
                <SimpleDropdown
                  label="Use Savings (optional)"
                  value={useSavingsCategory || ""}
                  onValueChange={(value) => {
                    setUseSavingsCategory(value || null);
                  }}
                  data={[{ id: "", name: "None", emoji: undefined, color: undefined }, ...availableSavings]}
                  placeholder="None"
                  style={styles.input}
                />
              );
            }
            return null;
          })()}

          <TextInput
            label={
              <Text style={{ color: amountError ? "red" : AppTheme.colors.textSecondary }}>
                Amount <Text style={{ color: "red" }}>*</Text>
              </Text>
            }
            value={amount}
            onChangeText={(value) => {
              setAmount(value);
              setAmountError(false);
            }}
            keyboardType="decimal-pad"
            placeholder="0.00"
            style={styles.input}
            left={<TextInput.Affix text="€" />}
          />
          <TextInput label="Description" value={description} onChangeText={setDescription} placeholder="e.g., Grocery shopping" style={styles.input} />
          <TextInput label="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} placeholder="2025-01-15" style={styles.input} />

          {categories.length > 0 && (
            <View style={styles.categorySelector}>
              <Text variant="labelMedium" style={styles.categoryLabel}>
                Quick Select Category:
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryChips}>
                {categories
                  .filter((c) => c.is_visible)
                  .map((cat) => (
                    <Chip key={cat.id} mode={category === cat.name ? "flat" : "outlined"} onPress={() => setCategory(cat.name)} style={styles.categoryChip}>
                      {cat.name}
                    </Chip>
                  ))}
              </ScrollView>
            </View>
          )}
        </View>
      </CustomDialog>

      {/* Confirmation Dialog for Manual Transactions */}
      <ConfirmDialog
        visible={confirmDialogVisible}
        onDismiss={() => setConfirmDialogVisible(false)}
        onConfirm={confirmDelete}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Move to Pending Dialog for Transactions from Expected Items */}
      <ConfirmDialog
        visible={pendingDialogVisible}
        onDismiss={() => setPendingDialogVisible(false)}
        onConfirm={confirmMoveToPending}
        title="Move to Pending?"
        message={
          itemToPending?.transaction.source_type === "income"
            ? "This will mark the expected income as unpaid and move it back to pending."
            : "This will mark the expected invoice as unpaid and move it back to pending."
        }
        confirmText="Move to Pending"
        cancelText="Cancel"
        confirmColor={AppTheme.colors.warning}
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
  searchSection: {
    marginBottom: AppTheme.spacing.xl,
  },
  searchBar: {
    marginBottom: AppTheme.spacing.md,
  },
  filterChips: {
    marginBottom: AppTheme.spacing.sm,
  },
  filterChipsContent: {
    gap: AppTheme.spacing.sm,
  },
  filterChip: {
    marginRight: AppTheme.spacing.sm,
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
  countChip: {
    marginLeft: AppTheme.spacing.sm,
    backgroundColor: AppTheme.colors.primary,
  },
  upcomingSection: {
    marginBottom: AppTheme.spacing.xl,
  },
  upcomingList: {
    gap: AppTheme.spacing.md,
  },
  transactionSection: {
    marginBottom: AppTheme.spacing.xl,
  },
  upcomingCard: {
    ...AppTheme.shadows.sm,
  },
  upcomingContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: AppTheme.spacing.sm,
  },
  upcomingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  upcomingInfo: {
    flex: 1,
    marginLeft: AppTheme.spacing.md,
  },
  upcomingDescription: {
    fontWeight: AppTheme.typography.fontWeight.medium,
    color: AppTheme.colors.textPrimary,
  },
  upcomingMeta: {
    color: AppTheme.colors.textSecondary,
    marginTop: 2,
  },
  upcomingRight: {
    alignItems: "flex-end",
    gap: AppTheme.spacing.xs,
  },
  statusChip: {
    borderColor: AppTheme.colors.warning,
  },
  statusChipText: {
    color: AppTheme.colors.warning,
    fontSize: 12,
  },
  transactionList: {},
  transactionCard: {
    ...AppTheme.shadows.sm,
    marginBottom: AppTheme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: AppTheme.colors.border,
  },
  linkedTransactionCard: {
    backgroundColor: "#FFF8F0",
    borderLeftWidth: 4,
    borderLeftColor: AppTheme.colors.warning,
  },
  transactionContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: AppTheme.spacing.xs, // Minimal vertical padding
    paddingHorizontal: 0, // Remove default padding to control spacing better
    minHeight: 80, // Ensure consistent height for all transaction cards
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingLeft: AppTheme.spacing.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontWeight: AppTheme.typography.fontWeight.medium,
    color: AppTheme.colors.textPrimary,
  },
  transactionMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  categoryBadgeContainer: {
    marginLeft: AppTheme.spacing.sm,
  },
  transactionMeta: {
    color: AppTheme.colors.textSecondary,
  },
  transactionRight: {
    alignItems: "flex-end",
    paddingRight: AppTheme.spacing.md,
  },
  amountAndMenuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: AppTheme.spacing.xs,
  },
  amountText: {
    fontWeight: AppTheme.typography.fontWeight.semibold,
    fontSize: AppTheme.typography.fontSize.lg,
  },
  menuButton: {
    margin: 0,
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
  fab: {
    position: "absolute",
    right: AppTheme.spacing.lg,
    bottom: AppTheme.spacing.lg,
    backgroundColor: AppTheme.colors.primary,
  },
  dialogContent: {
    gap: AppTheme.spacing.lg,
  },
  input: {
    backgroundColor: AppTheme.colors.background,
  },
  categorySelector: {
    marginTop: AppTheme.spacing.md,
  },
  categoryLabel: {
    marginBottom: AppTheme.spacing.sm,
    color: AppTheme.colors.textSecondary,
  },
  categoryChips: {
    marginBottom: AppTheme.spacing.sm,
  },
  categoryChip: {
    marginRight: AppTheme.spacing.sm,
  },
  savingsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: AppTheme.colors.backgroundSecondary,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  savingsBadgeText: {
    color: AppTheme.colors.secondary,
    fontSize: 12,
  },
  reorderButtons: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: 48, // Fixed width for reorder section
    alignSelf: "stretch", // Match parent height
  },
  reorderButtonContainer: {
    width: 48,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  reorderButtonUp: {
    marginTop: -8, // Shift up slightly for visual centering
  },
  reorderButtonDown: {
    marginBottom: -8, // Shift down slightly for visual centering
  },
  horizontalDivider: {
    height: 1,
    width: 24, // Not full width, centered
    backgroundColor: AppTheme.colors.border,
    marginVertical: -4, // Reduce vertical spacing between buttons
  },
  verticalDivider: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: AppTheme.colors.border,
    marginRight: AppTheme.spacing.xs,
  },
});
