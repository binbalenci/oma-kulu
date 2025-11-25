import { AppTheme } from "@/src/constants/AppTheme";
import React from "react";
import { InputAccessoryView, Platform, StyleSheet, View } from "react-native";
import { Button, HelperText, TextInput } from "react-native-paper";

interface NumberInputProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  style?: any;
  keyboardType?: "numeric" | "number-pad" | "decimal-pad";
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
}

export function NumberInput({
  label,
  value,
  onChangeText,
  placeholder,
  style,
  keyboardType = "numeric",
  disabled = false,
  error = false,
  helperText,
  rightIcon,
  onRightIconPress,
}: NumberInputProps) {
  // Generate a unique input ID for the accessory view
  const inputAccessoryViewID = React.useMemo(
    () => `number-input-${Math.random().toString(36).substring(2, 10)}`,
    []
  );

  return (
    <View style={[styles.container, style]}>
      <TextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        disabled={disabled}
        error={error}
        style={styles.input}
        mode="outlined"
        inputAccessoryViewID={Platform.OS === "ios" ? inputAccessoryViewID : undefined}
        right={
          rightIcon ? <TextInput.Icon icon={rightIcon} onPress={onRightIconPress} /> : undefined
        }
      />
      {helperText && <HelperText type={error ? "error" : "info"}>{helperText}</HelperText>}

      {Platform.OS === "ios" && (
        <InputAccessoryView nativeID={inputAccessoryViewID}>
          <View style={styles.accessoryView}>
            <Button mode="text" onPress={() => onChangeText(value)}>
              Done
            </Button>
          </View>
        </InputAccessoryView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: AppTheme.spacing.md,
  },
  input: {
    backgroundColor: AppTheme.colors.background,
  },
  accessoryView: {
    backgroundColor: "#f8f8f8",
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.xs,
    flexDirection: "row",
    justifyContent: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
});
