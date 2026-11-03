import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SolarIcon } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { customAlert } from '@/components/ui';
import { Fonts, MaxContentWidth, Palette, Rounded, Spacing } from '@/constants/theme';
import { subjectDetailsMap } from '@/data';
import { YEAR_CARD_WIDTH, YearWiseCard } from '@/features/courses';
import { UpgradeProCard } from '@/features/home/components/UpgradeProCard';
import { useEnrolledCourses } from '@/hooks/use-enrolled-courses';
import { useSubscription } from '@/hooks/use-subscription';
import { useTheme } from '@/hooks/use-theme';
import type { ChapterWiseItem, SubjectAccessData, YearWiseItem } from '@/types';
import type { RootStackScreenProps } from '@/types/navigation';
import { triggerHaptic } from '@/utils';

export type CourseAccessScreenProps = RootStackScreenProps<'CourseAccess'>;
export type { YearWiseItem, ChapterWiseItem, SubjectAccessData };
export { YEAR_CARD_WIDTH };

export function CourseAccessScreen({
  route,
  navigation,
}: CourseAccessScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const subjectId = (route.params?.subjectId ?? 'physics').toLowerCase();

  const currentSubject = useMemo(() => {
    return subjectDetailsMap[subjectId] ?? subjectDetailsMap.physics;
  }, [subjectId]);

  const displayTitle = route.params?.title ?? currentSubject.title ?? 'Physics';

  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuAnim = useSharedValue(0);

  const { tier } = useSubscription();
  const enrolledCourses = useEnrolledCourses();

  // Find enrolled courses matching this subject (or all-subjects master bundle)
  const subjectEnrolledCourses = useMemo(() => {
    return enrolledCourses.filter((course) => {
      if (subjectId === 'all') return true;
      return (
        course.subjectId === subjectId ||
        course.id === subjectId ||
        course.id === `course-${subjectId}` ||
        course.id.includes(subjectId)
      );
    });
  }, [enrolledCourses, subjectId]);

  // If user upgraded to Pro/Plus, or enrolled in a Complete Course / Master Bundle, they have full access!
  const hasFullAccess = useMemo(() => {
    if (tier === 'pro' || tier === 'plus') return true;
    return subjectEnrolledCourses.some(
      (c) => c.category === 'Full Course' || c.category === 'Master Bundle'
    );
  }, [tier, subjectEnrolledCourses]);

  // Primary active enrolled course for this subject (if any)
  const activeEnrolledCourse = useMemo(() => {
    return subjectEnrolledCourses[0] ?? null;
  }, [subjectEnrolledCourses]);

  // Check if content is currently scoped to a Starter Pack or Chapter Pack
  const isStarterScoped = useMemo(() => {
    if (hasFullAccess) return false;
    if (activeEnrolledCourse) {
      return (activeEnrolledCourse.chaptersCount ?? 0) < currentSubject.chapters.length;
    }
    return false;
  }, [hasFullAccess, activeEnrolledCourse, currentSubject.chapters.length]);

  // Dynamic Scoped Years:
  // - If Pro/Plus (Full Access): all years for this subject
  // - If Starter Pack / Chapter Pack: strictly the enrolled years count (e.g. 2 years for starter pack)
  // - If not enrolled & on free tier: preview 1st year (2024)
  const scopedYears = useMemo(() => {
    if (hasFullAccess) return currentSubject.years;
    if (activeEnrolledCourse) {
      const count = activeEnrolledCourse.yearsCount ?? 2;
      return currentSubject.years.slice(0, Math.min(count, currentSubject.years.length));
    }
    return currentSubject.years;
  }, [hasFullAccess, activeEnrolledCourse, currentSubject.years]);

  // Dynamic Scoped Chapters:
  // - If Pro/Plus (Full Access): all chapters for this subject
  // - If Starter Pack / Chapter Pack: strictly the enrolled chapters count (e.g. 2 chapters for starter pack)
  // - If not enrolled & on free tier: preview 1st chapter (01)
  const scopedChapters = useMemo(() => {
    if (hasFullAccess) return currentSubject.chapters;
    if (activeEnrolledCourse) {
      const count = activeEnrolledCourse.chaptersCount ?? 2;
      return currentSubject.chapters.slice(0, Math.min(count, currentSubject.chapters.length));
    }
    return currentSubject.chapters;
  }, [hasFullAccess, activeEnrolledCourse, currentSubject.chapters]);

  // Header description scoped to active enrolled course
  const displayDescription = useMemo(() => {
    if (isStarterScoped && activeEnrolledCourse) {
      return `${activeEnrolledCourse.title}: ${scopedChapters.length} Chapters • ${scopedYears.length} Years (${activeEnrolledCourse.videosCount ?? 15} Videos)`;
    }
    return currentSubject.description;
  }, [isStarterScoped, activeEnrolledCourse, scopedChapters.length, scopedYears.length, currentSubject.description]);

  const filteredYears = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return scopedYears;
    return scopedYears.filter(
      (y) =>
        y.year.toLowerCase().includes(q) ||
        y.title.toLowerCase().includes(q) ||
        y.description.toLowerCase().includes(q)
    );
  }, [scopedYears, searchQuery]);

  const filteredChapters = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return scopedChapters;
    return scopedChapters.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.subtitle.toLowerCase().includes(q) ||
        c.chapterNumber.toLowerCase().includes(q)
    );
  }, [scopedChapters, searchQuery]);

  const handleYearPress = (item: YearWiseItem) => {
    // Check if unlocked
    const isUnlocked = hasFullAccess || scopedYears.some((y) => y.id === item.id);
    if (!isUnlocked) {
      triggerHaptic(20);
      customAlert.show({
        title: 'Gyanoda Pro Required',
        message: `${displayTitle} ${item.year} previous year question solutions are exclusive to Gyanoda Pro & Plus members. Upgrade your plan to unlock all years.`,
        type: 'confirm',
        buttons: [
          {
            text: 'Upgrade Plan',
            style: 'primary',
            onPress: () => {
              triggerHaptic(20);
              navigation.navigate('UpgradePlan');
            },
          },
        ],
      });
      return;
    }

    navigation.navigate('YearPlaylist', {
      yearId: item.id,
      year: item.year,
      subjectId,
      title: `${displayTitle} ${item.year} Solutions`,
      description: item.description,
      imageUrl: item.thumbnailUrl ?? currentSubject.imageUrl,
    });
  };

  const handleChapterPress = (item: ChapterWiseItem) => {
    // Check if unlocked
    const isUnlocked = hasFullAccess || scopedChapters.some((c) => c.id === item.id);
    if (!isUnlocked) {
      triggerHaptic(20);
      customAlert.show({
        title: 'Gyanoda Pro Required',
        message: `${displayTitle} Chapter ${item.chapterNumber} is part of the Gyanoda Pro curriculum. Upgrade your plan to unlock all chapter solutions.`,
        type: 'confirm',
        buttons: [
          {
            text: 'Upgrade Plan',
            style: 'primary',
            onPress: () => {
              triggerHaptic(20);
              navigation.navigate('UpgradePlan');
            },
          },
        ],
      });
      return;
    }

    navigation.navigate('ChapterPlaylist', {
      chapterId: item.id,
      chapterNumber: item.chapterNumber,
      subjectId,
      title: item.title,
      subtitle: item.subtitle,
      description: `Comprehensive year-wise previous year question walkthroughs for Chapter ${item.chapterNumber}: ${item.title}.`,
      imageUrl: currentSubject.imageUrl,
    });
  };

  const animatedMenuStyle = useAnimatedStyle(() => ({
    opacity: menuAnim.value,
    transform: [{ translateY: (1 - menuAnim.value) * -4 }],
  }));

  const toggleMenu = () => {
    if (isMenuOpen) {
      menuAnim.value = withTiming(0, { duration: 100 });
      setIsMenuOpen(false);
    } else {
      setIsMenuOpen(true);
      menuAnim.value = withTiming(1, { duration: 150 });
    }
  };

  const handleSharePress = async () => {
    try {
      await Share.share({
        title: currentSubject.title,
        message: `Check out ${currentSubject.title} on Gyanoda!`,
      });
    } catch {
      customAlert.show({
        title: 'Share Subject',
        message: `Link for ${currentSubject.title} is ready to share.`,
        type: 'info',
      });
    }
  };

  const handleSupportPress = () => {
    setIsMenuOpen(false);
    customAlert.show({
      title: 'Support',
      message: 'Need help? Contact support@gyanoda.edu.',
      type: 'info',
    });
  };

  const handleReportPress = () => {
    setIsMenuOpen(false);
    customAlert.show({
      title: 'Report Content',
      message: 'Would you like to report an issue with this content?',
      type: 'confirm',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit Report',
          style: 'primary',
          onPress: () => {
            customAlert.show({
              title: 'Report Submitted',
              message: 'Thank you for your report.',
              type: 'success',
            });
          },
        },
      ],
    });
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.six },
        ]}
        showsVerticalScrollIndicator={false}>
        {/* 16:12 Media Thumbnail Container matching Course Details */}
        <View style={styles.mediaWrapper}>
          <View style={styles.mediaContainer}>
            <Image
              source={{ uri: currentSubject.imageUrl }}
              style={styles.mediaImage}
              contentFit="cover"
              transition={300}
            />

            {/* White gradient overlay: covered from the bottom, very little visible at the top, slightly diagonal */}
            <LinearGradient
              colors={[
                'rgba(255, 255, 255, 0)',
                'rgba(255, 255, 255, 0.40)',
                'rgba(255, 255, 255, 0.85)',
                'rgba(255, 255, 255, 0.98)',
                '#ffffff',
              ]}
              locations={[0, 0.10, 0.35, 0.58, 0.82]}
              start={{ x: 0.25, y: 0.0 }}
              end={{ x: 0.05, y: 0.95 }}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />

            {/* Subject title & description on the thumbnail moved bit upwards */}
            <View style={styles.thumbnailTitleContainer}>
              <Text style={styles.thumbnailTitle}>{displayTitle}</Text>
              <Text style={styles.thumbnailDescription} numberOfLines={2}>
                {displayDescription}
              </Text>
            </View>
          </View>

          {/* Top Control Bar: Back button on left, Share & 3-dot Menu on right */}
          <View style={styles.topControlBar}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [
                styles.headerButton,
                { backgroundColor: theme.backgroundElement },
                pressed && styles.pressed,
              ]}>
              <SolarIcon
                name="ArrowLeft"
                type="linear"
                size={22}
                color={theme.text}
              />
            </Pressable>

            <View style={styles.rightButtonsRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Share"
                onPress={handleSharePress}
                style={({ pressed }) => [
                  styles.headerButton,
                  { backgroundColor: theme.backgroundElement },
                  pressed && styles.pressed,
                ]}>
                <SolarIcon
                  name="Share"
                  type="linear"
                  size={20}
                  color={theme.text}
                />
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="More options"
                onPress={toggleMenu}
                style={({ pressed }) => [
                  styles.headerButton,
                  { backgroundColor: theme.backgroundElement },
                  pressed && styles.pressed,
                ]}>
                <SolarIcon
                  name="MenuDots"
                  type="bold"
                  size={20}
                  color={theme.text}
                />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Main Content Area */}
        <View style={styles.bodyContent}>
          {/* Unregistered Subject: user hasn't enrolled in any course for this subject */}
          {subjectEnrolledCourses.length === 0 && !hasFullAccess && (
            <View
              style={[
                styles.unregisteredSubjectCard,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.border,
                },
              ]}>
              <SolarIcon name="BookBookmark" type="linear" size={32} color={Palette.brand.primary} />
              <ThemedText style={styles.unregisteredTitle}>
                {`No ${displayTitle} Course Enrolled`}
              </ThemedText>
              <ThemedText
                themeColor="textSecondary"
                style={styles.unregisteredSubtitle}>
                {`Enroll in a free starter pack or complete ${displayTitle} course to unlock all chapters and past year papers.`}
              </ThemedText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Explore courses"
                onPress={() => navigation.navigate('Main', { screen: 'Courses' })}
                style={styles.unregisteredBtn}>
                <Text style={styles.unregisteredBtnText}>Explore Courses</Text>
              </Pressable>
            </View>
          )}

          {/* Sleek card to upgrade the plan to Pro (matching the home screen) */}
          {!hasFullAccess && (
            <UpgradeProCard onUpgradePress={() => navigation.navigate('UpgradePlan')} />
          )}

          {/* Search Bar */}
          <View style={styles.searchRow}>
            <View
              style={[
                styles.searchBar,
                { backgroundColor: theme.backgroundElement },
              ]}>
              <SolarIcon
                name="Magnifer"
                type="linear"
                size={18}
                color={theme.textSecondary}
              />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search years, chapters..."
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
                  <SolarIcon
                    name="CloseCircle"
                    type="bold"
                    size={16}
                    color={theme.textSecondary}
                  />
                </Pressable>
              )}
            </View>
          </View>

          {/* Empty search state */}
          {filteredYears.length === 0 && filteredChapters.length === 0 && (
            <View style={styles.emptyContainer}>
              <SolarIcon name="Book2" type="linear" size={44} themeColor="muted" />
              <ThemedText style={styles.emptyTitle}>No Matches Found</ThemedText>
              <ThemedText
                themeColor="textSecondary"
                style={styles.emptySubtitle}>
                {`No years or chapters match "${searchQuery.trim()}". Try another search term.`}
              </ThemedText>
            </View>
          )}

          {/* Section 1: Year Wise */}
          {filteredYears.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <ThemedText style={styles.sectionTitle}>Year Wise</ThemedText>
                <View
                  style={[
                    styles.countBadge,
                    { backgroundColor: theme.backgroundElement },
                  ]}>
                  <Text
                    style={[
                      styles.countBadgeText,
                      { color: theme.textSecondary },
                    ]}>
                    {`${filteredYears.length} Years`}
                  </Text>
                </View>
              </View>

              {/* Horizontal Scroll of Year Cards matching Recently Watched Card without progress */}
              <FlatList
                horizontal
                data={filteredYears}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                style={styles.yearList}
                contentContainerStyle={styles.yearListContent}
                renderItem={({ item }) => (
                  <YearWiseCard
                    item={item}
                    fallbackImage={currentSubject.imageUrl}
                    onPress={handleYearPress}
                  />
                )}
              />
            </View>
          )}

          {/* Section 2: Chapter Wise */}
          {filteredChapters.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <ThemedText style={styles.sectionTitle}>Chapter Wise</ThemedText>
                <View
                  style={[
                    styles.countBadge,
                    { backgroundColor: theme.backgroundElement },
                  ]}>
                  <Text
                    style={[
                      styles.countBadgeText,
                      { color: theme.textSecondary },
                    ]}>
                    {`${filteredChapters.length} Chapters`}
                  </Text>
                </View>
              </View>

              {/* List of Chapter Cards */}
              <View style={styles.chapterList}>
                {filteredChapters.map((item) => (
                  <Pressable
                    key={item.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Chapter ${item.chapterNumber}: ${item.title}`}
                    onPress={() => handleChapterPress(item)}
                    style={({ pressed }) => [
                      styles.chapterCard,
                      {
                        backgroundColor: theme.card,
                        borderColor: theme.border,
                      },
                      pressed && styles.pressed,
                    ]}>
                    <View
                      style={[
                        styles.chapterIndexPill,
                        { backgroundColor: 'rgba(56, 128, 255, 0.08)' },
                      ]}>
                      <Text
                        style={[
                          styles.chapterIndexText,
                          { color: Palette.brand.primary },
                        ]}>
                        {item.chapterNumber}
                      </Text>
                    </View>

                    <View style={styles.chapterInfo}>
                      <ThemedText style={styles.chapterTitle} numberOfLines={1}>
                        {item.title}
                      </ThemedText>
                      <ThemedText
                        themeColor="textSecondary"
                        style={styles.chapterSubtitle}
                        numberOfLines={1}>
                        {item.subtitle}
                      </ThemedText>
                      <View style={styles.chapterMetaRow}>
                        <ThemedText
                          themeColor="textSecondary"
                          style={styles.chapterMetaText}>
                          {`${item.lessonsCount} Lessons`}
                        </ThemedText>
                        <Text style={styles.metaDot}>•</Text>
                        <ThemedText
                          themeColor="textSecondary"
                          style={styles.chapterMetaText}>
                          {item.duration}
                        </ThemedText>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.chapterActionBtn,
                        { backgroundColor: theme.backgroundElement },
                      ]}>
                      <SolarIcon
                        name="ArrowRightUp"
                        type="linear"
                        size={17}
                        color={theme.text}
                      />
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Backdrop overlay when popup menu is open */}
      {isMenuOpen && (
        <Pressable
          accessibilityLabel="Dismiss menu"
          onPress={() => setIsMenuOpen(false)}
          style={styles.menuBackdrop}
        />
      )}

      {/* Tiny Popup Window with smooth spring animation */}
      {isMenuOpen && (
        <Animated.View
          style={[
            styles.menuPopup,
            {
              backgroundColor: theme.backgroundElement,
              borderColor: theme.border,
              top: insets.top + 60,
            },
            animatedMenuStyle,
          ]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Support"
            onPress={handleSupportPress}
            style={({ pressed }) => [
              styles.menuItem,
              pressed && styles.pressed,
            ]}>
            <SolarIcon name="Help" type="linear" size={18} color={theme.text} />
            <ThemedText style={styles.menuItemText}>Support</ThemedText>
          </Pressable>

          <View style={[styles.menuDivider, { backgroundColor: theme.border }]} />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Report"
            onPress={handleReportPress}
            style={({ pressed }) => [
              styles.menuItem,
              pressed && styles.pressed,
            ]}>
            <SolarIcon
              name="DangerTriangle"
              type="linear"
              size={18}
              color={Palette.pinkishRed}
            />
            <ThemedText
              style={[styles.menuItemText, { color: Palette.pinkishRed }]}>
              Report
            </ThemedText>
          </Pressable>
        </Animated.View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  mediaWrapper: {
    width: '100%',
    position: 'relative',
  },
  mediaContainer: {
    width: '100%',
    aspectRatio: 16 / 12, // Strictly matching Course Details 16:12 ratio
    overflow: 'hidden',
    backgroundColor: '#0a0a0a',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailTitleContainer: {
    position: 'absolute',
    bottom: 24, // moved bit upwards
    left: Spacing.four,
    right: Spacing.four,
    alignItems: 'flex-start',
    zIndex: 5,
    gap: 4,
  },
  thumbnailTitle: {
    fontFamily: Fonts?.sans,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    color: '#1a1d29',
    letterSpacing: -0.6,
    textAlign: 'left',
  },
  thumbnailDescription: {
    fontFamily: Fonts?.sans,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: '#4b5563',
    textAlign: 'left',
    maxWidth: '92%',
  },
  topControlBar: {
    position: 'absolute',
    top: Spacing.three,
    left: Spacing.four,
    right: Spacing.four,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  rightButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: Rounded.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  pressed: {
    opacity: 0.75,
  },
  bodyContent: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  unregisteredSubjectCard: {
    padding: Spacing.four,
    borderRadius: Rounded.card,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.four,
    gap: Spacing.two,
  },
  unregisteredTitle: {
    fontFamily: Fonts?.sans,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  unregisteredSubtitle: {
    fontFamily: Fonts?.sans,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    maxWidth: 280,
  },
  unregisteredBtn: {
    backgroundColor: Palette.brand.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: Rounded.full,
    marginTop: Spacing.one,
  },
  unregisteredBtnText: {
    color: '#ffffff',
    fontFamily: Fonts?.sans,
    fontSize: 13,
    fontWeight: '700',
  },
  searchRow: {
    marginBottom: Spacing.four,
  },
  searchBar: {
    height: 46,
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
  sectionContainer: {
    marginBottom: Spacing.five,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  sectionTitle: {
    fontFamily: Fonts?.sans,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Rounded.full,
  },
  countBadgeText: {
    fontFamily: Fonts?.sans,
    fontSize: 12,
    fontWeight: '600',
  },
  yearList: {
    marginHorizontal: -Spacing.four,
  },
  yearListContent: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    paddingBottom: Spacing.three + 6,
  },
  chapterList: {
    gap: 10,
  },
  chapterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  chapterIndexPill: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chapterIndexText: {
    fontFamily: Fonts?.sans,
    fontSize: 14,
    fontWeight: '800',
  },
  chapterInfo: {
    flex: 1,
    gap: 2,
  },
  chapterTitle: {
    fontFamily: Fonts?.sans,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  chapterSubtitle: {
    fontFamily: Fonts?.sans,
    fontSize: 12,
    lineHeight: 16,
  },
  chapterMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  chapterMetaText: {
    fontFamily: Fonts?.sans,
    fontSize: 11,
    fontWeight: '500',
  },
  metaDot: {
    fontSize: 10,
    color: '#9ca3af',
  },
  chapterActionBtn: {
    width: 36,
    height: 36,
    borderRadius: Rounded.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.six,
    gap: 6,
  },
  emptyTitle: {
    fontFamily: Fonts?.sans,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 6,
  },
  emptySubtitle: {
    fontFamily: Fonts?.sans,
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 260,
  },
  menuBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 100,
  },
  menuPopup: {
    position: 'absolute',
    right: Spacing.four,
    minWidth: 106,
    borderRadius: Rounded.md,
    borderWidth: 1,
    paddingVertical: 4,
    zIndex: 101,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  menuItemText: {
    fontFamily: Fonts?.sans,
    fontSize: 13,
    fontWeight: '600',
  },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 4,
  },
});
