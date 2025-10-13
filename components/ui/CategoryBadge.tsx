import { AppTheme } from "@/constants/AppTheme";
import Feather from "@react-native-vector-icons/feather";
import Ionicons from "@react-native-vector-icons/ionicons";
import MaterialIcons from "@react-native-vector-icons/material-design-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";

interface CategoryBadgeProps {
  category: string;
  icon?: string;
  iconFamily?: "MaterialIcons" | "Ionicons" | "Feather";
  color?: string;
  size?: "sm" | "md" | "lg";
  onPress?: () => void;
  style?: any;
}

const ICON_SIZES = {
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
  icon,
  iconFamily = "MaterialIcons",
  color = AppTheme.colors.primary,
  size = "md",
  onPress,
  style,
}: CategoryBadgeProps) {
  const iconSize = ICON_SIZES[size];
  const padding = PADDING_SIZES[size];

  const renderIcon = () => {
    if (!icon) return null;

    const iconProps = {
      name: icon,
      size: iconSize,
      color: AppTheme.colors.textInverse,
    };

    switch (iconFamily) {
      case "Ionicons":
        return <Ionicons {...iconProps} />;
      case "Feather":
        return <Feather {...iconProps} />;
      default:
        return <MaterialIcons {...iconProps} />;
    }
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
        {renderIcon()}
        <Text
          style={[
            styles.text,
            {
              fontSize: size === "sm" ? 12 : size === "md" ? 14 : 16,
              marginLeft: icon ? 6 : 0,
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
});
