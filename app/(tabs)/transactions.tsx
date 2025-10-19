import logger from "@/app/utils/logger";
import { useSnackbar } from "@/components/snackbar-provider";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Dialog as CustomDialog } from "@/components/ui/Dialog";
import { SimpleDropdown } from "@/components/ui/SimpleDropdown";
import { AppTheme } from "@/constants/AppTheme";
import { useMonth } from "@/lib/month-context";
import {
    deleteTransaction,
    loadCategories,
    loadIncomes,
    loadInvoices,
    loadTransactions,
    saveTransaction,
} from "@/lib/storage";
import type { Category, ExpectedIncome, ExpectedInvoice, Transaction } from "@/lib/types";
import Ionicons from "@react-native-vector-icons/ionicons";
import { format } from "date-fns";
import * as Crypto from "expo-crypto";
import { useFocusEffect } from "expo-router";
import React from "react";
import { FlatList, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Card, Chip, FAB, IconButton, Searchbar, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TransactionsScreen() {
  const { showSnackbar } = useSnackbar();
  const { currentMonth, setCurrentMonth } = useMonth();
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [incomes, setIncomes] = React.useState<ExpectedIncome[]>([]);
  const [invoices, setInvoices] = React.useState<ExpectedInvoice[]>([]);

  // Log navigation
  React.useEffect(() => {
    logger.navigationAction("TransactionsScreen", { month: currentMonth });
  }, [currentMonth]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [upcomingExpanded, setUpcomingExpanded] = React.useState(true);

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

  // Confirmation dialog states
  const [confirmDialogVisible, setConfirmDialogVisible] = React.useState(false);
  const [itemToDelete, setItemToDelete] = React.useState<{ id: string; type: string } | null>(null);

  // Load data when screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const [txs, incms, invcs, cats] = await Promise.all([
          loadTransactions(),
          loadIncomes(),
          loadInvoices(),
          loadCategories(),
        ]);
        setTransactions(txs);
        setIncomes(incms);
        setInvoices(invcs);
        setCategories(cats);
      })();
    }, [])
  );

  // Filter by current month
  const currentMonthKey = format(currentMonth, "yyyy-MM");

  // Upcoming items: unpaid incomes/invoices for current month + upcoming transactions
  const upcomingFromIncomes = incomes.filter((i) => !i.is_paid && i.month === currentMonthKey);
  const upcomingFromInvoices = invoices.filter((i) => !i.is_paid && i.month === currentMonthKey);
  const upcomingTransactions = transactions.filter((t) => t.status === "upcoming");

  // Recent: paid transactions only
  const recentTransactions = transactions
    .filter((t) => t.status === "paid")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Filter transactions based on search and filters
  const filteredTransactions = recentTransactions.filter((tx) => {
    const matchesSearch =
      searchQuery === "" ||
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === null || tx.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const resetForm = () => {
    setAmount("");
    setDescription("");
    setDate(format(new Date(), "yyyy-MM-dd"));
    setCategory("General");
    setEditing(null);
  };

  const handleSave = async () => {
    const amt = parseFloat(amount);
    if (Number.isNaN(amt)) {
      showSnackbar("Please enter a valid amount");
      return;
    }

    // Determine if this is an income or expense based on category type
    const categoryInfo = getCategoryInfo(category);
    const isIncome = categoryInfo?.type === "income";

    const tx: Transaction = {
      id: editing?.id || Crypto.randomUUID(),
      amount: isIncome ? Math.abs(amt) : -Math.abs(amt), // Positive for income, negative for expense
      description,
      date,
      category,
      status: "paid", // Only allow paid transactions
      created_at: editing?.created_at || new Date().toISOString(),
    };

    const success = await saveTransaction(tx);
    if (success) {
      if (editing) {
        setTransactions((prev) => prev.map((t) => (t.id === tx.id ? tx : t)));
        showSnackbar("Transaction updated!");
      } else {
        setTransactions((prev) => [tx, ...prev]);
        showSnackbar("Transaction added!");
      }
      setDialogVisible(false);
      resetForm();
    } else {
      showSnackbar("Failed to save transaction");
    }
  };

  const handleEdit = (t: Transaction) => {
    setEditing(t);
    setAmount(String(Math.abs(t.amount)));
    setDescription(t.description);
    setDate(t.date);
    setCategory(t.category);
    setDialogVisible(true);
  };

  const handleDelete = (id: string) => {
    setItemToDelete({ id, type: "transaction" });
    setConfirmDialogVisible(true);
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

  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    const categoryInfo = getCategoryInfo(item.category);

    return (
      <Card style={styles.transactionCard}>
        <Card.Content style={styles.transactionContent}>
          <View style={styles.transactionLeft}>
            <CategoryBadge
              category={item.category}
              emoji={categoryInfo?.emoji}
              color={categoryInfo?.color || AppTheme.colors.primary}
              size="sm"
            />
            <View style={styles.transactionInfo}>
              <Text variant="bodyLarge" style={styles.transactionDescription}>
                {item.description}
              </Text>
              <Text variant="bodySmall" style={styles.transactionMeta}>
                {format(new Date(item.date), "MMM dd")} • {item.category}
              </Text>
            </View>
          </View>

          <View style={styles.transactionRight}>
            {formatAmount(item.amount)}
            <View style={styles.transactionActions}>
              <IconButton
                icon="pencil"
                size={20}
                onPress={() => handleEdit(item)}
                style={styles.actionButton}
              />
              <IconButton
                icon="delete"
                size={20}
                onPress={() => handleDelete(item.id)}
                style={styles.actionButton}
              />
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderUpcomingItem = (
    item: ExpectedIncome | ExpectedInvoice | Transaction,
    type: "income" | "invoice" | "transaction"
  ) => {
    const categoryInfo = getCategoryInfo(item.category);
    const isIncome = type === "income" || (type === "transaction" && item.amount > 0);
    const amount = "amount" in item ? item.amount : (item as Transaction).amount;

    return (
      <Card key={`${type}-${item.id}`} style={styles.upcomingCard}>
        <Card.Content style={styles.upcomingContent}>
          <View style={styles.upcomingLeft}>
            <CategoryBadge
              category={item.category}
              emoji={categoryInfo?.emoji}
              color={categoryInfo?.color || AppTheme.colors.primary}
              size="sm"
            />
            <View style={styles.upcomingInfo}>
              <Text variant="bodyLarge" style={styles.upcomingDescription}>
                {"name" in item ? item.name : item.description}
              </Text>
              <Text variant="bodySmall" style={styles.upcomingMeta}>
                {item.category} •{" "}
                {type === "income"
                  ? "Expected Income"
                  : type === "invoice"
                  ? "Expected Invoice"
                  : "Upcoming"}
              </Text>
            </View>
          </View>

          <View style={styles.upcomingRight}>
            {formatAmount(isIncome ? amount : -amount)}
            <Chip
              mode="outlined"
              compact
              style={styles.statusChip}
              textStyle={styles.statusChipText}
            >
              Pending
            </Chip>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const totalUpcoming =
    upcomingFromIncomes.length + upcomingFromInvoices.length + upcomingTransactions.length;

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
              style={[
                styles.filterChip,
                selectedCategory === null && { backgroundColor: AppTheme.colors.chip },
              ]}
              textStyle={
                selectedCategory === null ? { color: AppTheme.colors.chipText } : undefined
              }
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
                  style={[
                    styles.filterChip,
                    selectedCategory === cat.name && { backgroundColor: AppTheme.colors.chip },
                  ]}
                  textStyle={
                    selectedCategory === cat.name ? { color: AppTheme.colors.chipText } : undefined
                  }
                >
                  {cat.name}
                </Chip>
              ))}
          </ScrollView>
        </View>

        {/* Upcoming Section */}
        <TouchableOpacity
          onPress={() => setUpcomingExpanded(!upcomingExpanded)}
          style={styles.sectionHeader}
        >
          <View style={styles.sectionTitle}>
            <Ionicons name="time-outline" size={24} color={AppTheme.colors.warning} />
            <Text variant="headlineSmall" style={styles.sectionTitleText}>
              Upcoming
            </Text>
            {totalUpcoming > 0 && (
              <Chip
                mode="flat"
                compact
                style={[styles.countChip, { backgroundColor: AppTheme.colors.accent }]}
                textStyle={{ color: AppTheme.colors.textInverse }}
              >
                {totalUpcoming}
              </Chip>
            )}
          </View>
          <Ionicons
            name={upcomingExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={AppTheme.colors.textSecondary}
          />
        </TouchableOpacity>

        {upcomingExpanded && (
          <View style={styles.upcomingSection}>
            {totalUpcoming === 0 ? (
              <Card style={styles.emptyCard}>
                <Card.Content style={styles.emptyContent}>
                  <Ionicons name="time-outline" size={48} color={AppTheme.colors.textMuted} />
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

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionTitle}>
            <Ionicons name="list" size={24} color={AppTheme.colors.primary} />
            <Text variant="headlineSmall" style={styles.sectionTitleText}>
              Recent Transactions
            </Text>
          </View>

          {filteredTransactions.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <Ionicons name="receipt-outline" size={48} color={AppTheme.colors.textMuted} />
                <Text variant="bodyLarge" style={styles.emptyText}>
                  {searchQuery || selectedCategory
                    ? "No transactions match your filters"
                    : "No recent transactions yet"}
                </Text>
              </Card.Content>
            </Card>
          ) : (
            <FlatList
              data={filteredTransactions}
              keyExtractor={(item) => item.id}
              renderItem={renderTransactionItem}
              scrollEnabled={false}
              style={styles.transactionList}
            />
          )}
        </View>
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
        onDismiss={() => setDialogVisible(false)}
        title={`${editing ? "Edit" : "Add"} Transaction`}
        onSave={handleSave}
        hasUnsavedChanges={!!(amount || description || category)}
      >
        <View style={styles.dialogContent}>
          <TextInput
            label="Amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="€0.0"
            style={styles.input}
          />
          <TextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="e.g., Grocery shopping"
            style={styles.input}
          />
          <TextInput
            label="Date (YYYY-MM-DD)"
            value={date}
            onChangeText={setDate}
            placeholder="2025-01-15"
            style={styles.input}
          />
          <SimpleDropdown
            label="Category"
            value={category}
            onValueChange={setCategory}
            data={categories
              .filter((c) => c.is_visible) 
              .map((cat) => ({ id: cat.name, name: cat.name }))}
            placeholder="Select category"
            style={styles.input}
          />

          {categories.length > 0 && (
            <View style={styles.categorySelector}>
              <Text variant="labelMedium" style={styles.categoryLabel}>
                Quick Select Category:
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryChips}
              >
                {categories
                  .filter((c) => c.is_visible)
                  .map((cat) => (
                    <Chip
                      key={cat.id}
                      mode={category === cat.name ? "flat" : "outlined"}
                      onPress={() => setCategory(cat.name)}
                      style={styles.categoryChip}
                    >
                      {cat.name}
                    </Chip>
                  ))}
              </ScrollView>
            </View>
          )}
        </View>
      </CustomDialog>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        visible={confirmDialogVisible}
        onDismiss={() => setConfirmDialogVisible(false)}
        onConfirm={confirmDelete}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
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
    gap: AppTheme.spacing.sm,
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
  transactionList: {
    gap: AppTheme.spacing.sm,
  },
  transactionCard: {
    ...AppTheme.shadows.sm,
  },
  transactionContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: AppTheme.spacing.sm,
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  transactionInfo: {
    flex: 1,
    marginLeft: AppTheme.spacing.md,
  },
  transactionDescription: {
    fontWeight: AppTheme.typography.fontWeight.medium,
    color: AppTheme.colors.textPrimary,
  },
  transactionMeta: {
    color: AppTheme.colors.textSecondary,
    marginTop: 2,
  },
  transactionRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: AppTheme.spacing.sm,
  },
  transactionActions: {
    flexDirection: "row",
    gap: AppTheme.spacing.xs,
  },
  actionButton: {
    margin: 0,
  },
  amountText: {
    fontWeight: AppTheme.typography.fontWeight.semibold,
    fontSize: AppTheme.typography.fontSize.lg,
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
});
