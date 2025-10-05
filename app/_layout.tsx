import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Provider as PaperProvider } from 'react-native-paper';
import React from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import PasscodeGate from '@/components/passcode-gate';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [unlocked, setUnlocked] = React.useState(false);

  return (
    <PaperProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        {unlocked ? (
          <>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
            <StatusBar style="auto" />
          </>
        ) : (
          <PasscodeGate onUnlocked={() => setUnlocked(true)} />
        )}
      </ThemeProvider>
    </PaperProvider>
  );
}
