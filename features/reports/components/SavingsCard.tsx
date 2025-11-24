import { AppTheme } from "@/constants/AppTheme";
import type { Category } from "@/lib/types";
import Ionicons from "@react-native-vector-icons/ionicons";
import MaterialIcons from "@react-native-vector-icons/material-design-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import type { SavingsProgress } from "../services";

interface SavingsCardProps {
  category: string;
  balance: number;
  target?: number;
  categoryInfo?: Category;
  savingsProgress: SavingsProgress;
  onPress: () => void;
}

export function SavingsCard({
  category,
  balance,
  target,
  categoryInfo,
  savingsProgress,
  onPress,
}: SavingsCardProps) {
  const progress = target && target > 0 ? balance / target : 0;

  return (
    <TouchableOpacity
      style={styles.categoryCardWrapper}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[styles.categoryCard, { borderColor: AppTheme.colors.secondary }]}
      >
        <View style={styles.cardContent}>
          <Ionicons
            name="information-circle-outline"
            size={14}
            color={AppTheme.colors.textSecondary}
            style={styles.infoIconAbsolute}
          />
          <View style={styles.cardMainRow}>
            <View
              style={[
                styles.cardIcon,
                { backgroundColor: categoryInfo?.color || AppTheme.colors.secondary },
              ]}
            >
              {categoryInfo?.emoji ? (
                <Text style={styles.cardEmoji}>{categoryInfo.emoji}</Text>
              ) : (
                <MaterialIcons
                  name="folder"
                  size={16}
                  color={AppTheme.colors.textInverse}
                />
              )}
            </View>
            <Text style={styles.cardName} numberOfLines={1}>
              {category}
            </Text>
          </View>
          <View style={styles.cardBottomRow}>
            <View>
              <Text style={styles.cardAmount}>€{balance.toFixed(1)}</Text>
              {target && target > 0 && (
                <Text style={styles.cardSubtext}>
                  Target: €{target.toFixed(1)}
                </Text>
              )}
              <Text style={styles.cardSubtext}>
                Contributions: €{savingsProgress.monthlyContributions.toFixed(1)} |
                Payments: €{savingsProgress.monthlyPayments.toFixed(1)}
              </Text>
            </View>
            {target && target > 0 && (
              <View style={styles.percentageBadge}>
                <Text
                  style={[
                    styles.percentageText,
                    progress > 1 && styles.percentageOver,
                  ]}
                >
                  {Math.round(progress * 100)}%
                </Text>
              </View>
            )}
          </View>
          {target && target > 0 && (
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${Math.min(100, progress * 100)}%` },
                ]}
              />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  categoryCardWrapper: {
    width: "47%",
    position: "relative",
  },
  categoryCard: {
    flexDirection: "row",
    padding: AppTheme.spacing.sm,
    paddingVertical: AppTheme.spacing.md,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    borderRadius: AppTheme.borderRadius.md,
    ...AppTheme.shadows.sm,
  },
  cardContent: {
    flex: 1,
    position: "relative",
  },
  cardMainRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: AppTheme.spacing.sm,
  },
  cardIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  cardEmoji: {
    fontSize: 12,
  },
  cardName: {
    flex: 1,
    fontSize: AppTheme.typography.fontSize.sm,
    fontWeight: AppTheme.typography.fontWeight.semibold,
    color: AppTheme.colors.textPrimary,
    marginRight: 4,
  },
  infoIconAbsolute: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 1,
  },
  cardBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardAmount: {
    fontSize: AppTheme.typography.fontSize.base,
    fontWeight: AppTheme.typography.fontWeight.bold,
    color: AppTheme.colors.textPrimary,
    marginBottom: 2,
  },
  cardSubtext: {
    fontSize: AppTheme.typography.fontSize.xs,
    color: AppTheme.colors.textSecondary,
    marginTop: 2,
  },
  percentageBadge: {
    backgroundColor: AppTheme.colors.backgroundSecondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: AppTheme.borderRadius.sm,
  },
  percentageText: {
    fontSize: AppTheme.typography.fontSize.xs,
    fontWeight: AppTheme.typography.fontWeight.bold,
    color: AppTheme.colors.success,
  },
  percentageOver: {
    color: AppTheme.colors.error,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: AppTheme.colors.backgroundSecondary,
    borderRadius: 2,
    marginTop: AppTheme.spacing.sm,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: AppTheme.colors.secondary,
    borderRadius: 2,
  },
});
