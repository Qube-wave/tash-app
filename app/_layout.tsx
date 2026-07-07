import '@/global.css';

import { fontAssets } from '@/constants/fonts';
import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from 'expo-router/react-navigation';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SessionProvider } from '@/providers/session-provider';
import { OnboardingProvider } from '@/providers/onboarding-provider';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { Uniwind } from 'uniwind';
import { useEffect } from 'react';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

// Keep the splash screen visible while we load fonts
SplashScreen.preventAutoHideAsync();
Uniwind.setTheme('light');

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ThemeProvider value={NAV_THEME.light}>
      <KeyboardProvider>
        <SessionProvider>
          <OnboardingProvider>
            <StatusBar style={'dark'} />
            <Stack screenOptions={{ headerShown: false }} />
            <PortalHost />
          </OnboardingProvider>
        </SessionProvider>
      </KeyboardProvider>
    </ThemeProvider>
  );
}
