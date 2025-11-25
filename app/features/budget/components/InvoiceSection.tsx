import { AppTheme } from "@/app/constants/AppTheme";
import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";
import { CategoryGroup } from "./CategoryGroup";
import type { Category, ExpectedIncome, ExpectedInvoice } from "@/app/lib/types";
import Ionicons from "@react-native-vector-icons/ionicons";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { Button, Card, IconButton, Text } from "react-native-paper";

interface InvoiceSectionProps {
  invoicesByCategory: Record<string, ExpectedInvoice[]>;
  categories: Category[];
  expandedCategories: Set<string>;
  isLoading: boolean;
  onAdd: () => void;
  onToggleExpand: (category: string) => void;
  onTogglePaid: (type: "invoice", item: ExpectedInvoice) => Promise<void>;
  onEdit: (type: "invoice", item: ExpectedInvoice) => void;
  onDelete: (type: "invoice", id: string) => void;
}

/**
 * InvoiceSection - Displays expected invoices grouped by category
 *
 * Features:
 * - Section header with title and add button
 * - Loading state with spinner
 * - Empty state card when no invoices
 * - Grouped invoice display using CategoryGroup
 * - Platform-specific add button (button on web, icon on mobile)
 */
export function InvoiceSection({
  invoicesByCategory,
  categories,
  expandedCategories,
  isLoading,
  onAdd,
  onToggleExpand,
  onTogglePaid,
  onEdit,
  onDelete,
}: InvoiceSectionProps) {
  const getCategoryInfo = (categoryName: string) => {
    return categories.find((c) => c.name === categoryName);
  };

  return (
    <View style={styles.section}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitle}>
          <Ionicons name="trending-down" size={24} color={AppTheme.colors.error} />
          <Text variant="headlineSmall" style={styles.sectionTitleText}>
            Expected Invoices
          </Text>
        </View>
        {Platform.OS === "web" ? (
          <Button
            mode="contained"
            onPress={onAdd}
            style={styles.addButton}
            icon="plus"
          >
            Add Invoice
          </Button>
        ) : (
          <IconButton
            icon="plus"
            mode="contained"
            onPress={onAdd}
            iconColor={AppTheme.colors.textInverse}
            containerColor={AppTheme.colors.primary}
            size={24}
          />
        )}
      </View>

      {/* Content: Loading / Empty / List */}
      {isLoading ? (
        <LoadingSpinner message="Loading invoices..." />
      ) : Object.keys(invoicesByCategory).length === 0 ? (
        <Card style={styles.emptyCard}>
          <Card.Content style={styles.emptyContent}>
            <Ionicons
              name="trending-down-outline"
              size={48}
              color={AppTheme.colors.textMuted}
            />
            <Text variant="bodyLarge" style={styles.emptyText}>
              No expected invoices yet. Tap + to add one.
            </Text>
          </Card.Content>
        </Card>
      ) : (
        <View style={styles.categoryList}>
          {Object.entries(invoicesByCategory).map(([categoryName, items]) => (
            <CategoryGroup
              key={categoryName}
              categoryName={categoryName}
              items={items}
              type="invoice"
              isExpanded={expandedCategories.has(categoryName)}
              onToggleExpand={onToggleExpand}
              categoryInfo={getCategoryInfo(categoryName)}
              onTogglePaid={onTogglePaid as (type: "income" | "invoice", item: ExpectedIncome | ExpectedInvoice) => Promise<void>}
              onEdit={onEdit as (type: "income" | "invoice", item: ExpectedIncome | ExpectedInvoice) => void}
              onDelete={onDelete as (type: "income" | "invoice", id: string) => void}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: AppTheme.spacing["2xl"],
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: AppTheme.spacing.lg,
  },
  sectionTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: AppTheme.spacing.sm,
  },
  sectionTitleText: {
    fontWeight: "600",
    color: AppTheme.colors.textPrimary,
  },
  addButton: {
    marginLeft: AppTheme.spacing.sm,
  },
  categoryList: {
    gap: AppTheme.spacing.sm,
  },
  emptyCard: {
    backgroundColor: AppTheme.colors.backgroundSecondary,
  },
  emptyContent: {
    alignItems: "center",
    paddingVertical: AppTheme.spacing["3xl"],
  },
  emptyText: {
    marginTop: AppTheme.spacing.md,
    color: AppTheme.colors.textSecondary,
    textAlign: "center",
  },
});
