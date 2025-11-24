import { AppTheme } from "@/constants/AppTheme";
import Ionicons from "@react-native-vector-icons/ionicons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Chip, Text } from "react-native-paper";

interface SectionHeaderProps {
  icon: string;
  iconColor: string;
  title: string;
  count?: number;
  countColor?: string;
  expanded: boolean;
  onToggle: () => void;
}

export function SectionHeader({
  icon,
  iconColor,
  title,
  count,
  countColor,
  expanded,
  onToggle,
}: SectionHeaderProps) {
  return (
    <TouchableOpacity onPress={onToggle} style={styles.header}>
      <View style={styles.title}>
        <Ionicons name={icon as any} size={24} color={iconColor} />
        <Text variant="headlineSmall" style={styles.titleText}>
          {title}
        </Text>
        {count !== undefined && count > 0 && (
          <Chip
            mode="flat"
            compact
            style={[styles.countChip, countColor && { backgroundColor: countColor }]}
            textStyle={{ color: AppTheme.colors.textInverse }}
          >
            {count}
          </Chip>
        )}
      </View>
      <Ionicons
        name={expanded ? "chevron-up" : "chevron-down"}
        size={20}
        color={AppTheme.colors.textSecondary}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: AppTheme.spacing.lg,
  },
  title: {
    flexDirection: "row",
    alignItems: "center",
    gap: AppTheme.spacing.sm,
  },
  titleText: {
    fontWeight: AppTheme.typography.fontWeight.semibold,
    color: AppTheme.colors.textPrimary,
  },
  countChip: {
    marginLeft: AppTheme.spacing.sm,
    backgroundColor: AppTheme.colors.primary,
  },
});
