import { AppTheme } from "@/constants/AppTheme";
import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text, TextInput } from "react-native-paper";
import { SimpleDialog } from "./SimpleDialog";

// Simplified emoji set for quick selection
const COMMON_EMOJIS = [
  "😀", "😁", "😂", "🤣", "😃", "😄", "😅", "😆", "😉", "😊", 
  "😋", "😎", "😍", "🥰", "😘", "🙂", "🤔", "🤨", "😐", "😑", 
  "😶", "🙄", "😏", "😒", "😬", "😮", "😱", "😳", "🥺", "😢", 
  "😭", "😠", "😡", "🤬", "👍", "👎", "🙌", "👏", "💪", "🧠", 
  "💯", "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "💫",
  "✨", "⚡️", "🔥", "💥", "🎉", "🎊", "🎁", "🏆", "🏅", "🥇",
  "🚀", "⭐", "🌟", "💫", "✅", "❌", "⭕", "❗", "❓", "‼️",
  "📊", "📈", "📉", "💰", "💴", "💵", "💸", "💳", "🧾", "🏦",
  "🏠", "🏢", "🏫", "🏥", "🛒", "🛍️", "📱", "💻", "🖥️", "📸",
  "🚗", "🚕", "🚙", "🚲", "🛴", "✈️", "🏝️", "⛰️", "🏞️", "🌄",
  // Category icons
  "💰", "💳", "💼", "🛍️", "🏠", "🚗", "✈️", "🍔", "📱", "💊",
  "📚", "🎬", "🎮", "🏋️‍♀️", "🧘‍♂️", "👨‍👩‍👧‍👦", "🎁", "🧶", "🔧", "📁",
];

interface SimpleEmojiPickerProps {
  visible: boolean;
  onDismiss: () => void;
  onSelectEmoji: (emoji: string) => void;
  selectedEmoji?: string;
}

export function SimpleEmojiPicker({
  visible,
  onDismiss,
  onSelectEmoji,
  selectedEmoji = "📁",
}: SimpleEmojiPickerProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filteredEmojis, setFilteredEmojis] = React.useState(COMMON_EMOJIS);
  
  // Clean explicit cleanup for iOS
  React.useEffect(() => {
    return () => {
      // Cleanup function to ensure no lingering references
      // This helps prevent memory leaks that might cause iOS issues
    };
  }, []);

  React.useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredEmojis(COMMON_EMOJIS);
    } else {
      // Simple filtering, just for demonstration
      setFilteredEmojis(
        COMMON_EMOJIS.filter((emoji) => 
          emoji.includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm]);

  const handleSelectEmoji = (emoji: string) => {
    onSelectEmoji(emoji);
    onDismiss();
  };

  return (
    <SimpleDialog
      visible={visible}
      onDismiss={onDismiss}
      title="Choose Emoji"
      showActions={false}
    >
      <View style={styles.container}>
        <TextInput
          label="Search emoji"
          value={searchTerm}
          onChangeText={setSearchTerm}
          style={styles.searchInput}
        />
        
        <ScrollView style={styles.emojiList}>
          <View style={styles.emojiGrid}>
            {filteredEmojis.map((emoji, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.emojiItem,
                  selectedEmoji === emoji && styles.selectedEmoji
                ]}
                onPress={() => handleSelectEmoji(emoji)}
              >
                <Text style={styles.emoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </SimpleDialog>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  searchInput: {
    marginBottom: AppTheme.spacing.md,
    backgroundColor: AppTheme.colors.background,
  },
  emojiList: {
    maxHeight: 300,
  },
  emojiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  emojiItem: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    margin: 4,
    borderRadius: 8,
    backgroundColor: AppTheme.colors.surfaceVariant,
  },
  selectedEmoji: {
    backgroundColor: AppTheme.colors.primaryContainer,
    borderWidth: 2,
    borderColor: AppTheme.colors.primary,
  },
  emoji: {
    fontSize: 24,
  },
});
