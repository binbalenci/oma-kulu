import { loadCategories, saveCategories } from "@/src/lib/storage";
import type { Category } from "@/src/lib/types";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, List, Switch, Text, TextInput } from "react-native-paper";

const PRESET: Category[] = [
  { id: "income", name: "Income", type: "income", is_visible: true },
  { id: "investing", name: "Investing", type: "expense", is_visible: true },
  { id: "loan_credit", name: "Loan+Credit", type: "expense", is_visible: true },
  { id: "vietnam", name: "Vietnam", type: "expense", is_visible: true },
  { id: "apartment", name: "Apartment", type: "expense", is_visible: true },
  { id: "insurance", name: "Insurance", type: "expense", is_visible: true },
  { id: "groceries_fuel", name: "Groceries+Fuel", type: "expense", is_visible: true },
  { id: "shopping", name: "Shopping", type: "expense", is_visible: true },
  { id: "subscriptions", name: "Subscriptions", type: "expense", is_visible: true },
  { id: "incurred", name: "Incurred", type: "expense", is_visible: true },
];

export default function CategoriesModal() {
  const [categories, setCategories] = React.useState<Category[]>(PRESET);
  React.useEffect(() => {
    (async () => {
      const existing = await loadCategories();
      if (existing.length) setCategories(existing);
      else await saveCategories(PRESET);
    })();
  }, []);

  React.useEffect(() => {
    saveCategories(categories);
  }, [categories]);
  const [newName, setNewName] = React.useState("");

  const toggle = (id: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_visible: !c.is_visible } : c))
    );
  };

  const add = () => {
    if (!newName.trim()) return;
    setCategories((prev) => [
      {
        id: newName.toLowerCase().replace(/\s+/g, "_"),
        name: newName.trim(),
        type: "expense", // Default to expense type
        is_visible: true,
      },
      ...prev,
    ]);
    setNewName("");
  };

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={{ marginBottom: 12 }}>
        Categories
      </Text>
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
        <TextInput
          style={{ flex: 1 }}
          placeholder="Add category"
          value={newName}
          onChangeText={setNewName}
        />
        <Button mode="contained" onPress={add}>
          Add
        </Button>
      </View>
      {categories.map((c) => (
        <List.Item
          key={c.id}
          title={c.name}
          right={() => <Switch value={c.is_visible} onValueChange={() => toggle(c.id)} />}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
