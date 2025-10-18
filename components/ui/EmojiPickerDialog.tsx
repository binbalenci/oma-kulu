import { AppTheme } from "@/constants/AppTheme";
import EmojiPicker, { emojiData } from "@hiraku-ai/react-native-emoji-picker";
import React from "react";

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
  const handleEmojiSelect = React.useCallback((emoji: string) => {
    onSelectEmoji(emoji);
    onDismiss();
  }, [onSelectEmoji, onDismiss]);

  if (!visible) return null;

  return (
    <EmojiPicker
      onEmojiSelect={handleEmojiSelect}
      emojis={emojiData}
      visible={visible}
      onClose={onDismiss}
      showHistoryTab={true}
      showSearchBar={true}
      showTabs={true}
      modalTitle="Choose Emoji"
      modalBackgroundColor={AppTheme.colors.card}
      modalBorderRadius={AppTheme.borderRadius.xl}
      searchPlaceholder="Search emojis..."
      searchPlaceholderColor={AppTheme.colors.onSurfaceVariant}
      searchIconColor={AppTheme.colors.onSurfaceVariant}
      clearIconColor={AppTheme.colors.onSurfaceVariant}
      modalCloseIconColor={AppTheme.colors.onSurface}
      tabIconColors={{
        'Recently Used': AppTheme.colors.primary,
        'Smileys & Emotion': AppTheme.colors.secondary,
        'People & Body': AppTheme.colors.tertiary,
        'Food & Drink': '#FF6B35',
        'Travel & Places': '#4ECDC4',
        'Activities': '#45B7D1',
        'Objects': '#96CEB4',
        'Symbols': '#FFEAA7',
        'Flags': '#DDA0DD',
      }}
      activeTabStyle={{
        backgroundColor: AppTheme.colors.primaryContainer,
        borderRadius: AppTheme.borderRadius.md,
      }}
      tabStyle={{
        borderRadius: AppTheme.borderRadius.md,
      }}
      categoryTitleStyle={{
        color: AppTheme.colors.onSurface,
        fontSize: 16,
        fontWeight: '600',
      }}
      searchContainerStyle={{
        backgroundColor: AppTheme.colors.surfaceVariant,
        borderRadius: AppTheme.borderRadius.md,
        marginHorizontal: AppTheme.spacing.md,
        marginBottom: AppTheme.spacing.sm,
      }}
      searchInputStyle={{
        color: AppTheme.colors.onSurface,
        fontSize: 16,
      }}
    />
  );
});
