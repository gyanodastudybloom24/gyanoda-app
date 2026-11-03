import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Palette, Rounded, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { CourseItem } from '@/types/courses';
import type { RootStackParamList } from '@/types/navigation';

export const ENROLLED_CARD_WIDTH = 260;
const BUTTON_SIZE = 46;
const STROKE_WIDTH = 3;
const RADIUS = (BUTTON_SIZE - STROKE_WIDTH) / 2;
const CENTER = BUTTON_SIZE / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface EnrolledCourseCardProps {
  item: CourseItem;
  onPress?: (item: CourseItem) => void;
}

export function EnrolledCourseCard({ item, onPress }: EnrolledCourseCardProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const theme = useTheme();
  const scale = useSharedValue(1);

  // Watch progress percentage matching RecentlyWatchedCard (e.g. 0.70)
  const progress = Math.min(
    Math.max(typeof item.progress === 'number' ? item.progress : 0.7, 0),
    1
  );
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
    if (onPress) {
      onPress(item);
    } else {
      navigation.navigate('CourseDetails', {
        courseId: item.id,
        title: item.title,
      });
    }
  };

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={`Enrolled course: ${item.title}`}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.enrolledContainer, animatedStyle]}>
      {/* 16:9 Ratio Compact Card with Online Image and Title with Transparent Background */}
      <View
        style={[
          styles.enrolledCard,
          {
            borderColor: theme.border,
            backgroundColor: theme.backgroundElement,
          },
        ]}>
        {/* 16:9 Online Image Thumbnail */}
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.enrolledThumbnail}
          contentFit="cover"
          transition={300}
        />

        {/* Video Title with strictly transparent background (no scrim/overlay) */}
        <View style={styles.enrolledTitleContainer}>
          <ThemedText style={styles.enrolledVideoTitle} numberOfLines={2}>
            {item.title}
          </ThemedText>
        </View>
      </View>

      {/* Play Button: Circular, black constant background, no shadow, positioned at bottom-right */}
      <View style={styles.enrolledPlayButton}>
        {/* Progress border: start & end of white smoothly mix with the accent color */}
        <Svg
          width={BUTTON_SIZE}
          height={BUTTON_SIZE}
          style={StyleSheet.absoluteFill}>
          <Defs>
            {/* Light accent arc where both ends seamlessly merge with the white base border */}
            <LinearGradient
              id={`lightAccentMergeEnrolled-${item.id}`}
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
            stroke={`url(#lightAccentMergeEnrolled-${item.id})`}
            strokeWidth={STROKE_WIDTH}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${CENTER} ${CENTER})`}
            fill="none"
          />
        </Svg>

        <ThemedText style={styles.enrolledPercentageText}>
          {`${Math.round(progress * 100)}%`}
        </ThemedText>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  enrolledContainer: {
    width: ENROLLED_CARD_WIDTH,
    position: 'relative',
    paddingBottom: 16,
  },
  enrolledCard: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: Rounded.card,
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
  enrolledThumbnail: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  enrolledTitleContainer: {
    position: 'absolute',
    bottom: Spacing.two,
    left: Spacing.two + 2,
    right: 64, // Leaves clean space for the play button at bottom-right
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  enrolledVideoTitle: {
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
  enrolledPlayButton: {
    position: 'absolute',
    bottom: -13, // Overhangs bottom edge per RecentlyWatchedCard design
    right: 14,
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
  enrolledPercentageText: {
    color: '#ffffff',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    fontFamily: Fonts?.sans,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
});

