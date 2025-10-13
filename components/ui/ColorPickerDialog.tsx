import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Button } from 'react-native-paper';
import ColorPicker, { Panel1, Swatches, Preview, OpacitySlider, HueSlider } from 'reanimated-color-picker';
import { Dialog } from './Dialog';
import { AppTheme } from '@/constants/AppTheme';

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
  selectedColor = '#2563EB',
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
        <ColorPicker
          style={styles.colorPicker}
          value={tempColor}
          onComplete={handleColorChange}
        >
          <Preview style={styles.preview} />
          <Panel1 style={styles.panel} />
          <HueSlider style={styles.slider} />
          <OpacitySlider style={styles.slider} />
          <Swatches style={styles.swatches} />
        </ColorPicker>
      </View>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  colorPicker: {
    width: '100%',
  },
  preview: {
    height: 60,
    borderRadius: AppTheme.borderRadius.md,
    marginBottom: AppTheme.spacing.lg,
  },
  panel: {
    height: 200,
    borderRadius: AppTheme.borderRadius.md,
    marginBottom: AppTheme.spacing.lg,
  },
  slider: {
    height: 40,
    borderRadius: AppTheme.borderRadius.sm,
    marginBottom: AppTheme.spacing.md,
  },
  swatches: {
    height: 60,
    borderRadius: AppTheme.borderRadius.md,
  },
});
