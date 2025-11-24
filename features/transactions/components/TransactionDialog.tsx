import { Dialog as CustomDialog } from "@/components/ui/Dialog";
import { SimpleDropdown } from "@/components/ui/SimpleDropdown";
import { AppTheme } from "@/constants/AppTheme";
import type { Category } from "@/lib/types";
import Ionicons from "@react-native-vector-icons/ionicons";
import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Chip, Text, TextInput } from "react-native-paper";

interface TransactionDialogProps {
  visible: boolean;
  editing: boolean;
  amount: string;
  description: string;
  date: string;
  category: string;
  selectedType: "income" | "expense" | "saving";
  useSavingsCategory: string | null;
  categories: Category[];
  savingsBalances: Record<string, number>;
  categoryError: boolean;
  amountError: boolean;
  onDismiss: () => void;
  onSave: () => Promise<boolean>;
  onAmountChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onTypeChange: (type: "income" | "expense" | "saving") => void;
  onUseSavingsChange: (value: string | null) => void;
}

export function TransactionDialog({
  visible,
  editing,
  amount,
  description,
  date,
  category,
  selectedType,
  useSavingsCategory,
  categories,
  savingsBalances,
  categoryError,
  amountError,
  onDismiss,
  onSave,
  onAmountChange,
  onDescriptionChange,
  onDateChange,
  onCategoryChange,
  onTypeChange,
  onUseSavingsChange,
}: TransactionDialogProps) {
  const hasUnsavedChanges = !!(amount || description || category || useSavingsCategory);

  return (
    <CustomDialog
      visible={visible}
      onDismiss={onDismiss}
      title={`${editing ? "Edit" : "Add"} Transaction`}
      onSave={onSave}
      hasUnsavedChanges={hasUnsavedChanges}
    >
      <View style={styles.dialogContent}>
        {/* Type Selector */}
        <View style={styles.typeSelector}>
          <View style={styles.typeButtons}>
            <TouchableOpacity
              style={[styles.typeButton, selectedType === "expense" && styles.typeButtonSelected]}
              onPress={() => onTypeChange("expense")}
            >
              <Ionicons
                name="trending-down"
                size={20}
                color={selectedType === "expense" ? AppTheme.colors.textInverse : AppTheme.colors.error}
              />
              <Text style={[styles.typeButtonText, selectedType === "expense" && styles.typeButtonTextSelected]}>
                Expense
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeButton, selectedType === "income" && styles.typeButtonSelected]}
              onPress={() => onTypeChange("income")}
            >
              <Ionicons
                name="trending-up"
                size={20}
                color={selectedType === "income" ? AppTheme.colors.textInverse : AppTheme.colors.success}
              />
              <Text style={[styles.typeButtonText, selectedType === "income" && styles.typeButtonTextSelected]}>
                Income
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <SimpleDropdown
          label=""
          value={category}
          onValueChange={onCategoryChange}
          data={categories
            .filter((c) => c.is_visible && c.type === selectedType)
            .map((cat) => ({ id: cat.name, name: cat.name, emoji: cat.emoji, color: cat.color }))}
          placeholder="Select category *"
          style={[styles.input, { zIndex: 10000 }]}
          error={categoryError}
        />

        {/* Use Savings dropdown - only show for expense type */}
        {(() => {
          const isExpenseType = selectedType === "expense";
          const availableSavings = Object.entries(savingsBalances)
            .filter(([_, balance]) => balance > 0)
            .map(([catName, balance]) => ({
              id: catName,
              name: catName,
              emoji: categories.find((c) => c.name === catName)?.emoji,
              color: categories.find((c) => c.name === catName)?.color,
              balance: balance,
            }));

          if (isExpenseType && availableSavings.length > 0) {
            return (
              <View style={styles.savingsDropdownWrapper}>
                <SimpleDropdown
                  label="Use Savings (optional)"
                  value={useSavingsCategory || ""}
                  onValueChange={(value) => onUseSavingsChange(value || null)}
                  data={[{ id: "", name: "", emoji: undefined, color: undefined }, ...availableSavings]}
                  placeholder="None"
                  style={[styles.input, { zIndex: 9000 }]}
                />
                {useSavingsCategory && savingsBalances[useSavingsCategory] && (
                  <Text style={styles.savingsBalanceHint}>
                    Available: €{savingsBalances[useSavingsCategory].toFixed(1)}
                  </Text>
                )}
              </View>
            );
          }
          return null;
        })()}

        <TextInput
          label={
            <Text style={{ color: amountError ? "red" : AppTheme.colors.textSecondary }}>
              Amount <Text style={{ color: "red" }}>*</Text>
            </Text>
          }
          value={amount}
          onChangeText={onAmountChange}
          keyboardType="decimal-pad"
          placeholder="0.00"
          style={styles.input}
          left={<TextInput.Affix text="€" />}
        />
        <TextInput
          label="Description"
          value={description}
          onChangeText={onDescriptionChange}
          placeholder="e.g., Grocery shopping"
          style={styles.input}
        />
        <TextInput
          label="Date (YYYY-MM-DD)"
          value={date}
          onChangeText={onDateChange}
          placeholder="2025-01-15"
          style={styles.input}
        />

        {categories.length > 0 && (
          <View style={styles.categorySelector}>
            <Text variant="labelMedium" style={styles.categoryLabel}>
              Quick Select Category:
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryChips}>
              {categories
                .filter((c) => c.is_visible && c.type === selectedType)
                .map((cat) => (
                  <Chip
                    key={cat.id}
                    mode={category === cat.name ? "flat" : "outlined"}
                    onPress={() => onCategoryChange(cat.name)}
                    style={styles.categoryChip}
                  >
                    {cat.name}
                  </Chip>
                ))}
            </ScrollView>
          </View>
        )}
      </View>
    </CustomDialog>
  );
}

const styles = StyleSheet.create({
  dialogContent: {
    gap: AppTheme.spacing.lg,
  },
  input: {
    backgroundColor: AppTheme.colors.background,
  },
  typeSelector: {
    marginBottom: AppTheme.spacing.sm,
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
  savingsDropdownWrapper: {
    marginBottom: AppTheme.spacing.sm,
  },
  savingsBalanceHint: {
    fontSize: 12,
    color: AppTheme.colors.textSecondary,
    marginTop: 4,
    marginLeft: 4,
  },
  categorySelector: {
    marginTop: AppTheme.spacing.md,
  },
  categoryLabel: {
    marginBottom: AppTheme.spacing.sm,
    color: AppTheme.colors.textSecondary,
  },
  categoryChips: {
    marginBottom: AppTheme.spacing.sm,
  },
  categoryChip: {
    marginRight: AppTheme.spacing.sm,
  },
});
