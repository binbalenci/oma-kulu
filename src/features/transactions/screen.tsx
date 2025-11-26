import logger from "@/src/utils/logger";
import { useSnackbar } from "@/src/components/snackbar-provider";
import { ConfirmDialog } from "@/src/components/ui/ConfirmDialog";
import { LoadingSpinner } from "@/src/components/ui/LoadingSpinner";
import { AppTheme } from "@/src/constants/AppTheme";
import { useMonth } from "@/src/lib/month-context";
import {
  deleteTransaction,
  getSavingsBalance,
  saveIncome,
  saveInvoice,
  saveTransaction,
  saveTransactions,
} from "@/src/lib/storage";
import type { Category, ExpectedIncome, ExpectedInvoice, Transaction } from "@/src/lib/types";
import Ionicons from "@react-native-vector-icons/ionicons";
import { endOfMonth, format, startOfMonth } from "date-fns";
import * as Crypto from "expo-crypto";
import { useFocusEffect } from "expo-router";
import React from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Card, Chip, FAB, IconButton, Searchbar, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { SectionHeader, TransactionCard, TransactionDialog, UpcomingCard } from "./components";
import { useTransactionReorder, useTransactionsData } from "./hooks";

export default function TransactionsScreen() {
  const { showSnackbar } = useSnackbar();
  const { currentMonth, setCurrentMonth } = useMonth();

  // Use the data loading hook
  const {
    transactions,
    incomes,
    invoices,
    savings,
    categories,
    savingsBalances,
    isLoading: isLoadingData,
    refresh: refreshData,
  } = useTransactionsData();

  // Local state for transactions (to allow optimistic updates)
  const [localTransactions, setLocalTransactions] = React.useState<Transaction[]>([]);
  const [localIncomes, setLocalIncomes] = React.useState<ExpectedIncome[]>([]);
  const [localInvoices, setLocalInvoices] = React.useState<ExpectedInvoice[]>([]);
  const [localSavingsBalances, setLocalSavingsBalances] = React.useState<Record<string, number>>({});

  // Sync hook data to local state
  React.useEffect(() => {
    setLocalTransactions(transactions);
    setLocalIncomes(incomes);
    setLocalInvoices(invoices);
    setLocalSavingsBalances(savingsBalances);
  }, [transactions, incomes, invoices, savingsBalances]);

  // Log navigation when month changes
  React.useEffect(() => {
    logger.navigationAction("TransactionsScreen", { month: currentMonth });
  }, [currentMonth]);

  // Refresh data when screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      refreshData();
    }, [refreshData])
  );

  // Section expansion states
  const [upcomingExpanded, setUpcomingExpanded] = React.useState(false);
  const [savingsExpanded, setSavingsExpanded] = React.useState(false);
  const [incomeExpanded, setIncomeExpanded] = React.useState(false);
  const [expenseExpanded, setExpenseExpanded] = React.useState(true);

  // Search and filter states
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

  // Form states
  const [dialogVisible, setDialogVisible] = React.useState(false);
  const [editing, setEditing] = React.useState<Transaction | null>(null);
  const [amount, setAmount] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [date, setDate] = React.useState(format(new Date(), "yyyy-MM-dd"));
  const [category, setCategory] = React.useState("General");
  const [selectedType, setSelectedType] = React.useState<"income" | "expense" | "saving">("expense");
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

  // Use the reorder hook
  const { moveUp, moveDown, canMoveUp, canMoveDown } = useTransactionReorder({
    transactions: localTransactions,
    setTransactions: setLocalTransactions,
    showSnackbar,
  });

  // Pull-to-refresh handler
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    logger.breadcrumb("Pull-to-refresh triggered", "data_refresh");

    try {
      await refreshData();
      logger.dataAction("pull_to_refresh", {
        transactionsCount: transactions.length,
        incomesCount: incomes.length,
        invoicesCount: invoices.length,
        categoriesCount: categories.length,
      });
    } catch (error) {
      logger.error(error as Error, { operation: "pull_to_refresh" });
      showSnackbar("Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  }, [refreshData, transactions.length, incomes.length, invoices.length, categories.length, showSnackbar]);

  // Filter by current month
  const currentMonthKey = format(currentMonth, "yyyy-MM");
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  // Upcoming items: unpaid incomes/invoices for current month + upcoming transactions
  const upcomingFromIncomes = localIncomes.filter((i) => !i.is_paid && i.month === currentMonthKey);
  const upcomingFromInvoices = localInvoices.filter((i) => !i.is_paid && i.month === currentMonthKey);
  const upcomingTransactions = localTransactions.filter((t) => t.status === "upcoming");

  // Savings items: paid savings for current month
  const paidSavings = savings.filter((s) => s.is_paid && s.month === currentMonthKey);

  // Recent: paid transactions for current month only
  const recentTransactions = localTransactions
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
    const matchesSearch =
      searchQuery === "" ||
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === null || tx.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Separate income and expense transactions
  const incomeTransactions = filteredTransactions.filter((t) => t.amount > 0);
  const expenseTransactions = filteredTransactions.filter((t) => t.amount < 0);

  const getCategoryInfo = (categoryName: string): Category | undefined => {
    return categories.find((c) => c.name === categoryName);
  };

  const resetForm = () => {
    setAmount("");
    setDescription("");
    setDate(format(new Date(), "yyyy-MM-dd"));

    // Default to expense type
    setSelectedType("expense");

    // Default to first expense category
    const firstExpenseCategory = categories.find((c) => c.type === "expense" && c.is_visible);
    setCategory(firstExpenseCategory?.name || "General");

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
    const usesSavingsCategoryObj = useSavingsCategory
      ? categories.find((c) => c.name === useSavingsCategory && c.type === "saving")
      : undefined;

    // Calculate savings usage if selected
    let savingsAmountUsed = 0;
    if (useSavingsCategory && !isIncome && localSavingsBalances[useSavingsCategory]) {
      const availableBalance = localSavingsBalances[useSavingsCategory];
      const transactionAmount = Math.abs(amt);
      // Use up to the available balance, capped at transaction amount
      savingsAmountUsed = Math.min(availableBalance, transactionAmount);
    }

    // Calculate order_index: insert at first position for new transactions or when date changes
    let orderIndex: number;
    const dateChanged = editing && editing.date !== date;
    let transactionsToShift: Transaction[] = [];

    if (editing && !dateChanged) {
      // Preserve order_index only if editing same date
      orderIndex = editing.order_index ?? 0;
    } else {
      // Insert at first position (0) and shift all other same-date transactions down
      orderIndex = 0;

      // Get all transactions on this date (excluding the one being edited if date changed)
      transactionsToShift = localTransactions.filter((t) =>
        t.date === date && (!editing || t.id !== editing.id)
      );

      if (dateChanged) {
        logger.userAction("transaction_date_changed", {
          transactionId: editing.id,
          oldDate: editing.date,
          newDate: date,
          newOrderIndex: orderIndex
        });
      }
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
      // Order index - inserts at first position for new/date-changed transactions
      order_index: orderIndex,
    };

    // Save the main transaction first
    const success = await saveTransaction(tx);
    if (success) {
      // If we inserted at first position, shift all other same-date transactions down
      if (transactionsToShift.length > 0) {
        const shiftedTransactions = transactionsToShift.map((t) => ({
          ...t,
          order_index: (t.order_index ?? 0) + 1,
        }));

        // Save all shifted transactions
        await saveTransactions(shiftedTransactions);
        logger.breadcrumb("Shifted same-date transactions", "transaction_create", {
          date,
          shiftedCount: shiftedTransactions.length,
        });
      }

      // Update savings balance if savings were used
      if (savingsAmountUsed > 0 && useSavingsCategory) {
        const balance = await getSavingsBalance(useSavingsCategory);
        setLocalSavingsBalances((prev) => ({ ...prev, [useSavingsCategory]: balance }));
      }
      if (editing) {
        setLocalTransactions((prev) =>
          prev.map((t) => {
            if (t.id === tx.id) return tx;
            // Update shifted transactions in state
            if (transactionsToShift.some((st) => st.id === t.id)) {
              return { ...t, order_index: (t.order_index ?? 0) + 1 };
            }
            return t;
          })
        );

        // If transaction was created from an expected item, sync changes back
        if (editing.source_type && editing.source_id) {
          const amountChanged = Math.abs(tx.amount) !== Math.abs(editing.amount);
          const categoryChanged = tx.category !== editing.category;
          const descriptionChanged = tx.description !== editing.description;

          if (amountChanged || categoryChanged || descriptionChanged) {
            if (editing.source_type === "income") {
              const sourceIncome = localIncomes.find((i) => i.id === editing.source_id);
              if (sourceIncome) {
                const updatedIncome = {
                  ...sourceIncome,
                  amount: Math.abs(tx.amount),
                  category: tx.category,
                  name: tx.description,
                  updated_at: new Date().toISOString(),
                };
                await saveIncome(updatedIncome);
                setLocalIncomes((prev) => prev.map((i) => (i.id === editing.source_id ? updatedIncome : i)));
              }
            } else if (editing.source_type === "invoice") {
              const sourceInvoice = localInvoices.find((i) => i.id === editing.source_id);
              if (sourceInvoice) {
                const updatedInvoice = {
                  ...sourceInvoice,
                  amount: Math.abs(tx.amount),
                  category: tx.category,
                  name: tx.description,
                  updated_at: new Date().toISOString(),
                };
                await saveInvoice(updatedInvoice);
                setLocalInvoices((prev) => prev.map((i) => (i.id === editing.source_id ? updatedInvoice : i)));
              }
            }
          }
        }

        showSnackbar("Transaction updated!");
      } else {
        setLocalTransactions((prev) => {
          const updated = [tx, ...prev];
          // Update shifted transactions in state
          if (transactionsToShift.length > 0) {
            return updated.map((t) => {
              if (transactionsToShift.some((st) => st.id === t.id)) {
                return { ...t, order_index: (t.order_index ?? 0) + 1 };
              }
              return t;
            });
          }
          return updated;
        });
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

    // Determine type based on amount
    const type = t.amount > 0 ? "income" : "expense";
    setSelectedType(type);

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
      setLocalTransactions((prev) => prev.filter((t) => t.id !== itemToDelete.id));
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
      setLocalTransactions((prev) => prev.filter((t) => t.id !== transaction.id));

      // Mark the source expected item as unpaid
      if (transaction.source_type === "income") {
        const sourceIncome = localIncomes.find((i) => i.id === transaction.source_id);
        if (sourceIncome) {
          const updatedIncome = { ...sourceIncome, is_paid: false, updated_at: new Date().toISOString() };
          await saveIncome(updatedIncome);
          setLocalIncomes((prev) => prev.map((i) => (i.id === transaction.source_id ? updatedIncome : i)));
        }
      } else if (transaction.source_type === "invoice") {
        const sourceInvoice = localInvoices.find((i) => i.id === transaction.source_id);
        if (sourceInvoice) {
          const updatedInvoice = { ...sourceInvoice, is_paid: false, updated_at: new Date().toISOString() };
          await saveInvoice(updatedInvoice);
          setLocalInvoices((prev) => prev.map((i) => (i.id === transaction.source_id ? updatedInvoice : i)));
        }
      }

      showSnackbar("Moved back to pending");
    } else {
      showSnackbar("Failed to move to pending");
    }
    setItemToPending(null);
  };

  const handleTypeChange = (type: "income" | "expense" | "saving") => {
    setSelectedType(type);
    // Auto-select first category of this type
    const firstCat = categories.find((c) => c.type === type && c.is_visible);
    if (firstCat) setCategory(firstCat.name);
  };

  const totalUpcoming = upcomingFromIncomes.length + upcomingFromInvoices.length + upcomingTransactions.length;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.monthSelector}>
          <IconButton
            icon="chevron-left"
            size={24}
            onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
          />
          <Text variant="headlineSmall" style={styles.monthText}>
            {format(currentMonth, "MMMM yyyy")}
          </Text>
          <IconButton
            icon="chevron-right"
            size={24}
            onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Search and Filters */}
        <View style={styles.searchSection}>
          <Searchbar
            placeholder="Search transactions..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchBar}
            icon="magnify"
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterChips}
            contentContainerStyle={styles.filterChipsContent}
          >
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
        <SectionHeader
          icon="time-outline"
          iconColor={AppTheme.colors.warning}
          title="Upcoming"
          count={totalUpcoming}
          countColor={AppTheme.colors.accent}
          expanded={upcomingExpanded}
          onToggle={() => setUpcomingExpanded(!upcomingExpanded)}
        />

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
                {upcomingFromIncomes.map((income) => (
                  <UpcomingCard key={`income-${income.id}`} item={income} type="income" categoryInfo={getCategoryInfo(income.category)} />
                ))}
                {upcomingFromInvoices.map((invoice) => (
                  <UpcomingCard key={`invoice-${invoice.id}`} item={invoice} type="invoice" categoryInfo={getCategoryInfo(invoice.category)} />
                ))}
                {upcomingTransactions.map((tx) => (
                  <UpcomingCard key={`transaction-${tx.id}`} item={tx} type="transaction" categoryInfo={getCategoryInfo(tx.category)} />
                ))}
              </View>
            )}
          </View>
        )}

        {/* Savings Section */}
        <SectionHeader
          icon="wallet"
          iconColor={AppTheme.colors.secondary}
          title="Savings"
          count={paidSavings.length}
          countColor={AppTheme.colors.secondary}
          expanded={savingsExpanded}
          onToggle={() => setSavingsExpanded(!savingsExpanded)}
        />

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
              <View style={styles.upcomingList}>
                {paidSavings.map((saving) => (
                  <UpcomingCard key={`saving-${saving.id}`} item={saving} type="saving" categoryInfo={getCategoryInfo(saving.category)} />
                ))}
              </View>
            )}
          </View>
        )}

        {/* Incomes Section */}
        <SectionHeader
          icon="trending-up"
          iconColor={AppTheme.colors.success}
          title="Incomes"
          count={incomeTransactions.length}
          countColor={AppTheme.colors.success}
          expanded={incomeExpanded}
          onToggle={() => setIncomeExpanded(!incomeExpanded)}
        />

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
                  <TransactionCard
                    key={item.id}
                    transaction={item}
                    categoryInfo={getCategoryInfo(item.category)}
                    canMoveUp={canMoveUp(item.id, true)}
                    canMoveDown={canMoveDown(item.id, true)}
                    onMoveUp={moveUp}
                    onMoveDown={moveDown}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* Expenses Section */}
        <SectionHeader
          icon="trending-down"
          iconColor={AppTheme.colors.error}
          title="Expenses"
          count={expenseTransactions.length}
          countColor={AppTheme.colors.error}
          expanded={expenseExpanded}
          onToggle={() => setExpenseExpanded(!expenseExpanded)}
        />

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
                  <TransactionCard
                    key={item.id}
                    transaction={item}
                    categoryInfo={getCategoryInfo(item.category)}
                    canMoveUp={canMoveUp(item.id, false)}
                    canMoveDown={canMoveDown(item.id, false)}
                    onMoveUp={moveUp}
                    onMoveDown={moveDown}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
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
      <TransactionDialog
        visible={dialogVisible}
        editing={!!editing}
        amount={amount}
        description={description}
        date={date}
        category={category}
        selectedType={selectedType}
        useSavingsCategory={useSavingsCategory}
        categories={categories}
        savingsBalances={localSavingsBalances}
        categoryError={categoryError}
        amountError={amountError}
        onDismiss={() => {
          setDialogVisible(false);
          setCategoryError(false);
          setAmountError(false);
        }}
        onSave={handleSave}
        onAmountChange={(value) => {
          setAmount(value);
          setAmountError(false);
        }}
        onDescriptionChange={setDescription}
        onDateChange={setDate}
        onCategoryChange={(value) => {
          setCategory(value);
          setCategoryError(false);
        }}
        onTypeChange={handleTypeChange}
        onUseSavingsChange={setUseSavingsCategory}
      />

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
  upcomingSection: {
    marginBottom: AppTheme.spacing.xl,
  },
  upcomingList: {
    gap: AppTheme.spacing.md,
  },
  transactionSection: {
    marginBottom: AppTheme.spacing.xl,
  },
  transactionList: {},
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
});
