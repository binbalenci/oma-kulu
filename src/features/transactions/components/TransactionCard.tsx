import { CategoryBadge } from "@/src/components/ui/CategoryBadge";
import { AppTheme } from "@/src/constants/AppTheme";
import type { Category, Transaction } from "@/src/lib/types";
import Ionicons from "@react-native-vector-icons/ionicons";
import { format } from "date-fns";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Card, IconButton, Menu, Text } from "react-native-paper";

interface TransactionCardProps {
  transaction: Transaction;
  categoryInfo: Category | undefined;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: (id: string, isIncome: boolean) => void;
  onMoveDown: (id: string, isIncome: boolean) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

export function TransactionCard({
  transaction,
  categoryInfo,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
}: TransactionCardProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const isLinkedTransaction = transaction.source_type && transaction.source_id;
  const isIncome = transaction.amount > 0;
  const showAnyArrow = canMoveUp || canMoveDown;

  const formatAmount = (amount: number, savingsAmountUsed?: number) => {
    const actualAmount = savingsAmountUsed && savingsAmountUsed > 0
      ? amount + savingsAmountUsed
      : amount;

    const sign = actualAmount >= 0 ? "+" : "-";
    const color = actualAmount >= 0 ? AppTheme.colors.success : AppTheme.colors.error;
    return (
      <Text style={[styles.amountText, { color }]}>
        {sign}€{Math.abs(actualAmount).toFixed(1)}
      </Text>
    );
  };

  return (
    <Card style={[styles.card, isLinkedTransaction && styles.linkedCard]}>
      <Card.Content style={styles.content}>
        {/* Reorder arrows - only show when reordering is possible */}
        {showAnyArrow && (
          <>
            <View style={styles.reorderButtons}>
              {canMoveUp && (
                <TouchableOpacity
                  onPress={() => onMoveUp(transaction.id, isIncome)}
                  style={styles.reorderButtonContainer}
                  activeOpacity={0.6}
                >
                  <Ionicons
                    style={styles.reorderButtonUp}
                    name="chevron-up"
                    size={24}
                    color={AppTheme.colors.textSecondary}
                  />
                </TouchableOpacity>
              )}

              {/* Horizontal divider between arrows - only show if both arrows present */}
              {canMoveUp && canMoveDown && <View style={styles.horizontalDivider} />}

              {canMoveDown && (
                <TouchableOpacity
                  onPress={() => onMoveDown(transaction.id, isIncome)}
                  style={styles.reorderButtonContainer}
                  activeOpacity={0.6}
                >
                  <Ionicons
                    style={styles.reorderButtonDown}
                    name="chevron-down"
                    size={24}
                    color={AppTheme.colors.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Vertical divider */}
            <View style={styles.verticalDivider} />
          </>
        )}

        <View style={styles.left}>
          <View style={styles.info}>
            <Text variant="bodyLarge" style={styles.description}>
              {transaction.description}
            </Text>
            <View style={styles.metaRow}>
              <Text variant="bodySmall" style={styles.meta}>
                {format(new Date(transaction.date), "MMM dd")}
              </Text>
              <View style={styles.categoryBadgeContainer}>
                <CategoryBadge
                  category={transaction.category}
                  emoji={categoryInfo?.emoji}
                  color={categoryInfo?.color || AppTheme.colors.primary}
                  size="sm"
                />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.right}>
          <View style={styles.amountAndMenuRow}>
            {formatAmount(transaction.amount, transaction.savings_amount_used)}
            <Menu
              visible={isMenuOpen}
              onDismiss={() => setIsMenuOpen(false)}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  size={20}
                  onPress={() => setIsMenuOpen(true)}
                  style={styles.menuButton}
                />
              }
            >
              <Menu.Item
                leadingIcon="pencil"
                onPress={() => {
                  setIsMenuOpen(false);
                  onEdit(transaction);
                }}
                title="Edit"
              />
              <Menu.Item
                leadingIcon={isLinkedTransaction ? "clock-outline" : "delete"}
                onPress={() => {
                  setIsMenuOpen(false);
                  onDelete(transaction);
                }}
                title={isLinkedTransaction ? "Move to Pending" : "Delete"}
              />
            </Menu>
          </View>
          {transaction.uses_savings_category &&
            transaction.savings_amount_used &&
            transaction.savings_amount_used > 0 && (
              <TouchableOpacity style={styles.savingsBadge}>
                <Ionicons name="wallet" size={14} color={AppTheme.colors.secondary} />
                <Text variant="bodySmall" style={styles.savingsBadgeText}>
                  {`€${transaction.savings_amount_used.toFixed(1)} from ${transaction.uses_savings_category}`}
                </Text>
              </TouchableOpacity>
            )}
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    ...AppTheme.shadows.sm,
    marginBottom: AppTheme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: AppTheme.colors.border,
  },
  linkedCard: {
    backgroundColor: "#FFF8F0",
    borderLeftWidth: 4,
    borderLeftColor: AppTheme.colors.warning,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: AppTheme.spacing.xs,
    paddingHorizontal: 0,
    minHeight: 80,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingLeft: AppTheme.spacing.md,
  },
  info: {
    flex: 1,
  },
  description: {
    fontWeight: AppTheme.typography.fontWeight.medium,
    color: AppTheme.colors.textPrimary,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  categoryBadgeContainer: {
    marginLeft: AppTheme.spacing.sm,
  },
  meta: {
    color: AppTheme.colors.textSecondary,
  },
  right: {
    alignItems: "flex-end",
    paddingRight: AppTheme.spacing.md,
  },
  amountAndMenuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: AppTheme.spacing.xs,
  },
  amountText: {
    fontWeight: AppTheme.typography.fontWeight.semibold,
    fontSize: AppTheme.typography.fontSize.lg,
  },
  menuButton: {
    margin: 0,
  },
  savingsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: AppTheme.colors.backgroundSecondary,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  savingsBadgeText: {
    color: AppTheme.colors.secondary,
    fontSize: 12,
  },
  reorderButtons: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: 48,
    alignSelf: "stretch",
  },
  reorderButtonContainer: {
    width: 48,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  reorderButtonUp: {
    marginTop: -8,
  },
  reorderButtonDown: {
    marginBottom: -8,
  },
  horizontalDivider: {
    height: 1,
    width: 24,
    backgroundColor: AppTheme.colors.border,
    marginVertical: -4,
  },
  verticalDivider: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: AppTheme.colors.border,
    marginRight: AppTheme.spacing.xs,
  },
});
