import { AppTheme } from "@/constants/AppTheme";
import React from "react";
import { Modal, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { Button, Text } from "react-native-paper";

interface SimpleDialogProps {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  children: React.ReactNode;
  onSave?: () => void;
  saveText?: string;
  cancelText?: string;
  showActions?: boolean;
  saveButtonColor?: string;
}

export function SimpleDialog({
  visible,
  onDismiss,
  title,
  children,
  onSave,
  saveText = "Save",
  cancelText = "Cancel",
  showActions = true,
  saveButtonColor = AppTheme.colors.primary,
}: SimpleDialogProps) {
  const handleSave = () => {
    if (onSave) {
      onSave();
    }
    onDismiss();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade" // Changed to fade for better iOS experience
      onRequestClose={onDismiss}
      presentationStyle="overFullScreen"
      statusBarTranslucent={true}
      hardwareAccelerated={true} // Better performance on iOS
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text variant="headlineSmall" style={styles.title}>
              {title}
            </Text>
            <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.content}>{children}</View>
          
          {showActions && (
            <View style={styles.actions}>
              <Button
                mode="outlined"
                onPress={onDismiss}
                style={styles.actionButton}
              >
                {cancelText}
              </Button>
              {onSave && (
                <Button
                  mode="contained"
                  onPress={handleSave}
                  style={[styles.actionButton, { backgroundColor: saveButtonColor }]}
                >
                  {saveText}
                </Button>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    width: "90%",
    maxWidth: 500,
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.borderRadius.lg,
    ...AppTheme.shadows.lg,
    // On iOS, we'll center the dialog instead of sliding from bottom
    ...(Platform.OS === "ios"
      ? {}
      : {
          position: "absolute",
          bottom: 0,
          width: "100%",
          borderTopLeftRadius: AppTheme.borderRadius.xl,
          borderTopRightRadius: AppTheme.borderRadius.xl,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        }),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: AppTheme.spacing.lg,
    paddingVertical: AppTheme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.border,
  },
  title: {
    flex: 1,
    fontWeight: AppTheme.typography.fontWeight.semibold,
    color: AppTheme.colors.textPrimary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: AppTheme.colors.surfaceVariant,
  },
  closeButtonText: {
    fontSize: 16,
    color: AppTheme.colors.textSecondary,
  },
  content: {
    padding: AppTheme.spacing.lg,
    maxHeight: Platform.OS === "ios" ? 400 : "60%",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: AppTheme.spacing.lg,
    paddingVertical: AppTheme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: AppTheme.colors.border,
    gap: AppTheme.spacing.md,
  },
  actionButton: {
    minWidth: 80,
  },
});
