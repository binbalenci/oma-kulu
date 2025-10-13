import { AppTheme } from "@/constants/AppTheme";
import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text, TextInput } from "react-native-paper";

interface SimpleDropdownProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  data: { id: string; name: string }[];
  placeholder?: string;
  style?: any;
}

export function SimpleDropdown({
  label,
  value,
  onValueChange,
  data,
  placeholder = "Select option",
  style,
}: SimpleDropdownProps) {
  const [visible, setVisible] = React.useState(false);

  const selectedItem = data.find((item) => item.name === value);

  const handleSelect = (item: { id: string; name: string }) => {
    onValueChange(item.name);
    setVisible(false);
  };

  return (
    <View style={[styles.container, style]}>
      <Text variant="labelMedium" style={styles.label}>
        {label}
      </Text>

      <TouchableOpacity style={styles.dropdown} onPress={() => setVisible(!visible)}>
        <TextInput
          value={selectedItem?.name || ""}
          placeholder={placeholder}
          editable={false}
          style={styles.input}
          right={<TextInput.Icon icon="chevron-down" />}
        />
      </TouchableOpacity>

      {visible && (
        <View style={styles.dropdownList}>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          >
            {data.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.dropdownItem, item.name === value && styles.selectedItem]}
                onPress={() => handleSelect(item)}
              >
                <Text
                  style={[styles.dropdownItemText, item.name === value && styles.selectedItemText]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    zIndex: 1000,
  },
  label: {
    marginBottom: AppTheme.spacing.xs,
    color: AppTheme.colors.textSecondary,
  },
  dropdown: {
    backgroundColor: AppTheme.colors.background,
  },
  input: {
    backgroundColor: AppTheme.colors.background,
  },
  dropdownList: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    maxHeight: 200,
    zIndex: 1001,
    ...AppTheme.shadows.md,
  },
  scrollView: {
    maxHeight: 200,
  },
  dropdownItem: {
    paddingHorizontal: AppTheme.spacing.lg,
    paddingVertical: AppTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.borderLight,
  },
  selectedItem: {
    backgroundColor: AppTheme.colors.primary + "10",
  },
  dropdownItemText: {
    color: AppTheme.colors.textPrimary,
    fontSize: AppTheme.typography.fontSize.base,
  },
  selectedItemText: {
    color: AppTheme.colors.primary,
    fontWeight: AppTheme.typography.fontWeight.medium,
  },
});
