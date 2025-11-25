/**
 * CategoryForm Component
 *
 * Form dialog for adding/editing categories with:
 * - Name input with validation
 * - Type selector (income/expense/saving)
 * - Emoji and color pickers
 * - Visibility and budget toggles
 */

import { AppTheme } from "@/app/constants/AppTheme";
import { Dialog as CustomDialog } from "@/app/components/ui/Dialog";
import { EmojiPickerDialog } from "@/app/components/ui/EmojiPickerDialog";
import { IOSColorPicker } from "@/app/components/ui/IOSColorPicker";
import type { Category } from "@/app/lib/types";
import Ionicons from "@react-native-vector-icons/ionicons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Switch, Text, TextInput } from "react-native-paper";

interface CategoryFormProps {
  visible: boolean;
  editing: Category | null;
  name: string;
  setName: (name: string) => void;
  color: string;
  setColor: (color: string) => void;
  emoji: string;
  setEmoji: (emoji: string) => void;
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
  budgetEnabled: boolean;
  setBudgetEnabled: (enabled: boolean) => void;
  selectedType: "income" | "expense" | "saving";
  setSelectedType: (type: "income" | "expense" | "saving") => void;
  nameError: boolean;
  setNameError: (error: boolean) => void;
  onDismiss: () => void;
  onSave: () => Promise<boolean>;
}

export function CategoryForm({
  visible,
  editing,
  name,
  setName,
  color,
  setColor,
  emoji,
  setEmoji,
  isVisible,
  setIsVisible,
  budgetEnabled,
  setBudgetEnabled,
  selectedType,
  setSelectedType,
  nameError,
  setNameError,
  onDismiss,
  onSave,
}: CategoryFormProps) {
  const [dialogVisible, setDialogVisible] = React.useState(visible);
  const [colorPickerVisible, setColorPickerVisible] = React.useState(false);
  const [emojiPickerVisible, setEmojiPickerVisible] = React.useState(false);

  // Sync dialog visibility with parent
  React.useEffect(() => {
    setDialogVisible(visible);
  }, [visible]);

  const handleDismiss = () => {
    setDialogVisible(false);
    onDismiss();
    setNameError(false);
  };

  return (
    <>
      {/* Add/Edit Dialog */}
      <CustomDialog
        visible={dialogVisible}
        onDismiss={handleDismiss}
        title={`${editing ? "Edit" : "Add"} Category`}
        onSave={onSave}
        hasUnsavedChanges={!!(name || color || emoji)}
      >
        <View style={styles.dialogContent}>
          <TextInput
            label={
              <Text style={{ color: nameError ? "red" : AppTheme.colors.textSecondary }}>
                Category Name <Text style={{ color: "red" }}>*</Text>
              </Text>
            }
            value={name}
            onChangeText={(value) => {
              setName(value);
              setNameError(false);
            }}
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
                  color={selectedType === "expense" ? AppTheme.colors.textInverse : AppTheme.colors.error}
                />
                <Text
                  style={[styles.typeButtonText, selectedType === "expense" && styles.typeButtonTextSelected]}
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
                  color={selectedType === "income" ? AppTheme.colors.textInverse : AppTheme.colors.success}
                />
                <Text
                  style={[styles.typeButtonText, selectedType === "income" && styles.typeButtonTextSelected]}
                >
                  Income
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, selectedType === "saving" && styles.typeButtonSelected]}
                onPress={() => setSelectedType("saving")}
              >
                <Ionicons
                  name="wallet"
                  size={20}
                  color={selectedType === "saving" ? AppTheme.colors.textInverse : AppTheme.colors.primary}
                />
                <Text
                  style={[styles.typeButtonText, selectedType === "saving" && styles.typeButtonTextSelected]}
                >
                  Saving
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
    </>
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
    lineHeight: 28,
    paddingTop: 2,
    textAlignVertical: "center",
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
