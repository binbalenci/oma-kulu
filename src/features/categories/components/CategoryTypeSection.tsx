/**
 * CategoryTypeSection Component
 *
 * Displays a section of categories grouped by type with:
 * - Section header with icon, title, and count
 * - Add button
 * - List of categories or empty state
 */

import { AppTheme } from "@/src/constants/AppTheme";
import type { Category } from "@/src/lib/types";
import Ionicons from "@react-native-vector-icons/ionicons";
import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Button, Card, Chip, Text } from "react-native-paper";
import { CategoryListItem } from "./CategoryListItem";

interface CategoryTypeSectionProps {
  title: string;
  type: "income" | "expense" | "saving";
  categories: Category[];
  onAdd: () => void;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

export function CategoryTypeSection({
  title,
  type,
  categories,
  onAdd,
  onEdit,
  onDelete,
}: CategoryTypeSectionProps) {
  const getIcon = () => {
    switch (type) {
      case "income":
        return "trending-up";
      case "expense":
        return "trending-down";
      case "saving":
        return "wallet";
    }
  };

  const getIconOutline = () => {
    switch (type) {
      case "income":
        return "trending-up-outline";
      case "expense":
        return "trending-down-outline";
      case "saving":
        return "wallet-outline";
    }
  };

  const getColor = () => {
    switch (type) {
      case "income":
        return AppTheme.colors.success;
      case "expense":
        return AppTheme.colors.error;
      case "saving":
        return AppTheme.colors.primary;
    }
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitle}>
          <Ionicons name={getIcon()} size={24} color={getColor()} />
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
        <Button mode="contained" onPress={onAdd} style={styles.addButton} icon="plus">
          Add
        </Button>
      </View>

      {categories.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Card.Content style={styles.emptyContent}>
            <Ionicons name={getIconOutline()} size={48} color={AppTheme.colors.textMuted} />
            <Text variant="bodyLarge" style={styles.emptyText}>
              No {type} categories yet. Tap + to add one.
            </Text>
          </Card.Content>
        </Card>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CategoryListItem item={item} onEdit={onEdit} onDelete={onDelete} />
          )}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.categorySeparator} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
});
