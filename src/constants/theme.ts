/**
 * Below are the colors that are used in the app. The colors are defined in light and dark modes.
 * - Brand (Primary): #3880FF (gradient to #5190FF)
 * - Accent / Secondary: #fc8019
 * - Background: #ffffff
 * - Foreground: #282c3f
 * - Muted: #686b78
 * - Border: #e9e9eb
 * - Card: #ffffff
 * - Dark Background: #121212
 * - Dark Foreground: #e9e9eb
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Palette = {
  brand: {
    primary: '#3880FF',
    light: '#5190FF',
    gradient: {
      from: '#3880FF',
      to: '#5190FF',
    },
  },
  accent: '#fc8019',
  secondary: '#fc8019',
  pinkishRed: '#ff2d55',
  notificationBadge: '#ff2d55',
  foreground: '#282c3f',
  muted: '#686b78',
  border: '#e9e9eb',
  card: '#ffffff',
  background: '#ffffff',
  dark: {
    background: '#121212',
    foreground: '#e9e9eb',
    border: '#282c3f',
    card: '#1a1d29',
    muted: '#686b78',
    pinkishRed: '#ff375f',
    notificationBadge: '#ff375f',
  },
} as const;

export const Colors = {
  light: {
    brand: '#3880FF',
    primary: '#3880FF',
    brandLight: '#5190FF',
    accent: '#fc8019',
    secondary: '#fc8019',
    pinkishRed: '#ff2d55',
    notificationBadge: '#ff2d55',
    text: '#282c3f',
    foreground: '#282c3f',
    background: '#ffffff',
    card: '#ffffff',
    border: '#e9e9eb',
    muted: '#686b78',
    textSecondary: '#686b78',
    backgroundElement: '#e9e9eb',
    backgroundSelected: '#dadae0',
  },
  dark: {
    brand: '#3880FF',
    primary: '#3880FF',
    brandLight: '#5190FF',
    accent: '#fc8019',
    secondary: '#fc8019',
    pinkishRed: '#ff375f',
    notificationBadge: '#ff375f',
    text: '#e9e9eb',
    foreground: '#e9e9eb',
    background: '#121212',
    card: '#1a1d29',
    border: '#282c3f',
    muted: '#686b78',
    textSecondary: '#686b78',
    backgroundElement: '#1e2230',
    backgroundSelected: '#282c3f',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/**
 * Typography design tokens:
 * - fontFamily.sans: "Basis Grotesque Pro, system-ui, sans-serif"
 * - body: fontSize "14px", lineHeight "1.4"
 * - heading: fontWeight "700", letterSpacing "-0.02em"
 */
export const typography = {
  fontFamily: {
    sans: 'Basis Grotesque Pro, system-ui, sans-serif',
  },
  body: {
    fontSize: '14px',
    lineHeight: '1.4',
    /** Numeric values for React Native StyleSheet */
    size: 14,
    lineHeightPx: 20, // Math.round(14 * 1.4)
  },
  heading: {
    fontWeight: '700' as const,
    letterSpacing: '-0.02em',
    /** Numeric ratio for React Native StyleSheet (-0.02em) */
    letterSpacingRatio: -0.02,
  },
} as const;

export const Typography = {
  ...typography,
  fontFamily: typography.fontFamily,
  body: {
    ...typography.body,
    fontSize: 14,
    fontSizeString: '14px',
    lineHeight: 20,
    lineHeightMultiplier: 1.4,
    lineHeightString: '1.4',
  },
  heading: {
    ...typography.heading,
    fontWeight: '700' as const,
    letterSpacing: -0.28,
    letterSpacingString: '-0.02em',
  },
} as const;

/**
 * Border radius tokens:
 * - default: "0px" (sharp edges, marketing)
 * - md: "8px" (UI components soft rounding)
 * - full: "9999px"
 */
export const rounded = {
  default: '0px',
  md: '8px',
  card: '24px',
  lg: '24px',
  full: '9999px',
  /** Numeric values for React Native StyleSheet */
  px: {
    default: 0,
    md: 8,
    card: 24,
    lg: 24,
    full: 9999,
  },
} as const;

export const Rounded = {
  default: 0,
  md: 8,
  card: 24,
  lg: 24,
  full: 9999,
  /** CSS string tokens */
  string: {
    default: '0px',
    md: '8px',
    card: '24px',
    lg: '24px',
    full: '9999px',
  },
} as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'Basis Grotesque Pro, system-ui, sans-serif',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'Basis Grotesque Pro, system-ui, sans-serif',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 116, android: 116 }) ?? 116;
export const MaxContentWidth = 800;
