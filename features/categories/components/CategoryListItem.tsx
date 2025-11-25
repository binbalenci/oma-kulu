/**
 * CategoryListItem Component
 *
 * Displays individual category with:
 * - Color bar indicator
 * - Emoji icon
 * - Name and status badges
 * - Edit and delete actions
 */

import { AppTheme } from "@/constants/AppTheme";
import type { Category } from "@/lib/types";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Card, IconButton, Text } from "react-native-paper";

interface CategoryListItemProps {
  item: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

export function CategoryListItem({ item, onEdit, onDelete }: CategoryListItemProps) {
  return (
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
                <IconButton icon="pencil" size={20} onPress={() => onEdit(item)} />
                <IconButton icon="delete" size={20} onPress={() => onDelete(item.id)} />
              </View>
            </View>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
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
    lineHeight: 24,
    marginRight: AppTheme.spacing.sm,
    paddingTop: 1,
    textAlignVertical: "center",
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
  statusBadges: {
    flexDirection: "row",
    gap: AppTheme.spacing.sm,
    marginTop: AppTheme.spacing.xs,
  },
  statusText: {
    color: AppTheme.colors.textMuted,
    fontWeight: AppTheme.typography.fontWeight.medium,
  },
});
