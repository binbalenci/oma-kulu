import { AppTheme } from "@/app/constants/AppTheme";
import { CustomCheckbox } from "@/app/components/ui/CustomCheckbox";
import { GradientProgressBar } from "@/app/components/ui/GradientProgressBar";
import type { Category, ExpectedSavings } from "@/app/lib/types";
import MaterialIcons from "@react-native-vector-icons/material-design-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Card, IconButton, Text } from "react-native-paper";

interface SavingsCardProps {
  saving: ExpectedSavings;
  balance: number;
  categoryInfo?: Category;
  onTogglePaid: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * SavingsCard - Displays an individual savings goal with progress
 *
 * Features:
 * - Category emoji/icon with color
 * - Balance, target, and monthly contribution display
 * - Checkbox to mark as paid/unpaid
 * - Edit and delete action buttons
 * - Optional progress bar (if target is set)
 * - Color-coded progress (green/orange/red)
 */
export function SavingsCard({
  saving,
  balance,
  categoryInfo,
  onTogglePaid,
  onEdit,
  onDelete,
}: SavingsCardProps) {
  const progress = saving.target && saving.target > 0 ? balance / saving.target : 0;

  return (
    <Card style={styles.card}>
      <Card.Content>
        {/* Header: Icon, Name, Actions */}
        <View style={styles.header}>
          <View style={styles.info}>
            <View
              style={[
                styles.icon,
                { backgroundColor: categoryInfo?.color || AppTheme.colors.secondary },
              ]}
            >
              {categoryInfo?.emoji ? (
                <Text style={styles.emoji}>{categoryInfo.emoji}</Text>
              ) : (
                <MaterialIcons
                  name="folder"
                  size={20}
                  color={AppTheme.colors.textInverse}
                />
              )}
            </View>
            <View style={styles.textContainer}>
              <Text variant="titleMedium" style={styles.category}>
                {saving.category}
              </Text>
              <Text variant="bodySmall" style={styles.details}>
                Balance: €{balance.toFixed(1)}
                {saving.target && saving.target > 0 && ` | Target: €${saving.target.toFixed(1)}`}
                {" | Monthly: €" + saving.amount.toFixed(1)}
              </Text>
              {saving.notes && (
                <Text variant="bodySmall" style={styles.notes}>
                  {saving.notes}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.actions}>
            <CustomCheckbox
              status={saving.is_paid ? "checked" : "unchecked"}
              onPress={onTogglePaid}
              color={AppTheme.colors.success}
            />
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

        {/* Progress Bar (only if target is set) */}
        {saving.target && saving.target > 0 && (
          <GradientProgressBar
            progress={progress}
            allocated={saving.target}
            spent={balance}
            height={12}
          />
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    backgroundColor: AppTheme.colors.surface,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  info: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  emoji: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
  },
  category: {
    fontWeight: "600",
    color: AppTheme.colors.textPrimary,
  },
  details: {
    color: AppTheme.colors.textSecondary,
    marginTop: 2,
  },
  notes: {
    color: AppTheme.colors.textSecondary,
    marginTop: 4,
    fontStyle: "italic",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    margin: 0,
  },
});
