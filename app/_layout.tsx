import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import * as Sentry from '@sentry/react-native';
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Provider as PaperProvider } from "react-native-paper";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

import logger from "@/app/utils/logger";
import PasscodeGate from "@/components/passcode-gate";
import { SnackbarProvider } from "@/components/snackbar-provider";
import { AppTheme } from "@/constants/AppTheme";
import { MonthProvider } from "@/lib/month-context";

// Initialize Sentry
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  sendDefaultPii: true,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

// Set up logger environment
logger.setEnvironment(__DEV__ ? 'development' : 'production');

export const unstable_settings = {
  anchor: "(tabs)",
};

function RootLayoutComponent() {
  const [unlocked, setUnlocked] = React.useState(false);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={AppTheme}>
        <ThemeProvider value={DefaultTheme}>
          <SnackbarProvider>
            <MonthProvider>
              {unlocked ? (
                <>
                  <Stack>
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen
                      name="modal"
                      options={{ presentation: "modal", title: "Modal" }}
                    />
                  </Stack>
                  <StatusBar style="dark" />
                </>
              ) : (
                <PasscodeGate onUnlocked={() => setUnlocked(true)} />
              )}
            </MonthProvider>
          </SnackbarProvider>
        </ThemeProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

export default Sentry.wrap(RootLayoutComponent);
