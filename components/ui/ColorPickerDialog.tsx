import { AppTheme } from "@/constants/AppTheme";
import React from "react";
import { StyleSheet, View } from "react-native";
import ColorPicker, {
  HueSlider,
  OpacitySlider,
  Panel1,
  Preview,
  Swatches,
} from "reanimated-color-picker";
import { Dialog } from "./Dialog";

interface ColorPickerDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onSelectColor: (color: string) => void;
  selectedColor?: string;
}

export function ColorPickerDialog({
  visible,
  onDismiss,
  onSelectColor,
  selectedColor = "#2563EB",
}: ColorPickerDialogProps) {
  const [tempColor, setTempColor] = React.useState(selectedColor);

  React.useEffect(() => {
    if (visible) {
      setTempColor(selectedColor);
    }
  }, [visible, selectedColor]);

  const handleColorChange = ({ hex }: { hex: string }) => {
    setTempColor(hex);
  };

  const handleSave = () => {
    onSelectColor(tempColor);
    onDismiss();
  };

  const handleCancel = () => {
    setTempColor(selectedColor);
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
        <View style={styles.pickerWrapper}>
          <ColorPicker value={tempColor} onComplete={handleColorChange}>
            <Preview style={styles.preview} />
            <Panel1 style={styles.panel} />
            <HueSlider style={styles.slider} />
            <OpacitySlider style={styles.slider} />
            <Swatches
              style={styles.swatches}
              colors={[
                "#f44336",
                "#E91E63",
                "#9C27B0",
                "#673AB7",
                "#3F51B5",
                "#2196F3",
                "#03A9F4",
                "#00BCD4",
                "#009688",
                "#4CAF50",
                "#8BC34A",
                "#CDDC39",
                "#FFEB3B",
                "#FFC107",
                "#FF9800",
                "#FF5722",
                "#795548",
                "#9E9E9E",
                "#607D8B",
              ]}
            />
          </ColorPicker>
        </View>
      </View>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    width: "100%",
  },
  pickerWrapper: {
    width: "100%",
  },
  preview: {
    height: 50,
    borderRadius: AppTheme.borderRadius.md,
    marginBottom: AppTheme.spacing.md,
  },
  panel: {
    height: 180,
    borderRadius: AppTheme.borderRadius.md,
    marginBottom: AppTheme.spacing.md,
  },
  slider: {
    height: 35,
    borderRadius: AppTheme.borderRadius.sm,
    marginBottom: AppTheme.spacing.sm,
  },
  swatches: {
    height: 40,
    borderRadius: AppTheme.borderRadius.md,
    marginBottom: 0,
  },
});
