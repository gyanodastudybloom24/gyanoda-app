import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import { FlatList, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { SolarIcon } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Header, customAlert } from '@/components/ui';
import {
  BottomTabInset,
  Fonts,
  MaxContentWidth,
  Palette,
  Rounded,
  Spacing,
} from '@/constants/theme';
import { coursesData } from '@/data';
import { useEnrolledCourses } from '@/hooks/use-enrolled-courses';
import { useTheme } from '@/hooks/use-theme';
import type { CourseItem } from '@/types';
import type { MainTabScreenProps, RootStackParamList } from '@/types/navigation';

export type CoursesScreenProps = MainTabScreenProps<'Courses'>;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ENROLLED_CARD_WIDTH = 260;
const BUTTON_SIZE = 46;
const STROKE_WIDTH = 3;
const RADIUS = (BUTTON_SIZE - STROKE_WIDTH) / 2;
const CENTER = BUTTON_SIZE / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function EnrolledCourseCard({ item }: { item: CourseItem }) {
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
    navigation.navigate('CourseDetails', {
      courseId: item.id,
      title: item.title,
    });
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

function CourseCard({ item }: { item: CourseItem }) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const scale = useSharedValue(1);
  const theme = useTheme();

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
    navigation.navigate('CourseDetails', {
      courseId: item.id,
      title: item.title,
    });
  };

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${item.subtitle}`}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
        animatedStyle,
      ]}>
      {/* Full Image Covered */}
      <Image
        source={{ uri: item.imageUrl }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={300}
      />

      {/* Top Left Title and Subtitle */}
      <View style={styles.cardHeader}>
        <ThemedText style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </ThemedText>
        <ThemedText style={styles.cardSubtitle} numberOfLines={2}>
          {item.subtitle}
        </ThemedText>
      </View>

      {/* Bottom Right Rounded Button with Arrow Up Right Icon */}
      <View
        style={[
          styles.actionButton,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: theme.border,
          },
        ]}>
        <SolarIcon name="ArrowRightUp" type="linear" size={20} color={theme.text} />
      </View>
    </AnimatedPressable>
  );
}

export function CoursesScreen({ navigation: _navigation }: CoursesScreenProps) {
  const theme = useTheme();
  const isDark = theme.background === '#121212';
  const [searchQuery, setSearchQuery] = useState('');
  const enrolledCourses = useEnrolledCourses();

  const handleFilterPress = () => {
    customAlert.show({
      title: 'Filter Courses',
      message: 'Filter courses by subject, grade, and schedule.',
      type: 'info',
    });
  };

  const filteredEnrolledCourses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return enrolledCourses;
    return enrolledCourses.filter(
      (course) =>
        course.title.toLowerCase().includes(q) ||
        course.subtitle.toLowerCase().includes(q)
    );
  }, [enrolledCourses, searchQuery]);

  const filteredCourses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return coursesData;
    return coursesData.filter(
      (course) =>
        course.title.toLowerCase().includes(q) ||
        course.subtitle.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Group into pairs for a 2-column grid matching the study section on the home screen
  const courseRows = useMemo(() => {
    const rows: CourseItem[][] = [];
    for (let i = 0; i < filteredCourses.length; i += 2) {
      rows.push(filteredCourses.slice(i, i + 2));
    }
    return rows;
  }, [filteredCourses]);

  return (
    <ThemedView style={styles.container}>
      <Header title="Courses" align="center" />

      {/* Search Bar with Search Icon & Filter Icon */}
      <View style={styles.searchRow}>
        <View style={[styles.searchBar, { backgroundColor: theme.backgroundElement }]}>
          <SolarIcon name="Magnifer" type="linear" size={18} color={theme.textSecondary} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search courses, subjects..."
            placeholderTextColor={theme.textSecondary}
            style={[styles.searchInput, { color: theme.text }]}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              onPress={() => setSearchQuery('')}
              hitSlop={8}>
              <SolarIcon name="CloseCircle" type="bold" size={16} color={theme.textSecondary} />
            </Pressable>
          )}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Filter courses"
          onPress={handleFilterPress}
          style={({ pressed }) => [
            styles.filterButton,
            { backgroundColor: theme.backgroundElement },
            pressed && styles.pressed,
          ]}>
          <SolarIcon name="Filter" type="linear" size={20} color={theme.text} />
        </Pressable>
      </View>

      {/* Courses Scroll Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Section 1: My Enrollments */}
          <View style={styles.enrolledSection}>
            <View style={styles.sectionHeaderRow}>
              <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
                My Enrollments
              </ThemedText>
              {filteredEnrolledCourses.length > 0 && (
                <View
                  style={[
                    styles.enrolledCountBadge,
                    {
                      backgroundColor: isDark
                        ? 'rgba(56, 128, 255, 0.16)'
                        : 'rgba(56, 128, 255, 0.1)',
                    },
                  ]}>
                  <Text
                    style={[
                      styles.enrolledCountText,
                      { color: Palette.brand.primary },
                    ]}>
                    {`${filteredEnrolledCourses.length} ${filteredEnrolledCourses.length === 1 ? 'Course' : 'Courses'}`}
                  </Text>
                </View>
              )}
            </View>

            {filteredEnrolledCourses.length > 0 ? (
              <FlatList
                horizontal
                data={filteredEnrolledCourses}
                keyExtractor={(item) => `enrolled-${item.id}`}
                renderItem={({ item }) => <EnrolledCourseCard item={item} />}
                showsHorizontalScrollIndicator={false}
                style={styles.enrolledList}
                contentContainerStyle={styles.enrolledListContent}
              />
            ) : (
              <View
                style={[
                  styles.emptyEnrolledCard,
                  {
                    backgroundColor: theme.backgroundElement,
                    borderColor: theme.border,
                  },
                ]}>
                <SolarIcon name="BookBookmark" type="linear" size={22} color={theme.textSecondary} />
                <ThemedText style={[styles.emptyEnrolledText, { color: theme.textSecondary }]}>
                  {searchQuery.trim()
                    ? 'No enrolled courses match your search'
                    : 'You have not enrolled in any course yet'}
                </ThemedText>
              </View>
            )}
          </View>

          {/* Section 2: Listed Courses */}
          <View style={styles.listedCoursesSection}>
            <View style={styles.sectionHeaderRow}>
              <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
                Listed Courses
              </ThemedText>
              <View
                style={[
                  styles.enrolledCountBadge,
                  {
                    backgroundColor: isDark
                      ? 'rgba(56, 128, 255, 0.16)'
                      : 'rgba(56, 128, 255, 0.1)',
                  },
                ]}>
                <Text
                  style={[
                    styles.enrolledCountText,
                    { color: Palette.brand.primary },
                  ]}>
                  {`${filteredCourses.length} ${filteredCourses.length === 1 ? 'Course' : 'Courses'}`}
                </Text>
              </View>
            </View>

            {filteredCourses.length === 0 ? (
              <View style={styles.emptyContainer}>
                <SolarIcon name="Book2" type="linear" size={48} themeColor="muted" />
                <ThemedText style={[styles.emptyTitle, { color: theme.text }]}>
                  No Matches Found
                </ThemedText>
                <ThemedText style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                  {`No courses matching "${searchQuery.trim()}". Try a different search term.`}
                </ThemedText>
              </View>
            ) : (
              <View style={styles.grid}>
                {courseRows.map((pair, rowIndex) => (
                  <View key={`row-${rowIndex}`} style={styles.row}>
                    {pair.map((item) => (
                      <CourseCard key={item.id} item={item} />
                    ))}
                    {pair.length === 1 && <View style={styles.cardPlaceholder} />}
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.one,
    paddingBottom: Spacing.three,
  },
  searchBar: {
    flex: 1,
    height: 44,
    borderRadius: Rounded.full,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontFamily: Fonts?.sans,
    fontSize: 14,
    paddingVertical: 0,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: Rounded.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: BottomTabInset + Spacing.four,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.one,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  enrolledSection: {
    marginBottom: Spacing.four,
  },
  listedCoursesSection: {
    marginBottom: Spacing.four,
  },
  emptyEnrolledCard: {
    padding: Spacing.four,
    borderRadius: Rounded.card,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.two,
    marginVertical: Spacing.one,
  },
  emptyEnrolledText: {
    fontFamily: Fonts?.sans,
    fontSize: 13,
    fontWeight: '500',
  },
  enrolledCountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Rounded.full,
  },
  enrolledCountText: {
    fontFamily: Fonts?.sans,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  enrolledList: {
    marginHorizontal: -Spacing.four,
  },
  enrolledListContent: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    paddingBottom: 16, // ensures overhanging circular play button is never clipped
  },
  enrolledContainer: {
    width: ENROLLED_CARD_WIDTH,
    position: 'relative',
  },
  enrolledCard: {
    width: ENROLLED_CARD_WIDTH,
    aspectRatio: 16 / 9, // Strictly 16:9 ratio matching RecentlyWatchedCard
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
  sectionTitle: {
    fontFamily: Fonts?.sans,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  grid: {
    width: '100%',
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  card: {
    flex: 1,
    aspectRatio: 1, // Standard 1:1 rounded square shape matching home study section
    borderRadius: Rounded.card, // 24px clean soft rounded corners
    overflow: 'hidden',
    padding: Spacing.three,
    justifyContent: 'space-between',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardPlaceholder: {
    flex: 1,
  },
  cardHeader: {
    zIndex: 2,
    gap: 3,
  },
  cardTitle: {
    fontFamily: Fonts?.sans,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardSubtitle: {
    fontFamily: Fonts?.sans,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  actionButton: {
    position: 'absolute',
    bottom: Spacing.one, // 4px offset - prevents touching the corner while staying tucked into bottom-right
    right: Spacing.one,
    width: 48,
    height: 48,
    borderRadius: Rounded.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    zIndex: 3,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.six,
    alignSelf: 'center',
    maxWidth: 280,
  },
  emptyTitle: {
    fontFamily: Fonts?.sans,
    fontSize: 18,
    fontWeight: '700',
    marginTop: Spacing.two,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: Fonts?.sans,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
});
