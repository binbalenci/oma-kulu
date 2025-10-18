import logger from "@/app/utils/logger";
import { useSnackbar } from "@/components/snackbar-provider";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Dialog as CustomDialog } from "@/components/ui/Dialog";
import { EmojiPickerDialog } from "@/components/ui/EmojiPickerDialog";
import { IOSColorPicker } from "@/components/ui/IOSColorPicker";
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
import { SafeAreaView } from "react-native-safe-area-context";

export default function CategoriesScreen() {
  const { showSnackbar } = useSnackbar();
  const [items, setItems] = React.useState<Category[]>([]);
  const [query, setQuery] = React.useState("");
  const [editing, setEditing] = React.useState<Category | null>(null);
  const [dialogVisible, setDialogVisible] = React.useState(false);
  const [colorPickerVisible, setColorPickerVisible] = React.useState(false);

  // Log navigation
  React.useEffect(() => {
    logger.navigationAction("CategoriesScreen");
  }, []);
  const [emojiPickerVisible, setEmojiPickerVisible] = React.useState(false);
  const [selectedType, setSelectedType] = React.useState<"income" | "expense">("expense");

  // Confirmation dialog states
  const [confirmDialogVisible, setConfirmDialogVisible] = React.useState(false);
  const [categoryToDelete, setCategoryToDelete] = React.useState<string | null>(null);

  // Form states
  const [name, setName] = React.useState("");
  const [color, setColor] = React.useState("#2563EB");
  const [emoji, setEmoji] = React.useState("📁");
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
      setEmoji(cat.emoji || "📁");
      setIsVisible(cat.is_visible);
      setBudgetEnabled(cat.budget_enabled ?? true);
      setSelectedType(cat.type);
    } else {
      setEditing(null);
      setName("");
      setColor("#2563EB");
      setEmoji("📁");
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
      emoji,
      order_index: editing?.order_index ?? (items[items.length - 1]?.order_index ?? 0) + 1,
      budget_enabled: budgetEnabled,
      created_at: editing?.created_at || new Date().toISOString(),
    };

    logger.userAction("save_category", { 
      categoryId: category.id, 
      categoryName: category.name,
      isEdit: !!editing 
    });
    
    const success = await saveCategory(category);
    if (success) {
      setItems((prev) => {
        const next = prev.filter((c) => c.id !== category.id);
        next.push(category);
        return next;
      });
      logger.databaseSuccess("save_category", { categoryId: category.id });
      showSnackbar(editing ? "Category updated!" : "Category added!");
      setDialogVisible(false);
    } else {
      logger.databaseError("Failed to save category", "save_category", { categoryId: category.id });
      showSnackbar("Failed to save category");
    }
  };

  const handleDelete = (id: string) => {
    logger.userAction("initiate_delete_category", { categoryId: id });
    setCategoryToDelete(id);
    setConfirmDialogVisible(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    logger.userAction("confirm_delete_category", { categoryId: categoryToDelete });
    const success = await deleteCategory(categoryToDelete);
    if (success) {
      setItems((prev) => prev.filter((c) => c.id !== categoryToDelete));
      logger.databaseSuccess("delete_category", { categoryId: categoryToDelete });
      showSnackbar("Category deleted!");
    } else {
      logger.databaseError("Failed to delete category", "delete_category", { categoryId: categoryToDelete });
      showSnackbar("Failed to delete category");
    }
    setCategoryToDelete(null);
  };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <Card style={styles.categoryCard}>
      <Card.Content style={styles.categoryContent}>
        <View style={styles.categoryLeft}>
          <View style={[styles.categoryColorBar, { backgroundColor: item.color }]} />
          {item.emoji && <Text style={styles.categoryEmoji}>{item.emoji}</Text>}
          <View style={styles.categoryInfo}>
            <View style={styles.categoryHeader}>
              <View style={styles.categoryInfo}>
                <Text variant="titleMedium" style={styles.categoryName}>
                  {item.name}
                </Text>
                <View style={styles.statusBadges}>
                  <Text variant="labelSmall" style={styles.statusText}>
                    {item.is_visible ? "Visible" : "Hidden"}
                  </Text>
                  <Text variant="labelSmall" style={styles.statusText}>
                    {item.budget_enabled ?? true ? "Budget" : "No Budget"}
                  </Text>
                </View>
              </View>
              <View style={styles.categoryActions}>
                <IconButton icon="pencil" size={20} onPress={() => openEdit(item)} />
                <IconButton icon="delete" size={20} onPress={() => handleDelete(item.id)} />
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
          <Chip
            mode="flat"
            compact
            style={[styles.countChip, { backgroundColor: AppTheme.colors.accent }]}
            textStyle={{ color: AppTheme.colors.textInverse }}
          >
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
          ItemSeparatorComponent={() => <View style={styles.categorySeparator} />}
        />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
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
        hasUnsavedChanges={!!(name || color || emoji)}
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
              onPress={() => {
                // Close add dialog and open emoji picker immediately
                setDialogVisible(false);
                setEmojiPickerVisible(true);
              }}
            >
              <Text variant="labelMedium" style={styles.pickerLabel}>
                Emoji
              </Text>
              <View style={styles.pickerValue}>
                <Text variant="bodyLarge" style={styles.emojiPreview}>
                  {emoji}
                </Text>
                <Ionicons name="chevron-down" size={16} color={AppTheme.colors.textSecondary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => {
                // Temporarily close add dialog to avoid modal conflicts
                setDialogVisible(false);
                setTimeout(() => {
                  setColorPickerVisible(true);
                }, 100);
              }}
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
                trackColor={{ false: AppTheme.colors.border, true: AppTheme.colors.toggle }}
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
                trackColor={{ false: AppTheme.colors.border, true: AppTheme.colors.toggle }}
                thumbColor={budgetEnabled ? AppTheme.colors.textInverse : AppTheme.colors.textMuted}
              />
            </View>
          </View>
        </View>
      </CustomDialog>

      {/* Color Picker Dialog */}
      <IOSColorPicker
        visible={colorPickerVisible}
        onDismiss={() => {
          setColorPickerVisible(false);
          // Reopen the add dialog after color picker closes
          setTimeout(() => {
            setDialogVisible(true);
          }, 50);
        }}
        onSelectColor={setColor}
        selectedColor={color}
      />

      {/* Emoji Picker Dialog */}
      <EmojiPickerDialog
        visible={emojiPickerVisible}
        onDismiss={() => {
          setEmojiPickerVisible(false);
          // Reopen the add dialog after emoji picker closes
          setDialogVisible(true);
        }}
        onSelectEmoji={setEmoji}
        selectedEmoji={emoji}
      />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        visible={confirmDialogVisible}
        onDismiss={() => setConfirmDialogVisible(false)}
        onConfirm={confirmDelete}
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </SafeAreaView>
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
  categorySeparator: {
    height: AppTheme.spacing.md,
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
  categoryEmoji: {
    fontSize: 20,
    lineHeight: 24, // Add line height to prevent clipping
    marginRight: AppTheme.spacing.sm,
    paddingTop: 1, // Small padding for iOS text rendering
    textAlignVertical: 'center', // Center vertically on Android
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
    gap: AppTheme.spacing.xs,
  },
  categoryStatus: {
    marginTop: AppTheme.spacing.sm,
  },
  statusBadges: {
    flexDirection: "row",
    gap: AppTheme.spacing.sm,
    marginTop: AppTheme.spacing.xs,
  },
  statusText: {
    color: AppTheme.colors.textMuted,
    fontWeight: AppTheme.typography.fontWeight.medium,
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
  emojiPreview: {
    fontSize: 24,
    lineHeight: 28, // Add line height to prevent clipping
    paddingTop: 2, // Small padding to account for iOS text rendering
    textAlignVertical: 'center', // Center vertically on Android
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
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: AppTheme.spacing.sm,
  },
  switchLabel: {
    color: AppTheme.colors.textSecondary,
  },
});
