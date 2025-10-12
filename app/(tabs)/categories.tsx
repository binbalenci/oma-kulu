import { ColorPicker } from "@/components/color-picker";
import { IconPicker } from "@/components/icon-picker";
import { useSnackbar } from "@/components/snackbar-provider";
import { loadCategories, saveCategory } from "@/lib/storage";
import type { Category } from "@/lib/types";
import React from "react";
import { FlatList, ScrollView, View } from "react-native";
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

export default function CategoriesScreen() {
  const { showSnackbar } = useSnackbar();
  const [items, setItems] = React.useState<Category[]>([]);
  const [query, setQuery] = React.useState("");
  const [editing, setEditing] = React.useState<Category | null>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const loadedCats = await loadCategories();
      setItems(loadedCats);
    })();
  }, []);

  const filtered = items
    .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

  const openEdit = (cat?: Category) => {
    setEditing(
      cat ?? {
        id: crypto.randomUUID(),
        name: "",
        is_visible: true,
        color: "#666666",
        type: "expense",
        icon: "📁",
        order_index: (items[items.length - 1]?.order_index ?? 0) + 1,
        budget_enabled: true,
        created_at: new Date().toISOString(),
      }
    );
    setVisible(true);
  };

  const saveEdit = async () => {
    if (!editing) return;

    const success = await saveCategory(editing);
    if (success) {
      setItems((prev) => {
        const next = prev.filter((c) => c.id !== editing.id);
        next.push(editing);
        return next;
      });
      showSnackbar(editing.created_at ? "Category updated!" : "Category added!");
      setVisible(false);
    } else {
      showSnackbar("Failed to save category");
    }
  };

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text variant="titleLarge">Categories</Text>
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
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
                  onValueChange={async (v) => {
                    const updated = { ...item, is_visible: v };
                    const success = await saveCategory(updated);
                    if (success) {
                      setItems((prev) => prev.map((c) => (c.id === item.id ? updated : c)));
                    }
                  }}
                />
                <Text>Budget</Text>
                <Switch
                  value={item.budget_enabled ?? true}
                  onValueChange={async (v) => {
                    const updated = { ...item, budget_enabled: v };
                    const success = await saveCategory(updated);
                    if (success) {
                      setItems((prev) => prev.map((c) => (c.id === item.id ? updated : c)));
                    }
                  }}
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
            <ScrollView style={{ maxHeight: 500 }}>
              <View style={{ gap: 16 }}>
                <View style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
                  <View style={{ width: 80 }}>
                    <IconPicker
                      selectedIcon={editing?.icon ?? "📁"}
                      onSelectIcon={(icon) => setEditing((e) => (e ? { ...e, icon } : e))}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <TextInput
                      label="Name"
                      value={editing?.name ?? ""}
                      onChangeText={(t) => setEditing((e) => (e ? { ...e, name: t } : e))}
                    />
                  </View>
                  <View style={{ width: 100 }}>
                    <ColorPicker
                      selectedColor={editing?.color ?? "#666666"}
                      onSelectColor={(color) => setEditing((e) => (e ? { ...e, color } : e))}
                    />
                  </View>
                </View>
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
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text>Visible in transactions</Text>
                  <Switch
                    value={editing?.is_visible ?? true}
                    onValueChange={(v) => setEditing((e) => (e ? { ...e, is_visible: v } : e))}
                  />
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text>Can be budgeted</Text>
                  <Switch
                    value={editing?.budget_enabled ?? true}
                    onValueChange={(v) => setEditing((e) => (e ? { ...e, budget_enabled: v } : e))}
                  />
                </View>
              </View>
            </ScrollView>
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
