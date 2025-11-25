/**
 * Categories Screen
 *
 * Main screen for managing categories:
 * - Search categories
 * - View income/expense/saving categories
 * - Add/edit/delete categories
 * - Pull-to-refresh support
 */

import logger from "@/app/utils/logger";
import { useSnackbar } from "@/components/snackbar-provider";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { AppTheme } from "@/constants/AppTheme";
import { deleteCategory, saveCategory } from "@/lib/storage";
import type { Category } from "@/lib/types";
import * as Crypto from "expo-crypto";
import React from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { IconButton, Searchbar, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { CategoryForm, CategoryTypeSection } from "./components";
import { useCategoriesData } from "./hooks";

export default function CategoriesScreen() {
  const { showSnackbar } = useSnackbar();
  const {
    items,
    setItems,
    query,
    setQuery,
    refreshing,
    onRefresh,
    incomeCategories,
    expenseCategories,
    savingCategories,
  } = useCategoriesData();

  // Dialog states
  const [editing, setEditing] = React.useState<Category | null>(null);
  const [dialogVisible, setDialogVisible] = React.useState(false);
  const [confirmDialogVisible, setConfirmDialogVisible] = React.useState(false);
  const [categoryToDelete, setCategoryToDelete] = React.useState<string | null>(null);

  // Form states
  const [name, setName] = React.useState("");
  const [color, setColor] = React.useState("#2563EB");
  const [emoji, setEmoji] = React.useState("📁");
  const [isVisible, setIsVisible] = React.useState(true);
  const [budgetEnabled, setBudgetEnabled] = React.useState(true);
  const [selectedType, setSelectedType] = React.useState<"income" | "expense" | "saving">("expense");
  const [nameError, setNameError] = React.useState(false);

  // Log navigation
  React.useEffect(() => {
    logger.navigationAction("CategoriesScreen");
  }, []);

  const openEdit = (cat?: Category, defaultType?: "income" | "expense" | "saving") => {
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
      setSelectedType(defaultType || "expense");
    }
    setDialogVisible(true);
  };

  const saveEdit = async () => {
    if (!name.trim()) {
      setNameError(true);
      return false;
    }

    const category: Category = {
      id: editing?.id || Crypto.randomUUID(),
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
      isEdit: !!editing,
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
      return true;
    } else {
      logger.databaseError("Failed to save category", "save_category", { categoryId: category.id });
      // Check if it's a duplicate error
      const isDuplicate = !editing && items.some((c) => c.name === category.name && c.type === category.type);
      showSnackbar(isDuplicate ? "Category with this name and type already exists" : "Failed to save category");
      return false;
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

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
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
        <CategoryTypeSection
          title="Income Categories"
          type="income"
          categories={incomeCategories}
          onAdd={() => openEdit(undefined, "income")}
          onEdit={openEdit}
          onDelete={handleDelete}
        />

        {/* Expense Categories */}
        <CategoryTypeSection
          title="Expense Categories"
          type="expense"
          categories={expenseCategories}
          onAdd={() => openEdit(undefined, "expense")}
          onEdit={openEdit}
          onDelete={handleDelete}
        />

        {/* Saving Categories */}
        <CategoryTypeSection
          title="Saving Categories"
          type="saving"
          categories={savingCategories}
          onAdd={() => openEdit(undefined, "saving")}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      </ScrollView>

      {/* Add/Edit Form */}
      <CategoryForm
        visible={dialogVisible}
        editing={editing}
        name={name}
        setName={setName}
        color={color}
        setColor={setColor}
        emoji={emoji}
        setEmoji={setEmoji}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        budgetEnabled={budgetEnabled}
        setBudgetEnabled={setBudgetEnabled}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        nameError={nameError}
        setNameError={setNameError}
        onDismiss={() => {
          setDialogVisible(false);
          setNameError(false);
        }}
        onSave={saveEdit}
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
});
