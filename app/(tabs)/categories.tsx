import { useSnackbar } from "@/components/snackbar-provider";
import { ColorPickerDialog } from "@/components/ui/ColorPickerDialog";
import { Dialog as CustomDialog } from "@/components/ui/Dialog";
import { IconPickerDialog } from "@/components/ui/IconPickerDialog";
import { AppTheme } from "@/constants/AppTheme";
import { deleteCategory, loadCategories, saveCategory } from "@/lib/storage";
import type { Category } from "@/lib/types";
import Ionicons from "@react-native-vector-icons/ionicons";
import React from "react";
import { FlatList, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import {
  Button,
  Card,
  Chip,
  IconButton,
  Searchbar,
  Switch,
  Text,
  TextInput,
} from "react-native-paper";

export default function CategoriesScreen() {
  const { showSnackbar } = useSnackbar();
  const [items, setItems] = React.useState<Category[]>([]);
  const [query, setQuery] = React.useState("");
  const [editing, setEditing] = React.useState<Category | null>(null);
  const [dialogVisible, setDialogVisible] = React.useState(false);
  const [colorPickerVisible, setColorPickerVisible] = React.useState(false);
  const [iconPickerVisible, setIconPickerVisible] = React.useState(false);
  const [selectedType, setSelectedType] = React.useState<"income" | "expense">("expense");

  // Form states
  const [name, setName] = React.useState("");
  const [color, setColor] = React.useState("#2563EB");
  const [icon, setIcon] = React.useState("category");
  const [iconFamily, setIconFamily] = React.useState<"MaterialIcons" | "Ionicons" | "Feather">(
    "MaterialIcons"
  );
  const [isVisible, setIsVisible] = React.useState(true);
  const [budgetEnabled, setBudgetEnabled] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      const loadedCats = await loadCategories();
      setItems(loadedCats);
    })();
  }, []);

  const incomeCategories = items
    .filter((c) => c.type === "income")
    .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

  const expenseCategories = items
    .filter((c) => c.type === "expense")
    .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

  const openEdit = (cat?: Category) => {
    if (cat) {
      setEditing(cat);
      setName(cat.name);
      setColor(cat.color || "#2563EB");
      setIcon(cat.icon ? cat.icon : "category");
      setIconFamily((cat as any).icon_family || "MaterialIcons");
      setIsVisible(cat.is_visible);
      setBudgetEnabled(cat.budget_enabled ?? true);
      setSelectedType(cat.type);
    } else {
      setEditing(null);
      setName("");
      setColor("#2563EB");
      setIcon("category");
      setIconFamily("MaterialIcons");
      setIsVisible(true);
      setBudgetEnabled(true);
      setSelectedType("expense");
    }
    setDialogVisible(true);
  };

  const saveEdit = async () => {
    if (!name.trim()) {
      showSnackbar("Please enter a category name");
      return;
    }

    const category: Category = {
      id: editing?.id || crypto.randomUUID(),
      name: name.trim(),
      is_visible: isVisible,
      color,
      type: selectedType,
      icon,
      order_index: editing?.order_index ?? (items[items.length - 1]?.order_index ?? 0) + 1,
      budget_enabled: budgetEnabled,
      created_at: editing?.created_at || new Date().toISOString(),
    };

    const success = await saveCategory(category);
    if (success) {
      setItems((prev) => {
        const next = prev.filter((c) => c.id !== category.id);
        next.push(category);
        return next;
      });
      showSnackbar(editing ? "Category updated!" : "Category added!");
      setDialogVisible(false);
    } else {
      showSnackbar("Failed to save category");
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteCategory(id);
    if (success) {
      setItems((prev) => prev.filter((c) => c.id !== id));
      showSnackbar("Category deleted!");
    } else {
      showSnackbar("Failed to delete category");
    }
  };

  const toggleVisibility = async (category: Category) => {
    const updated = { ...category, is_visible: !category.is_visible };
    const success = await saveCategory(updated);
    if (success) {
      setItems((prev) => prev.map((c) => (c.id === category.id ? updated : c)));
    }
  };

  const toggleBudgetEnabled = async (category: Category) => {
    const updated = { ...category, budget_enabled: !category.budget_enabled };
    const success = await saveCategory(updated);
    if (success) {
      setItems((prev) => prev.map((c) => (c.id === category.id ? updated : c)));
    }
  };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <Card style={styles.categoryCard}>
      <Card.Content style={styles.categoryContent}>
        <View style={styles.categoryLeft}>
          <View style={[styles.categoryColorBar, { backgroundColor: item.color }]} />
          <View style={styles.categoryInfo}>
            <View style={styles.categoryHeader}>
              <Text variant="titleMedium" style={styles.categoryName}>
                {item.name}
              </Text>
              <View style={styles.categoryActions}>
                <IconButton icon="pencil" size={20} onPress={() => openEdit(item)} />
                <IconButton icon="delete" size={20} onPress={() => handleDelete(item.id)} />
              </View>
            </View>
            <View style={styles.categorySwitches}>
              <View style={styles.switchRow}>
                <Text variant="bodySmall" style={styles.switchLabel}>
                  Visible
                </Text>
                <Switch
                  value={item.is_visible}
                  onValueChange={() => toggleVisibility(item)}
                  trackColor={{ false: AppTheme.colors.border, true: AppTheme.colors.primary }}
                  thumbColor={
                    item.is_visible ? AppTheme.colors.textInverse : AppTheme.colors.textMuted
                  }
                />
              </View>
              <View style={styles.switchRow}>
                <Text variant="bodySmall" style={styles.switchLabel}>
                  Budget Enabled
                </Text>
                <Switch
                  value={item.budget_enabled ?? true}
                  onValueChange={() => toggleBudgetEnabled(item)}
                  trackColor={{ false: AppTheme.colors.border, true: AppTheme.colors.primary }}
                  thumbColor={
                    item.budget_enabled ?? true
                      ? AppTheme.colors.textInverse
                      : AppTheme.colors.textMuted
                  }
                />
              </View>
            </View>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderCategorySection = (
    title: string,
    categories: Category[],
    type: "income" | "expense"
  ) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitle}>
          <Ionicons
            name={type === "income" ? "trending-up" : "trending-down"}
            size={24}
            color={type === "income" ? AppTheme.colors.success : AppTheme.colors.error}
          />
          <Text variant="headlineSmall" style={styles.sectionTitleText}>
            {title}
          </Text>
          <Chip mode="flat" compact style={styles.countChip}>
            {categories.length}
          </Chip>
        </View>
        <Button
          mode="contained"
          onPress={() => {
            setSelectedType(type);
            openEdit();
          }}
          style={styles.addButton}
          icon="plus"
        >
          Add
        </Button>
      </View>

      {categories.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Card.Content style={styles.emptyContent}>
            <Ionicons
              name={type === "income" ? "trending-up-outline" : "trending-down-outline"}
              size={48}
              color={AppTheme.colors.textMuted}
            />
            <Text variant="bodyLarge" style={styles.emptyText}>
              No {type} categories yet. Tap + to add one.
            </Text>
          </Card.Content>
        </Card>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={renderCategoryItem}
          scrollEnabled={false}
          style={styles.categoryList}
        />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerTitle}>
          Categories
        </Text>
        <View style={styles.headerActions}>
          <IconButton icon="bell-outline" size={24} />
          <IconButton icon="account-circle-outline" size={24} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View style={styles.searchSection}>
          <Searchbar
            placeholder="Search categories..."
            value={query}
            onChangeText={setQuery}
            style={styles.searchBar}
            icon="magnify"
          />
        </View>

        {/* Income Categories */}
        {renderCategorySection("Income Categories", incomeCategories, "income")}

        {/* Expense Categories */}
        {renderCategorySection("Expense Categories", expenseCategories, "expense")}
      </ScrollView>

      {/* Add/Edit Dialog */}
      <CustomDialog
        visible={dialogVisible}
        onDismiss={() => setDialogVisible(false)}
        title={`${editing ? "Edit" : "Add"} Category`}
        onSave={saveEdit}
        hasUnsavedChanges={!!(name || color || icon)}
      >
        <View style={styles.dialogContent}>
          <TextInput
            label="Category Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g., Groceries"
            style={styles.input}
          />

          <View style={styles.typeSelector}>
            <Text variant="labelMedium" style={styles.typeLabel}>
              Type
            </Text>
            <View style={styles.typeButtons}>
              <TouchableOpacity
                style={[styles.typeButton, selectedType === "expense" && styles.typeButtonSelected]}
                onPress={() => setSelectedType("expense")}
              >
                <Ionicons
                  name="trending-down"
                  size={20}
                  color={
                    selectedType === "expense" ? AppTheme.colors.textInverse : AppTheme.colors.error
                  }
                />
                <Text
                  style={[
                    styles.typeButtonText,
                    selectedType === "expense" && styles.typeButtonTextSelected,
                  ]}
                >
                  Expense
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, selectedType === "income" && styles.typeButtonSelected]}
                onPress={() => setSelectedType("income")}
              >
                <Ionicons
                  name="trending-up"
                  size={20}
                  color={
                    selectedType === "income"
                      ? AppTheme.colors.textInverse
                      : AppTheme.colors.success
                  }
                />
                <Text
                  style={[
                    styles.typeButtonText,
                    selectedType === "income" && styles.typeButtonTextSelected,
                  ]}
                >
                  Income
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.pickerRow}>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setIconPickerVisible(true)}
            >
              <Text variant="labelMedium" style={styles.pickerLabel}>
                Icon
              </Text>
              <View style={styles.pickerValue}>
                <Text variant="bodyLarge">{icon}</Text>
                <Ionicons name="chevron-down" size={16} color={AppTheme.colors.textSecondary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setColorPickerVisible(true)}
            >
              <Text variant="labelMedium" style={styles.pickerLabel}>
                Color
              </Text>
              <View style={styles.pickerValue}>
                <View style={[styles.colorPreview, { backgroundColor: color }]} />
                <Ionicons name="chevron-down" size={16} color={AppTheme.colors.textSecondary} />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.switchSection}>
            <View style={styles.switchRow}>
              <Text variant="bodyMedium" style={styles.switchLabel}>
                Visible in transactions
              </Text>
              <Switch
                value={isVisible}
                onValueChange={setIsVisible}
                trackColor={{ false: AppTheme.colors.border, true: AppTheme.colors.primary }}
                thumbColor={isVisible ? AppTheme.colors.textInverse : AppTheme.colors.textMuted}
              />
            </View>
            <View style={styles.switchRow}>
              <Text variant="bodyMedium" style={styles.switchLabel}>
                Can be budgeted
              </Text>
              <Switch
                value={budgetEnabled}
                onValueChange={setBudgetEnabled}
                trackColor={{ false: AppTheme.colors.border, true: AppTheme.colors.primary }}
                thumbColor={budgetEnabled ? AppTheme.colors.textInverse : AppTheme.colors.textMuted}
              />
            </View>
          </View>
        </View>
      </CustomDialog>

      {/* Color Picker Dialog */}
      <ColorPickerDialog
        visible={colorPickerVisible}
        onDismiss={() => setColorPickerVisible(false)}
        onSelectColor={setColor}
        selectedColor={color}
      />

      {/* Icon Picker Dialog */}
      <IconPickerDialog
        visible={iconPickerVisible}
        onDismiss={() => setIconPickerVisible(false)}
        onSelectIcon={(iconData) => {
          setIcon(iconData.name);
          setIconFamily(iconData.family);
        }}
        selectedIcon={{ name: icon, family: iconFamily }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: AppTheme.spacing.lg,
    paddingVertical: AppTheme.spacing.lg,
    backgroundColor: AppTheme.colors.card,
    ...AppTheme.shadows.sm,
  },
  headerTitle: {
    fontWeight: AppTheme.typography.fontWeight.semibold,
    color: AppTheme.colors.textPrimary,
  },
  headerActions: {
    flexDirection: "row",
    gap: AppTheme.spacing.xs,
  },
  content: {
    flex: 1,
    padding: AppTheme.spacing.lg,
  },
  searchSection: {
    marginBottom: AppTheme.spacing.xl,
  },
  searchBar: {
    marginBottom: AppTheme.spacing.sm,
  },
  section: {
    marginBottom: AppTheme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: AppTheme.spacing.lg,
  },
  sectionTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: AppTheme.spacing.sm,
  },
  sectionTitleText: {
    fontWeight: AppTheme.typography.fontWeight.semibold,
    color: AppTheme.colors.textPrimary,
  },
  countChip: {
    marginLeft: AppTheme.spacing.sm,
    backgroundColor: AppTheme.colors.primary,
  },
  addButton: {
    backgroundColor: AppTheme.colors.primary,
  },
  emptyCard: {
    ...AppTheme.shadows.sm,
  },
  emptyContent: {
    alignItems: "center",
    paddingVertical: AppTheme.spacing.xl,
  },
  emptyText: {
    marginTop: AppTheme.spacing.md,
    textAlign: "center",
    color: AppTheme.colors.textSecondary,
  },
  categoryList: {
    gap: AppTheme.spacing.sm,
  },
  categoryCard: {
    ...AppTheme.shadows.sm,
  },
  categoryContent: {
    paddingVertical: AppTheme.spacing.sm,
  },
  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryColorBar: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: AppTheme.spacing.md,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: AppTheme.spacing.sm,
  },
  categoryName: {
    fontWeight: AppTheme.typography.fontWeight.semibold,
    color: AppTheme.colors.textPrimary,
  },
  categoryActions: {
    flexDirection: "row",
  },
  categorySwitches: {
    flexDirection: "row",
    gap: AppTheme.spacing.xl,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: AppTheme.spacing.sm,
  },
  switchLabel: {
    color: AppTheme.colors.textSecondary,
  },
  dialogContent: {
    gap: AppTheme.spacing.lg,
  },
  input: {
    backgroundColor: AppTheme.colors.background,
  },
  typeSelector: {
    marginBottom: AppTheme.spacing.md,
  },
  typeLabel: {
    marginBottom: AppTheme.spacing.sm,
    color: AppTheme.colors.textSecondary,
  },
  typeButtons: {
    flexDirection: "row",
    gap: AppTheme.spacing.sm,
  },
  typeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: AppTheme.spacing.md,
    paddingHorizontal: AppTheme.spacing.lg,
    borderRadius: AppTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    gap: AppTheme.spacing.sm,
  },
  typeButtonSelected: {
    backgroundColor: AppTheme.colors.primary,
    borderColor: AppTheme.colors.primary,
  },
  typeButtonText: {
    fontWeight: AppTheme.typography.fontWeight.medium,
    color: AppTheme.colors.textPrimary,
  },
  typeButtonTextSelected: {
    color: AppTheme.colors.textInverse,
  },
  pickerRow: {
    flexDirection: "row",
    gap: AppTheme.spacing.md,
  },
  pickerButton: {
    flex: 1,
    paddingVertical: AppTheme.spacing.md,
    paddingHorizontal: AppTheme.spacing.lg,
    borderRadius: AppTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    backgroundColor: AppTheme.colors.background,
  },
  pickerLabel: {
    marginBottom: AppTheme.spacing.xs,
    color: AppTheme.colors.textSecondary,
  },
  pickerValue: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  colorPreview: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  switchSection: {
    gap: AppTheme.spacing.md,
  },
});
