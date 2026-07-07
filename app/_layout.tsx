import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { OnboardingProvider, useOnboarding } from '@/components/onboarding-provider';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { configureNotificationHandler } from '@/lib/notifications';

export const unstable_settings = {
  anchor: '(tabs)',
};

SplashScreen.preventAutoHideAsync();
configureNotificationHandler();

function RootNavigator() {
  const { isLoading, hasOnboarded } = useOnboarding();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  // Keep the splash screen up until we know whether onboarding is done.
  if (isLoading) {
    return null;
  }

  return (
    <Stack>
      <Stack.Protected guard={hasOnboarded}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="plant/[id]" options={{ title: 'Plant' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack.Protected>

      <Stack.Protected guard={!hasOnboarded}>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <OnboardingProvider>
        <RootNavigator />
      </OnboardingProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
