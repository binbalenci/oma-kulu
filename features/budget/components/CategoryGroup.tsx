import { AppTheme } from "@/constants/AppTheme";
import { CustomCheckbox } from "@/components/ui/CustomCheckbox";
import type { Category, ExpectedIncome, ExpectedInvoice } from "@/lib/types";
import Ionicons from "@react-native-vector-icons/ionicons";
import MaterialIcons from "@react-native-vector-icons/material-design-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Card, IconButton, Text } from "react-native-paper";

interface CategoryGroupProps {
  categoryName: string;
  items: (ExpectedIncome | ExpectedInvoice)[];
  type: "income" | "invoice";
  isExpanded: boolean;
  onToggleExpand: (category: string) => void;
  categoryInfo?: Category;
  onTogglePaid: (type: "income" | "invoice", item: ExpectedIncome | ExpectedInvoice) => Promise<void>;
  onEdit: (type: "income" | "invoice", item: ExpectedIncome | ExpectedInvoice) => void;
  onDelete: (type: "income" | "invoice", id: string) => void;
}

/**
 * CategoryGroup - Renders a collapsible group of income or invoice items by category
 *
 * Features:
 * - Collapsible category header with emoji/icon
 * - Summary info (paid count, total amount)
 * - Individual item rows with checkbox, edit, delete actions
 * - Supports both income and invoice items
 */
export function CategoryGroup({
  categoryName,
  items,
  type,
  isExpanded,
  onToggleExpand,
  categoryInfo,
  onTogglePaid,
  onEdit,
  onDelete,
}: CategoryGroupProps) {
  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
  const paidCount = items.filter((item) => item.is_paid).length;

  return (
    <Card style={styles.categoryCard}>
      <TouchableOpacity
        onPress={() => onToggleExpand(categoryName)}
        style={styles.categoryHeader}
      >
        <View style={styles.categoryHeaderLeft}>
          <View
            style={[
              styles.categoryIcon,
              { backgroundColor: categoryInfo?.color || AppTheme.colors.primary },
            ]}
          >
            {categoryInfo?.emoji ? (
              <Text style={styles.categoryEmoji}>{categoryInfo.emoji}</Text>
            ) : (
              <MaterialIcons name="folder" size={20} color={AppTheme.colors.textInverse} />
            )}
          </View>
          <View style={styles.categoryInfo}>
            <Text variant="titleMedium" style={styles.categoryName}>
              {categoryName}
            </Text>
            <Text variant="bodySmall" style={styles.categorySubtext}>
              {paidCount}/{items.length} paid • €{totalAmount.toFixed(1)}
            </Text>
          </View>
        </View>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          color={AppTheme.colors.textSecondary}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.categoryItems}>
          {items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <CustomCheckbox
                status={item.is_paid ? "checked" : "unchecked"}
                onPress={() => onTogglePaid(type, item)}
              />
              <View style={styles.itemInfo}>
                <Text
                  variant="bodyLarge"
                  style={[styles.itemName, item.is_paid && styles.itemPaid]}
                >
                  {item.name}
                </Text>
                {item.notes && (
                  <Text variant="bodySmall" style={styles.itemNotes}>
                    {item.notes}
                  </Text>
                )}
              </View>
              <Text
                variant="bodyLarge"
                style={[styles.itemAmount, item.is_paid && styles.itemPaid]}
              >
                €{item.amount.toFixed(1)}
              </Text>
              <View style={styles.itemActions}>
                <IconButton
                  icon="pencil"
                  size={16}
                  onPress={() => onEdit(type, item)}
                  style={styles.actionButton}
                />
                <IconButton
                  icon="delete"
                  size={16}
                  onPress={() => onDelete(type, item.id)}
                  style={styles.actionButton}
                />
              </View>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  categoryCard: {
    marginBottom: 12,
    backgroundColor: AppTheme.colors.surface,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  categoryHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  categoryEmoji: {
    fontSize: 20,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontWeight: "600",
    color: AppTheme.colors.textPrimary,
  },
  categorySubtext: {
    color: AppTheme.colors.textSecondary,
    marginTop: 2,
  },
  categoryItems: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: AppTheme.colors.border,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 8,
  },
  itemName: {
    color: AppTheme.colors.textPrimary,
  },
  itemPaid: {
    opacity: 0.5,
    textDecorationLine: "line-through",
  },
  itemNotes: {
    color: AppTheme.colors.textSecondary,
    marginTop: 2,
  },
  itemAmount: {
    fontWeight: "600",
    color: AppTheme.colors.textPrimary,
    marginRight: 8,
  },
  itemActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    margin: 0,
  },
});
