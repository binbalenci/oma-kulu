import { loadBudgets, loadCategories, loadTransactions, saveBudgets } from "@/lib/storage";
import type { Budget, Category, Transaction } from "@/lib/types";
import { addMonths, endOfMonth, format, startOfMonth } from "date-fns";
import React from "react";
import { FlatList, View } from "react-native";
import { Button, Card, Dialog, Portal, ProgressBar, Text, TextInput } from "react-native-paper";

function monthKey(d: Date): string {
  return format(d, "yyyy-MM");
}

export default function BudgetsScreen() {
  const [now, setNow] = React.useState(new Date());
  const [budgets, setBudgets] = React.useState<Budget[]>([]);
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [editing, setEditing] = React.useState<Budget | null>(null);
  const [alloc, setAlloc] = React.useState("");
  const [visible, setVisible] = React.useState(false);
  const [allCategories, setAllCategories] = React.useState<Category[]>([]);
  const [catQuery, setCatQuery] = React.useState("");

  React.useEffect(() => {
    (async () => {
      const [b, t, c] = await Promise.all([loadBudgets(), loadTransactions(), loadCategories()]);
      setBudgets(b);
      setTransactions(t);
      setAllCategories(c);
    })();
  }, []);

  React.useEffect(() => {
    saveBudgets(budgets);
  }, [budgets]);

  const curMonth = monthKey(now);
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const monthTx = transactions.filter((t) => {
    const d = new Date(t.date + "T00:00:00");
    return d >= monthStart && d <= monthEnd;
  });

  // compute spent per category for current month
  const spentByCategory = monthTx.reduce<Record<string, number>>((acc, t) => {
    if (t.amount < 0) {
      acc[t.category] = (acc[t.category] ?? 0) + Math.abs(t.amount);
    }
    return acc;
  }, {});

  const currentBudgets = budgets.filter((b) => b.month === curMonth && b.is_active);
  const totalAllocated = currentBudgets.reduce((s, b) => s + b.allocated_amount, 0);
  const totalSpent = currentBudgets.reduce((s, b) => s + (spentByCategory[b.category] ?? 0), 0);
  const totalRemaining = Math.max(0, totalAllocated - totalSpent);

  const openEdit = (cat: string) => {
    const existing = budgets.find((b) => b.category === cat && b.month === curMonth);
    const b: Budget = existing ?? {
      id: Math.random().toString(36).slice(2),
      category: cat,
      allocated_amount: 0,
      spent_amount: 0,
      month: curMonth,
      is_active: true,
    };
    setEditing(b);
    setAlloc(existing ? String(existing.allocated_amount) : "0");
    setCatQuery(cat);
    setVisible(true);
  };

  const saveEdit = () => {
    if (!editing) return;
    const amt = parseFloat(alloc || "0");
    setBudgets((prev) => {
      const next = prev.filter(
        (x) => !(x.category === editing.category && x.month === editing.month)
      );
      next.push({ ...editing, allocated_amount: isNaN(amt) ? 0 : amt });
      return next;
    });
    setVisible(false);
  };

  const addNewBudget = () => {
    openEdit("");
  };

  const copyFromPreviousMonth = () => {
    const prevMonth = monthKey(addMonths(now, -1));
    const prev = budgets.filter((b) => b.month === prevMonth);
    if (prev.length === 0) return;
    setBudgets((prevBudgets) => {
      const existingCatsThisMonth = new Set(
        prevBudgets.filter((b) => b.month === curMonth).map((b) => b.category)
      );
      const toAdd = prev
        .filter((b) => !existingCatsThisMonth.has(b.category))
        .map((b) => ({ ...b, id: Math.random().toString(36).slice(2), month: curMonth }));
      return [...prevBudgets, ...toAdd];
    });
  };

  const goPrevMonth = () => setNow((d) => addMonths(d, -1));
  const goNextMonth = () => setNow((d) => addMonths(d, 1));

  // categories inferred from existing budgets and transactions
  const categories = Array.from(
    new Set<string>([
      ...budgets.filter((b) => b.month === curMonth).map((b) => b.category),
      ...transactions.map((t) => t.category),
    ])
  ).sort();

  return (
    <View style={{ flex: 1, padding: 12, gap: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Button onPress={goPrevMonth}>Prev</Button>
        <Text variant="titleLarge">{format(now, "MMMM yyyy")} Budgets</Text>
        <Button onPress={goNextMonth}>Next</Button>
      </View>

      <View style={{ flexDirection: "row", gap: 8 }}>
        <Button mode="contained" onPress={addNewBudget}>
          Add Budget
        </Button>
        <Button mode="outlined" onPress={copyFromPreviousMonth}>
          Copy Previous Month
        </Button>
      </View>

      <Card>
        <Card.Title title="Summary" />
        <Card.Content>
          <Text>Total Allocated: ${totalAllocated.toFixed(2)}</Text>
          <Text>Total Spent: ${totalSpent.toFixed(2)}</Text>
          <Text>Remaining: ${totalRemaining.toFixed(2)}</Text>
        </Card.Content>
      </Card>

      <FlatList
        data={categories}
        keyExtractor={(c) => c}
        renderItem={({ item: cat }) => {
          const allocated =
            budgets.find((b) => b.category === cat && b.month === curMonth)?.allocated_amount ?? 0;
          const spent = spentByCategory[cat] ?? 0;
          const ratio = allocated > 0 ? Math.min(1, spent / allocated) : 0;
          const color = ratio < 0.75 ? "green" : ratio < 1 ? "orange" : "red";
          return (
            <Card style={{ marginBottom: 8 }}>
              <Card.Title
                title={cat}
                right={() => <Button onPress={() => openEdit(cat)}>Edit</Button>}
              />
              <Card.Content>
                <Text>
                  ${spent.toFixed(2)} / ${allocated.toFixed(2)}
                </Text>
                <ProgressBar progress={ratio} color={color} style={{ marginTop: 8 }} />
                <Text>
                  Remaining: ${Math.max(0, allocated - spent).toFixed(2)} (
                  {allocated > 0 ? Math.round((spent / allocated) * 100) : 0}% used)
                </Text>
              </Card.Content>
            </Card>
          );
        }}
      />

      <Portal>
        <Dialog visible={visible} onDismiss={() => setVisible(false)}>
          <Dialog.Title>Set Budget</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Category"
              value={catQuery}
              onChangeText={(t) => {
                setCatQuery(t);
                setEditing((e) => (e ? { ...e, category: t } : e));
              }}
              placeholder="e.g., Groceries+Fuel"
            />
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
              {allCategories
                .filter((c) => (c.is_visible ?? true) && (c.budget_enabled ?? true))
                .filter((c) => c.name.toLowerCase().includes(catQuery.toLowerCase()))
                .slice(0, 10)
                .map((c) => (
                  <Button
                    key={c.id}
                    mode={editing?.category === c.name ? "contained" : "outlined"}
                    onPress={() => {
                      setEditing((e) => (e ? { ...e, category: c.name } : e));
                      setCatQuery(c.name);
                    }}
                  >
                    {c.name}
                  </Button>
                ))}
            </View>
            <TextInput
              label="Allocation"
              value={alloc}
              onChangeText={setAlloc}
              keyboardType="decimal-pad"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setVisible(false)}>Cancel</Button>
            <Button onPress={saveEdit}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}
