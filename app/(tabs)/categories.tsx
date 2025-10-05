import { loadCategories, saveCategories } from "@/lib/storage";
import type { Category } from "@/lib/types";
import React from "react";
import { FlatList, View } from "react-native";
import {
  Button,
  Card,
  Dialog,
  Portal,
  SegmentedButtons,
  Switch,
  Text,
  TextInput,
} from "react-native-paper";

const DEFAULT_ICONS = ["💰", "🎯", "🛒", "⛽", "🏠", "📊", "💳", "🛡️", "📱", "✈️"];

export default function CategoriesScreen() {
  const [items, setItems] = React.useState<Category[]>([]);
  const [query, setQuery] = React.useState("");
  const [editing, setEditing] = React.useState<Category | null>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const loaded = await loadCategories();
      setItems(loaded);
    })();
  }, []);

  React.useEffect(() => {
    saveCategories(items);
  }, [items]);

  const filtered = items
    .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

  const openEdit = (cat?: Category) => {
    setEditing(
      cat ?? {
        id: Math.random().toString(36).slice(2),
        name: "",
        is_visible: true,
        color: "#666666",
        type: "expense",
        icon: "📁",
        order_index: (items[items.length - 1]?.order_index ?? 0) + 1,
        budget_enabled: true,
      }
    );
    setVisible(true);
  };

  const saveEdit = () => {
    if (!editing) return;
    setItems((prev) => {
      const next = prev.filter((c) => c.id !== editing.id);
      next.push(editing);
      return next;
    });
    setVisible(false);
  };

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text variant="titleLarge">Categories</Text>
      <View style={{ flexDirection: "row", gap: 8, marginVertical: 12 }}>
        <TextInput
          style={{ flex: 1 }}
          placeholder="Search categories..."
          value={query}
          onChangeText={setQuery}
        />
        <Button mode="contained" onPress={() => openEdit()}>
          Add
        </Button>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(c) => c.id}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 8 }}>
            <Card.Title
              title={`${item.icon ?? "📁"}  ${item.name}`}
              right={() => <Button onPress={() => openEdit(item)}>Edit</Button>}
            />
            <Card.Content>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
                <Text>Visible</Text>
                <Switch
                  value={item.is_visible}
                  onValueChange={(v) =>
                    setItems((prev) =>
                      prev.map((c) => (c.id === item.id ? { ...c, is_visible: v } : c))
                    )
                  }
                />
                <Text>Budget</Text>
                <Switch
                  value={item.budget_enabled ?? true}
                  onValueChange={(v) =>
                    setItems((prev) =>
                      prev.map((c) => (c.id === item.id ? { ...c, budget_enabled: v } : c))
                    )
                  }
                />
              </View>
            </Card.Content>
          </Card>
        )}
      />

      <Portal>
        <Dialog visible={visible} onDismiss={() => setVisible(false)}>
          <Dialog.Title>{editing?.id ? "Edit Category" : "Add Category"}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Name"
              value={editing?.name ?? ""}
              onChangeText={(t) => setEditing((e) => (e ? { ...e, name: t } : e))}
            />
            <SegmentedButtons
              value={editing?.type ?? "expense"}
              onValueChange={(v) =>
                setEditing((e) => (e ? { ...e, type: v as "income" | "expense" } : e))
              }
              buttons={[
                { value: "expense", label: "Expense" },
                { value: "income", label: "Income" },
              ]}
            />
            <TextInput
              label="Color"
              value={editing?.color ?? "#666666"}
              onChangeText={(t) => setEditing((e) => (e ? { ...e, color: t } : e))}
            />
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
              {DEFAULT_ICONS.map((ic) => (
                <Button
                  key={ic}
                  mode={editing?.icon === ic ? "contained" : "outlined"}
                  onPress={() => setEditing((e) => (e ? { ...e, icon: ic } : e))}
                >
                  {ic}
                </Button>
              ))}
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 16, marginTop: 8 }}>
              <Text>Hide from transactions</Text>
              <Switch
                value={!editing?.is_visible ? true : false}
                onValueChange={(v) => setEditing((e) => (e ? { ...e, is_visible: !v } : e))}
              />
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 16, marginTop: 8 }}>
              <Text>Enable budgeting</Text>
              <Switch
                value={editing?.budget_enabled ?? true}
                onValueChange={(v) => setEditing((e) => (e ? { ...e, budget_enabled: v } : e))}
              />
            </View>
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
