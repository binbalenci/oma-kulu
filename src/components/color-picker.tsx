import Slider from "@react-native-community/slider";
import React from "react";
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Button, IconButton, Portal, Text } from "react-native-paper";

const PRESET_COLORS = [
  "#f44336",
  "#e91e63",
  "#9c27b0",
  "#673ab7",
  "#3f51b5",
  "#2196f3",
  "#03a9f4",
  "#00bcd4",
  "#009688",
  "#4caf50",
  "#8bc34a",
  "#cddc39",
  "#ffeb3b",
  "#ffc107",
  "#ff9800",
  "#ff5722",
  "#795548",
  "#9e9e9e",
  "#607d8b",
  "#000000",
  "#ffffff",
];

interface ColorPickerProps {
  selectedColor: string;
  onSelectColor: (color: string) => void;
}

function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHSL(hex: string): { h: number; s: number; l: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 0, s: 50, l: 50 };

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function ColorPicker({ selectedColor, onSelectColor }: ColorPickerProps) {
  const [visible, setVisible] = React.useState(false);
  const [tempColor, setTempColor] = React.useState(selectedColor);
  const hsl = hexToHSL(tempColor);
  const [hue, setHue] = React.useState(hsl.h);
  const [saturation, setSaturation] = React.useState(hsl.s);
  const [lightness, setLightness] = React.useState(hsl.l);

  React.useEffect(() => {
    const newColor = hslToHex(hue, saturation, lightness);
    setTempColor(newColor);
  }, [hue, saturation, lightness]);

  const handleOpen = () => {
    setTempColor(selectedColor);
    const currentHSL = hexToHSL(selectedColor);
    setHue(currentHSL.h);
    setSaturation(currentHSL.s);
    setLightness(currentHSL.l);
    setVisible(true);
  };

  const handleSave = () => {
    onSelectColor(tempColor);
    setVisible(false);
  };

  return (
    <>
      <TouchableOpacity onPress={handleOpen} style={styles.colorButton}>
        <View style={[styles.colorPreview, { backgroundColor: selectedColor }]} />
        <Text variant="bodyMedium">{selectedColor}</Text>
      </TouchableOpacity>

      <Portal>
        <Modal visible={visible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.header}>
                <Text variant="titleLarge">Pick a Color</Text>
                <IconButton icon="close" onPress={() => setVisible(false)} />
              </View>

              <View style={styles.previewContainer}>
                <View style={[styles.largePreview, { backgroundColor: tempColor }]} />
                <Text variant="bodyLarge">{tempColor}</Text>
              </View>

              <View style={styles.slidersContainer}>
                <View style={styles.sliderRow}>
                  <Text style={styles.sliderLabel}>Hue</Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={360}
                    value={hue}
                    onValueChange={setHue}
                    minimumTrackTintColor="#2196f3"
                    maximumTrackTintColor="#ccc"
                  />
                  <Text style={styles.sliderValue}>{Math.round(hue)}°</Text>
                </View>

                <View style={styles.sliderRow}>
                  <Text style={styles.sliderLabel}>Saturation</Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={100}
                    value={saturation}
                    onValueChange={setSaturation}
                    minimumTrackTintColor="#2196f3"
                    maximumTrackTintColor="#ccc"
                  />
                  <Text style={styles.sliderValue}>{Math.round(saturation)}%</Text>
                </View>

                <View style={styles.sliderRow}>
                  <Text style={styles.sliderLabel}>Lightness</Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={100}
                    value={lightness}
                    onValueChange={setLightness}
                    minimumTrackTintColor="#2196f3"
                    maximumTrackTintColor="#ccc"
                  />
                  <Text style={styles.sliderValue}>{Math.round(lightness)}%</Text>
                </View>
              </View>

              <Text variant="labelLarge" style={{ marginTop: 16, marginBottom: 8 }}>
                Presets
              </Text>
              <View style={styles.presetsScrollContainer}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.presetsContainer}
                >
                  {PRESET_COLORS.map((color) => (
                    <TouchableOpacity
                      key={color}
                      onPress={() => {
                        const newHSL = hexToHSL(color);
                        setHue(newHSL.h);
                        setSaturation(newHSL.s);
                        setLightness(newHSL.l);
                      }}
                      style={[
                        styles.presetColor,
                        { backgroundColor: color },
                        tempColor === color && styles.selectedPreset,
                      ]}
                    />
                  ))}
                </ScrollView>
              </View>

              <View style={styles.actions}>
                <Button mode="outlined" onPress={() => setVisible(false)}>
                  Cancel
                </Button>
                <Button mode="contained" onPress={handleSave}>
                  Select
                </Button>
              </View>
            </View>
          </View>
        </Modal>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  colorButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f5f5f5",
  },
  colorPreview: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ccc",
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
    padding: 20,
    width: "90%",
    maxWidth: 400,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  previewContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  largePreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#ccc",
    marginBottom: 8,
  },
  slidersContainer: {
    gap: 16,
  },
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sliderLabel: {
    width: 80,
    fontSize: 14,
  },
  slider: {
    flex: 1,
  },
  sliderValue: {
    width: 50,
    textAlign: "right",
    fontSize: 14,
  },
  presetsScrollContainer: {
    width: "100%",
    height: 60,
  },
  presetsContainer: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  presetColor: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  selectedPreset: {
    borderWidth: 3,
    borderColor: "#2196f3",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 24,
  },
});
