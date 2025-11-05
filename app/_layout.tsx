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
import { isSessionValid } from "@/lib/session";

// Initialize Sentry
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  sendDefaultPii: true,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.mobileReplayIntegration(),
  ],
});

// Set up logger environment
logger.setEnvironment(__DEV__ ? 'development' : 'production');

export const unstable_settings = {
  anchor: "(tabs)",
};

function RootLayoutComponent() {
  const [unlocked, setUnlocked] = React.useState(false);
  const [isCheckingSession, setIsCheckingSession] = React.useState(true);

  // Check for valid session on app startup
  React.useEffect(() => {
    const checkSession = async () => {
      try {
        const hasValidSession = await isSessionValid();
        if (hasValidSession) {
          logger.breadcrumb("Valid session found, skipping passcode gate", "session");
          setUnlocked(true);
        } else {
          logger.breadcrumb("No valid session found, showing passcode gate", "session");
          setUnlocked(false);
        }
      } catch (error) {
        logger.error(error as Error, { operation: "check_session" });
        setUnlocked(false);
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkSession();
  }, []);

  // Show loading state while checking session
  if (isCheckingSession) {
    return null; // Or you could show a loading spinner here
  }

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
