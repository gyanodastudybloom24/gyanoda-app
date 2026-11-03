import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { SolarIcon } from '@/components/icons';
import { Fonts, Palette, Rounded, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { YearWiseItem } from '@/types/courses';

export const YEAR_CARD_WIDTH = 260;
const BUTTON_SIZE = 46;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface YearWiseCardProps {
  item: YearWiseItem;
  fallbackImage: string;
  onPress: (item: YearWiseItem) => void;
}

export function YearWiseCard({ item, fallbackImage, onPress }: YearWiseCardProps) {
  const theme = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={`Year ${item.year}: ${item.description}, Duration ${item.duration}`}
      onPress={() => onPress(item)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.yearContainer, animatedStyle]}>
      {/* 16:9 Ratio Compact Card matching Recently Watched Card */}
      <View
        style={[
          styles.yearCard,
          {
            borderColor: theme.border,
            backgroundColor: theme.backgroundElement,
          },
        ]}>
        {/* 16:9 Online Image Thumbnail */}
        <Image
          source={{ uri: item.thumbnailUrl ?? fallbackImage }}
          style={styles.yearThumbnail}
          contentFit="cover"
          transition={300}
        />

        {/* Gradient Scrim for text readability over thumbnail */}
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.35)', 'rgba(0, 0, 0, 0.45)', 'rgba(0, 0, 0, 0.85)']}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        {/* Card Content: Year + Calendar badge, Description, and Duration */}
        <View style={styles.yearCardContent}>
          <View style={styles.yearCardTop}>
            <Text style={styles.yearCardYear}>{item.year}</Text>
            <View style={styles.yearBadge}>
              <SolarIcon
                name="Calendar"
                type="bold"
                size={13}
                color="#ffffff"
              />
            </View>
          </View>

          <Text style={styles.yearCardDesc} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.yearCardBottom}>
            <View style={styles.yearMetaRow}>
              <SolarIcon
                name="ClockCircle"
                type="linear"
                size={13}
                color="#ffffff"
              />
              <Text style={styles.yearDurationText}>{item.duration}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Play Button: Circular, black constant background, solid white border, positioned at bottom-right, NO progress indicator */}
      <View style={styles.yearPlayButton}>
        <SolarIcon
          name="Play"
          type="bold"
          size={18}
          color="#ffffff"
          style={styles.yearPlayIcon}
        />
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  yearContainer: {
    width: YEAR_CARD_WIDTH,
    position: 'relative',
  },
  yearCard: {
    width: YEAR_CARD_WIDTH,
    aspectRatio: 16 / 9, // Strictly 16:9 ratio
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
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
  yearThumbnail: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  yearCardContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: Spacing.three,
    justifyContent: 'space-between',
    zIndex: 2,
  },
  yearCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  yearCardYear: {
    fontFamily: Fonts?.sans,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  yearBadge: {
    width: 26,
    height: 26,
    borderRadius: Rounded.full,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearCardDesc: {
    fontFamily: Fonts?.sans,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.95)',
    marginRight: 44, // leaves clear space for the play button at bottom-right
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  yearCardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  yearMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  yearDurationText: {
    fontFamily: Fonts?.sans,
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  yearPlayButton: {
    position: 'absolute',
    bottom: -13, // Overhangs bottom edge per sketch
    right: 14,   // Original proportioned position
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: Palette.foreground, // Constant black/charcoal
    borderWidth: 3,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  yearPlayIcon: {
    marginLeft: 2,
  },
});

