import React from "react";
import { Modal, StyleSheet, View } from "react-native";
import { IconButton, Text } from "react-native-paper";
import { AppTheme } from "@/src/constants/AppTheme";

interface AboutModalProps {
  visible: boolean;
  onDismiss: () => void;
}

export function AboutModal({ visible, onDismiss }: AboutModalProps) {
  const currentYear = new Date().getFullYear();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay} onTouchEnd={onDismiss}>
        <View style={styles.modal} onTouchEnd={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text variant="headlineSmall" style={styles.title}>
              About
            </Text>
            <IconButton
              icon="close"
              size={24}
              onPress={onDismiss}
              style={styles.closeButton}
            />
          </View>

          <View style={styles.content}>
            <Text variant="titleLarge" style={styles.appName}>
              Oma Kulu
            </Text>

            <Text variant="bodyMedium" style={styles.version}>
              Version 3.5.0
            </Text>

            <Text variant="bodyMedium" style={styles.author}>
              Benjamin B
            </Text>

            <Text variant="bodySmall" style={styles.copyright}>
              © {currentYear} All rights reserved
            </Text>
          </View>
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
  },
  modal: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.borderRadius.lg,
    minWidth: 320,
    maxWidth: 400,
    ...AppTheme.shadows.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: AppTheme.spacing.xl,
    paddingRight: AppTheme.spacing.sm,
    paddingTop: AppTheme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.border,
  },
  title: {
    fontWeight: AppTheme.typography.fontWeight.semibold,
    color: AppTheme.colors.textPrimary,
  },
  closeButton: {
    margin: 0,
  },
  content: {
    padding: AppTheme.spacing.xl,
    alignItems: "center",
    gap: AppTheme.spacing.md,
  },
  appName: {
    fontWeight: AppTheme.typography.fontWeight.bold,
    color: AppTheme.colors.primary,
    marginBottom: AppTheme.spacing.sm,
  },
  version: {
    color: AppTheme.colors.textSecondary,
  },
  author: {
    color: AppTheme.colors.textPrimary,
  },
  copyright: {
    color: AppTheme.colors.textMuted,
    marginTop: AppTheme.spacing.sm,
  },
});
