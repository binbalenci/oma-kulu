import { useSnackbar } from "@/components/snackbar-provider";
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
import { addMonths, endOfMonth, format, startOfMonth } from "date-fns";
import { useFocusEffect } from "expo-router";
import React from "react";
import { ScrollView, View } from "react-native";
import {
  Button,
  Card,
  Checkbox,
  Dialog,
  Divider,
  IconButton,
  Portal,
  ProgressBar,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";

function monthKey(d: Date): string {
  return format(d, "yyyy-MM");
}

export default function BudgetsScreen() {
  const theme = useTheme();
  const { showSnackbar } = useSnackbar();
  const [now, setNow] = React.useState(new Date());

  // Data states
  const [incomes, setIncomes] = React.useState<ExpectedIncome[]>([]);
  const [invoices, setInvoices] = React.useState<ExpectedInvoice[]>([]);
  const [budgets, setBudgets] = React.useState<Budget[]>([]);
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [startingBalance, setStartingBalance] = React.useState<number>(0);

  // Dialog states
  const [dialogVisible, setDialogVisible] = React.useState(false);
  const [dialogType, setDialogType] = React.useState<"income" | "invoice" | "budget">("income");
  const [editingItem, setEditingItem] = React.useState<any>(null);
  const [itemName, setItemName] = React.useState("");
  const [itemCategory, setItemCategory] = React.useState("");
  const [itemAmount, setItemAmount] = React.useState("");
  const [itemNotes, setItemNotes] = React.useState("");

  // Load data on mount and when month changes
  React.useEffect(() => {
    (async () => {
      const [cats, txs, settings, incms, invcs, bdgts] = await Promise.all([
        loadCategories(),
        loadTransactions(),
        loadSettings(),
        loadIncomes(),
        loadInvoices(),
        loadBudgets(),
      ]);
      setCategories(cats);
      setTransactions(txs);
      setStartingBalance(settings.starting_balance ?? 0);
      setIncomes(incms);
      setInvoices(invcs);
      setBudgets(bdgts);
    })();
  }, []);

  // Refetch categories when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const cats = await loadCategories();
        setCategories(cats);
      })();
    }, [])
  );

  const curMonth = monthKey(now);
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

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
  const actualInBank = startingBalance + transactions.reduce((sum, t) => sum + t.amount, 0);

  // Check if all sections are empty
  const allEmpty =
    currentIncomes.length === 0 && currentInvoices.length === 0 && currentBudgets.length === 0;

  const goPrevMonth = () => setNow((d) => addMonths(d, -1));
  const goNextMonth = () => setNow((d) => addMonths(d, 1));

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
    // If name matches category, show as empty (user left it blank)
    setItemName(type === "budget" ? "" : item.name === item.category ? "" : item.name);
    setItemCategory(item.category);
    setItemAmount(String(type === "budget" ? item.allocated_amount : item.amount));
    setItemNotes(item.notes || "");
    setDialogVisible(true);
  };

  const handleSaveItem = async () => {
    const amount = parseFloat(itemAmount || "0");
    if (isNaN(amount) || amount <= 0) {
      showSnackbar("Please enter a valid amount");
      return;
    }
    if (!itemCategory) {
      showSnackbar("Please select a category");
      return;
    }
    // Name is optional for incomes/invoices - will use category name if empty

    const id = editingItem?.id || crypto.randomUUID();

    if (dialogType === "income") {
      const income: ExpectedIncome = {
        id,
        name: itemName || itemCategory, // Use category name if name is empty
        category: itemCategory,
        amount,
        month: curMonth,
        is_paid: editingItem?.is_paid || false,
        notes: itemNotes || undefined,
        created_at: editingItem?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const success = await saveIncome(income);
      if (success) {
        setIncomes((prev) => {
          const filtered = prev.filter((i) => i.id !== id);
          return [...filtered, income];
        });
        showSnackbar(editingItem ? "Income updated!" : "Income added!");
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
        is_paid: editingItem?.is_paid || false,
        notes: itemNotes || undefined,
        created_at: editingItem?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const success = await saveInvoice(invoice);
      if (success) {
        setInvoices((prev) => {
          const filtered = prev.filter((i) => i.id !== id);
          return [...filtered, invoice];
        });
        showSnackbar(editingItem ? "Invoice updated!" : "Invoice added!");
      } else {
        showSnackbar("Failed to save invoice");
      }
    } else {
      const budget: Budget = {
        id,
        category: itemCategory,
        allocated_amount: amount,
        month: curMonth,
        notes: itemNotes || undefined,
        created_at: editingItem?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const success = await saveBudget(budget);
      if (success) {
        setBudgets((prev) => {
          const filtered = prev.filter((b) => b.id !== id);
          return [...filtered, budget];
        });
        showSnackbar(editingItem ? "Budget updated!" : "Budget added!");
      } else {
        showSnackbar("Failed to save budget");
      }
    }

    setDialogVisible(false);
  };

  const handleDeleteItem = async (type: "income" | "invoice" | "budget", id: string) => {
    if (type === "income") {
      const success = await deleteIncome(id);
      if (success) {
        setIncomes((prev) => prev.filter((i) => i.id !== id));
        showSnackbar("Income deleted");
      } else {
        showSnackbar("Failed to delete income");
      }
    } else if (type === "invoice") {
      const success = await deleteInvoice(id);
      if (success) {
        setInvoices((prev) => prev.filter((i) => i.id !== id));
        showSnackbar("Invoice deleted");
      } else {
        showSnackbar("Failed to delete invoice");
      }
    } else {
      const success = await deleteBudget(id);
      if (success) {
        setBudgets((prev) => prev.filter((b) => b.id !== id));
        showSnackbar("Budget deleted");
      } else {
        showSnackbar("Failed to delete budget");
      }
    }
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

    // Create transaction
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

  const copyFromPreviousMonth = async () => {
    const prevMonth = monthKey(addMonths(now, -1));
    const prevIncomes = incomes.filter((i) => i.month === prevMonth);
    const prevInvoices = invoices.filter((i) => i.month === prevMonth);
    const prevBudgets = budgets.filter((b) => b.month === prevMonth);

    if (prevIncomes.length === 0 && prevInvoices.length === 0 && prevBudgets.length === 0) {
      showSnackbar(`No data found for ${format(addMonths(now, -1), "MMMM yyyy")}`);
      return;
    }

    const newIncomes = prevIncomes.map((i) => ({
      id: crypto.randomUUID(),
      name: i.name,
      category: i.category,
      amount: i.amount,
      month: curMonth,
      is_paid: false,
      notes: i.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const newInvoices = prevInvoices.map((i) => ({
      id: crypto.randomUUID(),
      name: i.name,
      category: i.category,
      amount: i.amount,
      month: curMonth,
      is_paid: false,
      notes: i.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const newBudgets = prevBudgets.map((b) => ({
      id: crypto.randomUUID(),
      category: b.category,
      allocated_amount: b.allocated_amount,
      month: curMonth,
      notes: b.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    // Save to database
    await Promise.all([
      ...newIncomes.map((i) => saveIncome(i)),
      ...newInvoices.map((i) => saveInvoice(i)),
      ...newBudgets.map((b) => saveBudget(b)),
    ]);

    setIncomes((prev) => [...prev, ...newIncomes]);
    setInvoices((prev) => [...prev, ...newInvoices]);
    setBudgets((prev) => [...prev, ...newBudgets]);

    const count = newIncomes.length + newInvoices.length + newBudgets.length;
    showSnackbar(`Copied ${count} item(s) from ${format(addMonths(now, -1), "MMMM yyyy")}`);
  };

  const getProgressColor = (ratio: number) => {
    if (ratio === 0) return theme.colors.surfaceDisabled;
    if (ratio < 0.75) return "#4caf50"; // green
    if (ratio < 0.96) return "#ff9800"; // orange
    return "#f44336"; // red
  };

  const filteredCategories = categories.filter((c) => {
    if (dialogType === "income") return c.type === "income" && c.is_visible;
    if (dialogType === "invoice") return c.type === "expense" && c.is_visible;
    return c.type === "expense" && c.is_visible;
  });

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 100 }}
      >
        {/* Month Selector */}
        <View
          style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
        >
          <IconButton icon="chevron-left" size={24} onPress={goPrevMonth} />
          <Text variant="titleLarge">{format(now, "MMMM yyyy")}</Text>
          <IconButton icon="chevron-right" size={24} onPress={goNextMonth} />
        </View>

        {/* Cash Overview */}
        <Card>
          <Card.Content>
            <Text variant="labelSmall" style={{ color: theme.colors.secondary, marginBottom: 8 }}>
              CASH OVERVIEW
            </Text>
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text variant="bodyMedium">Total expected income:</Text>
                <Text variant="bodyMedium" style={{ fontWeight: "600" }}>
                  €{expectedIncome.toFixed(1)}
                </Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text variant="bodyMedium">Total expected expenses:</Text>
                <Text variant="bodyMedium" style={{ fontWeight: "600" }}>
                  €{expectedExpenses.toFixed(1)}
                </Text>
              </View>
              <Divider />
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text variant="bodyLarge" style={{ fontWeight: "bold" }}>
                  Money to assign:
                </Text>
                <Text
                  variant="bodyLarge"
                  style={{
                    fontWeight: "bold",
                    color: moneyToAssign < 0 ? theme.colors.error : theme.colors.primary,
                  }}
                >
                  €{moneyToAssign.toFixed(1)}
                </Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text variant="bodyLarge" style={{ fontWeight: "bold" }}>
                  Money left in bank:
                </Text>
                <Text variant="bodyLarge" style={{ fontWeight: "bold" }}>
                  €{actualInBank.toFixed(1)}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Copy Previous Month Button */}
        {allEmpty && (
          <Card style={{ backgroundColor: theme.colors.secondaryContainer }}>
            <Card.Content
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 12,
              }}
            >
              <Text variant="bodyMedium">💡 No budget set?</Text>
              <Button mode="contained-tonal" onPress={copyFromPreviousMonth} compact>
                Copy Previous Month
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Expected Incomes Section */}
        <View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <Text variant="labelLarge" style={{ color: theme.colors.secondary, letterSpacing: 1 }}>
              EXPECTED INCOMES
            </Text>
            <Button icon="plus" mode="text" compact onPress={() => openAddDialog("income")}>
              Add Income
            </Button>
          </View>
          <Divider style={{ marginBottom: 12 }} />

          {currentIncomes.length === 0 ? (
            <Text
              variant="bodyMedium"
              style={{
                textAlign: "center",
                color: theme.colors.secondary,
                paddingVertical: 24,
              }}
            >
              No expected incomes yet. Tap + to add one.
            </Text>
          ) : (
            <View style={{ gap: 8 }}>
              {currentIncomes.map((income) => (
                <Card key={income.id} style={{ opacity: income.is_paid ? 0.6 : 1 }}>
                  <Card.Content>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                      <Checkbox
                        status={income.is_paid ? "checked" : "unchecked"}
                        onPress={() => togglePaid("income", income)}
                      />
                      <View style={{ flex: 1 }}>
                        <Text variant="bodyLarge">{income.name}</Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>
                          {income.category}
                        </Text>
                      </View>
                      <Text variant="bodyLarge" style={{ fontWeight: "600" }}>
                        €{income.amount.toFixed(1)}
                      </Text>
                      <IconButton
                        icon="pencil"
                        size={20}
                        onPress={() => openEditDialog("income", income)}
                      />
                      <IconButton
                        icon="delete"
                        size={20}
                        onPress={() => handleDeleteItem("income", income.id)}
                      />
                    </View>
                  </Card.Content>
                </Card>
              ))}
            </View>
          )}
        </View>

        {/* Expected Invoices Section */}
        <View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <Text variant="labelLarge" style={{ color: theme.colors.secondary, letterSpacing: 1 }}>
              EXPECTED INVOICES
            </Text>
            <Button icon="plus" mode="text" compact onPress={() => openAddDialog("invoice")}>
              Add Invoice
            </Button>
          </View>
          <Divider style={{ marginBottom: 12 }} />

          {currentInvoices.length === 0 ? (
            <Text
              variant="bodyMedium"
              style={{
                textAlign: "center",
                color: theme.colors.secondary,
                paddingVertical: 24,
              }}
            >
              No expected invoices yet. Tap + to add one.
            </Text>
          ) : (
            <View style={{ gap: 8 }}>
              {currentInvoices.map((invoice) => (
                <Card key={invoice.id} style={{ opacity: invoice.is_paid ? 0.6 : 1 }}>
                  <Card.Content>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                      <Checkbox
                        status={invoice.is_paid ? "checked" : "unchecked"}
                        onPress={() => togglePaid("invoice", invoice)}
                      />
                      <View style={{ flex: 1 }}>
                        <Text variant="bodyLarge">{invoice.name}</Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>
                          {invoice.category}
                        </Text>
                      </View>
                      <Text variant="bodyLarge" style={{ fontWeight: "600" }}>
                        €{invoice.amount.toFixed(1)}
                      </Text>
                      <IconButton
                        icon="pencil"
                        size={20}
                        onPress={() => openEditDialog("invoice", invoice)}
                      />
                      <IconButton
                        icon="delete"
                        size={20}
                        onPress={() => handleDeleteItem("invoice", invoice.id)}
                      />
                    </View>
                  </Card.Content>
                </Card>
              ))}
            </View>
          )}
        </View>

        {/* Budgets Section */}
        <View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <Text variant="labelLarge" style={{ color: theme.colors.secondary, letterSpacing: 1 }}>
              BUDGETS
            </Text>
            <Button icon="plus" mode="text" compact onPress={() => openAddDialog("budget")}>
              Add Budget
            </Button>
          </View>
          <Divider style={{ marginBottom: 12 }} />

          {currentBudgets.length === 0 ? (
            <Text
              variant="bodyMedium"
              style={{
                textAlign: "center",
                color: theme.colors.secondary,
                paddingVertical: 24,
              }}
            >
              No budgets yet. Tap + to add one.
            </Text>
          ) : (
            <View style={{ gap: 12 }}>
              {currentBudgets.map((budget) => {
                const spent = spentByCategory[budget.category] ?? 0;
                const remaining = budget.allocated_amount - spent;
                const ratio = budget.allocated_amount > 0 ? spent / budget.allocated_amount : 0;
                const progressColor = getProgressColor(ratio);

                return (
                  <Card key={budget.id}>
                    <Card.Content>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <Text variant="titleMedium">{budget.category}</Text>
                        <View style={{ flexDirection: "row" }}>
                          <IconButton
                            icon="pencil"
                            size={20}
                            onPress={() => openEditDialog("budget", budget)}
                          />
                          <IconButton
                            icon="delete"
                            size={20}
                            onPress={() => handleDeleteItem("budget", budget.id)}
                          />
                        </View>
                      </View>
                      <View style={{ gap: 4, marginBottom: 8 }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                          <Text variant="bodySmall">
                            Allocated: €{budget.allocated_amount.toFixed(1)}
                          </Text>
                          <Text variant="bodySmall">Spent: €{spent.toFixed(1)}</Text>
                          <Text
                            variant="bodySmall"
                            style={{
                              color: remaining < 0 ? theme.colors.error : undefined,
                            }}
                          >
                            Left: €{remaining.toFixed(1)}
                          </Text>
                        </View>
                      </View>
                      <ProgressBar
                        progress={Math.min(ratio, 1)}
                        color={progressColor}
                        style={{ height: 8, borderRadius: 4 }}
                      />
                      <Text
                        variant="bodySmall"
                        style={{
                          color: theme.colors.secondary,
                          marginTop: 4,
                        }}
                      >
                        {Math.round(ratio * 100)}% used
                      </Text>
                    </Card.Content>
                  </Card>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add/Edit Dialog */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>
            {editingItem ? "Edit" : "Add"}{" "}
            {dialogType === "income" ? "Income" : dialogType === "invoice" ? "Invoice" : "Budget"}
          </Dialog.Title>
          <Dialog.Content style={{ gap: 12 }}>
            {dialogType !== "budget" && (
              <TextInput
                label="Name (optional)"
                value={itemName}
                onChangeText={setItemName}
                placeholder={
                  dialogType === "income"
                    ? "Leave empty to use category name"
                    : "Leave empty to use category name"
                }
              />
            )}
            <TextInput
              label="Category"
              value={itemCategory}
              onChangeText={setItemCategory}
              placeholder="Select or type category"
            />
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {filteredCategories.slice(0, 10).map((cat) => (
                <Button
                  key={cat.id}
                  mode={itemCategory === cat.name ? "contained" : "outlined"}
                  onPress={() => setItemCategory(cat.name)}
                  compact
                >
                  {cat.icon} {cat.name}
                </Button>
              ))}
            </View>
            <TextInput
              label="Amount"
              value={itemAmount}
              onChangeText={setItemAmount}
              keyboardType="decimal-pad"
              placeholder="0.0"
            />
            <TextInput
              label="Notes (optional)"
              value={itemNotes}
              onChangeText={setItemNotes}
              placeholder="Add any notes..."
              multiline
              numberOfLines={3}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button mode="contained" onPress={handleSaveItem}>
              {editingItem ? "Update" : "Add"}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}
