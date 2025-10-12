import React from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import EmojiSelector from "react-native-emoji-selector";
import { IconButton, Portal, Text } from "react-native-paper";

interface IconPickerProps {
  selectedIcon: string;
  onSelectIcon: (icon: string) => void;
}

export function IconPicker({ selectedIcon, onSelectIcon }: IconPickerProps) {
  const [visible, setVisible] = React.useState(false);

  const handleSelect = (emoji: string) => {
    onSelectIcon(emoji);
    setVisible(false);
  };

  return (
    <>
      <TouchableOpacity onPress={() => setVisible(true)} style={styles.iconButton}>
        <Text style={styles.iconPreview}>{selectedIcon}</Text>
        <Text variant="bodySmall">Tap to change</Text>
      </TouchableOpacity>

      <Portal>
        <Modal visible={visible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.header}>
                <Text variant="titleLarge">Pick an Icon</Text>
                <IconButton icon="close" onPress={() => setVisible(false)} />
              </View>

              <EmojiSelector
                onEmojiSelected={handleSelect}
                showSearchBar
                showTabs
                showHistory={false}
                showSectionTitles
                columns={8}
                placeholder="Search emoji..."
              />
            </View>
          </View>
        </Modal>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f5f5f5",
  },
  iconPreview: {
    fontSize: 48,
    marginBottom: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    width: "90%",
    maxWidth: 400,
    height: "70%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
});
