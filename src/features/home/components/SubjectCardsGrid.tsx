import { useMemo, useState } from 'react';
import { LayoutChangeEvent, Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { SolarIcon } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { customAlert } from '@/components/ui';
import { Fonts, Rounded, Spacing } from '@/constants/theme';
import { studySubjects } from '@/data';
import { useEnrolledCourses } from '@/hooks/use-enrolled-courses';
import { useSubscription } from '@/hooks/use-subscription';
import { useTheme } from '@/hooks/use-theme';
import type { SubjectItem } from '@/types';
import type { RootStackParamList } from '@/types/navigation';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function SubjectCard({ item }: { item: SubjectItem }) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const theme = useTheme();
  const isDark = theme.background === '#121212';
  const scale = useSharedValue(1);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  const { tier } = useSubscription();
  const enrolledCourses = useEnrolledCourses();

  const hasSubjectAccess = useMemo(() => {
    if (tier === 'pro' || tier === 'plus') return true;
    return enrolledCourses.some((c) => {
      if (item.id === 'all') return enrolledCourses.length > 0;
      return (
        c.subjectId === item.id ||
        c.id === item.id ||
        c.id === `course-${item.id}` ||
        c.id.includes(item.id)
      );
    });
  }, [tier, enrolledCourses, item.id]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = () => {
    if (!hasSubjectAccess) {
      customAlert.show({
        title: `Enroll in ${item.title} First`,
        message: `You haven't enrolled in any ${item.title} course yet. Explore our courses and enroll in a starter pack to unlock learning!`,
        type: 'confirm',
        buttons: [
          {
            text: 'Explore Courses',
            style: 'primary',
            onPress: () => {
              navigation.navigate('Main', { screen: 'Courses' });
            },
          },
        ],
      });
      return;
    }

    navigation.navigate('CourseAccess', {
      subjectId: item.id,
      title: item.title,
    });
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setDimensions({ width: Math.round(width), height: Math.round(height) });
    }
  };

  const cardBg = isDark ? '#1e2230' : item.fadeColor;
  const gradientStart = isDark ? '#1e293b' : item.fadeColor;
  const gradientMid = isDark ? '#1e2230' : item.midColor;
  const gradientEnd = item.primaryColor;
  const titleColor = isDark ? '#ffffff' : item.titleColor;
  const subtitleColor = isDark ? 'rgba(255, 255, 255, 0.75)' : 'rgba(30, 41, 59, 0.7)';

  const cardWidth = dimensions.width > 0 ? dimensions.width : '100%';
  const cardHeight = dimensions.height > 0 ? dimensions.height : '100%';

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${item.subtitle}`}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onLayout={handleLayout}
      style={[styles.card, { backgroundColor: cardBg }, animatedStyle]}>
      {/* Edge-to-edge full bleed gradient covering 100% of the card */}
      <Svg
        width={cardWidth}
        height={cardHeight}
        style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient
            id={`diag-${item.id}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%">
            <Stop offset="0%" stopColor={gradientStart} stopOpacity="1" />
            <Stop offset="55%" stopColor={gradientMid} stopOpacity="1" />
            <Stop offset="100%" stopColor={gradientEnd} stopOpacity="1" />
          </LinearGradient>
        </Defs>

        <Rect
          x="0"
          y="0"
          width={cardWidth}
          height={cardHeight}
          fill={`url(#diag-${item.id})`}
        />
      </Svg>

      {/* Top-Left Title & Subtitle */}
      <View style={styles.textContainer}>
        <ThemedText style={[styles.cardTitle, { color: titleColor }]}>
          {item.title}
        </ThemedText>
        <ThemedText style={[styles.cardSubtitle, { color: subtitleColor }]}>
          {item.subtitle}
        </ThemedText>
      </View>

      {/* Crisp watermark icon at bottom-right corner: half visible, outer half clipped */}
      <View style={styles.iconSlot} pointerEvents="none">
        <SolarIcon
          name={item.icon as any}
          type="bold"
          size={84}
          color="#ffffff"
        />
      </View>
    </AnimatedPressable>
  );
}

export function SubjectCardsGrid() {
  return (
    <View style={styles.container}>
      {/* Row 1: Physics and Chemistry */}
      <View style={styles.row}>
        <SubjectCard item={studySubjects[0]} />
        <SubjectCard item={studySubjects[1]} />
      </View>

      {/* Row 2: Maths and All */}
      <View style={styles.row}>
        <SubjectCard item={studySubjects[2]} />
        <SubjectCard item={studySubjects[3]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 12,
    marginTop: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  card: {
    flex: 1,
    aspectRatio: 1, // Standard 1:1 rounded square shape
    borderRadius: Rounded.card, // Clean soft rounded corners
    overflow: 'hidden',
    padding: Spacing.three,
    justifyContent: 'space-between',
    borderWidth: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 0, // Prevents Android native grey background rendering
      },
    }),
  },
  textContainer: {
    zIndex: 2,
    gap: 3,
  },
  cardTitle: {
    fontFamily: Fonts?.sans,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  cardSubtitle: {
    fontFamily: Fonts?.sans,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  iconSlot: {
    position: 'absolute',
    bottom: -18,
    right: -18,
    zIndex: 1,
    opacity: 0.88, // Crisp and brightly visible white against saturated primary color corner
  },
});
