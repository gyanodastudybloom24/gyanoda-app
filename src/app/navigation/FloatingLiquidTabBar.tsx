import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { GlassView } from 'expo-glass-effect';
import { useEffect } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { SolarIcon } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { Fonts, Rounded } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { triggerHaptic } from '@/utils';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const TAB_CONFIG: Record<
  string,
  {
    label: string;
    icon: 'Home2' | 'Book2' | 'ClipboardCheck' | 'SquareAcademicCap2';
  }
> = {
  Home: {
    label: 'Home',
    icon: 'Home2',
  },
  Courses: {
    label: 'Courses',
    icon: 'Book2',
  },
  Test: {
    label: 'Test',
    icon: 'ClipboardCheck',
  },
  Study: {
    label: 'Study',
    icon: 'SquareAcademicCap2',
  },
};

interface TabItemProps {
  routeName: string;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

// Gentle, low-intensity spring transition (no wobbling, smooth elastic glide)
const layoutTransition = LinearTransition.springify()
  .damping(28)
  .stiffness(160)
  .mass(0.6);

function TabItem({ routeName, isFocused, onPress, onLongPress }: TabItemProps) {
  const theme = useTheme();
  const config = TAB_CONFIG[routeName] ?? { label: routeName, icon: 'Home2' };

  const pressScale = useSharedValue(1);
  const titleSlide = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    if (isFocused) {
      titleSlide.value = 0;
      titleSlide.value = withSpring(1, {
        damping: 26,
        stiffness: 180,
        mass: 0.6,
      });
    } else {
      titleSlide.value = withTiming(0, { duration: 110 });
    }
  }, [isFocused, titleSlide]);

  const animatedScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  // Low-intensity, subtle 6px slide up with fade-in for title
  const animatedTitleStyle = useAnimatedStyle(() => ({
    opacity: titleSlide.value,
    transform: [
      {
        translateY: (1 - titleSlide.value) * 6,
      },
    ],
  }));

  const handlePressIn = () => {
    pressScale.value = withSpring(0.96, { damping: 24, stiffness: 320 });
  };

  const handlePressOut = () => {
    pressScale.value = withSpring(1, { damping: 24, stiffness: 320 });
  };

  const handlePress = () => {
    triggerHaptic(20);
    onPress();
  };

  return (
    <Animated.View layout={layoutTransition} style={styles.tabItemWrapper}>
      <AnimatedPressable
        accessibilityRole="button"
        accessibilityState={{ selected: isFocused }}
        accessibilityLabel={`${config.label} tab`}
        hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}
        onPress={handlePress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          isFocused ? styles.activePill : styles.inactiveTab,
          isFocused && { backgroundColor: theme.brand },
          animatedScaleStyle,
        ]}>
        {/* Icon: Solid white when focused, muted when inactive */}
        <SolarIcon
          name={config.icon}
          type={isFocused ? 'bold' : 'linear'}
          size={isFocused ? 19 : 22}
          color={isFocused ? '#ffffff' : theme.muted}
        />

        {/* Title: Solid white, smoothly slides right next to icon from the bottom */}
        {isFocused && (
          <Animated.View style={[styles.titleContainer, animatedTitleStyle]}>
            <ThemedText style={styles.activeTitle} numberOfLines={1}>
              {config.label}
            </ThemedText>
          </Animated.View>
        )}
      </AnimatedPressable>
    </Animated.View>
  );
}

export function FloatingLiquidTabBar({ state, descriptors: _descriptors, navigation }: BottomTabBarProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const insets = useSafeAreaInsets();

  // Dynamically calculate bottom offset: automatically floats above Android 3-button bar or iOS home bar
  const dynamicBottom = Math.max(insets.bottom, 12) + (Platform.OS === 'android' ? 10 : 8);

  // Only render configured tabs
  const visibleRoutes = state.routes.filter((route) => route.name in TAB_CONFIG);

  return (
    <View style={[styles.floatingWrapper, { bottom: dynamicBottom }]} pointerEvents="box-none">
      <View
        style={[
          styles.frostedGlassContainer,
          {
            backgroundColor: isDark
              ? 'rgba(20, 24, 38, 0.78)'
              : 'rgba(255, 255, 255, 0.82)',
            borderColor: isDark
              ? 'rgba(255, 255, 255, 0.14)'
              : 'rgba(255, 255, 255, 0.65)',
          },
        ]}>
        {/* Native Frosted Liquid Glass layer */}
        <GlassView
          glassEffectStyle="regular"
          colorScheme={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />

        {/* Specular curved liquid shine along the top edge */}
        <Svg
          width="100%"
          height="100%"
          style={StyleSheet.absoluteFill}
          pointerEvents="none">
          <Defs>
            <LinearGradient id="frostedTopShine" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop
                offset="0%"
                stopColor="#ffffff"
                stopOpacity={isDark ? 0.22 : 0.45}
              />
              <Stop
                offset="30%"
                stopColor="#ffffff"
                stopOpacity={isDark ? 0.04 : 0.1}
              />
              <Stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="url(#frostedTopShine)"
          />
        </Svg>

        {/* Tab Items Row with smooth spring layout */}
        <View style={styles.tabsRow}>
          {visibleRoutes.map((route) => {
            const index = state.routes.indexOf(route);
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            return (
              <TabItem
                key={route.key}
                routeName={route.name}
                isFocused={isFocused}
                onPress={onPress}
                onLongPress={onLongPress}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingWrapper: {
    position: 'absolute',
    left: 18,
    right: 18,
    alignSelf: 'center',
    maxWidth: 420,
    zIndex: 100,
  },
  frostedGlassContainer: {
    height: 58,
    borderRadius: Rounded.full,
    borderWidth: 1.2,
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 18,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tabsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    zIndex: 2,
  },
  tabItemWrapper: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inactiveTab: {
    width: 46,
    height: 46,
    borderRadius: Rounded.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePill: {
    height: 46,
    borderRadius: Rounded.full,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#3880FF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  titleContainer: {
    overflow: 'hidden',
  },
  activeTitle: {
    fontFamily: Fonts?.sans,
    fontSize: 12.5,
    lineHeight: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.2,
  },
});
