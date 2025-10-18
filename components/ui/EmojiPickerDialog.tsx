import { AppTheme } from "@/constants/AppTheme";
import EmojiPicker, { emojiData } from "@hiraku-ai/react-native-emoji-picker";
import React from "react";

// Create a curated emoji dataset optimized for categories
// First, let's get a good sample from each category
const getEmojisByCategory = (categoryName: string, limit: number = 50) => {
  return emojiData.filter((emoji: any) => {
    return emoji && emoji.category === categoryName;
  }).slice(0, limit);
};

// Get emojis from each relevant category
const smileysEmojis = getEmojisByCategory('Smileys & Emotion', 60);
const peopleEmojis = getEmojisByCategory('People & Body', 50);
const foodEmojis = getEmojisByCategory('Food & Drink', 60);
const travelEmojis = getEmojisByCategory('Travel & Places', 50);
const activitiesEmojis = getEmojisByCategory('Activities', 40);
const objectsEmojis = getEmojisByCategory('Objects', 60);
const symbolsEmojis = getEmojisByCategory('Symbols', 40);

// Combine all categories
const CATEGORY_EMOJIS = [
  ...smileysEmojis,
  ...peopleEmojis,
  ...foodEmojis,
  ...travelEmojis,
  ...activitiesEmojis,
  ...objectsEmojis,
  ...symbolsEmojis,
];

// Debug: Log category counts
console.log('Category emoji counts:', {
  smileys: smileysEmojis.length,
  people: peopleEmojis.length,
  food: foodEmojis.length,
  travel: travelEmojis.length,
  activities: activitiesEmojis.length,
  objects: objectsEmojis.length,
  symbols: symbolsEmojis.length,
  total: CATEGORY_EMOJIS.length
});

// Fallback: If no emojis after filtering, use a simple slice
const FINAL_EMOJIS = CATEGORY_EMOJIS.length > 0 ? CATEGORY_EMOJIS : emojiData.slice(0, 200);

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
    // Close immediately without delay
    onDismiss();
  }, [onSelectEmoji, onDismiss]);

  // Don't render if not visible to improve performance
  if (!visible) return null;

  return (
    <EmojiPicker
      onEmojiSelect={handleEmojiSelect}
      emojis={FINAL_EMOJIS}
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
      }}
      searchInputStyle={{
        color: AppTheme.colors.onSurface,
      }}
    />
  );
});
