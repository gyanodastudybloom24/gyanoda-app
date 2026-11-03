import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, ThemeColor, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return <Text style={[{ color: theme[themeColor ?? 'text'] }, styles[type], style]} {...rest} />;
}

const styles = StyleSheet.create({
  small: {
    fontFamily: Fonts?.sans,
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.lineHeight,
    fontWeight: 500,
  },
  smallBold: {
    fontFamily: Fonts?.sans,
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.lineHeight,
    fontWeight: Typography.heading.fontWeight,
  },
  default: {
    fontFamily: Fonts?.sans,
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.lineHeight,
    fontWeight: 500,
  },
  title: {
    fontFamily: Fonts?.sans,
    fontSize: 48,
    fontWeight: Typography.heading.fontWeight,
    letterSpacing: -0.96, // -0.02em of 48
    lineHeight: 52,
  },
  subtitle: {
    fontFamily: Fonts?.sans,
    fontSize: 32,
    fontWeight: Typography.heading.fontWeight,
    letterSpacing: -0.64, // -0.02em of 32
    lineHeight: 44,
  },
  link: {
    fontFamily: Fonts?.sans,
    lineHeight: 30,
    fontSize: Typography.body.fontSize,
  },
  linkPrimary: {
    fontFamily: Fonts?.sans,
    lineHeight: 30,
    fontSize: Typography.body.fontSize,
    color: '#3c87f7',
  },
  code: {
    fontFamily: Fonts?.mono,
    fontWeight: Platform.select({ android: 700 }) ?? 500,
    fontSize: 12,
  },
});
