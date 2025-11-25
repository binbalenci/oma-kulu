import { AppTheme } from "@/app/constants/AppTheme";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";

interface CategoryBadgeProps {
  category: string;
  emoji?: string;
  color?: string;
  size?: "sm" | "md" | "lg";
  onPress?: () => void;
  style?: any;
}

const EMOJI_SIZES = {
  sm: 14,
  md: 16,
  lg: 20,
};

const PADDING_SIZES = {
  sm: { horizontal: 8, vertical: 4 },
  md: { horizontal: 12, vertical: 6 },
  lg: { horizontal: 16, vertical: 8 },
};

export function CategoryBadge({
  category,
  emoji,
  color = AppTheme.colors.primary,
  size = "md",
  onPress,
  style,
}: CategoryBadgeProps) {
  const emojiSize = EMOJI_SIZES[size];
  const padding = PADDING_SIZES[size];

  const renderEmoji = () => {
    if (!emoji) return null;

    return <Text style={[styles.emoji, { fontSize: emojiSize }]}>{emoji}</Text>;
  };

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      style={[
        styles.badge,
        {
          backgroundColor: color,
          paddingHorizontal: padding.horizontal,
          paddingVertical: padding.vertical,
        },
        style,
      ]}
      onPress={onPress}
    >
      <View style={styles.content}>
        {renderEmoji()}
        <Text
          style={[
            styles.text,
            {
              fontSize: size === "sm" ? 12 : size === "md" ? 14 : 16,
              marginLeft: emoji ? 6 : 0,
            },
          ]}
        >
          {category}
        </Text>
      </View>
    </Component>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: AppTheme.borderRadius.full,
    alignSelf: "flex-start",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    color: AppTheme.colors.textInverse,
    fontWeight: AppTheme.typography.fontWeight.medium,
  },
  emoji: {
    color: AppTheme.colors.textInverse,
  },
});
