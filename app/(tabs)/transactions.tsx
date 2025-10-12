import { useSnackbar } from "@/components/snackbar-provider";
import {
  deleteTransaction,
  loadIncomes,
  loadInvoices,
  loadTransactions,
  saveTransaction,
} from "@/lib/storage";
import type { ExpectedIncome, ExpectedInvoice, Transaction } from "@/lib/types";
import { format } from "date-fns";
import { useFocusEffect } from "expo-router";
import React from "react";
import { FlatList, TouchableOpacity, View } from "react-native";
import {
  Button,
  Card,
  Dialog,
  Divider,
  FAB,
  IconButton,
  Portal,
  SegmentedButtons,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";

export default function TransactionsScreen() {
  const theme = useTheme();
  const { showSnackbar } = useSnackbar();
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [incomes, setIncomes] = React.useState<ExpectedIncome[]>([]);
  const [invoices, setInvoices] = React.useState<ExpectedInvoice[]>([]);
  const [upcomingExpanded, setUpcomingExpanded] = React.useState(true);

  // Form states
  const [dialogVisible, setDialogVisible] = React.useState(false);
  const [editing, setEditing] = React.useState<Transaction | null>(null);
  const [amount, setAmount] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [date, setDate] = React.useState(format(new Date(), "yyyy-MM-dd"));
  const [category, setCategory] = React.useState("General");
  const [status, setStatus] = React.useState<"upcoming" | "paid">("paid");

  // Load data when screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const [txs, incms, invcs] = await Promise.all([
          loadTransactions(),
          loadIncomes(),
          loadInvoices(),
        ]);
        setTransactions(txs);
        setIncomes(incms);
        setInvoices(invcs);
      })();
    }, [])
  );

  // Upcoming items: unpaid incomes/invoices + upcoming transactions
  const upcomingFromIncomes = incomes.filter((i) => !i.is_paid);
  const upcomingFromInvoices = invoices.filter((i) => !i.is_paid);
  const upcomingTransactions = transactions.filter((t) => t.status === "upcoming");

  // Recent: paid transactions only
  const recentTransactions = transactions
    .filter((t) => t.status === "paid")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const resetForm = () => {
    setAmount("");
    setDescription("");
    setDate(format(new Date(), "yyyy-MM-dd"));
    setCategory("General");
    setStatus("paid");
    setEditing(null);
  };

  const handleSave = async () => {
    const amt = parseFloat(amount);
    if (Number.isNaN(amt)) {
      showSnackbar("Please enter a valid amount");
      return;
    }

    const tx: Transaction = {
      id: editing?.id || crypto.randomUUID(),
      amount: amt,
      description,
      date,
      category,
      status,
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
    setAmount(String(t.amount));
    setDescription(t.description);
    setDate(t.date);
    setCategory(t.category);
    setStatus(t.status);
    setDialogVisible(true);
  };

  const handleDelete = async (id: string) => {
    const success = await deleteTransaction(id);
    if (success) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      showSnackbar("Transaction deleted");
    } else {
      showSnackbar("Failed to delete transaction");
    }
  };

  const formatAmount = (amount: number) => {
    const sign = amount >= 0 ? "+" : "-";
    const color = amount >= 0 ? "#4caf50" : "#f44336";
    return (
      <Text style={{ fontWeight: "600", color }}>
        {sign}€{Math.abs(amount).toFixed(1)}
      </Text>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Month Selector Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: theme.colors.elevation.level2,
        }}
      >
        <IconButton
          icon="chevron-left"
          size={24}
          onPress={() => setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
        />
        <Text variant="titleMedium">{format(currentMonth, "MMMM yyyy")}</Text>
        <IconButton
          icon="chevron-right"
          size={24}
          onPress={() => setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
        />
      </View>

      <View style={{ flex: 1, padding: 16 }}>
        {/* Upcoming Section */}
        <TouchableOpacity
          onPress={() => setUpcomingExpanded(!upcomingExpanded)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <Text variant="titleMedium" style={{ color: theme.colors.secondary }}>
            UPCOMING
          </Text>
          <IconButton icon={upcomingExpanded ? "chevron-up" : "chevron-down"} size={24} />
        </TouchableOpacity>

        {upcomingExpanded && (
          <View style={{ marginBottom: 16 }}>
            {upcomingFromIncomes.length === 0 &&
            upcomingFromInvoices.length === 0 &&
            upcomingTransactions.length === 0 ? (
              <Text
                style={{
                  textAlign: "center",
                  color: theme.colors.secondary,
                  paddingVertical: 16,
                }}
              >
                No upcoming items
              </Text>
            ) : (
              <>
                {upcomingFromIncomes.map((income) => (
                  <Card key={`income-${income.id}`} style={{ marginBottom: 8 }}>
                    <Card.Content style={{ paddingVertical: 12 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <View style={{ flex: 1 }}>
                          <Text variant="bodyLarge">{income.name}</Text>
                          <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>
                            {income.category} • Expected Income
                          </Text>
                        </View>
                        <Text style={{ fontWeight: "600", color: "#4caf50" }}>
                          +€{income.amount.toFixed(1)}
                        </Text>
                      </View>
                    </Card.Content>
                  </Card>
                ))}

                {upcomingFromInvoices.map((invoice) => (
                  <Card key={`invoice-${invoice.id}`} style={{ marginBottom: 8 }}>
                    <Card.Content style={{ paddingVertical: 12 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <View style={{ flex: 1 }}>
                          <Text variant="bodyLarge">{invoice.name}</Text>
                          <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>
                            {invoice.category} • Expected Invoice
                          </Text>
                        </View>
                        <Text style={{ fontWeight: "600", color: "#f44336" }}>
                          -€{invoice.amount.toFixed(1)}
                        </Text>
                      </View>
                    </Card.Content>
                  </Card>
                ))}

                {upcomingTransactions.map((tx) => (
                  <Card key={tx.id} style={{ marginBottom: 8 }}>
                    <Card.Content style={{ paddingVertical: 12 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <View style={{ flex: 1 }}>
                          <Text variant="bodyLarge">{tx.description}</Text>
                          <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>
                            {tx.date} • {tx.category}
                          </Text>
                        </View>
                        {formatAmount(tx.amount)}
                        <View style={{ flexDirection: "row", marginLeft: 8 }}>
                          <IconButton icon="pencil" size={20} onPress={() => handleEdit(tx)} />
                          <IconButton icon="delete" size={20} onPress={() => handleDelete(tx.id)} />
                        </View>
                      </View>
                    </Card.Content>
                  </Card>
                ))}
              </>
            )}
          </View>
        )}

        <Divider style={{ marginVertical: 8 }} />

        {/* Recent Section */}
        <Text variant="titleMedium" style={{ color: theme.colors.secondary, marginBottom: 12 }}>
          RECENT
        </Text>

        <FlatList
          data={recentTransactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card style={{ marginBottom: 8 }}>
              <Card.Content style={{ paddingVertical: 12 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyLarge">{item.description}</Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>
                      {item.date} • {item.category}
                    </Text>
                  </View>
                  {formatAmount(item.amount)}
                  <View style={{ flexDirection: "row", marginLeft: 8 }}>
                    <IconButton icon="pencil" size={20} onPress={() => handleEdit(item)} />
                    <IconButton icon="delete" size={20} onPress={() => handleDelete(item.id)} />
                  </View>
                </View>
              </Card.Content>
            </Card>
          )}
          ListEmptyComponent={() => (
            <View style={{ padding: 24, alignItems: "center" }}>
              <Text style={{ color: theme.colors.secondary }}>No recent transactions yet</Text>
            </View>
          )}
        />
      </View>

      <FAB
        style={{ position: "absolute", right: 16, bottom: 16 }}
        icon="plus"
        onPress={() => {
          resetForm();
          setDialogVisible(true);
        }}
      />

      {/* Add/Edit Dialog */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>{editing ? "Edit" : "Add"} Transaction</Dialog.Title>
          <Dialog.Content style={{ gap: 12 }}>
            <TextInput
              label="Amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.0"
            />
            <TextInput
              label="Description"
              value={description}
              onChangeText={setDescription}
              placeholder="e.g., Grocery shopping"
            />
            <TextInput
              label="Date (YYYY-MM-DD)"
              value={date}
              onChangeText={setDate}
              placeholder="2025-01-15"
            />
            <TextInput
              label="Category"
              value={category}
              onChangeText={setCategory}
              placeholder="e.g., Groceries"
            />
            <SegmentedButtons
              value={status}
              onValueChange={(v) => setStatus(v as "upcoming" | "paid")}
              buttons={[
                { value: "paid", label: "Paid" },
                { value: "upcoming", label: "Upcoming" },
              ]}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button mode="contained" onPress={handleSave}>
              {editing ? "Update" : "Add"}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}
