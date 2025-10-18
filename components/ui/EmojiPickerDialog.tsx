import { AppTheme } from "@/constants/AppTheme";
import { BlurView } from "expo-blur";
import React from "react";
import { Dimensions, Modal, Platform, StyleSheet, View } from "react-native";
import { IconButton, Portal, Text } from "react-native-paper";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import EmojiPicker from "rn-emoji-picker";
import { emojis } from "rn-emoji-picker/dist/data";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface EmojiPickerDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onSelectEmoji: (emoji: string) => void;
  selectedEmoji?: string;
}

export const EmojiPickerDialog = React.memo(function EmojiPickerDialog({
  visible,
  onDismiss,
  onSelectEmoji,
  selectedEmoji = "📁",
}: EmojiPickerDialogProps) {
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

  const handleEmojiSelect = React.useCallback((emoji: any) => {
    onSelectEmoji(emoji.emoji);
    onDismiss();
  }, [onSelectEmoji, onDismiss]);

  if (!visible) return null;

  return (
    <Portal>
      <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
        <Animated.View style={[styles.backdropOverlay, backdropStyle]}>
          <View style={styles.darkOverlay} />
          <BlurView intensity={30} style={StyleSheet.absoluteFill} />
        </Animated.View>
        
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContent, animatedStyle]}>
            <View style={styles.header}>
              <Text variant="titleLarge">Choose Emoji</Text>
              <IconButton icon="close" onPress={onDismiss} />
            </View>

            <View style={styles.emojiContainer}>
              <View style={styles.emojiPickerWrapper}>
                <EmojiPicker
                  emojis={emojis}
                  recent={[]} // We can implement recent emojis later if needed
                  autoFocus={false}
                  loading={false}
                  darkMode={false} // Use light mode to match your app
                perLine={Platform.OS === 'web' ? 10 : 7} // More emojis per line on web for better density
                onSelect={handleEmojiSelect}
                onChangeRecent={() => {}} // We can implement this later
                enabledCategories={[
                  'recent',
                  'emotion',
                  'emojis', 
                  'activities',
                  'flags',
                  'food',
                  'places',
                  'nature',
                  'objects'
                ]}
                defaultCategory={'emotion'}
                backgroundColor={AppTheme.colors.card}
                />
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </Portal>
  );
});

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
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
  modalContent: {
    backgroundColor: AppTheme.colors.card,
    borderTopLeftRadius: AppTheme.borderRadius.xl,
    borderTopRightRadius: AppTheme.borderRadius.xl,
    height: Platform.OS === 'web' ? "70%" : "60%", // Larger height on web for more emojis
    maxHeight: Platform.OS === 'web' ? SCREEN_HEIGHT * 0.7 : SCREEN_HEIGHT * 0.6,
    ...AppTheme.shadows.xl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: AppTheme.spacing.lg,
    paddingVertical: AppTheme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.border,
  },
  emojiContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
    // Add constraints to ensure consistent emoji sizing
    maxHeight: Platform.OS === 'web' ? 600 : 500, // More height on web for more emojis
    overflow: 'hidden', // Prevent overflow
  },
  emojiPickerWrapper: {
    flex: 1,
    width: "100%",
    height: "100%",
    // Additional constraints for consistent sizing
    transform: Platform.OS === 'web' ? [{ scale: 0.85 }] : [], // Scale down more on web for better density
  },
});