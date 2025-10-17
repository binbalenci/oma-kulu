import React from "react";
import { Dimensions, Platform, StyleSheet, View } from "react-native";
import { Snackbar } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SnackbarContextType {
  showSnackbar: (message: string, duration?: number) => void;
}

const SnackbarContext = React.createContext<SnackbarContextType | undefined>(undefined);

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [duration, setDuration] = React.useState(3000);
  const insets = useSafeAreaInsets();

  const showSnackbar = React.useCallback((msg: string, dur: number = 3000) => {
    setMessage(msg);
    setDuration(dur);
    setVisible(true);
  }, []);

  // Calculate dynamic position based on platform, safe area, and screen size
  const getSnackbarTop = React.useCallback(() => {
    const { height: screenHeight } = Dimensions.get('window');
    const baseOffset = insets.top;
    
    // Platform-specific adjustments with screen size consideration
    if (Platform.OS === 'ios') {
      // iOS: Account for status bar + header height
      // Use a combination of fixed offset and percentage for different screen sizes
      const headerHeight = Math.max(90, screenHeight * 0.08); // At least 70px, or 8% of screen height
      return baseOffset + headerHeight;
    } else {
      // Android: Account for status bar + action bar height
      // Action bar is typically 56dp + status bar
      const actionBarHeight = Math.max(70, screenHeight * 0.07); // At least 56px, or 7% of screen height
      return baseOffset + actionBarHeight;
    }
  }, [insets.top]);

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      <View style={{ flex: 1 }}>
        {children}
        {visible && (
          <View style={[styles.snackbarContainer, { top: getSnackbarTop() }]} pointerEvents="box-none">
            <Snackbar
              visible={visible}
              onDismiss={() => setVisible(false)}
              duration={duration}
              action={{
                label: "OK",
                onPress: () => setVisible(false),
              }}
              style={styles.snackbar}
            >
              {message}
            </Snackbar>
          </View>
        )}
      </View>
    </SnackbarContext.Provider>
  );
}

const styles = StyleSheet.create({
  snackbarContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 9999,
  },
  snackbar: {
    marginHorizontal: 16,
  },
});

export function useSnackbar() {
  const context = React.useContext(SnackbarContext);
  if (!context) {
    throw new Error("useSnackbar must be used within a SnackbarProvider");
  }
  return context;
}
