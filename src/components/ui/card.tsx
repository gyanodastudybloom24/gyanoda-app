import { type PropsWithChildren, type ReactNode } from 'react';
import { Pressable, StyleSheet, type StyleProp, View, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Rounded, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type CardVariant = 'default' | 'outlined' | 'elevated' | 'brand' | 'accent';
export type CardRounded = 'default' | 'md' | 'card' | 'full';

export type CardProps = PropsWithChildren<{
  variant?: CardVariant;
  rounded?: CardRounded;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}>;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Card({
  children,
  variant = 'default',
  rounded = 'card',
  onPress,
  style,
  testID,
}: CardProps) {
  const theme = useTheme();
  const scale = useSharedValue(1);

  const borderRadius = Rounded[rounded];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    }
  };

  const variantStyles = {
    default: {
      backgroundColor: theme.card,
      borderColor: theme.border,
      borderWidth: 1,
    },
    outlined: {
      backgroundColor: 'transparent',
      borderColor: theme.border,
      borderWidth: 1.5,
    },
    elevated: {
      backgroundColor: theme.card,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    brand: {
      backgroundColor: theme.brand,
      borderColor: theme.brand,
    },
    accent: {
      backgroundColor: theme.accent,
      borderColor: theme.accent,
    },
  }[variant];

  if (onPress) {
    return (
      <AnimatedPressable
        testID={testID}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.base, { borderRadius }, variantStyles, animatedStyle, style]}>
        {children}
      </AnimatedPressable>
    );
  }

  return (
    <View testID={testID} style={[styles.base, { borderRadius }, variantStyles, style]}>
      {children}
    </View>
  );
}

export function CardHeader({
  children,
  style,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[styles.header, style]}>{children}</View>;
}

export function CardTitle({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <ThemedText type="smallBold" style={[styles.title, style]}>
      {children}
    </ThemedText>
  );
}

export function CardDescription({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <ThemedText type="small" themeColor="muted" style={style}>
      {children}
    </ThemedText>
  );
}

export function CardContent({
  children,
  style,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[styles.content, style]}>{children}</View>;
}

export function CardFooter({
  children,
  style,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[styles.footer, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    padding: Spacing.four,
    gap: Spacing.two,
  },
  header: {
    gap: Spacing.one,
  },
  title: {
    fontSize: 16,
    lineHeight: 22,
  },
  content: {
    gap: Spacing.two,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
});
