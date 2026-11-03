import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { FlatList, LayoutAnimation, Platform, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SolarIcon } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { RatingStar, customAlert } from '@/components/ui';
import { Fonts, MaxContentWidth, Palette, Rounded, Spacing } from '@/constants/theme';
import { coursesData, defaultCourseInclusions, defaultCourseReviewItems, defaultVideoYearItems } from '@/data';
import { CourseMediaContainer } from '@/features/courses';
import { useEnrolledCourses } from '@/hooks/use-enrolled-courses';
import { useSubscription } from '@/hooks/use-subscription';
import { useTheme } from '@/hooks/use-theme';
import { enrollmentService } from '@/services';
import type { CourseFilter, CourseReviewItem, VideoYearItem } from '@/types';
import type { RootStackScreenProps } from '@/types/navigation';
import { triggerHaptic } from '@/utils';

export type CourseDetailsScreenProps = RootStackScreenProps<'CourseDetails'>;
export type { CourseFilter, VideoYearItem, CourseReviewItem };
export { RatingStar, CourseMediaContainer, defaultVideoYearItems, defaultCourseReviewItems };

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const filterTabs: { id: CourseFilter; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'videos', label: 'Videos' },
  { id: 'review', label: 'Review' },
];

export function CourseDetailsScreen({
  route,
  navigation,
}: CourseDetailsScreenProps) {
  const theme = useTheme();
  const isDark = theme.background === '#121212';
  const insets = useSafeAreaInsets();
  const courseId = route.params?.courseId;

  // Active filter tab: overview is selected by default
  const [activeFilter, setActiveFilter] = useState<CourseFilter>('overview');

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuAnim = useSharedValue(0);

  useEffect(() => {
    if (isMenuOpen) {
      menuAnim.value = withTiming(1, { duration: 150 });
    } else {
      menuAnim.value = withTiming(0, { duration: 100 });
    }
  }, [isMenuOpen, menuAnim]);

  const animatedMenuStyle = useAnimatedStyle(() => ({
    opacity: menuAnim.value,
    transform: [{ translateY: (1 - menuAnim.value) * -4 }],
  }));

  // Resolve current course data or fallback to the first course
  const course = useMemo(() => {
    return coursesData.find((c) => c.id === courseId) ?? coursesData[0];
  }, [courseId]);

  const chaptersCount = course.chaptersCount ?? 10;
  const videosCount = course.videosCount ?? 120;
  const yearsCount = course.yearsCount ?? 14;
  const courseDuration = course.duration ?? '24 hrs';
  const ratingValue = course.rating ? `${course.rating}` : '4.8';
  const aboutCourseText =
    course.about ??
    'This course is comprehensively structured to cover core theoretical concepts, problem-solving techniques, and real-world exam applications with past paper walkthroughs and intuitive video lessons.';
  const inclusionsList = course.inclusions ?? defaultCourseInclusions;
  const videoYearItems = defaultVideoYearItems;

  const enrolledCourses = useEnrolledCourses();
  const isEnrolled = enrolledCourses.some((c) => c.id === course.id) || Boolean(course.isEnrolled);

  // Review states: student can give stars (1-5) and write feedback, enabled if enrolled
  const [reviewsList, setReviewsList] = useState<CourseReviewItem[]>(defaultCourseReviewItems);
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>('');

  const { tier: userTier } = useSubscription();

  const isFree = Boolean(course.isFree || course.price === 0 || course.requiredTier === 'free');
  const requiredTier = course.requiredTier ?? (isFree ? 'free' : 'pro');
  const isPlus = requiredTier === 'plus';
  const hasTierAccess =
    isFree ||
    (requiredTier === 'pro' && (userTier === 'pro' || userTier === 'plus')) ||
    (requiredTier === 'plus' && userTier === 'plus');

  // Animated scale for Enroll button press micro-animation
  const enrollScale = useSharedValue(1);

  const enrollAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: enrollScale.value }],
  }));

  const handleEnrollPressIn = () => {
    enrollScale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  };

  const handleEnrollPressOut = () => {
    enrollScale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handleEnrollPress = () => {
    const targetSubjectId = course.subjectId ?? 'physics';
    const targetTitle =
      targetSubjectId === 'maths'
        ? 'Maths'
        : targetSubjectId === 'chemistry'
          ? 'Chemistry'
          : targetSubjectId === 'physics'
            ? 'Physics'
            : targetSubjectId === 'biology'
              ? 'Biology'
              : 'All Subjects';

    if (isEnrolled) {
      navigation.navigate('CourseAccess', {
        subjectId: targetSubjectId,
        title: targetTitle,
      });
      return;
    }

    // 1. If course matches free tier:
    if (isFree) {
      customAlert.show({
        title: 'Enroll in Free Course',
        message: `Start learning ${course.title} for free with access to ${course.chaptersCount ?? 2} chapters, ${course.yearsCount ?? 2} years, and ${course.videosCount ?? 15} videos.`,
        type: 'confirm',
        buttons: [
          {
            text: 'Start Learning',
            style: 'primary',
            onPress: () => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              enrollmentService.enroll(course.id);
              navigation.navigate('CourseAccess', {
                subjectId: targetSubjectId,
                title: targetTitle,
              });
            },
          },
        ],
      });
      return;
    }

    // 2. If user has active subscription matching this course tier:
    if (hasTierAccess) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      enrollmentService.enroll(course.id);
      navigation.navigate('CourseAccess', {
        subjectId: targetSubjectId,
        title: targetTitle,
      });
      return;
    }

    // 3. User does not have the required tier: redirect to UpgradePlan!
    triggerHaptic(20);
    customAlert.show({
      title: isPlus ? 'Gyanoda Plus Required' : 'Gyanoda Pro Required',
      message: `${course.title} is exclusive to Gyanoda ${isPlus ? 'Plus' : 'Pro'} members. Upgrade your plan to get full access to all lectures, mock tests, and mentor guidance.`,
      type: 'confirm',
      buttons: [
        {
          text: isPlus ? 'Upgrade to PLUS' : 'Upgrade to PRO',
          style: 'primary',
          onPress: () => {
            triggerHaptic(20);
            navigation.navigate('UpgradePlan');
          },
        },
      ],
    });
  };

  const handleAddReview = () => {
    if (!isEnrolled) {
      customAlert.show({
        title: 'Enrollment Required',
        message: `Please enroll in ${course.title} to rate and write a review.`,
        type: 'confirm',
        buttons: [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Enroll Now', style: 'primary', onPress: () => handleEnrollPress() },
        ],
      });
      return;
    }

    const trimmed = newComment.trim();
    if (trimmed.length < 3) {
      customAlert.show({
        title: 'Review Text Required',
        message: 'Please write a brief comment sharing your learning experience.',
        type: 'info',
      });
      return;
    }

    const reviewItem: CourseReviewItem = {
      id: `rev-${Date.now()}`,
      name: 'You (Student)',
      rating: newRating,
      date: 'Just now',
      comment: trimmed,
    };

    setReviewsList((prev) => [reviewItem, ...prev]);
    setNewComment('');
    customAlert.show({
      title: 'Review Submitted!',
      message: 'Thank you for your rating and review. It is now published below.',
      type: 'success',
    });
  };

  const handleVideoItemPress = (item: VideoYearItem, isUnlocked?: boolean) => {
    const unlocked = isUnlocked ?? (isEnrolled || hasTierAccess);
    if (!unlocked) {
      triggerHaptic(20);
      customAlert.show({
        title: `${item.year} Lecture Locked`,
        message: `${course.title} ${item.year} video lecture is exclusive to Gyanoda ${isPlus ? 'Plus' : 'Pro'} members. Upgrade your plan to unlock all solutions.`,
        type: 'confirm',
        buttons: [
          {
            text: isPlus ? 'Upgrade to PLUS' : 'Upgrade to PRO',
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

    customAlert.show({
      title: `${item.year} Video Lecture`,
      message: `Playing ${course.title} - ${item.year} ${item.description} (${item.duration}).`,
      type: 'info',
    });
  };

  // Dynamic bottom calculation to adapt cleanly to Android 3-button navigation, gesture bar, or iOS home bar
  const dynamicBottomPadding = Math.max(insets.bottom, 12);

  // Controls smooth slide-up entrance of the sticky enroll footer on scroll (course-specific, starts hidden)
  const footerVisible = useSharedValue(0);

  const animatedFooterStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - footerVisible.value) * 160 }],
    opacity: footerVisible.value,
  }));

  const revealFooter = () => {
    if (footerVisible.value !== 1) {
      footerVisible.value = withSpring(1, { damping: 22, stiffness: 200, mass: 0.7 });
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (footerVisible.value === 1) return;
    const scrollY = event.nativeEvent.contentOffset.y;
    if (scrollY > 10) {
      revealFooter();
    }
  };

  const handleScrollBeginDrag = () => {
    setIsMenuOpen(false);
    if (footerVisible.value !== 1) {
      revealFooter();
    }
  };

  const handleSharePress = async () => {
    try {
      await Share.share({
        title: course.title,
        message: `Check out ${course.title} on Gyanoda!`,
      });
    } catch {
      customAlert.show({
        title: 'Share Course',
        message: `Link for ${course.title} is ready to share.`,
        type: 'info',
      });
    }
  };

  const handleSupportPress = () => {
    setIsMenuOpen(false);
    customAlert.show({
      title: 'Student Support',
      message: 'Need help or have questions about this course? Reach out to support@gyanoda.edu or call +91 98765 43210.',
      type: 'info',
    });
  };

  const handleReportPress = () => {
    setIsMenuOpen(false);
    customAlert.show({
      title: 'Report Content',
      message: 'Are you sure you want to flag or report this course material to our academic moderators?',
      type: 'confirm',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Report',
          style: 'destructive',
          onPress: () => {
            customAlert.show({
              title: 'Report Submitted',
              message: 'Thank you for your report. Our academic moderation team will review this course promptly.',
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
          { paddingBottom: dynamicBottomPadding + 140 },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBeginDrag}>
        {/* 16:12 Media Container placed directly below the top safe area */}
        <View style={styles.mediaWrapper}>
        <CourseMediaContainer imageUrl={course.imageUrl} />

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
            <SolarIcon name="ArrowLeft" type="linear" size={22} color={theme.text} />
          </Pressable>

          <View style={styles.rightButtonsRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Share course"
              onPress={handleSharePress}
              style={({ pressed }) => [
                styles.headerButton,
                { backgroundColor: theme.backgroundElement },
                pressed && styles.pressed,
              ]}>
              <SolarIcon name="Share" type="linear" size={20} color={theme.text} />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="More options"
              onPress={() => setIsMenuOpen((prev) => !prev)}
              style={({ pressed }) => [
                styles.headerButton,
                { backgroundColor: theme.backgroundElement },
                pressed && styles.pressed,
              ]}>
              <SolarIcon name="MenuDots" type="bold" size={20} color={theme.text} />
            </Pressable>
          </View>
        </View>

        {/* Bottom Filter Buttons overlaid directly on the image */}
        <View style={styles.bottomFilterRow}>
          {filterTabs.map((tab) => {
            const isSelected = activeFilter === tab.id;
            return (
              <Pressable
                key={tab.id}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`${tab.label} filter`}
                onPress={() => setActiveFilter(tab.id)}
                style={({ pressed }) => [
                  styles.filterPill,
                  isSelected
                    ? [
                        styles.filterPillActive,
                        {
                          backgroundColor: isDark ? '#ffffff' : '#121212',
                          borderColor: isDark ? '#ffffff' : '#121212',
                        },
                      ]
                    : [
                        styles.filterPillInactive,
                        {
                          backgroundColor: isDark
                            ? 'rgba(0, 0, 0, 0.55)'
                            : 'rgba(255, 255, 255, 0.75)',
                          borderColor: isDark
                            ? 'rgba(255, 255, 255, 0.15)'
                            : 'rgba(255, 255, 255, 0.6)',
                        },
                      ],
                  pressed && styles.pressed,
                ]}>
                <Text
                  style={[
                    styles.filterPillText,
                    {
                      color: isSelected
                        ? isDark
                          ? '#121212'
                          : '#ffffff'
                        : isDark
                          ? '#ffffff'
                          : '#121212',
                    },
                  ]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Course Title & Description on the content area below the image */}
      <View style={styles.courseInfoContainer}>
        <ThemedText style={styles.courseTitle}>
          {course.title}
        </ThemedText>
        <ThemedText
          themeColor="textSecondary"
          style={styles.courseDescription}
          numberOfLines={3}>
          {course.description ??
            'Comprehensive video lectures, in-depth study materials, and interactive practice questions designed for exam excellence.'}
        </ThemedText>

        {/* TAB 1: OVERVIEW */}
        {activeFilter === 'overview' && (
          <>
            {/* Course Stats with Big Fonts (chapters | videos years) */}
            <View style={styles.statsContainer}>
              {/* Chapters */}
              <View style={styles.statColumnChapters}>
                <ThemedText themeColor="textSecondary" style={styles.statLabel}>
                  chapters
                </ThemedText>
                <ThemedText style={styles.statNumberBig}>
                  {chaptersCount}
                </ThemedText>
              </View>

              {/* Vertical Divider centered between chapters and videos */}
              <View style={[styles.statDivider, { backgroundColor: theme.text }]} />

              {/* Videos with increased font size matching chapters, pushed bottom-wards */}
              <View style={styles.statColumnVideos}>
                <ThemedText themeColor="textSecondary" style={styles.statLabel}>
                  videos
                </ThemedText>
                <ThemedText style={styles.statNumberBig}>
                  {videosCount}
                </ThemedText>
              </View>

              {/* Years */}
              <View style={styles.statColumnYears}>
                <ThemedText themeColor="textSecondary" style={styles.statLabel}>
                  years
                </ThemedText>
                <ThemedText style={styles.statNumberSmall}>
                  {yearsCount}
                </ThemedText>
              </View>

              {/* Vertical Divider after years, matching chapters divider */}
              <View style={[styles.statDivider, { backgroundColor: theme.text }]} />

              {/* Ratings with big number matching chapters count */}
              <View style={styles.statColumnRatings}>
                <ThemedText themeColor="textSecondary" style={styles.statLabel}>
                  ratings
                </ThemedText>
                <ThemedText style={styles.statNumberBig}>
                  {ratingValue}
                </ThemedText>
              </View>

              {/* Duration - free form separate element directly below chapters number */}
              <View style={styles.durationRow}>
                <SolarIcon name="ClockCircle" type="linear" size={16} color={theme.textSecondary} />
                <ThemedText themeColor="textSecondary" style={styles.durationText}>
                  {courseDuration}
                </ThemedText>
              </View>
            </View>

            {/* About Course Section */}
            <View style={styles.aboutCourseContainer}>
              <ThemedText style={styles.sectionTitle}>
                About Course
              </ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.aboutText}>
                {aboutCourseText}
              </ThemedText>
            </View>

            {/* What's Included / Prerequisites Section */}
            <View style={styles.inclusionsSection}>
              <ThemedText style={styles.sectionTitle}>
                {"What's Included"}
              </ThemedText>

              <View style={styles.inclusionsList}>
                {inclusionsList.map((item, index) => {
                  const isLast = index === inclusionsList.length - 1;
                  return (
                    <View key={item.id}>
                      <View style={styles.inclusionRow}>
                        <View
                          style={[
                            styles.inclusionIconContainer,
                            { backgroundColor: isDark ? '#1e2230' : '#f0f5ff' },
                          ]}>
                          <SolarIcon
                            name={item.icon as any}
                            type="linear"
                            size={22}
                            color={Palette.brand.primary}
                          />
                        </View>
                        <View style={styles.inclusionContent}>
                          <ThemedText style={styles.inclusionTitle}>
                            {item.title}
                          </ThemedText>
                          <ThemedText themeColor="textSecondary" style={styles.inclusionSubtitle}>
                            {item.description}
                          </ThemedText>
                        </View>
                      </View>
                      {!isLast && (
                        <View style={[styles.inclusionDivider, { backgroundColor: theme.border }]} />
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          </>
        )}

        {/* TAB 2: VIDEOS - FlatList of Year pill containers */}
        {activeFilter === 'videos' && (
          <View style={styles.videosTabSection}>
            <View style={styles.videoTabHeader}>
              <ThemedText style={styles.sectionTitle}>
                Previous Year Video Solutions
              </ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.videoTabSubtitle}>
                {`Complete video lectures & past paper analysis (${yearsCount} years)`}
              </ThemedText>
            </View>

            <FlatList
              data={videoYearItems}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.videoListContainer}
              renderItem={({ item, index }) => {
                const isUnlocked = isEnrolled || hasTierAccess || index === 0;
                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${item.year}, ${item.description}, ${item.duration}${!isUnlocked ? ', locked' : ''}`}
                    onPress={() => handleVideoItemPress(item, isUnlocked)}
                    style={({ pressed }) => [
                      styles.videoPillCard,
                      {
                        backgroundColor: theme.card,
                        borderColor: theme.border,
                      },
                      pressed && styles.pressed,
                    ]}>
                    {/* Icon Circle Container: Accent with subtle translucency for play button, muted for lock */}
                    <View
                      style={[
                        styles.playIconCircle,
                        isUnlocked
                          ? {
                              backgroundColor: 'rgba(252, 128, 25, 0.90)', // Palette.accent (#fc8019) with very slight translucency (90% opacity)
                            }
                          : {
                              backgroundColor: isDark
                                ? 'rgba(255, 255, 255, 0.08)'
                                : '#f3f4f6',
                            },
                      ]}>
                      <SolarIcon
                        name={isUnlocked ? 'Play' : 'Lock'}
                        type="bold"
                        size={isUnlocked ? 18 : 17}
                        color={isUnlocked ? '#ffffff' : theme.textSecondary}
                      />
                    </View>

                    {/* Year Title & Description in Middle */}
                    <View style={styles.videoTextContainer}>
                      <View style={styles.videoTitleRow}>
                        <ThemedText style={styles.videoYearTitle}>
                          {item.year}
                        </ThemedText>
                        {!isUnlocked && (
                          <View style={[styles.lockedBadge, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9' }]}>
                            <Text style={[styles.lockedBadgeText, { color: theme.textSecondary }]}>
                              Locked
                            </Text>
                          </View>
                        )}
                      </View>
                      <ThemedText
                        themeColor="textSecondary"
                        style={styles.videoDescription}
                        numberOfLines={1}>
                        {item.description}
                      </ThemedText>
                    </View>

                    {/* Duration in hrs on the right end */}
                    <Text style={[styles.videoDurationText, { color: theme.textSecondary }]}>
                      {item.duration}
                    </Text>
                  </Pressable>
                );
              }}
            />
          </View>
        )}

        {/* TAB 3: REVIEW - Clean separator lines, proper 5-point star icons & interactive review form */}
        {activeFilter === 'review' && (
          <View style={styles.reviewsContainer}>
            {/* Reviews Summary Header with 5-point Star */}
            <View style={styles.reviewsHeader}>
              <View style={styles.reviewsRatingBadge}>
                <RatingStar size={22} filled color={Palette.accent} />
                <ThemedText style={styles.reviewsScore}>{ratingValue}</ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.reviewsOutof}>
                  {' '}/ 5.0
                </ThemedText>
              </View>
              <ThemedText themeColor="textSecondary" style={styles.reviewsCount}>
                {`Based on ${1420 + (reviewsList.length - defaultCourseReviewItems.length)} student ratings`}
              </ThemedText>
            </View>

            {/* Write a Review Section: Rendered ONLY when enrolled */}
            {isEnrolled && (
              <View
                style={[
                  styles.writeReviewContainer,
                  {
                    backgroundColor: theme.backgroundElement,
                    borderColor: theme.border,
                  },
                ]}>
                <View style={styles.writeReviewHeaderRow}>
                  <ThemedText style={styles.writeReviewTitle}>
                    Leave a Rating & Review
                  </ThemedText>
                </View>

                {/* Star Selection Row with 5 Interactive 5-point Stars */}
                <View style={styles.starSelectRow}>
                  <Text style={[styles.rateLabel, { color: theme.textSecondary }]}>
                    Your Rating:
                  </Text>
                  <View style={styles.starsInteractiveRow}>
                    {[1, 2, 3, 4, 5].map((starNum) => {
                      const isFilled = starNum <= newRating;
                      return (
                        <Pressable
                          key={starNum}
                          accessibilityRole="button"
                          accessibilityLabel={`Rate ${starNum} star${starNum > 1 ? 's' : ''}`}
                          onPress={() => setNewRating(starNum)}
                          hitSlop={6}
                          style={({ pressed }) => [
                            styles.starPressable,
                            pressed && styles.pressed,
                          ]}>
                          <RatingStar
                            size={24}
                            filled={isFilled}
                            color={isFilled ? Palette.accent : (isDark ? 'rgba(255, 255, 255, 0.25)' : '#d1d5db')}
                          />
                        </Pressable>
                      );
                    })}
                  </View>
                  <Text style={[styles.ratingScoreHint, { color: Palette.accent }]}>
                    {newRating}.0
                  </Text>
                </View>

                {/* Review Comment Input */}
                <View style={styles.inputWrapper}>
                  <TextInput
                    value={newComment}
                    onChangeText={setNewComment}
                    placeholder="Write your feedback or thoughts about this course..."
                    placeholderTextColor={theme.textSecondary}
                    multiline
                    numberOfLines={3}
                    style={[
                      styles.reviewTextInput,
                      {
                        color: theme.text,
                        backgroundColor: isDark ? 'rgba(0, 0, 0, 0.25)' : '#ffffff',
                        borderColor: theme.border,
                      },
                    ]}
                  />
                </View>

                {/* Submit Review Button */}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Post your review"
                  onPress={handleAddReview}
                  style={({ pressed }) => [
                    styles.submitReviewButton,
                    { backgroundColor: Palette.brand.primary },
                    pressed && styles.pressed,
                  ]}>
                  <Text style={styles.submitReviewButtonText}>Post Review</Text>
                </Pressable>
              </View>
            )}

            {/* Reviews List with Separator Lines - strictly NO cards */}
            <View style={styles.reviewsListContainer}>
              {reviewsList.map((review, index) => {
                const isLast = index === reviewsList.length - 1;
                return (
                  <View key={review.id} style={styles.reviewItem}>
                    <View style={styles.reviewAuthorRow}>
                      <ThemedText style={styles.reviewAuthor}>{review.name}</ThemedText>
                      <ThemedText themeColor="textSecondary" style={styles.reviewDate}>
                        {review.date}
                      </ThemedText>
                    </View>

                    <View style={styles.reviewStarsRow}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <RatingStar
                          key={i}
                          size={14}
                          filled={i < review.rating}
                          color={i < review.rating ? Palette.accent : (isDark ? 'rgba(255, 255, 255, 0.15)' : '#e5e7eb')}
                        />
                      ))}
                    </View>

                    <ThemedText themeColor="textSecondary" style={styles.reviewComment}>
                      {review.comment}
                    </ThemedText>

                    {!isLast && (
                      <View style={[styles.reviewSeparator, { backgroundColor: theme.border }]} />
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </View>
    </ScrollView>

      {/* Sticky Bottom Enroll Bar with Gradually Fading Background */}
      <Animated.View
        style={[
          styles.stickyFooterWrapper,
          {
            paddingBottom: dynamicBottomPadding + (Platform.OS === 'android' ? 6 : 4),
          },
          animatedFooterStyle,
        ]}>
        <LinearGradient
          colors={
            isDark
              ? [
                  'rgba(18, 18, 18, 0)',
                  'rgba(18, 18, 18, 0.55)',
                  'rgba(18, 18, 18, 0.94)',
                  '#121212',
                  '#121212',
                ]
              : [
                  'rgba(255, 255, 255, 0)',
                  'rgba(255, 255, 255, 0.55)',
                  'rgba(255, 255, 255, 0.94)',
                  '#ffffff',
                  '#ffffff',
                ]
          }
          locations={[0, 0.2, 0.42, 0.55, 1]}
          style={styles.fadeGradient}
          pointerEvents="none"
        />

        <View style={styles.stickyFooterContent}>
          {/* Plan/Tier on Left - displayed only before enrollment */}
          {!isEnrolled && (
            <View style={styles.priceContainer}>
              <ThemedText themeColor="textSecondary" style={styles.priceLabel}>
                Plan
              </ThemedText>
              <ThemedText
                style={[
                  styles.priceValue,
                  {
                    color: isFree
                      ? '#10b981'
                      : isPlus
                        ? Palette.brand.primary
                        : Palette.accent,
                  },
                ]}>
                {isFree ? 'Free' : isPlus ? 'Plus' : 'Pro'}
              </ThemedText>
            </View>
          )}

          {/* Enroll Now / Enroll for Free / Continue Learning Button */}
          <AnimatedPressable
            accessibilityRole="button"
            accessibilityLabel={
              isEnrolled
                ? 'Continue learning'
                : isFree
                  ? 'Enroll for free'
                  : hasTierAccess
                    ? 'Start learning'
                    : isPlus
                      ? 'Upgrade to Plus'
                      : 'Upgrade to Pro'
            }
            onPress={handleEnrollPress}
            onPressIn={handleEnrollPressIn}
            onPressOut={handleEnrollPressOut}
            style={[
              styles.enrollButton,
              isEnrolled && styles.enrollButtonFullWidth,
              {
                backgroundColor: isEnrolled
                  ? Palette.brand.primary
                  : isFree
                    ? Palette.accent
                    : hasTierAccess
                      ? Palette.brand.primary
                      : isPlus
                        ? Palette.brand.primary
                        : Palette.accent,
              },
              enrollAnimStyle,
            ]}>
            <Text style={styles.enrollButtonText}>
              {isEnrolled
                ? 'Continue Learning'
                : isFree
                  ? 'Enroll for Free'
                  : hasTierAccess
                    ? 'Start Learning'
                    : isPlus
                      ? 'Upgrade to Plus'
                      : 'Upgrade to Pro'}
            </Text>
          </AnimatedPressable>
        </View>
      </Animated.View>

      {/* Backdrop overlay when popup menu is open */}
      {isMenuOpen && (
        <Pressable
          accessibilityLabel="Dismiss menu"
          onPress={() => setIsMenuOpen(false)}
          style={styles.menuBackdrop}
        />
      )}

      {/* Tiny Popup Window with smooth spring animation (Report & Support) */}
      {isMenuOpen && (
        <Animated.View
          style={[
            styles.popupMenu,
            {
              top: insets.top + Spacing.two + 44 + 6,
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
            animatedMenuStyle,
          ]}>
          {/* Support Option */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Student Support"
            onPress={handleSupportPress}
            style={({ pressed }) => [
              styles.popupItem,
              pressed && { backgroundColor: theme.backgroundElement },
            ]}>
            <SolarIcon name="QuestionCircle" type="linear" size={16} color={theme.text} />
            <ThemedText type="smallBold" style={styles.popupText}>
              Support
            </ThemedText>
          </Pressable>

          {/* Divider */}
          <View style={[styles.popupDivider, { backgroundColor: theme.border }]} />

          {/* Report Option (Red like logout) */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Report Course"
            onPress={handleReportPress}
            style={({ pressed }) => [
              styles.popupItem,
              pressed && { backgroundColor: theme.backgroundElement },
            ]}>
            <SolarIcon name="DangerTriangle" type="linear" size={16} color={theme.pinkishRed} />
            <Text
              style={[
                styles.popupText,
                { color: theme.pinkishRed, fontWeight: '600' },
              ]}>
              Report
            </Text>
          </Pressable>
        </Animated.View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  mediaWrapper: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    position: 'relative',
  },
  mediaContainer: {
    width: '100%',
    aspectRatio: 16 / 12,
    backgroundColor: '#000000',
    overflow: 'hidden',
    position: 'relative',
    borderBottomLeftRadius: Rounded.card,
    borderBottomRightRadius: Rounded.card,
  },
  mediaImage: {
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: Rounded.card,
    borderBottomRightRadius: Rounded.card,
  },
  topControlBar: {
    position: 'absolute',
    top: Spacing.two,
    left: Spacing.four,
    right: Spacing.four,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  bottomFilterRow: {
    position: 'absolute',
    bottom: Spacing.two + Spacing.half, // 10px from bottom edge of the image
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    zIndex: 10,
  },
  filterPill: {
    height: 38,
    minWidth: 92,
    paddingHorizontal: 16,
    borderRadius: Rounded.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  filterPillActive: {
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  filterPillInactive: {
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  filterPillText: {
    fontFamily: Fonts?.sans,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  rightButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: Rounded.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  pressed: {
    opacity: 0.7,
  },
  menuBackdrop: {
    ...StyleSheet.absoluteFill,
    zIndex: 90,
  },
  popupMenu: {
    position: 'absolute',
    right: Spacing.four,
    minWidth: 104,
    borderRadius: Rounded.md,
    borderWidth: 1,
    paddingVertical: 4,
    zIndex: 100,
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
  popupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  popupText: {
    fontFamily: Fonts?.sans,
    fontSize: 13,
    lineHeight: 18,
  },
  popupDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 1,
  },
  courseInfoContainer: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    gap: Spacing.one,
  },
  courseTitle: {
    fontFamily: Fonts?.sans,
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  courseDescription: {
    fontFamily: Fonts?.sans,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.1,
  },
  statsContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: Spacing.four,
    paddingTop: Spacing.one,
    paddingBottom: Spacing.two,
  },
  statColumnChapters: {
    alignItems: 'flex-start',
  },
  durationRow: {
    position: 'absolute',
    top: 84, // Free form placement just below the chapters number
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one + 1,
  },
  durationText: {
    fontFamily: Fonts?.sans,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  statDivider: {
    width: 2,
    height: 78,
    marginTop: 4,
    opacity: 0.35,
    marginHorizontal: 12, // Exactly centered with 12px on both left and right
    borderRadius: 1,
  },
  statColumnVideos: {
    alignItems: 'flex-start',
    marginTop: 48, // Pushed bottom-wards to align where the vertical line ends
  },
  statColumnYears: {
    marginLeft: 14, // Moved bit more left side closer to videos
    alignItems: 'flex-start',
  },
  statColumnRatings: {
    alignItems: 'flex-start',
    marginTop: 48, // Shifted bottom-wards on the same line as videos
  },
  statLabel: {
    fontFamily: Fonts?.sans,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    letterSpacing: -0.2,
    marginBottom: 2,
    textAlign: 'left',
  },
  statNumberBig: {
    fontFamily: Fonts?.sans,
    fontSize: 48,
    lineHeight: 54,
    fontWeight: '700',
    letterSpacing: -1.2,
    textAlign: 'left',
  },
  statNumberSmall: {
    fontFamily: Fonts?.sans,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700',
    letterSpacing: -0.8,
    textAlign: 'left',
  },
  aboutCourseContainer: {
    marginTop: Spacing.four,
    gap: Spacing.two,
  },
  sectionTitle: {
    fontFamily: Fonts?.sans,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  aboutText: {
    fontFamily: Fonts?.sans,
    fontSize: 14,
    lineHeight: 22,
    letterSpacing: -0.1,
  },
  inclusionsSection: {
    marginTop: Spacing.four,
    gap: Spacing.two,
  },
  inclusionsList: {
    marginTop: Spacing.one,
  },
  inclusionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
  },
  inclusionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: Rounded.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inclusionContent: {
    flex: 1,
    gap: 2,
  },
  inclusionTitle: {
    fontFamily: Fonts?.sans,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  inclusionSubtitle: {
    fontFamily: Fonts?.sans,
    fontSize: 12.5,
    lineHeight: 17,
    letterSpacing: -0.1,
  },
  inclusionDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.one,
  },
  stickyFooterWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 24,
    paddingHorizontal: Spacing.four,
    zIndex: 20,
  },
  fadeGradient: {
    position: 'absolute',
    top: -72,
    left: 0,
    right: 0,
    bottom: 0,
  },
  stickyFooterContent: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priceContainer: {
    justifyContent: 'center',
    gap: 2,
  },
  priceLabel: {
    fontFamily: Fonts?.sans,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.one + 2,
  },
  priceValue: {
    fontFamily: Fonts?.sans,
    fontSize: 25,
    lineHeight: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  originalPrice: {
    fontFamily: Fonts?.sans,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    textDecorationLine: 'line-through',
  },
  enrollButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.five,
    height: 54,
    borderRadius: Rounded.full,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  enrollButtonFullWidth: {
    flex: 1,
    width: '100%',
  },
  enrollButtonText: {
    fontFamily: Fonts?.sans,
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.2,
  },

  // Videos Tab Styles (pill containers matching reference image)
  videosTabSection: {
    marginTop: Spacing.two,
  },
  videoTabHeader: {
    marginBottom: Spacing.three,
  },
  videoTabSubtitle: {
    fontFamily: Fonts?.sans,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },
  videoListContainer: {
    paddingBottom: Spacing.two,
    paddingHorizontal: 2,
  },
  videoPillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 36,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  playIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoTextContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
    justifyContent: 'center',
  },
  videoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lockedBadge: {
    paddingHorizontal: 7,
    paddingVertical: 1.5,
    borderRadius: Rounded.full,
  },
  lockedBadgeText: {
    fontFamily: Fonts?.sans,
    fontSize: 10.5,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  videoYearTitle: {
    fontFamily: Fonts?.sans,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  videoDescription: {
    fontFamily: Fonts?.sans,
    fontSize: 12.5,
    lineHeight: 16,
    fontWeight: '500',
    marginTop: 2,
    letterSpacing: -0.1,
  },
  videoDurationText: {
    fontFamily: Fonts?.sans,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    marginRight: 8,
    letterSpacing: -0.2,
  },

  // Reviews Tab Styles - Clean separator lines, no cards
  reviewsContainer: {
    marginTop: Spacing.two,
  },
  reviewsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  reviewsRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reviewsScore: {
    fontFamily: Fonts?.sans,
    fontSize: 22,
    fontWeight: '800',
  },
  reviewsOutof: {
    fontFamily: Fonts?.sans,
    fontSize: 14,
    fontWeight: '500',
  },
  reviewsCount: {
    fontFamily: Fonts?.sans,
    fontSize: 12.5,
  },
  writeReviewContainer: {
    padding: Spacing.three,
    borderRadius: Rounded.md,
    borderWidth: 1,
    marginBottom: Spacing.four,
    gap: 10,
  },
  writeReviewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  writeReviewTitle: {
    fontFamily: Fonts?.sans,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  starSelectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rateLabel: {
    fontFamily: Fonts?.sans,
    fontSize: 13,
    fontWeight: '500',
  },
  starsInteractiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  starPressable: {
    padding: 2,
  },
  ratingScoreHint: {
    fontFamily: Fonts?.sans,
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 4,
  },
  inputWrapper: {
    width: '100%',
  },
  reviewTextInput: {
    width: '100%',
    minHeight: 74,
    borderRadius: Rounded.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    fontFamily: Fonts?.sans,
    fontSize: 13.5,
    lineHeight: 19,
    textAlignVertical: 'top',
  },
  submitReviewButton: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: Rounded.full,
  },
  submitReviewButtonText: {
    fontFamily: Fonts?.sans,
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.1,
  },
  reviewsListContainer: {
    width: '100%',
  },
  reviewItem: {
    paddingVertical: Spacing.two,
  },
  reviewAuthorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewAuthor: {
    fontFamily: Fonts?.sans,
    fontSize: 14,
    fontWeight: '700',
  },
  reviewDate: {
    fontFamily: Fonts?.sans,
    fontSize: 11,
  },
  reviewStarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 6,
  },
  reviewComment: {
    fontFamily: Fonts?.sans,
    fontSize: 13.5,
    lineHeight: 19,
  },
  reviewSeparator: {
    height: StyleSheet.hairlineWidth,
    marginTop: Spacing.two + 4,
  },
});
