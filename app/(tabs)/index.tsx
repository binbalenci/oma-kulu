import { loadTransactions } from "@/lib/storage";
import type { Transaction } from "@/lib/types";
import { endOfMonth, format, startOfMonth } from "date-fns";
import React from "react";
import { View } from "react-native";
import { Card, List, Text } from "react-native-paper";

export default function DashboardScreen() {
  const [now] = React.useState(new Date());
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);

  React.useEffect(() => {
    (async () => {
      const loaded = await loadTransactions();
      setTransactions(loaded);
    })();
  }, []);

  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const thisMonth = transactions.filter((t) => {
    const d = new Date(t.date + "T00:00:00");
    return d >= monthStart && d <= monthEnd;
  });

  const income = thisMonth.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const expenses = thisMonth
    .filter((t) => t.amount < 0)
    .reduce((s, t) => s + Math.abs(t.amount), 0);
  const net = income - expenses;

  const byCategory = thisMonth.reduce<Record<string, number>>((acc, t) => {
    acc[t.category] = (acc[t.category] ?? 0) + t.amount;
    return acc;
  }, {});

  return (
    <View style={{ flex: 1, padding: 16, gap: 16 }}>
      <Text variant="titleLarge">{format(now, "MMMM yyyy")}</Text>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <Card style={{ flex: 1 }}>
          <Card.Title title="Income" subtitle="$" />
          <Card.Content>
            <Text variant="headlineMedium">${income.toFixed(2)}</Text>
          </Card.Content>
        </Card>
        <Card style={{ flex: 1 }}>
          <Card.Title title="Expenses" subtitle="$" />
          <Card.Content>
            <Text variant="headlineMedium">${expenses.toFixed(2)}</Text>
          </Card.Content>
        </Card>
        <Card style={{ flex: 1 }}>
          <Card.Title title="Net" subtitle="$" />
          <Card.Content>
            <Text variant="headlineMedium">${net.toFixed(2)}</Text>
          </Card.Content>
        </Card>
      </View>

      <Card>
        <Card.Title title="Category Breakdown" />
        <Card.Content>
          {Object.keys(byCategory).length === 0 ? (
            <Text>No data</Text>
          ) : (
            Object.entries(byCategory).map(([cat, sum]) => (
              <List.Item key={cat} title={cat} right={() => <Text>${sum.toFixed(2)}</Text>} />
            ))
          )}
        </Card.Content>
      </Card>
    </View>
  );
}
