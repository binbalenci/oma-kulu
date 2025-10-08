import React from "react";
import { StyleSheet, View } from "react-native";
import { Snackbar } from "react-native-paper";

interface SnackbarContextType {
  showSnackbar: (message: string, duration?: number) => void;
}

const SnackbarContext = React.createContext<SnackbarContextType | undefined>(undefined);

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [duration, setDuration] = React.useState(3000);

  const showSnackbar = React.useCallback((msg: string, dur: number = 3000) => {
    setMessage(msg);
    setDuration(dur);
    setVisible(true);
  }, []);

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      <View style={{ flex: 1 }}>
        {children}
        {visible && (
          <View style={styles.snackbarContainer} pointerEvents="box-none">
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
    top: 70,
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
