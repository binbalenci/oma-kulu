import { AppTheme } from "@/app/constants/AppTheme";
import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";
import Ionicons from "@react-native-vector-icons/ionicons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";

interface CashOverviewCardProps {
  expectedIncome: number;
  expectedExpenses: number;
  moneyToAssign: number;
  actualInBank: number;
  totalSavingsBalance: number;
  isLoading: boolean;
  onShowIncomeDetail: () => void;
  onShowExpenseDetail: () => void;
  onShowRemainingDetail: () => void;
  onShowInBankDetail: () => void;
  onShowSavingsDetail: () => void;
}

/**
 * CashOverviewCard - Displays a 2-row compact cash overview
 *
 * Row 1: Income | Expenses | Remaining
 * Row 2: In Bank | Savings
 *
 * Each item is clickable to show detail popup
 */
export function CashOverviewCard({
  expectedIncome,
  expectedExpenses,
  moneyToAssign,
  actualInBank,
  totalSavingsBalance,
  isLoading,
  onShowIncomeDetail,
  onShowExpenseDetail,
  onShowRemainingDetail,
  onShowInBankDetail,
  onShowSavingsDetail,
}: CashOverviewCardProps) {
  return (
    <View style={styles.overviewCompact}>
      {/* Row 1: Income, Expenses, Remaining */}
      <View style={styles.overviewRow}>
        {/* Expected Income */}
        <TouchableOpacity
          style={styles.overviewCompactItem}
          onPress={onShowIncomeDetail}
          activeOpacity={0.7}
        >
          <View style={styles.overviewItemHeader}>
            <Ionicons name="trending-up" size={14} color={AppTheme.colors.success} />
            <Text variant="labelSmall" style={styles.overviewCompactLabel}>
              Income
            </Text>
            <Ionicons
              name="information-circle-outline"
              size={14}
              color={AppTheme.colors.textSecondary}
              style={styles.infoIcon}
            />
          </View>
          {isLoading ? (
            <LoadingSpinner size="small" />
          ) : (
            <Text variant="bodyMedium" style={styles.positiveAmount}>
              €{expectedIncome.toFixed(1)}
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.overviewDivider} />

        {/* Expected Expenses */}
        <TouchableOpacity
          style={styles.overviewCompactItem}
          onPress={onShowExpenseDetail}
          activeOpacity={0.7}
        >
          <View style={styles.overviewItemHeader}>
            <Ionicons name="trending-down" size={14} color={AppTheme.colors.error} />
            <Text variant="labelSmall" style={styles.overviewCompactLabel}>
              Expenses
            </Text>
            <Ionicons
              name="information-circle-outline"
              size={14}
              color={AppTheme.colors.textSecondary}
              style={styles.infoIcon}
            />
          </View>
          {isLoading ? (
            <LoadingSpinner size="small" />
          ) : (
            <Text variant="bodyMedium" style={styles.negativeAmount}>
              -€{expectedExpenses.toFixed(1)}
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.overviewDivider} />

        {/* Remaining to Budget */}
        <TouchableOpacity
          style={styles.overviewCompactItem}
          onPress={onShowRemainingDetail}
          activeOpacity={0.7}
        >
          <View style={styles.overviewItemHeader}>
            <Ionicons name="add-circle" size={14} color={AppTheme.colors.warning} />
            <Text variant="labelSmall" style={styles.overviewCompactLabel}>
              Remaining
            </Text>
            <Ionicons
              name="information-circle-outline"
              size={14}
              color={AppTheme.colors.textSecondary}
              style={styles.infoIcon}
            />
          </View>
          {isLoading ? (
            <LoadingSpinner size="small" />
          ) : (
            <Text variant="bodyMedium" style={styles.neutralAmount}>
              €{moneyToAssign.toFixed(1)}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Row Divider */}
      <View style={styles.overviewRowDivider} />

      {/* Row 2: In Bank, Savings Balances */}
      <View style={styles.overviewRow}>
        {/* In Bank */}
        <TouchableOpacity
          style={styles.overviewCompactItem}
          onPress={onShowInBankDetail}
          activeOpacity={0.7}
        >
          <View style={styles.overviewItemHeader}>
            <Ionicons name="wallet" size={14} color={AppTheme.colors.primary} />
            <Text variant="labelSmall" style={styles.overviewCompactLabel}>
              In Bank
            </Text>
            <Ionicons
              name="information-circle-outline"
              size={14}
              color={AppTheme.colors.textSecondary}
              style={styles.infoIcon}
            />
          </View>
          {isLoading ? (
            <LoadingSpinner size="small" />
          ) : (
            <Text variant="bodyMedium" style={styles.neutralAmount}>
              €{actualInBank.toFixed(1)}
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.overviewDivider} />

        {/* Savings Balances */}
        <TouchableOpacity
          style={styles.overviewCompactItem}
          onPress={onShowSavingsDetail}
          activeOpacity={0.7}
        >
          <View style={styles.overviewItemHeader}>
            <Ionicons name="wallet-outline" size={14} color={AppTheme.colors.secondary} />
            <Text variant="labelSmall" style={styles.overviewCompactLabel}>
              Savings
            </Text>
            <Ionicons
              name="information-circle-outline"
              size={14}
              color={AppTheme.colors.textSecondary}
              style={styles.infoIcon}
            />
          </View>
          {isLoading ? (
            <LoadingSpinner size="small" />
          ) : (
            <Text variant="bodyMedium" style={styles.neutralAmount}>
              €{totalSavingsBalance.toFixed(1)}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overviewCompact: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: 12,
    padding: AppTheme.spacing.md,
    marginBottom: AppTheme.spacing.xl,
    ...AppTheme.shadows.md,
  },
  overviewRow: {
    flexDirection: "row",
  },
  overviewRowDivider: {
    height: 1,
    backgroundColor: AppTheme.colors.border,
    marginVertical: AppTheme.spacing.sm,
  },
  overviewCompactItem: {
    flex: 1,
    paddingVertical: AppTheme.spacing.sm,
    paddingHorizontal: AppTheme.spacing.xs,
    alignItems: "center",
  },
  overviewItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  overviewCompactLabel: {
    color: AppTheme.colors.textSecondary,
    fontSize: 11,
  },
  infoIcon: {
    opacity: 0.5,
  },
  overviewDivider: {
    width: 1,
    backgroundColor: AppTheme.colors.border,
  },
  positiveAmount: {
    color: AppTheme.colors.success,
    fontWeight: "600",
  },
  negativeAmount: {
    color: AppTheme.colors.error,
    fontWeight: "600",
  },
  neutralAmount: {
    color: AppTheme.colors.textPrimary,
    fontWeight: "600",
  },
});
