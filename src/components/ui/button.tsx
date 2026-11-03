import { type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type StyleProp,
  Text,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Fonts, Rounded, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonRounded = 'default' | 'md' | 'full';

export type ButtonProps = {
  children?: ReactNode;
  title?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  rounded?: ButtonRounded;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  testID?: string;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  children,
  title,
  variant = 'primary',
  size = 'md',
  rounded = 'full',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  onPress,
  style,
  textStyle,
  testID,
}: ButtonProps) {
  const theme = useTheme();
  const scale = useSharedValue(1);

  const borderRadius = Rounded[rounded];
  const isDisabled = disabled || loading;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!isDisabled) {
      scale.value = withSpring(0.96, { damping: 15, stiffness: 350 });
    }
  };

  const handlePressOut = () => {
    if (!isDisabled) {
      scale.value = withSpring(1, { damping: 15, stiffness: 350 });
    }
  };

  // Color schemes based on variant
  const getVariantStyles = (): { container: ViewStyle; text: TextStyle; indicatorColor: string } => {
    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: theme.brand,
            borderWidth: 0,
          },
          text: {
            color: '#ffffff',
          },
          indicatorColor: '#ffffff',
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: theme.accent,
            borderWidth: 0,
          },
          text: {
            color: '#ffffff',
          },
          indicatorColor: '#ffffff',
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: theme.brand,
          },
          text: {
            color: theme.brand,
          },
          indicatorColor: theme.brand,
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 0,
          },
          text: {
            color: theme.text,
          },
          indicatorColor: theme.text,
        };
      case 'destructive':
        return {
          container: {
            backgroundColor: '#ef4444',
            borderWidth: 0,
          },
          text: {
            color: '#ffffff',
          },
          indicatorColor: '#ffffff',
        };
    }
  };

  const sizeStyles = {
    sm: {
      paddingVertical: Spacing.one + 2,
      paddingHorizontal: Spacing.three,
      minHeight: 36,
      fontSize: 13,
      gap: Spacing.one,
    },
    md: {
      paddingVertical: Spacing.two + 2,
      paddingHorizontal: Spacing.four,
      minHeight: 44,
      fontSize: 14,
      gap: Spacing.two,
    },
    lg: {
      paddingVertical: Spacing.three,
      paddingHorizontal: Spacing.five,
      minHeight: 52,
      fontSize: 16,
      gap: Spacing.two,
    },
  }[size];

  const variantStyle = getVariantStyles();
  const content = children ?? (title ? <Text>{title}</Text> : null);

  return (
    <AnimatedPressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      onPress={isDisabled ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.base,
        {
          borderRadius,
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          minHeight: sizeStyles.minHeight,
          gap: sizeStyles.gap,
          opacity: isDisabled ? 0.5 : 1,
        },
        variantStyle.container,
        animatedStyle,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator size="small" color={variantStyle.indicatorColor} />
      ) : (
        <>
          {icon && iconPosition === 'left' ? icon : null}
          <Text
            style={[
              styles.text,
              {
                fontSize: sizeStyles.fontSize,
                fontFamily: Fonts?.sans,
              },
              variantStyle.text,
              textStyle,
            ]}>
            {content}
          </Text>
          {icon && iconPosition === 'right' ? icon : null}
        </>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
});
