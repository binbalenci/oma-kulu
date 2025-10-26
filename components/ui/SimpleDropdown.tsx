import { AppTheme } from "@/constants/AppTheme";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Text } from "react-native-paper";

interface SimpleDropdownProps {
  label: string | React.ReactNode;
  value: string;
  onValueChange: (value: string) => void;
  data: { id: string; name: string; emoji?: string; color?: string }[];
  placeholder?: string;
  style?: any;
  error?: boolean;
}

export function SimpleDropdown({
  label,
  value,
  onValueChange,
  data,
  placeholder = "Select option",
  style,
  error = false,
}: SimpleDropdownProps) {
  const [visible, setVisible] = React.useState(false);
  const selectedItem = data.find((item) => item.name === value);

  const handleSelect = (item: { id: string; name: string; emoji?: string; color?: string }) => {
    onValueChange(item.name);
    setVisible(false);
  };

  return (
    <View style={[styles.container, style]}>
      {typeof label === 'string' ? (
        <Text variant="labelMedium" style={styles.label}>
          {label}
        </Text>
      ) : (
        <View style={styles.label}>{label}</View>
      )}

      <TouchableOpacity style={styles.dropdown} onPress={() => setVisible(!visible)}>
        <View style={styles.inputWrapper}>
          <Text style={[styles.inputText, !selectedItem && error && styles.errorPlaceholder]} numberOfLines={1} ellipsizeMode="tail">
            {selectedItem ? (
              <>
                {selectedItem.emoji && <Text>{selectedItem.emoji} </Text>}
                {selectedItem.name}
              </>
            ) : (
              placeholder
            )}
          </Text>
          <TouchableOpacity 
            style={styles.arrowButton} 
            onPress={() => setVisible(!visible)}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          >
            <Text style={styles.arrowIcon}>{visible ? '▲' : '▼'}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {visible && (
        <>
          <TouchableWithoutFeedback onPress={() => setVisible(false)}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>
          
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
                    style={[
                      styles.dropdownItemText,
                      item.name === value && styles.selectedItemText,
                    ]}
                  >
                    {item.emoji && <Text>{item.emoji} </Text>}
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    zIndex: 9999,
  },
  label: {
    marginBottom: AppTheme.spacing.xs,
    color: AppTheme.colors.textSecondary,
  },
  dropdown: {
    backgroundColor: AppTheme.colors.background,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    borderRadius: AppTheme.borderRadius.sm,
    backgroundColor: AppTheme.colors.background,
    paddingHorizontal: AppTheme.spacing.lg,
    paddingVertical: AppTheme.spacing.md,
    height: 56,  // Match TextInput height
  },
  inputText: {
    flex: 1,
    color: AppTheme.colors.textPrimary,
    fontSize: AppTheme.typography.fontSize.base,
    marginRight: AppTheme.spacing.md,
  },
  arrowButton: {
    padding: 8,
  },
  arrowIcon: {
    fontSize: 12,
    color: AppTheme.colors.textSecondary,
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
    maxHeight: 185,
    zIndex: 9999,
    ...AppTheme.shadows.md,
    elevation: 9999,
  },
  scrollView: {
    maxHeight: 185,
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
  backdrop: {
    position: "absolute",
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    zIndex: 9998,
  },
  errorPlaceholder: {
    color: 'red',
  },
});
