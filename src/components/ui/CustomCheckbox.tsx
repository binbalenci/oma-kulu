import { AppTheme } from '@/src/constants/AppTheme';
import Ionicons from '@react-native-vector-icons/ionicons';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface CustomCheckboxProps {
  status: 'checked' | 'unchecked';
  onPress: () => void;
  color?: string;
  size?: number;
  disabled?: boolean;
}

export const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  status,
  onPress,
  color = AppTheme.colors.primary,
  size = 20,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      onPress={disabled ? undefined : onPress}
      style={[
        styles.checkbox,
        {
          width: size,
          height: size,
          borderColor: status === 'checked' ? color : AppTheme.colors.border,
          backgroundColor: status === 'checked' ? color : 'transparent',
          opacity: disabled ? 0.5 : 1,
        },
      ]}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {status === 'checked' && (
        <Ionicons
          name="checkmark"
          size={size * 0.7}
          color="white"
          style={styles.checkIcon}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  checkbox: {
    borderWidth: 2,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: AppTheme.spacing.sm,
  },
  checkIcon: {
    textAlign: 'center',
    textAlignVertical: 'center',
  },
});
