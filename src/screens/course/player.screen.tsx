import * as ScreenOrientation from 'expo-screen-orientation';
import { Image } from 'expo-image';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SolarIcon } from '@/components/icons';
import { VideoPlayer } from '@/components/player/VideoPlayer';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { customAlert } from '@/components/ui';
import { Fonts, MaxContentWidth, Palette, Rounded, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import type { PlayerPlaylistItem, RootStackScreenProps } from '@/types/navigation';

export type PlayerScreenProps = RootStackScreenProps<'Player'>;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const DEFAULT_SAMPLE_VIDEO =
  'https://vjs.zencdn.net/v/oceans.mp4';

// Fallback playlist items with realistic physics examination problems and step-by-step solutions
const defaultQueuePlaylist: PlayerPlaylistItem[] = [
  {
    id: 'phy-q1',
    chapterNumber: '01',
    title: 'Units, Dimensions & Error Analysis',
    subtitle: 'Dimensional formula of gravitational constant & percentage error',
    duration: '18:40',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop',
    videoUrl: DEFAULT_SAMPLE_VIDEO,
    questionText:
      'A physical quantity P is related to four observables a, b, c, and d as P = (a³ b²) / (√c · d). The percentage errors of measurement in a, b, c, and d are 1%, 3%, 4%, and 2% respectively. Determine the percentage error in the quantity P.',
    answerText:
      'Step-by-step Solution:\n\n1. Formula: Given P = (a³ b²) / (c^(1/2) · d)\n\n2. Taking natural logarithm and differentiating to find fractional error:\n   (ΔP / P) = 3(Δa / a) + 2(Δb / b) + (1/2)(Δc / c) + (Δd / d)\n\n3. Percentage error calculation:\n   % error in P = [3(1%) + 2(3%) + 0.5(4%) + (2%)]\n   = 3% + 6% + 2% + 2% = 13%\n\nConclusion: The percentage error in measurement of P is 13%.',
  },
  {
    id: 'phy-q2',
    chapterNumber: '02',
    title: 'Kinematics & 2D Projectile Trajectory',
    subtitle: 'Maximum range, time of flight and velocity vectors',
    duration: '24:15',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=800&auto=format&fit=crop',
    videoUrl: DEFAULT_SAMPLE_VIDEO,
    questionText:
      'A projectile is fired with an initial velocity of 50 m/s at an elevation angle of 37° above the horizontal. Find (a) the time of flight, (b) the maximum height reached, and (c) the horizontal range of the projectile. (Take g = 10 m/s², sin 37° = 0.6, cos 37° = 0.8)',
    answerText:
      'Step-by-step Solution:\n\n1. Initial velocity components:\n   ux = u cos 37° = 50 × 0.8 = 40 m/s\n   uy = u sin 37° = 50 × 0.6 = 30 m/s\n\n2. Time of flight (T):\n   T = (2 · uy) / g = (2 × 30) / 10 = 6.0 seconds\n\n3. Maximum height (H_max):\n   H = (uy²) / (2g) = (30²) / (2 × 10) = 900 / 20 = 45 meters\n\n4. Horizontal Range (R):\n   R = ux × T = 40 × 6.0 = 240 meters.',
  },
  {
    id: 'phy-q3',
    chapterNumber: '03',
    title: 'Laws of Motion & Friction Dynamics',
    subtitle: 'Inclined plane equilibrium & minimum force calculations',
    duration: '28:50',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1518152006812-edab29b069ac?q=80&w=800&auto=format&fit=crop',
    videoUrl: DEFAULT_SAMPLE_VIDEO,
    questionText:
      'A block of mass 4 kg rests on a rough inclined plane inclined at 30° to the horizontal. If the coefficient of static friction is 0.5, calculate the minimum force applied parallel to the incline required to prevent the block from sliding down.',
    answerText:
      'Step-by-step Solution:\n\n1. Normal reaction force:\n   N = m · g · cos 30° = 4 × 9.8 × (√3 / 2) ≈ 33.95 N\n\n2. Downward gravitational pull along incline:\n   F_pull = m · g · sin 30° = 4 × 9.8 × 0.5 = 19.6 N\n\n3. Maximum limiting static friction force:\n   f_s = μ · N = 0.5 × 33.95 ≈ 16.98 N (acts upward along the incline)\n\n4. Minimum external force F required:\n   F + f_s ≥ m · g · sin 30°\n   F = 19.6 - 16.98 = 2.62 N (directed upwards along the incline).',
  },
  {
    id: 'phy-q4',
    chapterNumber: '04',
    title: 'Work, Energy & Power Principles',
    subtitle: 'Conservative force fields & spring potential energy',
    duration: '21:30',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop',
    videoUrl: DEFAULT_SAMPLE_VIDEO,
    questionText:
      'A particle of mass 200 g is attached to a light spring of spring constant k = 100 N/m. The spring is compressed by 10 cm and released from rest on a frictionless horizontal floor. Determine the velocity of the particle as it passes through the natural equilibrium position.',
    answerText:
      'Step-by-step Solution:\n\n1. Conservation of Mechanical Energy:\n   Initial potential energy of compressed spring = Final kinetic energy of mass\n   (1/2) · k · x² = (1/2) · m · v²\n\n2. Substituting values:\n   m = 0.2 kg, k = 100 N/m, x = 0.10 m\n   100 × (0.10)² = 0.2 × v²\n   100 × 0.01 = 0.2 × v²\n   1.0 = 0.2 × v²\n   v² = 5.0  ==>  v = √5 ≈ 2.24 m/s.',
  },
  {
    id: 'phy-q5',
    chapterNumber: '05',
    title: 'Rotational Mechanics & Moment of Inertia',
    subtitle: 'Rolling without slipping on inclined slope',
    duration: '32:10',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=800&auto=format&fit=crop',
    videoUrl: DEFAULT_SAMPLE_VIDEO,
    questionText:
      'A uniform solid cylinder of mass M and radius R rolls without slipping down an inclined plane of inclination angle θ. Find the linear acceleration of the cylinder down the slope and the minimum friction coefficient required for pure rolling.',
    answerText:
      'Step-by-step Solution:\n\n1. Moment of inertia of solid cylinder:\n   I_cm = (1/2) · M · R²\n\n2. Acceleration in pure rolling:\n   a = (g · sin θ) / [1 + (I_cm / (M · R²))]\n   a = (g · sin θ) / [1 + 1/2] = (2/3) · g · sin θ\n\n3. Minimum friction coefficient μ_min:\n   f = M · g · sin θ - M · a = M · g · sin θ - (2/3) M · g · sin θ = (1/3) M · g · sin θ\n   f ≤ μ · N = μ · M · g · cos θ\n   μ_min = (1/3) · tan θ.',
  },
];

export function PlayerScreen({ route, navigation }: PlayerScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const playlist = useMemo(() => {
    return route.params?.playlist && route.params.playlist.length > 0
      ? route.params.playlist
      : defaultQueuePlaylist;
  }, [route.params?.playlist]);

  const [currentIndex, setCurrentIndex] = useState(
    route.params?.initialIndex ?? 0
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(148);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const currentItem = playlist[currentIndex] ?? playlist[0];
  const videoUrl =
    currentItem.videoUrl ?? route.params?.videoUrl ?? DEFAULT_SAMPLE_VIDEO;
  const questionTitle =
    currentItem.questionText ?? currentItem.title ?? 'Examination Problem';
  const answerExplanation =
    currentItem.answerText ??
    'Detailed step-by-step video solution and derivations available in the player lecture above.';

  // Exclude the currently playing video from the "Up Next" FlatList below
  const upNextVideos = useMemo(() => {
    return playlist.filter((item) => item.id !== currentItem.id);
  }, [playlist, currentItem.id]);

  // Previous & Next navigation capabilities
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < playlist.length - 1;

  const handlePrevious = () => {
    if (hasPrevious) {
      setCurrentIndex((idx) => idx - 1);
      setIsExpanded(false);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      setCurrentIndex((idx) => idx + 1);
      setIsExpanded(false);
    }
  };

  // Manage status bar visibility and theme styling
  useEffect(() => {
    StatusBar.setHidden(isFullscreen, 'fade');
    if (!isFullscreen) {
      StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content', true);
    }
    return () => {
      StatusBar.setHidden(false, 'fade');
      StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content', true);
    };
  }, [isFullscreen, isDark]);

  // Listen to physical device orientation changes to auto-sync fullscreen
  useEffect(() => {
    // Unlock device orientation so accelerometer sensor can trigger auto-rotation
    ScreenOrientation.unlockAsync().catch(() => {});

    // Check current orientation on mount
    ScreenOrientation.getOrientationAsync()
      .then((orientation) => {
        const isLandscape =
          orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
          orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT;
        if (isLandscape) {
          setIsFullscreen(true);
        }
      })
      .catch(() => {});

    const orientationSub = ScreenOrientation.addOrientationChangeListener(
      (event) => {
        const orientation = event.orientationInfo.orientation;
        const isLandscape =
          orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
          orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT;
        setIsFullscreen(isLandscape);
      }
    );

    return () => {
      orientationSub.remove();
      StatusBar.setHidden(false, 'fade');
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      ).catch(() => {});
    };
  }, []);

  const handleToggleFullscreen = async () => {
    try {
      if (isFullscreen) {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT_UP
        );
        setIsFullscreen(false);
        // After snapping to portrait, unlock so future physical rotation works
        setTimeout(() => {
          ScreenOrientation.unlockAsync().catch(() => {});
        }, 500);
      } else {
        // Lock to LANDSCAPE (supports both LEFT and RIGHT without auto-reverting)
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.LANDSCAPE
        );
        setIsFullscreen(true);
      }
    } catch {
      // Fallback toggling state
      setIsFullscreen(!isFullscreen);
    }
  };

  const handleLikePress = () => {
    if (isLiked) {
      setIsLiked(false);
      setLikeCount((c) => c - 1);
    } else {
      setIsLiked(true);
      setLikeCount((c) => c + 1);
      if (isDisliked) setIsDisliked(false);
    }
  };

  const handleDislikePress = () => {
    if (isDisliked) {
      setIsDisliked(false);
    } else {
      setIsDisliked(true);
      if (isLiked) {
        setIsLiked(false);
        setLikeCount((c) => c - 1);
      }
    }
  };

  const handleSharePress = async () => {
    try {
      await Share.share({
        title: currentItem.title,
        message: `Watch this solution on Gyanoda: ${currentItem.title}\n${questionTitle}`,
      });
    } catch {
      // User dismissed
    }
  };

  const handleSavePress = () => {
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    customAlert.show({
      title: nextSaved ? 'Saved to Watchlist' : 'Removed from Watchlist',
      message: nextSaved
        ? `${currentItem.title} saved to your learning library.`
        : `${currentItem.title} removed from your learning library.`,
      type: 'success',
    });
  };

  const handleSelectVideo = (selectedItem: PlayerPlaylistItem) => {
    const targetIndex = playlist.findIndex((p) => p.id === selectedItem.id);
    if (targetIndex !== -1) {
      setCurrentIndex(targetIndex);
    }
    setIsExpanded(false);
  };

  return (
    <ThemedView style={[styles.container, !isFullscreen && { paddingTop: insets.top }]}>
      <ExpoStatusBar
        hidden={isFullscreen}
        style={isDark ? 'light' : 'dark'}
        animated={true}
      />
      {/* 1. Reusable Video Player Component */}
      <VideoPlayer
        videoUrl={videoUrl}
        title={`CH ${currentItem.chapterNumber}: ${questionTitle}`}
        onBack={() => {
          if (isFullscreen) {
            handleToggleFullscreen();
          } else {
            navigation.goBack();
          }
        }}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        autoPlay={true}
        onNext={handleNext}
        onPrevious={handlePrevious}
        hasNext={hasNext}
        hasPrevious={hasPrevious}
      />

      {/* 2. Portrait Details & Content (Hidden in landscape fullscreen mode) */}
      {!isFullscreen && (
        <FlatList
          data={upNextVideos}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + Spacing.six },
          ]}
          ListHeaderComponent={
            <View style={styles.detailsContainer}>
              {/* Question Text Title (YouTube Video Title Style with Expand Arrow) */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Toggle question and text answer details"
                onPress={() => setIsExpanded((prev) => !prev)}
                style={styles.questionTitleRow}>
                <View style={styles.questionTextContainer}>
                  <Text style={[styles.questionNumberBadge, { color: Palette.brand.primary }]}>
                    {`CHAPTER ${currentItem.chapterNumber}`}
                  </Text>
                  <ThemedText style={styles.questionTitleText} numberOfLines={isExpanded ? undefined : 2}>
                    {questionTitle}
                  </ThemedText>
                </View>

                {/* Arrow down button to expand full question and text answer */}
                <View
                  style={[
                    styles.expandArrowButton,
                    { backgroundColor: theme.backgroundElement },
                  ]}>
                  <SolarIcon
                    name={isExpanded ? 'AltArrowUp' : 'AltArrowDown'}
                    type="bold"
                    size={16}
                    color={theme.text}
                  />
                </View>
              </Pressable>

              {/* Action Buttons Row: Like, Dislike, Share, Save */}
              <View style={styles.actionButtonsRow}>
                {/* Like / Dislike Pill */}
                <View
                  style={[
                    styles.likeDislikePill,
                    { backgroundColor: theme.backgroundElement },
                  ]}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Like video"
                    onPress={handleLikePress}
                    style={styles.pillButtonHalf}>
                    <SolarIcon
                      name="Like"
                      type={isLiked ? 'bold' : 'linear'}
                      size={18}
                      color={isLiked ? Palette.brand.primary : theme.text}
                    />
                    <Text style={[styles.actionButtonText, { color: theme.text }]}>
                      {likeCount}
                    </Text>
                  </Pressable>

                  <View style={[styles.pillDivider, { backgroundColor: theme.border }]} />

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Dislike video"
                    onPress={handleDislikePress}
                    style={styles.pillButtonHalf}>
                    <SolarIcon
                      name="Dislike"
                      type={isDisliked ? 'bold' : 'linear'}
                      size={18}
                      color={isDisliked ? Palette.accent : theme.text}
                    />
                  </Pressable>
                </View>

                {/* Share Button */}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Share video"
                  onPress={handleSharePress}
                  style={[
                    styles.actionPillButton,
                    { backgroundColor: theme.backgroundElement },
                  ]}>
                  <SolarIcon name="Share" type="linear" size={17} color={theme.text} />
                  <Text style={[styles.actionButtonText, { color: theme.text }]}>
                    Share
                  </Text>
                </Pressable>

                {/* Save Button */}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Save video to library"
                  onPress={handleSavePress}
                  style={[
                    styles.actionPillButton,
                    { backgroundColor: theme.backgroundElement },
                  ]}>
                  <SolarIcon
                    name="Bookmark"
                    type={isSaved ? 'bold' : 'linear'}
                    size={17}
                    color={isSaved ? Palette.accent : theme.text}
                  />
                  <Text style={[styles.actionButtonText, { color: theme.text }]}>
                    {isSaved ? 'Saved' : 'Save'}
                  </Text>
                </Pressable>
              </View>

              {/* Expandable YouTube-Style Description & Text-Based Answer Box */}
              {isExpanded && (
                <Animated.View
                  entering={FadeIn.duration(200)}
                  style={[
                    styles.answerBox,
                    {
                      backgroundColor: theme.backgroundElement,
                      borderColor: theme.border,
                    },
                  ]}>
                  <View style={styles.answerBoxHeader}>
                    <SolarIcon
                      name="DocumentText"
                      type="bold"
                      size={16}
                      color={Palette.brand.primary}
                    />
                    <Text style={[styles.answerBoxTitle, { color: Palette.brand.primary }]}>
                      Text Solution & Explanation
                    </Text>
                  </View>

                  <ThemedText style={styles.answerBodyText}>
                    {answerExplanation}
                  </ThemedText>

                  {/* Collapse button at the bottom of description */}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Collapse answer details"
                    onPress={() => setIsExpanded(false)}
                    style={styles.collapseButton}>
                    <Text style={[styles.collapseButtonText, { color: theme.textSecondary }]}>
                      Show less
                    </Text>
                    <SolarIcon
                      name="AltArrowUp"
                      type="bold"
                      size={14}
                      color={theme.textSecondary}
                    />
                  </Pressable>
                </Animated.View>
              )}

              {/* Up Next Header Row */}
              <View style={styles.upNextHeaderRow}>
                <ThemedText style={styles.upNextTitle}>Up Next</ThemedText>
                <View
                  style={[
                    styles.queueBadge,
                    { backgroundColor: theme.backgroundElement },
                  ]}>
                  <Text
                    style={[
                      styles.queueBadgeText,
                      { color: theme.textSecondary },
                    ]}>
                    {`${upNextVideos.length} Videos`}
                  </Text>
                </View>
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <PlaylistQueueRow
              item={item}
              onPress={() => handleSelectVideo(item)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyQueueContainer}>
              <SolarIcon
                name="VideoLibrary"
                type="linear"
                size={32}
                color={theme.textSecondary}
              />
              <ThemedText
                themeColor="textSecondary"
                style={styles.emptyQueueText}>
                No more videos in this playlist
              </ThemedText>
            </View>
          }
        />
      )}
    </ThemedView>
  );
}

