import { loadTransactions, saveTransactions } from "@/lib/storage";
import type { Transaction } from "@/lib/types";
import { format } from "date-fns";
import React from "react";
import { FlatList, View } from "react-native";
import { Button, Divider, FAB, List, SegmentedButtons, Text, TextInput } from "react-native-paper";

type Filter = "all" | "upcoming" | "paid";

export default function TransactionsScreen() {
  const [filter, setFilter] = React.useState<Filter>("all");
  const [items, setItems] = React.useState<Transaction[]>([]);
  React.useEffect(() => {
    (async () => {
      const loaded = await loadTransactions();
      setItems(loaded);
    })();
  }, []);

  React.useEffect(() => {
    saveTransactions(items);
  }, [items]);
  const [showForm, setShowForm] = React.useState(false);
  const [editing, setEditing] = React.useState<Transaction | null>(null);

  const [amount, setAmount] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [date, setDate] = React.useState(format(new Date(), "yyyy-MM-dd"));
  const [category, setCategory] = React.useState("General");
  const [status, setStatus] = React.useState<"upcoming" | "paid">("upcoming");

  const filtered = items.filter((t) => (filter === "all" ? true : t.status === filter));
  const upcoming = items.filter((t) => t.status === "upcoming");
  const recent = items.filter((t) => t.status === "paid");

  const resetForm = () => {
    setAmount("");
    setDescription("");
    setDate(format(new Date(), "yyyy-MM-dd"));
    setCategory("General");
    setStatus("upcoming");
    setEditing(null);
  };

  const onSubmit = () => {
    const amt = parseFloat(amount);
    if (Number.isNaN(amt)) return;
    if (editing) {
      setItems((prev) =>
        prev.map((t) =>
          t.id === editing.id ? { ...editing, amount: amt, description, date, category, status } : t
        )
      );
    } else {
      const newItem: Transaction = {
        id: Math.random().toString(36).slice(2),
        amount: amt,
        description,
        date,
        category,
        status,
        created_at: new Date().toISOString(),
      };
      setItems((prev) => [newItem, ...prev]);
    }
    setShowForm(false);
    resetForm();
  };

  const onEdit = (t: Transaction) => {
    setEditing(t);
    setAmount(String(t.amount));
    setDescription(t.description);
    setDate(t.date);
    setCategory(t.category);
    setStatus(t.status);
    setShowForm(true);
  };

  const onDelete = (id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 12 }}>
        <SegmentedButtons
          value={filter}
          onValueChange={(v) => setFilter(v as Filter)}
          buttons={[
            { value: "all", label: "All" },
            { value: "upcoming", label: "Upcoming" },
            { value: "paid", label: "Paid" },
          ]}
        />
      </View>

      {showForm ? (
        <View style={{ padding: 12, gap: 12 }}>
          <Text variant="titleMedium">{editing ? "Edit" : "Add"} Transaction</Text>
          <TextInput
            label="Amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
          <TextInput label="Description" value={description} onChangeText={setDescription} />
          <TextInput label="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} />
          <TextInput label="Category" value={category} onChangeText={setCategory} />
          <SegmentedButtons
            value={status}
            onValueChange={(v) => setStatus(v as "upcoming" | "paid")}
            buttons={[
              { value: "upcoming", label: "Upcoming" },
              { value: "paid", label: "Paid" },
            ]}
          />
          <View style={{ flexDirection: "row", gap: 12 }}>
            <Button mode="contained" onPress={onSubmit}>
              {editing ? "Save" : "Add"}
            </Button>
            <Button
              onPress={() => {
                setShowForm(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
          </View>
        </View>
      ) : (
        <>
          {filter === "all" ? (
            <>
              <List.Subheader>Upcoming</List.Subheader>
              {upcoming.length === 0 ? (
                <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
                  <Text>No upcoming items</Text>
                </View>
              ) : (
                upcoming.map((item) => (
                  <List.Item
                    key={item.id}
                    title={`${item.description || "No description"}`}
                    description={`${item.date} • ${item.category}`}
                    right={() => (
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Text style={{ marginRight: 12 }}>${item.amount.toFixed(2)}</Text>
                        <Button compact onPress={() => onEdit(item)}>
                          Edit
                        </Button>
                        <Button compact onPress={() => onDelete(item.id)}>
                          Delete
                        </Button>
                      </View>
                    )}
                  />
                ))
              )}
              <Divider style={{ marginVertical: 8 }} />
              <List.Subheader>Recent</List.Subheader>
              {recent.length === 0 ? (
                <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
                  <Text>No recent transactions</Text>
                </View>
              ) : (
                recent.map((item) => (
                  <List.Item
                    key={item.id}
                    title={`${item.description || "No description"}`}
                    description={`${item.date} • ${item.category}`}
                    right={() => (
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Text style={{ marginRight: 12 }}>${item.amount.toFixed(2)}</Text>
                        <Button compact onPress={() => onEdit(item)}>
                          Edit
                        </Button>
                        <Button compact onPress={() => onDelete(item.id)}>
                          Delete
                        </Button>
                      </View>
                    )}
                  />
                ))
              )}
            </>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <List.Item
                  title={`${item.description || "No description"}`}
                  description={`${item.date} • ${item.category} • ${item.status}`}
                  right={() => (
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Text style={{ marginRight: 12 }}>${item.amount.toFixed(2)}</Text>
                      <Button compact onPress={() => onEdit(item)}>
                        Edit
                      </Button>
                      <Button compact onPress={() => onDelete(item.id)}>
                        Delete
                      </Button>
                    </View>
                  )}
                />
              )}
              ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: "#eee" }} />}
              ListEmptyComponent={() => (
                <View style={{ padding: 24, alignItems: "center" }}>
                  <Text>No transactions yet</Text>
                </View>
              )}
            />
          )}
          <FAB
            style={{ position: "absolute", right: 16, bottom: 16 }}
            icon="plus"
            onPress={() => setShowForm(true)}
          />
        </>
      )}
    </View>
  );
}
