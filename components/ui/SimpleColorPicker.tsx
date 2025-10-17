import { AppTheme } from "@/constants/AppTheme";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import { Dialog } from "./Dialog";

// Define a set of colors that work well for UI elements
const COLOR_PALETTE = [
  // Blues
  "#1e40af", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd",
  // Reds
  "#b91c1c", "#dc2626", "#ef4444", "#f87171", "#fca5a5",
  // Greens
  "#166534", "#16a34a", "#22c55e", "#4ade80", "#86efac",
  // Yellows
  "#a16207", "#ca8a04", "#eab308", "#facc15", "#fde047",
  // Purples
  "#6b21a8", "#8b5cf6", "#a855f7", "#c084fc", "#d8b4fe",
  // Pinks
  "#9d174d", "#db2777", "#ec4899", "#f472b6", "#f9a8d4",
  // Oranges
  "#c2410c", "#ea580c", "#f97316", "#fb923c", "#fdba74",
  // Teals
  "#115e59", "#14b8a6", "#2dd4bf", "#5eead4", "#99f6e4",
  // Grays
  "#1f2937", "#4b5563", "#6b7280", "#9ca3af", "#d1d5db",
  // Special
  "#000000", "#ffffff",
];

interface SimpleColorPickerProps {
  visible: boolean;
  onDismiss: () => void;
  onSelectColor: (color: string) => void;
  selectedColor?: string;
}

export function SimpleColorPicker({
  visible,
  onDismiss,
  onSelectColor,
  selectedColor = "#2563eb",
}: SimpleColorPickerProps) {
  const [tempColor, setTempColor] = React.useState(selectedColor);

  React.useEffect(() => {
    if (visible) {
      setTempColor(selectedColor);
    }
  }, [visible, selectedColor]);

  const handleSave = () => {
    onSelectColor(tempColor);
    onDismiss();
  };

  const handleCancel = () => {
    onDismiss();
  };

  return (
    <Dialog
      visible={visible}
      onDismiss={handleCancel}
      title="Choose Color"
      onSave={handleSave}
      saveText="Select"
      cancelText="Cancel"
    >
      <View style={styles.container}>
        <View style={styles.previewContainer}>
          <View style={[styles.colorPreview, { backgroundColor: tempColor }]} />
          <Text style={styles.colorText}>{tempColor}</Text>
        </View>

        <Text style={styles.sectionTitle}>Select a Color</Text>

        <View style={styles.colorGrid}>
          {COLOR_PALETTE.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorOption,
                { backgroundColor: color },
                tempColor === color && styles.selectedColor,
              ]}
              onPress={() => setTempColor(color)}
              activeOpacity={0.7}
            />
          ))}
        </View>
      </View>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    padding: AppTheme.spacing.md,
  },
  previewContainer: {
    alignItems: "center",
    marginBottom: AppTheme.spacing.lg,
  },
  colorPreview: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: AppTheme.colors.border,
    marginBottom: AppTheme.spacing.sm,
  },
  colorText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: AppTheme.spacing.md,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 4,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: "#000",
  },
});

