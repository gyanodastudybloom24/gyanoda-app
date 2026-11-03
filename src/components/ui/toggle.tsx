import { useEffect } from 'react';
import { Pressable, StyleSheet, type StyleProp, View, type ViewStyle } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Rounded, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ToggleSize = 'sm' | 'md' | 'lg';

export type ToggleProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: ToggleSize;
  label?: string;
  description?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function Toggle({
  checked,
  onCheckedChange,
  disabled = false,
  size = 'md',
  label,
  description,
  style,
  testID,
}: ToggleProps) {
  const theme = useTheme();

  // Animation progress: 0 (unchecked) -> 1 (checked)
  const progress = useSharedValue(checked ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(checked ? 1 : 0, {
      damping: 18,
      stiffness: 240,
      mass: 0.8,
    });
  }, [checked, progress]);

  const dimensions = {
    sm: { width: 38, height: 22, thumb: 18, offset: 16 },
    md: { width: 48, height: 28, thumb: 24, offset: 20 },
    lg: { width: 58, height: 34, thumb: 28, offset: 24 },
  }[size];

  const trackAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      [theme.backgroundElement, theme.brand]
    );
    return {
      backgroundColor,
    };
  });

  const thumbAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: progress.value * dimensions.offset }],
    };
  });

  const handlePress = () => {
    if (!disabled) {
      onCheckedChange(!checked);
    }
  };

  const toggleElement = (
    <Pressable
      testID={testID}
      accessibilityRole="switch"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={label}
      onPress={handlePress}
      disabled={disabled}
      style={[
        styles.trackBase,
        {
          width: dimensions.width,
          height: dimensions.height,
          borderRadius: Rounded.full,
          opacity: disabled ? 0.5 : 1,
        },
      ]}>
      <Animated.View
        style={[
          styles.track,
          {
            borderRadius: Rounded.full,
            borderColor: theme.border,
          },
          trackAnimatedStyle,
        ]}>
        <Animated.View
          style={[
            styles.thumb,
            {
              width: dimensions.thumb,
              height: dimensions.thumb,
              borderRadius: Rounded.full,
              backgroundColor: '#ffffff',
            },
            thumbAnimatedStyle,
          ]}
        />
      </Animated.View>
    </Pressable>
  );

  if (label || description) {
    return (
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        style={[styles.container, style]}>
        <View style={styles.textContainer}>
          {label && <ThemedText type="smallBold">{label}</ThemedText>}
          {description && (
            <ThemedText type="small" themeColor="muted">
              {description}
            </ThemedText>
          )}
        </View>
        {toggleElement}
      </Pressable>
    );
  }

  return toggleElement;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
    gap: Spacing.three,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  trackBase: {
    justifyContent: 'center',
  },
  track: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    paddingHorizontal: 2,
    borderWidth: 1,
  },
  thumb: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
});
