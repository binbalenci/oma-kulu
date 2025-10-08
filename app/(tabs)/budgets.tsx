import { useSnackbar } from "@/components/snackbar-provider";
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
import { ScrollView, TouchableOpacity, View } from "react-native";
import {
  Button,
  Card,
  Checkbox,
  Dialog,
  Divider,
  FAB,
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
  const router = useRouter();
  const theme = useTheme();
  const { showSnackbar } = useSnackbar();
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
  const [addTemplateVisible, setAddTemplateVisible] = React.useState(false);
  const [templateType, setTemplateType] = React.useState<"income" | "expense">("income");

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

  // Calculate expected income and expenses from templates
  const expectedIncome = templates
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Math.abs(t.typical_amount || 0), 0);
  const expectedExpenses = templates
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Math.abs(t.typical_amount || 0), 0);

  // Money to assign = expected income - expected expenses - allocated budgets
  const moneyToAssign = expectedIncome - expectedExpenses - totalAllocated;

  // Actual in bank = starting balance + all transactions
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
    if (prev.length === 0) {
      showSnackbar(`No budget data found for ${format(addMonths(now, -1), "MMMM yyyy")}`);
      return;
    }
    setBudgets((prevBudgets) => {
      const existingCatsThisMonth = new Set(
        prevBudgets.filter((b) => b.month === curMonth).map((b) => b.category)
      );
      const toAdd = prev
        .filter((b) => !existingCatsThisMonth.has(b.category))
        .map((b) => ({ ...b, id: Math.random().toString(36).slice(2), month: curMonth }));

      if (toAdd.length === 0) {
        showSnackbar("All budgets from last month already exist this month");
        return prevBudgets;
      }

      showSnackbar(
        `Copied ${toAdd.length} budget(s) from ${format(addMonths(now, -1), "MMMM yyyy")}`
      );
      return [...prevBudgets, ...toAdd];
    });
  };

  const goPrevMonth = () => setNow((d) => addMonths(d, -1));
  const goNextMonth = () => setNow((d) => addMonths(d, 1));

  // Check if all expected items are paid
  const allExpectedPaid =
    templates.length > 0 && templates.every((t) => isTemplatePaidThisMonth(t));

  // Check if there's any data for this month
  const hasData = templates.length > 0 || currentBudgets.length > 0;

  const getProgressColor = (ratio: number) => {
    if (ratio === 0) return theme.colors.surfaceDisabled;
    if (ratio < 0.75) return "#4caf50"; // green
    if (ratio < 0.96) return "#ff9800"; // orange
    return "#f44336"; // red
  };

  const getProgressMessage = (ratio: number) => {
    if (ratio === 0) return "";
    if (ratio < 0.75) return "Filling";
    if (ratio < 0.96) return "Getting there!";
    if (ratio >= 1) return "Over budget!";
    return "";
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 100 }}
      >
        {/* Header Section */}
        <View
          style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
        >
          <IconButton icon="chevron-left" size={24} onPress={goPrevMonth} />
          <TouchableOpacity>
            <Text variant="titleLarge">{format(now, "MMMM yyyy")}</Text>
          </TouchableOpacity>
          <IconButton icon="chevron-right" size={24} onPress={goNextMonth} />
        </View>

        {/* Cash Overview */}
        <Card>
          <Card.Content>
            <Text variant="labelSmall" style={{ color: theme.colors.secondary, marginBottom: 8 }}>
              CASH OVERVIEW
            </Text>
            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text variant="bodyMedium">Total expected income:</Text>
                <Text variant="bodyMedium" style={{ fontWeight: "600" }}>
                  €{expectedIncome.toFixed(2)}
                </Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text variant="bodyMedium">Total expected spent:</Text>
                <Text variant="bodyMedium" style={{ fontWeight: "600" }}>
                  €{expectedExpenses.toFixed(2)}
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
                  €{moneyToAssign.toFixed(2)}
                </Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text variant="bodyLarge" style={{ fontWeight: "bold" }}>
                  Money left in bank:
                </Text>
                <Text variant="bodyLarge" style={{ fontWeight: "bold" }}>
                  €{actualInBank.toFixed(2)}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Empty State */}
        {!hasData && (
          <Card>
            <Card.Content style={{ alignItems: "center", paddingVertical: 32 }}>
              <Text variant="titleMedium" style={{ marginBottom: 8 }}>
                No Budget Set for {format(now, "MMMM yyyy")}
              </Text>
              <Text
                variant="bodyMedium"
                style={{ textAlign: "center", marginBottom: 24, color: theme.colors.secondary }}
              >
                It looks like you haven&apos;t set up your budget for this month yet.
              </Text>
              <View style={{ flexDirection: "row", gap: 12 }}>
                <Button mode="contained" onPress={copyFromPreviousMonth}>
                  Copy Last Month&apos;s Budget
                </Button>
                <Button mode="outlined" onPress={addNewBudget}>
                  Start Fresh
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* All Paid State */}
        {allExpectedPaid && (
          <Card style={{ backgroundColor: theme.colors.primaryContainer }}>
            <Card.Content style={{ alignItems: "center", paddingVertical: 16 }}>
              <Text variant="titleMedium" style={{ marginBottom: 4 }}>
                🎉 All Expected Items Paid!
              </Text>
              <Text
                variant="bodyMedium"
                style={{ textAlign: "center", color: theme.colors.secondary }}
              >
                All your expected incomes and invoices for {format(now, "MMMM")} are marked as paid.
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Expected Income & Invoices */}
        {templates.length > 0 && (
          <View>
            <Text
              variant="labelLarge"
              style={{ color: theme.colors.secondary, marginBottom: 8, letterSpacing: 1 }}
            >
              ⌦ EXPECTED INCOME & INVOICES
            </Text>
            <Divider style={{ marginBottom: 12 }} />

            {Array.from(templatesByCategory.entries()).map(([cat, list]) => {
              const planned = list.reduce((s, x) => s + Math.abs(x.typical_amount || 0), 0);
              const open = expanded[cat] ?? false;
              const allPaid = list.every((t) => isTemplatePaidThisMonth(t));
              const hasUnpaid = list.some((t) => !isTemplatePaidThisMonth(t));

              return (
                <View key={cat} style={{ marginBottom: 12 }}>
                  <TouchableOpacity
                    onPress={() => setExpanded((e) => ({ ...e, [cat]: !open }))}
                    style={{ flexDirection: "row", alignItems: "center", paddingVertical: 8 }}
                  >
                    <Text variant="bodyMedium" style={{ marginRight: 4 }}>
                      {open ? "▸" : "▶"}
                    </Text>
                    <Text
                      variant="bodyLarge"
                      style={{
                        flex: 1,
                        fontWeight: hasUnpaid ? "bold" : "normal",
                        fontStyle: allPaid ? "italic" : "normal",
                      }}
                    >
                      {cat.toUpperCase()}
                    </Text>
                    <Text variant="bodyMedium" style={{ color: theme.colors.secondary }}>
                      (€{planned.toFixed(2)})
                    </Text>
                  </TouchableOpacity>

                  {open && (
                    <View style={{ paddingLeft: 24, gap: 4 }}>
                      {list.map((tpl) => {
                        const paid = isTemplatePaidThisMonth(tpl);
                        return (
                          <View
                            key={tpl.id}
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              paddingVertical: 4,
                              opacity: paid ? 0.5 : 1,
                            }}
                          >
                            <Checkbox
                              status={paid ? "checked" : "unchecked"}
                              onPress={() => {
                                if (!paid) markTemplatePaid(tpl);
                              }}
                            />
                            <Text variant="bodyMedium" style={{ flex: 1, marginLeft: 8 }}>
                              {tpl.name}
                            </Text>
                            <Text variant="bodyMedium">
                              €{Math.abs(tpl.typical_amount || 0).toFixed(2)}
                            </Text>
                          </View>
                        );
                      })}
                      <Button
                        icon="plus"
                        mode="text"
                        compact
                        onPress={() => {
                          setTemplateType(list[0]?.type === "income" ? "income" : "expense");
                          setAddTemplateVisible(true);
                        }}
                        style={{ alignSelf: "flex-start", marginTop: 4 }}
                      >
                        Add {list[0]?.type === "income" ? "income" : "invoice"}
                      </Button>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Free-Range Budgets */}
        {currentBudgets.length > 0 && (
          <View>
            <Text
              variant="labelLarge"
              style={{ color: theme.colors.secondary, marginBottom: 8, letterSpacing: 1 }}
            >
              💰 FREE-RANGE BUDGETS
            </Text>
            <Divider style={{ marginBottom: 12 }} />

            {currentBudgets.map((budget) => {
              const spent = spentByCategory[budget.category] ?? 0;
              const remaining = budget.allocated_amount - spent;
              const ratio = budget.allocated_amount > 0 ? spent / budget.allocated_amount : 0;
              const progressColor = getProgressColor(ratio);
              const message = getProgressMessage(ratio);

              return (
                <Card key={budget.id} style={{ marginBottom: 12 }}>
                  <Card.Content>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <Text variant="titleMedium">{budget.category}</Text>
                      <Button mode="text" compact onPress={() => openEdit(budget.category)}>
                        Edit
                      </Button>
                    </View>
                    <View style={{ gap: 4, marginBottom: 8 }}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Text variant="bodySmall">
                          Allocated: €{budget.allocated_amount.toFixed(2)}
                        </Text>
                        <Text variant="bodySmall">Spent: €{spent.toFixed(2)}</Text>
                        <Text
                          variant="bodySmall"
                          style={{ color: remaining < 0 ? theme.colors.error : undefined }}
                        >
                          Left: €{remaining.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                    <ProgressBar
                      progress={Math.min(ratio, 1)}
                      color={progressColor}
                      style={{ height: 8, borderRadius: 4 }}
                    />
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginTop: 4,
                      }}
                    >
                      <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>
                        {Math.round(ratio * 100)}% used
                      </Text>
                      {message && (
                        <Text
                          variant="bodySmall"
                          style={{ color: theme.colors.error, fontWeight: "600" }}
                        >
                          {message}
                        </Text>
                      )}
                    </View>
                  </Card.Content>
                </Card>
              );
            })}

            <Button icon="plus" mode="outlined" onPress={addNewBudget} style={{ marginTop: 8 }}>
              Add New Budget
            </Button>
          </View>
        )}
      </ScrollView>

      <FAB.Group
        open={fabOpen}
        visible
        icon={fabOpen ? "close" : "plus"}
        actions={[
          { icon: "content-copy", label: "Copy Last Month's Plan", onPress: copyFromPreviousMonth },
          {
            icon: "cash-plus",
            label: "Add Expected Income",
            onPress: () => {
              setTemplateType("income");
              setAddTemplateVisible(true);
            },
          },
          {
            icon: "receipt",
            label: "Add Expected Invoice",
            onPress: () => {
              setTemplateType("expense");
              setAddTemplateVisible(true);
            },
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

        <Dialog visible={addTemplateVisible} onDismiss={() => setAddTemplateVisible(false)}>
          <Dialog.Title>
            Add Expected {templateType === "income" ? "Income" : "Invoice"}
          </Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
              To add expected items, please go to the Categories tab and create a recurring
              template. Templates will automatically appear here each month.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAddTemplateVisible(false)}>Cancel</Button>
            <Button
              mode="contained"
              onPress={() => {
                setAddTemplateVisible(false);
                router.push("/(tabs)/categories");
              }}
            >
              Go to Categories
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}
