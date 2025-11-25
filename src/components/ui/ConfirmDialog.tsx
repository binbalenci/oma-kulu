import { AppTheme } from "@/src/constants/AppTheme";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { Dialog } from "./Dialog";

interface ConfirmDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string;
}

export function ConfirmDialog({
  visible,
  onDismiss,
  onConfirm,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  confirmColor = AppTheme.colors.error,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onDismiss();
  };

  return (
    <Dialog
      visible={visible}
      onDismiss={onDismiss} // Allow cancel and X to close
      title={title}
      onSave={handleConfirm}
      saveText={confirmText}
      cancelText={cancelText}
      showActions={true}
      saveButtonColor={confirmColor}
      allowOutsideDismiss={false} // Prevent outside click dismissal
    >
      <View style={styles.content}>
        <Text variant="bodyLarge" style={styles.message}>
          {message}
        </Text>
      </View>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingVertical: AppTheme.spacing.md,
  },
  message: {
    color: AppTheme.colors.textPrimary,
    textAlign: "center",
  },
});
