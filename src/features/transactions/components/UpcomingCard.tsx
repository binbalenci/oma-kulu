import { CategoryBadge } from "@/src/components/ui/CategoryBadge";
import { AppTheme } from "@/src/constants/AppTheme";
import type { Category, ExpectedIncome, ExpectedInvoice, ExpectedSavings, Transaction } from "@/src/lib/types";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Card, Chip, Text } from "react-native-paper";

type UpcomingItem = ExpectedIncome | ExpectedInvoice | ExpectedSavings | Transaction;
type UpcomingType = "income" | "invoice" | "saving" | "transaction";

interface UpcomingCardProps {
  item: UpcomingItem;
  type: UpcomingType;
  categoryInfo: Category | undefined;
}

export function UpcomingCard({ item, type, categoryInfo }: UpcomingCardProps) {
  const isIncome = type === "income" || (type === "transaction" && "amount" in item && item.amount > 0);
  const amount = "amount" in item ? item.amount : (item as Transaction).amount;

  const getDisplayName = () => {
    if (type === "saving") {
      return (item as ExpectedSavings).category;
    }
    if ("name" in item) {
      return item.name;
    }
    return (item as Transaction).description;
  };

  const getTypeLabel = () => {
    switch (type) {
      case "income":
        return "Expected Income";
      case "invoice":
        return "Expected Invoice";
      case "saving":
        return "Savings";
      default:
        return "Upcoming";
    }
  };

  const formatAmount = (amt: number) => {
    const sign = amt >= 0 ? "+" : "-";
    const color = amt >= 0 ? AppTheme.colors.success : AppTheme.colors.error;
    return (
      <Text style={[styles.amountText, { color }]}>
        {sign}€{Math.abs(amt).toFixed(1)}
      </Text>
    );
  };

  return (
    <Card key={`${type}-${item.id}`} style={styles.card}>
      <Card.Content style={styles.content}>
        <View style={styles.left}>
          <CategoryBadge
            category={item.category}
            emoji={categoryInfo?.emoji}
            color={categoryInfo?.color || AppTheme.colors.primary}
            size="sm"
          />
          <View style={styles.info}>
            <Text variant="bodyLarge" style={styles.description}>
              {getDisplayName()}
            </Text>
            <Text variant="bodySmall" style={styles.meta}>
              {item.category} • {getTypeLabel()}
            </Text>
          </View>
        </View>

        <View style={styles.right}>
          {formatAmount(isIncome ? amount : -amount)}
          <Chip mode="outlined" compact style={styles.statusChip} textStyle={styles.statusChipText}>
            Pending
          </Chip>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    ...AppTheme.shadows.sm,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: AppTheme.spacing.sm,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  info: {
    flex: 1,
    marginLeft: AppTheme.spacing.md,
  },
  description: {
    fontWeight: AppTheme.typography.fontWeight.medium,
    color: AppTheme.colors.textPrimary,
  },
  meta: {
    color: AppTheme.colors.textSecondary,
    marginTop: 2,
  },
  right: {
    alignItems: "flex-end",
    gap: AppTheme.spacing.xs,
  },
  amountText: {
    fontWeight: AppTheme.typography.fontWeight.semibold,
    fontSize: AppTheme.typography.fontSize.lg,
  },
  statusChip: {
    borderColor: AppTheme.colors.warning,
  },
  statusChipText: {
    color: AppTheme.colors.warning,
    fontSize: 12,
  },
});
