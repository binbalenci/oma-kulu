import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Provider as PaperProvider } from "react-native-paper";
import "react-native-reanimated";

import PasscodeGate from "@/components/passcode-gate";
import { SnackbarProvider } from "@/components/snackbar-provider";
import { MonthProvider } from "@/lib/month-context";
import { AppTheme } from "@/constants/AppTheme";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const [unlocked, setUnlocked] = React.useState(true);

  return (
    <PaperProvider theme={AppTheme}>
      <ThemeProvider value={DefaultTheme}>
        <SnackbarProvider>
          <MonthProvider>
            {unlocked ? (
              <>
                <Stack>
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="modal" options={{ presentation: "modal", title: "Modal" }} />
                </Stack>
                <StatusBar style="light" />
              </>
            ) : (
              <PasscodeGate onUnlocked={() => setUnlocked(true)} />
            )}
          </MonthProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </PaperProvider>
  );
}
