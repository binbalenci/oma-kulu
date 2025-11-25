import { AppTheme } from "@/src/constants/AppTheme";
import { LoadingSpinner } from "@/src/components/ui/LoadingSpinner";
import Ionicons from "@react-native-vector-icons/ionicons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";

interface MoneyToAssignCardProps {
  amount: number;
  isLoading: boolean;
  onPress: () => void;
}

/**
 * MoneyToAssignCard - Displays money remaining to be assigned to budgets
 *
 * Features:
 * - Large prominent display of remaining amount
 * - Color-coded (green if positive, red if negative)
 * - Tappable to show calculation detail
 */
export function MoneyToAssignCard({
  amount,
  isLoading,
  onPress,
}: MoneyToAssignCardProps) {
  const isNegative = amount < 0;
  const isZero = amount === 0;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons
            name="wallet-outline"
            size={20}
            color={AppTheme.colors.textSecondary}
          />
          <Text variant="titleMedium" style={styles.title}>
            Money to Assign
          </Text>
          <Ionicons
            name="information-circle-outline"
            size={18}
            color={AppTheme.colors.textSecondary}
            style={styles.infoIcon}
          />
        </View>

        {isLoading ? (
          <LoadingSpinner size="small" />
        ) : (
          <Text
            variant="displaySmall"
            style={[
              styles.amount,
              isNegative && styles.negativeAmount,
              isZero && styles.zeroAmount,
            ]}
          >
            €{amount.toFixed(2)}
          </Text>
        )}

        {!isLoading && !isZero && (
          <Text variant="bodySmall" style={styles.subtitle}>
            {isNegative
              ? "⚠️ Overbudgeted - adjust your allocations"
              : "✓ Ready to allocate to categories"}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: 12,
    padding: AppTheme.spacing.lg,
    marginBottom: AppTheme.spacing.xl,
    ...AppTheme.shadows.md,
  },
  content: {
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: AppTheme.spacing.md,
  },
  title: {
    color: AppTheme.colors.textSecondary,
    fontWeight: "500",
  },
  infoIcon: {
    opacity: 0.6,
  },
  amount: {
    fontWeight: "700",
    color: AppTheme.colors.success,
    marginBottom: AppTheme.spacing.xs,
  },
  negativeAmount: {
    color: AppTheme.colors.error,
  },
  zeroAmount: {
    color: AppTheme.colors.textSecondary,
  },
  subtitle: {
    color: AppTheme.colors.textSecondary,
    textAlign: "center",
  },
});