interface PlaylistQueueRowProps {
  item: PlayerPlaylistItem;
  onPress: () => void;
}

function PlaylistQueueRow({ item, onPress }: PlaylistQueueRowProps) {
  const theme = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={`Play chapter ${item.chapterNumber}: ${item.title}`}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.queueRow, animatedStyle]}>
      {/* Little 16:9 Thumbnail preview with duration badge */}
      <View
        style={[
          styles.queueThumbnailContainer,
          {
            borderColor: theme.border,
            backgroundColor: theme.backgroundElement,
          },
        ]}>
        <Image
          source={{ uri: item.thumbnailUrl }}
          style={styles.queueThumbnail}
          contentFit="cover"
          transition={300}
        />

        <View style={styles.thumbnailScrim} />

        {/* Duration badge at bottom-right */}
        <View style={styles.queueDurationBadge}>
          <Text style={styles.queueDurationText}>{item.duration}</Text>
        </View>

        {/* Centered play icon */}
        <View style={styles.queuePlayIconOverlay}>
          <SolarIcon
            name="Play"
            type="bold"
            size={14}
            color="#ffffff"
          />
        </View>
      </View>

      {/* Video metadata */}
      <View style={styles.queueTextContent}>
        <View style={styles.queueMetaRow}>
          <Text style={[styles.queueChapterIndex, { color: Palette.brand.primary }]}>
            {item.year ? `YEAR ${item.year}` : `CH ${item.chapterNumber}`}
          </Text>
        </View>

        <ThemedText style={styles.queueTitle} numberOfLines={2}>
          {item.title}
        </ThemedText>

        <ThemedText
          themeColor="textSecondary"
          style={styles.queueSubtitle}
          numberOfLines={1}>
          {item.subtitle ?? item.duration}
        </ThemedText>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
  },
  detailsContainer: {
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  questionTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: Spacing.three,
  },
  questionTextContainer: {
    flex: 1,
    gap: 4,
  },
  questionNumberBadge: {
    fontFamily: Fonts?.sans,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  questionTitleText: {
    fontFamily: Fonts?.sans,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  expandArrowButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  likeDislikePill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Rounded.full,
    height: 38,
    paddingHorizontal: 4,
  },
  pillButtonHalf: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: '100%',
  },
  pillDivider: {
    width: 1,
    height: 18,
  },
  actionPillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 38,
    paddingHorizontal: 14,
    borderRadius: Rounded.full,
  },
  actionButtonText: {
    fontFamily: Fonts?.sans,
    fontSize: 13,
    fontWeight: '600',
  },
  answerBox: {
    borderRadius: 16,
    padding: Spacing.three,
    borderWidth: 1,
    marginBottom: Spacing.four,
    gap: 8,
  },
  answerBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  answerBoxTitle: {
    fontFamily: Fonts?.sans,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  answerBodyText: {
    fontFamily: Fonts?.sans,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '400',
  },
  collapseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 6,
  },
  collapseButtonText: {
    fontFamily: Fonts?.sans,
    fontSize: 12,
    fontWeight: '600',
  },
  upNextHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.two,
    marginBottom: Spacing.two,
  },
  upNextTitle: {
    fontFamily: Fonts?.sans,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  queueBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Rounded.full,
  },
  queueBadgeText: {
    fontFamily: Fonts?.sans,
    fontSize: 12,
    fontWeight: '600',
  },
  queueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
    borderRadius: 14,
  },
  queueThumbnailContainer: {
    width: 120,
    aspectRatio: 16 / 9,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
  },
  queueThumbnail: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  thumbnailScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.20)',
  },
  queueDurationBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  queueDurationText: {
    fontFamily: Fonts?.sans,
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  queuePlayIconOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  queueTextContent: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  queueMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  queueChapterIndex: {
    fontFamily: Fonts?.sans,
    fontSize: 11,
    fontWeight: '800',
  },
  queueTitle: {
    fontFamily: Fonts?.sans,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  queueSubtitle: {
    fontFamily: Fonts?.sans,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
  emptyQueueContainer: {
    paddingVertical: Spacing.six,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  emptyQueueText: {
    fontFamily: Fonts?.sans,
    fontSize: 13,
    fontWeight: '500',
  },
});
