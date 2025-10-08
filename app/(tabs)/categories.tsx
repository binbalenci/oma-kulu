import {
  loadCategories,
  loadSettings,
  loadTemplates,
  saveCategories,
  saveSettings,
  saveTemplates,
} from "@/lib/storage";
import type { AppSettings, Category, RecurringTemplate } from "@/lib/types";
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
  const [tab, setTab] = React.useState<"categories" | "templates" | "settings">("categories");

  const [templates, setTemplates] = React.useState<RecurringTemplate[]>([]);
  const [editingTemplate, setEditingTemplate] = React.useState<RecurringTemplate | null>(null);
  const [templateVisible, setTemplateVisible] = React.useState(false);

  const [settings, setSettings] = React.useState<AppSettings>({});

  React.useEffect(() => {
    (async () => {
      const [loadedCats, loadedTemps, loadedSettings] = await Promise.all([
        loadCategories(),
        loadTemplates(),
        loadSettings(),
      ]);
      setItems(loadedCats);
      setTemplates(loadedTemps);
      setSettings(loadedSettings);
    })();
  }, []);

  React.useEffect(() => {
    saveCategories(items);
  }, [items]);
  React.useEffect(() => {
    saveTemplates(templates);
  }, [templates]);
  React.useEffect(() => {
    saveSettings(settings);
  }, [settings]);

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
      <Text variant="titleLarge">Categories & Settings</Text>
      <SegmentedButtons
        style={{ marginVertical: 12 }}
        value={tab}
        onValueChange={(v) => setTab(v as any)}
        buttons={[
          { value: "categories", label: "Categories" },
          { value: "templates", label: "Templates" },
          { value: "settings", label: "Settings" },
        ]}
      />

      {tab === "categories" && (
        <>
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
        </>
      )}

      {tab === "templates" && (
        <>
          <View style={{ flexDirection: "row", justifyContent: "flex-end", marginBottom: 12 }}>
            <Button
              mode="contained"
              onPress={() => {
                setEditingTemplate({
                  id: Math.random().toString(36).slice(2),
                  name: "",
                  type: "expense",
                  category: "",
                  typical_amount: 0,
                  enabled: true,
                });
                setTemplateVisible(true);
              }}
            >
              New Template
            </Button>
          </View>
          <FlatList
            data={templates}
            keyExtractor={(t) => t.id}
            renderItem={({ item }) => (
              <Card style={{ marginBottom: 8 }}>
                <Card.Title
                  title={item.name}
                  subtitle={`${item.type} • ${item.category}`}
                  right={() => (
                    <Button
                      onPress={() => {
                        setEditingTemplate(item);
                        setTemplateVisible(true);
                      }}
                    >
                      Edit
                    </Button>
                  )}
                />
                <Card.Content>
                  <Text>Typical Amount: ${item.typical_amount.toFixed(2)}</Text>
                </Card.Content>
              </Card>
            )}
          />
          <Portal>
            <Dialog visible={templateVisible} onDismiss={() => setTemplateVisible(false)}>
              <Dialog.Title>{editingTemplate?.id ? "Edit Template" : "New Template"}</Dialog.Title>
              <Dialog.Content>
                <TextInput
                  label="Name"
                  value={editingTemplate?.name ?? ""}
                  onChangeText={(t) => setEditingTemplate((e) => (e ? { ...e, name: t } : e))}
                />
                <SegmentedButtons
                  value={editingTemplate?.type ?? "expense"}
                  onValueChange={(v) =>
                    setEditingTemplate((e) => (e ? { ...e, type: v as "income" | "expense" } : e))
                  }
                  buttons={[
                    { value: "income", label: "Income" },
                    { value: "expense", label: "Expense" },
                  ]}
                />
                <TextInput
                  label="Category"
                  value={editingTemplate?.category ?? ""}
                  onChangeText={(t) => setEditingTemplate((e) => (e ? { ...e, category: t } : e))}
                />
                <TextInput
                  label="Typical Amount"
                  value={editingTemplate ? String(editingTemplate.typical_amount) : ""}
                  onChangeText={(t) =>
                    setEditingTemplate((e) =>
                      e ? { ...e, typical_amount: parseFloat(t || "0") } : e
                    )
                  }
                  keyboardType="decimal-pad"
                />
                <View style={{ flexDirection: "row", alignItems: "center", gap: 16, marginTop: 8 }}>
                  <Text>Enabled</Text>
                  <Switch
                    value={editingTemplate?.enabled ?? true}
                    onValueChange={(v) => setEditingTemplate((e) => (e ? { ...e, enabled: v } : e))}
                  />
                </View>
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={() => setTemplateVisible(false)}>Cancel</Button>
                <Button
                  onPress={() => {
                    if (!editingTemplate) return;
                    setTemplates((prev) => {
                      const next = prev.filter((t) => t.id !== editingTemplate.id);
                      next.push(editingTemplate);
                      return next;
                    });
                    setTemplateVisible(false);
                  }}
                >
                  Save
                </Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
        </>
      )}

      {tab === "settings" && (
        <>
          <Card>
            <Card.Title title="App Settings" />
            <Card.Content>
              <TextInput
                label="Starting Cash Balance"
                value={String(settings.starting_balance ?? 0)}
                onChangeText={(t) =>
                  setSettings((s) => ({ ...s, starting_balance: parseFloat(t || "0") }))
                }
                keyboardType="decimal-pad"
              />
            </Card.Content>
          </Card>
        </>
      )}
    </View>
  );
}
