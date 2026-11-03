import { useIsFocused } from '@react-navigation/native';
import {
  StatusBar as ExpoStatusBar,
  setStatusBarStyle,
  type StatusBarProps,
  type StatusBarStyle,
} from 'expo-status-bar';
import { useEffect } from 'react';
import { StatusBar as RNStatusBar } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';

export type FocusAwareStatusBarProps = StatusBarProps & {
  dynamic?: boolean;
};

/**
 * Dynamic, focus-aware Status Bar component.
 * Automatically adapts status bar content color (black in light mode, white in dark mode)
 * whenever the screen gains focus.
 */
export function FocusAwareStatusBar({
  style,
  dynamic = true,
  ...props
}: FocusAwareStatusBarProps) {
  const isFocused = useIsFocused();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Dynamic calculation: Light theme -> 'dark' (black content); Dark theme -> 'light' (white content)
  const resolvedStyle: StatusBarStyle = dynamic
    ? (style ?? (isDark ? 'light' : 'dark'))
    : (style ?? 'auto');

  useEffect(() => {
    if (isFocused) {
      // Set via expo-status-bar
      setStatusBarStyle(resolvedStyle, true);
      // Set via React Native StatusBar for maximum platform compatibility
      RNStatusBar.setBarStyle(resolvedStyle === 'light' ? 'light-content' : 'dark-content', true);
    }
  }, [isFocused, resolvedStyle]);

  if (!isFocused) {
    return null;
  }

  return <ExpoStatusBar style={resolvedStyle} {...props} />;
}
