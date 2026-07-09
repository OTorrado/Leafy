import {
  Fredoka_400Regular,
  Fredoka_500Medium,
  Fredoka_600SemiBold,
  Fredoka_700Bold,
  useFonts,
} from '@expo-google-fonts/fredoka';
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
  const [fontsLoaded, fontError] = useFonts({
    Fredoka_400Regular,
    Fredoka_500Medium,
    Fredoka_600SemiBold,
    Fredoka_700Bold,
    Poppins_500Medium: require('@expo-google-fonts/poppins/500Medium/Poppins_500Medium.ttf'),
    Poppins_600SemiBold: require('@expo-google-fonts/poppins/600SemiBold/Poppins_600SemiBold.ttf'),
    Poppins_700Bold: require('@expo-google-fonts/poppins/700Bold/Poppins_700Bold.ttf'),
    Quicksand_500Medium: require('@expo-google-fonts/quicksand/500Medium/Quicksand_500Medium.ttf'),
    Quicksand_600SemiBold: require('@expo-google-fonts/quicksand/600SemiBold/Quicksand_600SemiBold.ttf'),
    Quicksand_700Bold: require('@expo-google-fonts/quicksand/700Bold/Quicksand_700Bold.ttf'),
  });

  const ready = !isLoading && (fontsLoaded || !!fontError);

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  // Keep the splash screen up until onboarding state and fonts are ready.
  if (!ready) {
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
