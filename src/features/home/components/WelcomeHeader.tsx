import { useEffect } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { MembershipBadge, MembershipTier } from '@/components/ui';
import { Fonts, Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { WelcomeMessage } from '@/types';

export type WelcomeHeaderProps = {
  data: WelcomeMessage;
  /**
   * Duration of the gooey blur fade-in slow animation in milliseconds
   * @default 1150
   */
  duration?: number;
  tier?: MembershipTier;
  onTierPress?: () => void;
};

export function WelcomeHeader({
  data,
  duration = 1150,
  tier = 'free',
  onTierPress,
}: WelcomeHeaderProps) {
  const theme = useTheme();

  // Animated values for greeting gooey blur entrance
  const greetingOpacity = useSharedValue(0);
  const greetingTranslateY = useSharedValue(12);
  const greetingBlur = useSharedValue(14);

  // Animated values for title/quote slow gooey blur bloom
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(18);
  const titleScale = useSharedValue(0.94);
  const titleBlur = useSharedValue(22);

  // Animated values for subtitle
  const subtitleOpacity = useSharedValue(0);
  const subtitleTranslateY = useSharedValue(12);

  useEffect(() => {
    // Reset to initial states
    greetingOpacity.value = 0;
    greetingTranslateY.value = 12;
    greetingBlur.value = 14;

    titleOpacity.value = 0;
    titleTranslateY.value = 18;
    titleScale.value = 0.94;
    titleBlur.value = 22;

    subtitleOpacity.value = 0;
    subtitleTranslateY.value = 12;

    // Organic gooey easing curve (slow, cinematic, fluid deceleration)
    const gooeyEasing = Easing.bezier(0.16, 1, 0.3, 1);

    // 1. Greeting softly materializes
    greetingOpacity.value = withTiming(1, { duration: duration * 0.75, easing: gooeyEasing });
    greetingTranslateY.value = withTiming(0, { duration: duration * 0.75, easing: gooeyEasing });
    greetingBlur.value = withTiming(0, { duration: duration * 0.75, easing: gooeyEasing });

    // 2. Entire Quote / Title blooms with slow gooey blur fade-in
    titleOpacity.value = withDelay(
      100,
      withTiming(1, { duration, easing: gooeyEasing })
    );
    titleTranslateY.value = withDelay(
      100,
      withTiming(0, { duration, easing: gooeyEasing })
    );
    titleScale.value = withDelay(
      100,
      withTiming(1, { duration: duration * 1.05, easing: gooeyEasing })
    );
    titleBlur.value = withDelay(
      100,
      withTiming(0, { duration: duration * 0.95, easing: gooeyEasing })
    );

    // 3. Subtitle smoothly follows
    subtitleOpacity.value = withDelay(
      320,
      withTiming(1, { duration: duration * 0.8, easing: gooeyEasing })
    );
    subtitleTranslateY.value = withDelay(
      320,
      withTiming(0, { duration: duration * 0.8, easing: gooeyEasing })
    );
  }, [
    data.title,
    data.greeting,
    duration,
    greetingOpacity,
    greetingTranslateY,
    greetingBlur,
    titleOpacity,
    titleTranslateY,
    titleScale,
    titleBlur,
    subtitleOpacity,
    subtitleTranslateY,
  ]);

  const animatedGreetingStyle = useAnimatedStyle(() => {
    const style: Record<string, unknown> = {
      opacity: greetingOpacity.value,
      transform: [{ translateY: greetingTranslateY.value }],
    };

    if (Platform.OS === 'web') {
      style.filter = `blur(${greetingBlur.value}px)`;
      style.willChange = 'filter, opacity, transform';
    }

    return style;
  });

  const animatedTitleStyle = useAnimatedStyle(() => {
    const style: Record<string, unknown> = {
      opacity: titleOpacity.value,
      transform: [
        { translateY: titleTranslateY.value },
        { scale: titleScale.value },
      ],
    };

    if (Platform.OS === 'web') {
      style.filter = `blur(${titleBlur.value}px)`;
      style.willChange = 'filter, opacity, transform';
    }

    return style;
  });

  const animatedSubtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: subtitleTranslateY.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Greeting line (e.g. "Hello, Ankan") with membership tier badge */}
      {data.greeting ? (
        <Animated.View style={[styles.greetingRow, animatedGreetingStyle]}>
          <Text style={[styles.greeting, { color: theme.muted }]}>
            {data.greeting}
          </Text>
          <MembershipBadge tier={tier} onPress={onTierPress} />
        </Animated.View>
      ) : null}

      {/* Large quote / title with slow gooey blur fade-in */}
      <Animated.View style={animatedTitleStyle}>
        <Text style={[styles.title, { color: theme.text }]}>
          {data.title}
        </Text>
      </Animated.View>

      {/* Optional subtitle if provided */}
      {data.subtitle ? (
        <Animated.View style={[styles.subtitleContainer, animatedSubtitleStyle]}>
          <Text style={[styles.subtitle, { color: theme.muted }]}>
            {data.subtitle}
          </Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingTop: Spacing.two,
    paddingBottom: Spacing.four,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.one,
  },
  greeting: {
    fontFamily: Fonts?.sans,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  title: {
    fontFamily: Fonts?.sans,
    fontSize: 38,
    lineHeight: 44,
    fontWeight: Typography.heading.fontWeight,
    letterSpacing: -0.8,
  },
  subtitleContainer: {
    marginTop: Spacing.two,
  },
  subtitle: {
    fontFamily: Fonts?.sans,
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.lineHeight,
  },
});
