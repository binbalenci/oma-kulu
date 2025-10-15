import { AppTheme } from "@/constants/AppTheme";
import { BlurView } from "expo-blur";
import React from "react";
import { Dimensions, Modal, StyleSheet, View } from "react-native";
import EmojiSelector from "react-native-emoji-selector";
import { IconButton, Portal, Text } from "react-native-paper";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface EmojiPickerDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onSelectEmoji: (emoji: string) => void;
  selectedEmoji?: string;
}

export function EmojiPickerDialog({
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

  const handleSelect = (emoji: string) => {
    onSelectEmoji(emoji);
    onDismiss();
  };

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
              <EmojiSelector
                onEmojiSelected={handleSelect}
                showSearchBar
                showTabs
                showHistory={false}
                showSectionTitles
                columns={8}
                placeholder="Search emoji..."
                category={undefined}
              />
            </View>
          </Animated.View>
        </View>
      </Modal>
    </Portal>
  );
}

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
    height: "60%",
    maxHeight: SCREEN_HEIGHT * 0.6,
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
  },
});
