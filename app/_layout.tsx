import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Provider as PaperProvider } from "react-native-paper";
import "react-native-reanimated";

import PasscodeGate from "@/components/passcode-gate";
import { SnackbarProvider } from "@/components/snackbar-provider";
import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [unlocked, setUnlocked] = React.useState(true);

  return (
    <PaperProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <SnackbarProvider>
          {unlocked ? (
            <>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: "modal", title: "Modal" }} />
              </Stack>
              <StatusBar style="auto" />
            </>
          ) : (
            <PasscodeGate onUnlocked={() => setUnlocked(true)} />
          )}
        </SnackbarProvider>
      </ThemeProvider>
    </PaperProvider>
  );
}
