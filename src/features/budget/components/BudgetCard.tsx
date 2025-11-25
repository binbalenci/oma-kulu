import { AppTheme } from "@/src/constants/AppTheme";
import { GradientProgressBar } from "@/src/components/ui/GradientProgressBar";
import type { Budget, Category } from "@/src/lib/types";
import MaterialIcons from "@react-native-vector-icons/material-design-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Card, IconButton, Text } from "react-native-paper";

interface BudgetCardProps {
  budget: Budget;
  spent: number;
  categoryInfo?: Category;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * BudgetCard - Displays an individual budget with progress bar
 *
 * Features:
 * - Category emoji/icon with color
 * - Category name and optional notes
 * - Edit and delete action buttons
 * - Progress bar showing spent vs allocated
 * - Color-coded progress (green/orange/red based on percentage)
 */
export function BudgetCard({
  budget,
  spent,
  categoryInfo,
  onEdit,
  onDelete,
}: BudgetCardProps) {
  const progress = budget.allocated_amount > 0 ? spent / budget.allocated_amount : 0;

  return (
    <Card style={styles.budgetCard}>
      <Card.Content>
        {/* Header: Icon, Name, Actions */}
        <View style={styles.budgetHeader}>
          <View style={styles.budgetInfo}>
            <View
              style={[
                styles.budgetIcon,
                { backgroundColor: categoryInfo?.color || AppTheme.colors.primary },
              ]}
            >
              {categoryInfo?.emoji ? (
                <Text style={styles.budgetEmoji}>{categoryInfo.emoji}</Text>
              ) : (
                <MaterialIcons
                  name="folder"
                  size={20}
                  color={AppTheme.colors.textInverse}
                />
              )}
            </View>
            <View style={styles.budgetText}>
              <Text variant="titleMedium" style={styles.budgetCategory}>
                {budget.category}
              </Text>
              {budget.notes && (
                <Text variant="bodySmall" style={styles.budgetNotes}>
                  {budget.notes}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.budgetActions}>
            <IconButton
              icon="pencil"
              size={16}
              onPress={onEdit}
              style={styles.actionButton}
            />
            <IconButton
              icon="delete"
              size={16}
              onPress={onDelete}
              style={styles.actionButton}
            />
          </View>
        </View>

        {/* Progress Bar */}
        <GradientProgressBar
          progress={progress}
          allocated={budget.allocated_amount}
          spent={spent}
          height={12}
        />
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  budgetCard: {
    marginBottom: 12,
    backgroundColor: AppTheme.colors.surface,
  },
  budgetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  budgetInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  budgetIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  budgetEmoji: {
    fontSize: 20,
  },
  budgetText: {
    flex: 1,
  },
  budgetCategory: {
    fontWeight: "600",
    color: AppTheme.colors.textPrimary,
  },
  budgetNotes: {
    color: AppTheme.colors.textSecondary,
    marginTop: 2,
  },
  budgetActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    margin: 0,
  },
});
