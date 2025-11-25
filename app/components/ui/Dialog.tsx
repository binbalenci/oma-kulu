import { AppTheme } from "@/app/constants/AppTheme";
import { BlurView } from "expo-blur";
import React from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Button, Portal, Text } from "react-native-paper";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface DialogProps {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  children: React.ReactNode;
  onSave?: () => Promise<boolean | void> | boolean | void;
  hasUnsavedChanges?: boolean;
  saveText?: string;
  cancelText?: string;
  showActions?: boolean;
  saveButtonColor?: string;
  allowOutsideDismiss?: boolean;
}

export function Dialog({
  visible,
  onDismiss,
  title,
  children,
  onSave,
  hasUnsavedChanges = false,
  saveText = "Save",
  cancelText = "Cancel",
  showActions = true,
  saveButtonColor = AppTheme.colors.primary,
  allowOutsideDismiss = true,
}: DialogProps) {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, {
        damping: 25,
        stiffness: 200,
        mass: 0.8,
      });
      opacity.value = withTiming(1, { duration: 250 });
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 });
      opacity.value = withTiming(0, { duration: 250 });
    }
  }, [visible, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handleDismiss = () => {
    if (hasUnsavedChanges) {
      // TODO: Show confirmation dialog
      console.log("Has unsaved changes - should show confirmation");
    }
    onDismiss();
  };

  const handleSave = async () => {
    if (onSave) {
      const result = await onSave();
      if (result !== false) {
        onDismiss();
      }
    } else {
      onDismiss();
    }
  };

  if (!visible) return null;

  return (
    <Portal>
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={handleDismiss}
        statusBarTranslucent
      >
        <Animated.View style={[styles.backdropOverlay, backdropStyle]}>
          <TouchableWithoutFeedback onPress={allowOutsideDismiss ? handleDismiss : undefined}>
            <View style={styles.backdrop}>
              <View style={styles.darkOverlay} />
              <BlurView intensity={30} style={StyleSheet.absoluteFill} />
            </View>
          </TouchableWithoutFeedback>
        </Animated.View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
          style={styles.keyboardAvoidingView}
        >
          <Animated.View style={[styles.dialog, animatedStyle]}>
            <View style={styles.header}>
              <Text variant="headlineSmall" style={styles.title}>
                {title}
              </Text>
              <Button mode="text" onPress={handleDismiss} icon="close" style={styles.closeButton}>
                {""}
              </Button>
            </View>

            <View style={styles.content}>{children}</View>

            {showActions && (
              <View style={styles.actions}>
                <Button mode="outlined" onPress={handleDismiss} style={styles.actionButton}>
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
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "transparent",
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 1000, // Ensure backdrop is on top
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: "flex-end",
    height: "100%",
    zIndex: 1001, // Ensure keyboard view is on top of backdrop
  },
  backdropOverlay: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  dialog: {
    backgroundColor: AppTheme.colors.card,
    borderTopLeftRadius: AppTheme.borderRadius.xl,
    borderTopRightRadius: AppTheme.borderRadius.xl,
    maxHeight: SCREEN_HEIGHT * 0.9,
    ...AppTheme.shadows.xl,
    marginTop: "auto",
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
    marginLeft: AppTheme.spacing.md,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    paddingHorizontal: AppTheme.spacing.lg,
    paddingVertical: AppTheme.spacing.lg,
    maxHeight: SCREEN_HEIGHT * 0.6,
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
  saveButton: {
    backgroundColor: AppTheme.colors.primary,
  },
});
