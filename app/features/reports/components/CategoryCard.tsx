import { AppTheme } from "@/app/constants/AppTheme";
import type { Category } from "@/app/lib/types";
import Ionicons from "@react-native-vector-icons/ionicons";
import MaterialIcons from "@react-native-vector-icons/material-design-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import type { CategorySpending } from "../services";
import { getProgressColors } from "../services";

interface CategoryCardProps {
  item: CategorySpending;
  index: number;
  categoryInfo?: Category;
  onPress: () => void;
}

export function CategoryCard({
  item,
  index,
  categoryInfo,
  onPress,
}: CategoryCardProps) {
  const hasBudget =
    item.budget !== undefined && item.budget > 0 && item.budget > 0;
  const progress = hasBudget && item.budget ? item.spent / item.budget : 0;
  const colors = hasBudget
    ? getProgressColors(progress)
    : (["rgba(156, 163, 175, 0.08)", "rgba(156, 163, 175, 0.04)"] as const);

  return (
    <TouchableOpacity
      style={styles.categoryCardWrapper}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.categoryCardBackground}
      >
        <View style={styles.categoryCard}>
          <View style={styles.rankSection}>
            <Text style={styles.rankText}>{index + 1}</Text>
          </View>
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
                  { backgroundColor: categoryInfo?.color || AppTheme.colors.primary },
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
                {item.category}
              </Text>
            </View>
            <View style={styles.cardBottomRow}>
              <Text style={styles.cardAmount}>€{item.spent.toFixed(1)}</Text>
              {hasBudget && (
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
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  categoryCardWrapper: {
    width: "47%",
    position: "relative",
  },
  categoryCardBackground: {
    borderRadius: AppTheme.borderRadius.md,
    overflow: "hidden",
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
  rankSection: {
    width: 32,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: AppTheme.colors.border,
    marginRight: AppTheme.spacing.sm,
    paddingRight: AppTheme.spacing.sm,
  },
  rankText: {
    fontSize: AppTheme.typography.fontSize.base,
    fontWeight: AppTheme.typography.fontWeight.bold,
    color: AppTheme.colors.textSecondary,
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
});
