import {
  loadBudgets,
  loadCategories,
  loadSettings,
  loadTemplates,
  loadTransactions,
  saveBudgets,
  saveTransactions,
} from "@/lib/storage";
import type { Budget, Category, RecurringTemplate, Transaction } from "@/lib/types";
import { addMonths, endOfMonth, format, startOfMonth } from "date-fns";
import { useRouter } from "expo-router";
import React from "react";
import { FlatList, View } from "react-native";
import {
  Button,
  Card,
  Checkbox,
  Chip,
  Dialog,
  FAB,
  List,
  Portal,
  ProgressBar,
  Text,
  TextInput,
} from "react-native-paper";

function monthKey(d: Date): string {
  return format(d, "yyyy-MM");
}

export default function BudgetsScreen() {
  const router = useRouter();
  const [now, setNow] = React.useState(new Date());
  const [budgets, setBudgets] = React.useState<Budget[]>([]);
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [editing, setEditing] = React.useState<Budget | null>(null);
  const [alloc, setAlloc] = React.useState("");
  const [visible, setVisible] = React.useState(false);
  const [allCategories, setAllCategories] = React.useState<Category[]>([]);
  const [catQuery, setCatQuery] = React.useState("");
  const [startingBalance, setStartingBalance] = React.useState<number>(0);
  const [templates, setTemplates] = React.useState<RecurringTemplate[]>([]);
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});
  const [fabOpen, setFabOpen] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const [b, t, c, s, tmpl] = await Promise.all([
        loadBudgets(),
        loadTransactions(),
        loadCategories(),
        loadSettings(),
        loadTemplates(),
      ]);
      setBudgets(b);
      setTransactions(t);
      setAllCategories(c);
      setStartingBalance(s.starting_balance ?? 0);
      setTemplates(tmpl.filter((x) => x.enabled !== false));
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
  const actualInBank = startingBalance + transactions.reduce((s, t) => s + t.amount, 0);

  // Expected items from templates, grouped by category
  const templatesByCategory = React.useMemo(() => {
    const map = new Map<string, RecurringTemplate[]>();
    for (const tpl of templates) {
      const key = tpl.category || "(Uncategorized)";
      map.set(key, [...(map.get(key) ?? []), tpl]);
    }
    return map;
  }, [templates]);

  const isTemplatePaidThisMonth = (tpl: RecurringTemplate): boolean => {
    // consider paid if a transaction exists this month with description matching template name
    return monthTx.some(
      (t) =>
        t.status === "paid" &&
        t.description === tpl.name &&
        (tpl.type === "income" ? t.amount > 0 : t.amount < 0)
    );
  };

  const markTemplatePaid = (tpl: RecurringTemplate) => {
    const amt = Math.abs(tpl.typical_amount || 0);
    const amount = tpl.type === "income" ? amt : -amt;
    const tx: Transaction = {
      id: Math.random().toString(36).slice(2),
      amount,
      description: tpl.name,
      date: format(new Date(), "yyyy-MM-dd"),
      category: tpl.category || "General",
      status: "paid",
      created_at: new Date().toISOString(),
    };
    setTransactions((prev) => [tx, ...prev]);
  };

  React.useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

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
        <Button onPress={goPrevMonth}>◀</Button>
        <Text variant="titleLarge">{format(now, "MMMM yyyy")}</Text>
        <Button onPress={goNextMonth}>▶</Button>
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
        <Card.Title title="Cash Flow" />
        <Card.Content>
          <View style={{ flexDirection: "row", gap: 16 }}>
            <View style={{ flex: 1 }}>
              <Text variant="labelLarge">Planned to Assign</Text>
              <Text variant="headlineSmall">${totalRemaining.toFixed(2)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="labelLarge">Actual in Bank</Text>
              <Text variant="headlineSmall">${actualInBank.toFixed(2)}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card>
        <Card.Title title="Expected Items" />
        <Card.Content>
          <List.Section>
            {Array.from(templatesByCategory.entries()).map(([cat, list]) => {
              const planned = list.reduce((s, x) => s + Math.abs(x.typical_amount || 0), 0);
              const open = expanded[cat] ?? false;
              return (
                <View key={cat} style={{ marginBottom: 8 }}>
                  <List.Item
                    title={cat}
                    description={`Planned: $${planned.toFixed(2)}`}
                    left={() => <List.Icon icon={open ? "chevron-down" : "chevron-right"} />}
                    onPress={() => setExpanded((e) => ({ ...e, [cat]: !open }))}
                  />
                  {open && (
                    <View style={{ paddingLeft: 8 }}>
                      {list.map((tpl) => {
                        const paid = isTemplatePaidThisMonth(tpl);
                        return (
                          <List.Item
                            key={tpl.id}
                            title={tpl.name}
                            right={() => (
                              <Text>${Math.abs(tpl.typical_amount || 0).toFixed(2)}</Text>
                            )}
                            left={() => (
                              <Checkbox
                                status={paid ? "checked" : "unchecked"}
                                onPress={() => {
                                  if (!paid) markTemplatePaid(tpl);
                                }}
                              />
                            )}
                          />
                        );
                      })}
                      <Button icon="plus" compact onPress={() => router.push("/(tabs)/categories")}>
                        Add item to {cat}
                      </Button>
                    </View>
                  )}
                </View>
              );
            })}
          </List.Section>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
            <Chip icon="plus" onPress={() => router.push("/(tabs)/categories")}>
              Add Expected Income
            </Chip>
            <Chip icon="plus" onPress={() => router.push("/(tabs)/categories")}>
              Add Expected Invoice
            </Chip>
          </View>
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

      <FAB.Group
        open={fabOpen}
        visible
        icon={fabOpen ? "close" : "plus"}
        actions={[
          { icon: "content-copy", label: "Copy Last Month's Plan", onPress: copyFromPreviousMonth },
          {
            icon: "plus",
            label: "Add Expected Income",
            onPress: () => router.push("/(tabs)/categories"),
          },
          {
            icon: "plus",
            label: "Add Expected Invoice",
            onPress: () => router.push("/(tabs)/categories"),
          },
        ]}
        onStateChange={({ open }) => setFabOpen(open)}
        onPress={() => {
          if (fabOpen) {
            // if speed dial open, do nothing special
          }
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
