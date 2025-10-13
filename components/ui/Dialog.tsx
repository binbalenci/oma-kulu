import React from 'react';
import { Modal, StyleSheet, View, TouchableWithoutFeedback, Dimensions } from 'react-native';
import { Text, Button, Portal } from 'react-native-paper';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { AppTheme } from '@/constants/AppTheme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface DialogProps {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  children: React.ReactNode;
  onSave?: () => void;
  hasUnsavedChanges?: boolean;
  saveText?: string;
  cancelText?: string;
  showActions?: boolean;
}

export function Dialog({
  visible,
  onDismiss,
  title,
  children,
  onSave,
  hasUnsavedChanges = false,
  saveText = 'Save',
  cancelText = 'Cancel',
  showActions = true,
}: DialogProps) {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 300,
      });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handleDismiss = () => {
    if (hasUnsavedChanges) {
      // TODO: Show confirmation dialog
      console.log('Has unsaved changes - should show confirmation');
    }
    onDismiss();
  };

  const handleSave = () => {
    if (onSave) {
      onSave();
    }
    onDismiss();
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
        <TouchableWithoutFeedback onPress={handleDismiss}>
          <View style={styles.backdrop}>
            <Animated.View style={[styles.backdropOverlay, backdropStyle]}>
              <BlurView intensity={20} style={StyleSheet.absoluteFill} />
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>

        <Animated.View style={[styles.dialog, animatedStyle]}>
          <View style={styles.header}>
            <Text variant="headlineSmall" style={styles.title}>
              {title}
            </Text>
            <Button
              mode="text"
              onPress={handleDismiss}
              icon="close"
              style={styles.closeButton}
            >
              {''}
            </Button>
          </View>

          <View style={styles.content}>
            {children}
          </View>

          {showActions && (
            <View style={styles.actions}>
              <Button
                mode="outlined"
                onPress={handleDismiss}
                style={styles.actionButton}
              >
                {cancelText}
              </Button>
              {onSave && (
                <Button
                  mode="contained"
                  onPress={handleSave}
                  style={[styles.actionButton, styles.saveButton]}
                >
                  {saveText}
                </Button>
              )}
            </View>
          )}
        </Animated.View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdropOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  dialog: {
    backgroundColor: AppTheme.colors.card,
    borderTopLeftRadius: AppTheme.borderRadius.xl,
    borderTopRightRadius: AppTheme.borderRadius.xl,
    maxHeight: SCREEN_HEIGHT * 0.9,
    ...AppTheme.shadows.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  },
  content: {
    paddingHorizontal: AppTheme.spacing.lg,
    paddingVertical: AppTheme.spacing.lg,
    maxHeight: SCREEN_HEIGHT * 0.6,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
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
