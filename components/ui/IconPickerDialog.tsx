import { AppTheme } from "@/constants/AppTheme";
import Feather from "@react-native-vector-icons/feather";
import Ionicons from "@react-native-vector-icons/ionicons";
import MaterialIcons from "@react-native-vector-icons/material-design-icons";
import React from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { Searchbar, Text } from "react-native-paper";
import { Dialog } from "./Dialog";

interface IconPickerDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onSelectIcon: (icon: { name: string; family: "MaterialIcons" | "Ionicons" | "Feather" }) => void;
  selectedIcon?: { name: string; family: "MaterialIcons" | "Ionicons" | "Feather" };
}

// Popular icons for financial app
const MATERIAL_ICONS = [
  "account-balance",
  "account-balance-wallet",
  "attach-money",
  "trending-up",
  "trending-down",
  "shopping-cart",
  "restaurant",
  "local-gas-station",
  "home",
  "car-repair",
  "fitness-center",
  "movie",
  "music-note",
  "phone",
  "laptop",
  "flight",
  "hotel",
  "local-hospital",
  "school",
  "work",
  "favorite",
  "star",
  "bookmark",
  "notifications",
  "settings",
  "add",
  "edit",
  "delete",
  "save",
  "cancel",
  "check",
  "close",
  "arrow-back",
  "arrow-forward",
  "refresh",
];

const IONICONS = [
  "wallet",
  "card",
  "cash",
  "trending-up",
  "trending-down",
  "cart",
  "restaurant",
  "car",
  "home",
  "fitness",
  "musical-notes",
  "call",
  "laptop",
  "airplane",
  "bed",
  "medical",
  "school",
  "briefcase",
  "heart",
  "star",
  "bookmark",
  "notifications",
  "settings",
  "add",
  "create",
  "trash",
  "save",
  "close",
  "checkmark",
  "arrow-back",
  "arrow-forward",
  "refresh",
  "search",
  "filter",
  "menu",
];

const FEATHER_ICONS = [
  "dollar-sign",
  "credit-card",
  "trending-up",
  "trending-down",
  "shopping-cart",
  "home",
  "car",
  "heart",
  "star",
  "bookmark",
  "bell",
  "settings",
  "plus",
  "edit",
  "trash-2",
  "save",
  "x",
  "check",
  "arrow-left",
  "arrow-right",
  "refresh-cw",
  "search",
  "filter",
  "menu",
  "user",
];

const ICON_FAMILIES = [
  { name: "Material", key: "MaterialIcons", icons: MATERIAL_ICONS, component: MaterialIcons },
  { name: "Ionicons", key: "Ionicons", icons: IONICONS, component: Ionicons },
  { name: "Feather", key: "Feather", icons: FEATHER_ICONS, component: Feather },
] as const;

export function IconPickerDialog({
  visible,
  onDismiss,
  onSelectIcon,
  selectedIcon = { name: "home", family: "MaterialIcons" },
}: IconPickerDialogProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedFamily, setSelectedFamily] = React.useState<
    "MaterialIcons" | "Ionicons" | "Feather"
  >("MaterialIcons");

  const currentFamily = ICON_FAMILIES.find((f) => f.key === selectedFamily);
  const filteredIcons =
    currentFamily?.icons.filter((icon) => icon.toLowerCase().includes(searchQuery.toLowerCase())) ||
    [];

  const handleSelectIcon = (iconName: string) => {
    onSelectIcon({ name: iconName, family: selectedFamily });
    onDismiss();
  };

  const renderIcon = ({ item }: { item: string }) => {
    const IconComponent = currentFamily?.component;
    const isSelected = selectedIcon.name === item && selectedIcon.family === selectedFamily;

    if (!IconComponent) return null;

    return (
      <TouchableOpacity
        style={[styles.iconItem, isSelected && styles.selectedIconItem]}
        onPress={() => handleSelectIcon(item)}
      >
        <IconComponent
          name={item as any}
          size={24}
          color={isSelected ? AppTheme.colors.primary : AppTheme.colors.textSecondary}
        />
      </TouchableOpacity>
    );
  };

  const renderFamilyTab = (family: (typeof ICON_FAMILIES)[number]) => (
    <TouchableOpacity
      key={family.key}
      style={[styles.familyTab, selectedFamily === family.key && styles.selectedFamilyTab]}
      onPress={() => setSelectedFamily(family.key)}
    >
      <Text
        style={[
          styles.familyTabText,
          selectedFamily === family.key && styles.selectedFamilyTabText,
        ]}
      >
        {family.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Dialog visible={visible} onDismiss={onDismiss} title="Choose Icon" showActions={false}>
      <View style={styles.container}>
        <Searchbar
          placeholder="Search icons..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchBar}
        />

        <View style={styles.familyTabs}>{ICON_FAMILIES.map(renderFamilyTab)}</View>

        <FlatList
          data={filteredIcons}
          renderItem={renderIcon}
          keyExtractor={(item) => `${selectedFamily}-${item}`}
          numColumns={6}
          style={styles.iconGrid}
          contentContainerStyle={styles.iconGridContent}
        />
      </View>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 400,
  },
  searchBar: {
    marginBottom: AppTheme.spacing.lg,
  },
  familyTabs: {
    flexDirection: "row",
    marginBottom: AppTheme.spacing.lg,
    backgroundColor: AppTheme.colors.backgroundSecondary,
    borderRadius: AppTheme.borderRadius.md,
    padding: 4,
  },
  familyTab: {
    flex: 1,
    paddingVertical: AppTheme.spacing.sm,
    paddingHorizontal: AppTheme.spacing.md,
    borderRadius: AppTheme.borderRadius.sm,
    alignItems: "center",
  },
  selectedFamilyTab: {
    backgroundColor: AppTheme.colors.primary,
  },
  familyTabText: {
    fontSize: AppTheme.typography.fontSize.sm,
    fontWeight: AppTheme.typography.fontWeight.medium,
    color: AppTheme.colors.textSecondary,
  },
  selectedFamilyTabText: {
    color: AppTheme.colors.textInverse,
  },
  iconGrid: {
    flex: 1,
  },
  iconGridContent: {
    paddingBottom: AppTheme.spacing.lg,
  },
  iconItem: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    margin: 4,
    borderRadius: AppTheme.borderRadius.md,
    backgroundColor: AppTheme.colors.backgroundSecondary,
  },
  selectedIconItem: {
    backgroundColor: AppTheme.colors.primary + "20",
    borderWidth: 2,
    borderColor: AppTheme.colors.primary,
  },
});
