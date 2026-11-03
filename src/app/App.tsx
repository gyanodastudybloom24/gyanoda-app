import { DarkTheme, DefaultTheme, NavigationContainer, Theme } from '@react-navigation/native';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as SplashScreen from 'expo-splash-screen';
import { setStatusBarStyle, StatusBar, type StatusBarStyle } from 'expo-status-bar';
import { useCallback, useEffect, useMemo } from 'react';
import { StatusBar as RNStatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from './navigation/RootNavigator';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AlertProvider } from '@/components/ui/alert';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Splash screen might already be hidden or not available in the current environment
});

export default function App() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
  }, []);

  const syncStatusBar = useCallback(() => {
    const style: StatusBarStyle = isDark ? 'light' : 'dark';
    setStatusBarStyle(style, true);
    RNStatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content', true);
  }, [isDark]);

  useEffect(() => {
    syncStatusBar();
  }, [syncStatusBar]);

  const navigationTheme: Theme = useMemo(() => {
    const baseTheme = isDark ? DarkTheme : DefaultTheme;
    return {
      ...baseTheme,
      dark: isDark,
      colors: {
        ...baseTheme.colors,
        primary: colors.brand,
        background: colors.background,
        card: colors.card,
        text: colors.text,
        border: colors.border,
        notification: colors.accent,
      },
    };
  }, [colors, isDark]);

  return (
    <SafeAreaProvider>
      <AlertProvider>
        <NavigationContainer
          theme={navigationTheme}
          onReady={syncStatusBar}
          onStateChange={syncStatusBar}>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <AnimatedSplashOverlay />
          <RootNavigator />
        </NavigationContainer>
      </AlertProvider>
    </SafeAreaProvider>
  );
}
