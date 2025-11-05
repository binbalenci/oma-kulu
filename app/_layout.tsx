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

/**
 * Initialize Sentry error monitoring and performance tracking
 *
 * This function configures Sentry with optimal settings for mobile app monitoring:
 * - Error tracking with detailed context and breadcrumbs
 * - Performance monitoring for user interactions
 * - Session replay for debugging user issues
 * - Mobile-specific integrations and optimizations
 */
function initializeSentry() {
  // Core Sentry Configuration
  Sentry.init({
    // Data Source Name - identifies this app in Sentry dashboard
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,

    // Privacy & Data Collection Settings
    // Send Personally Identifiable Information (device info, user context)
    sendDefaultPii: true,

    // Performance Monitoring
    // Sample rate for tracing (10% of interactions are monitored for performance)
    tracesSampleRate: 0.1,

    // Session Replay Configuration
    // Sample rate for session replays (10% of sessions recorded)
    replaysSessionSampleRate: 0.1,
    // Always capture replays when errors occur (100% of error sessions)
    replaysOnErrorSampleRate: 1.0,

    // Integrations - Mobile-specific features
    integrations: [
      // Mobile replay integration for session recording and debugging
      Sentry.mobileReplayIntegration(),
    ],

    // Development & Debugging
    // Enable console logs to be captured and sent to Sentry
    enableLogs: true,
  });
}

/**
 * Initialize application monitoring and logging environment
 *
 * Sets up the logging system with appropriate environment context
 * for development vs production error reporting and analytics.
 */
function initializeMonitoring() {
  // Initialize Sentry error monitoring first
  initializeSentry();

  // Configure logger environment for consistent tagging
  logger.setEnvironment(__DEV__ ? 'development' : 'production');
}

// Initialize monitoring on module load
initializeMonitoring();

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
