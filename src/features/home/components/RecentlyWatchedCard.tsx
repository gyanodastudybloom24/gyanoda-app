import { Image } from 'expo-image';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { customAlert } from '@/components/ui';
import { Fonts, Palette, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { RecentlyWatchedItem } from '@/types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const RECENT_CARD_WIDTH = 260;
const BUTTON_SIZE = 46;
const STROKE_WIDTH = 3;
const RADIUS = (BUTTON_SIZE - STROKE_WIDTH) / 2;
const CENTER = BUTTON_SIZE / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export interface RecentlyWatchedCardProps {
  item: RecentlyWatchedItem;
}

export function RecentlyWatchedCard({ item }: RecentlyWatchedCardProps) {
  const theme = useTheme();
  const scale = useSharedValue(1);

  // Watch progress percentage (e.g. 0.72)
  const progress = Math.min(Math.max(typeof item.progress === 'number' ? item.progress : 0.7, 0), 1);
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = () => {
    customAlert.show({
      title: item.title,
      message: `Resuming video playback for ${item.title}...`,
      type: 'info',
    });
  };

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={`Recently watched video: ${item.title}`}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, animatedStyle]}>
      {/* 16:9 Ratio Compact Card with Online Image and Title with Transparent Background */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.backgroundElement,
          },
        ]}>
        {/* 16:9 Online Image Thumbnail */}
        <Image
          source={{ uri: item.thumbnailUrl }}
          style={styles.thumbnail}
          contentFit="cover"
          transition={300}
        />

        {/* Video Title with strictly transparent background (no scrim/overlay) */}
        <View style={styles.titleContainer}>
          <ThemedText style={styles.videoTitle} numberOfLines={2}>
            {item.title}
          </ThemedText>
        </View>
      </View>

      {/* Play Button: Circular, black constant background, no shadow, positioned at bottom-right */}
      <View style={styles.playButton}>
        {/* Progress border: start & end of white smoothly mix with the accent color */}
        <Svg
          width={BUTTON_SIZE}
          height={BUTTON_SIZE}
          style={StyleSheet.absoluteFill}>
          <Defs>
            {/* Light accent arc where both ends seamlessly merge with the white base border */}
            <LinearGradient
              id={`lightAccentMerge-${item.id}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%">
              <Stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <Stop offset="12%" stopColor="#fb923c" stopOpacity="1" />
              <Stop offset="88%" stopColor="#fb923c" stopOpacity="1" />
              <Stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
            </LinearGradient>
          </Defs>

          {/* Base border: Solid White */}
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            stroke="#ffffff"
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />

          {/* Light Accent watched portion: both ends merge with bg white without sudden cuts */}
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            stroke={`url(#lightAccentMerge-${item.id})`}
            strokeWidth={STROKE_WIDTH}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${CENTER} ${CENTER})`}
            fill="none"
          />
        </Svg>

        <ThemedText style={styles.percentageText}>
          {`${Math.round(progress * 100)}%`}
        </ThemedText>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: RECENT_CARD_WIDTH,
    position: 'relative',
  },
  card: {
    width: RECENT_CARD_WIDTH,
    aspectRatio: 16 / 9, // Strictly 16:9 ratio
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  thumbnail: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  titleContainer: {
    position: 'absolute',
    bottom: Spacing.two,
    left: Spacing.two + 2,
    right: 64, // Leaves clean space for the play button at bottom-right
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  videoTitle: {
    color: '#ffffff',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
    fontFamily: Fonts?.sans,
    backgroundColor: 'transparent',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  playButton: {
    position: 'absolute',
    bottom: -13, // Overhangs bottom edge per sketch
    right: 14,   // Original proportioned position
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: Palette.foreground, // Constant black/charcoal
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
    borderWidth: 0,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  percentageText: {
    color: '#ffffff',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    fontFamily: Fonts?.sans,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
});
