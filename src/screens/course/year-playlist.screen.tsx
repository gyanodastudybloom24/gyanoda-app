import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SolarIcon } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { customAlert } from '@/components/ui';
import { Fonts, MaxContentWidth, Palette, Rounded, Spacing } from '@/constants/theme';
import {
  DEFAULT_SAMPLE_VIDEO,
  defaultChemistryChapters,
  defaultMathChapters,
  defaultPhysicsChapters,
} from '@/data';
import { useTheme } from '@/hooks/use-theme';
import type { YearChapterItem } from '@/types';
import type { PlayerPlaylistItem, RootStackScreenProps } from '@/types/navigation';

export type YearPlaylistScreenProps = RootStackScreenProps<'YearPlaylist'>;
export type { YearChapterItem };

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ChapterRowItemProps {
  item: YearChapterItem;
  onPress: (item: YearChapterItem) => void;
  onMorePress: (item: YearChapterItem) => void;
}

function ChapterRowItem({ item, onPress, onMorePress }: ChapterRowItemProps) {
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
      accessibilityLabel={`Chapter ${item.chapterNumber}: ${item.title}`}
      onPress={() => onPress(item)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.chapterRow, animatedStyle]}>
      {/* Little 16:9 Thumbnail with duration overlay badge */}
      <View
        style={[
          styles.chapterThumbnailContainer,
          {
            borderColor: theme.border,
            backgroundColor: theme.backgroundElement,
          },
        ]}>
        <Image
          source={{ uri: item.thumbnailUrl }}
          style={styles.chapterThumbnail}
          contentFit="cover"
          transition={300}
        />

        {/* Dark subtle overlay */}
        <View style={styles.thumbnailScrim} />

        {/* Duration Badge on bottom-right of little thumbnail */}
        <View style={styles.durationBadge}>
          <Text style={styles.durationBadgeText}>{item.duration}</Text>
        </View>

        {/* Play Icon centered on little thumbnail */}
        <View style={styles.thumbnailPlayOverlay}>
          <SolarIcon name="Play" type="bold" size={14} color="#ffffff" />
        </View>
      </View>

      {/* Chapter Information */}
      <View style={styles.chapterTextContent}>
        <View style={styles.chapterHeaderLine}>
          <Text style={[styles.chapterIndexBadge, { color: Palette.brand.primary }]}>
            {`CH ${item.chapterNumber}`}
          </Text>
          <Text style={[styles.questionsCountText, { color: theme.textSecondary }]}>
            {`${item.questionsCount} PYQs`}
          </Text>
        </View>

        <ThemedText style={styles.chapterTitle} numberOfLines={2}>
          {item.title}
        </ThemedText>

        <ThemedText
          themeColor="textSecondary"
          style={styles.chapterSubtitle}
          numberOfLines={1}>
          {item.subtitle}
        </ThemedText>
      </View>

      {/* More Options / Context button */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Options for ${item.title}`}
        onPress={() => onMorePress(item)}
        hitSlop={8}
        style={styles.chapterMoreButton}>
        <SolarIcon name="MenuDots" type="bold" size={18} color={theme.textSecondary} />
      </Pressable>
    </AnimatedPressable>
  );
}

export function YearPlaylistScreen({
  route,
  navigation,
}: YearPlaylistScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const year = route.params?.year ?? '2024';
  const subjectId = (route.params?.subjectId ?? 'physics').toLowerCase();
  const title = route.params?.title ?? `${year} PYQ Solutions`;
  const description =
    route.params?.description ??
    `Comprehensive chapter-wise previous year question walkthroughs with step-by-step solutions for ${year}.`;
  const imageUrl =
    route.params?.imageUrl ??
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1200&auto=format&fit=crop';

  const [isSaved, setIsSaved] = useState(false);

  // Select chapter playlist dataset matching the subject
  const chapters = useMemo(() => {
    if (subjectId.includes('chem')) return defaultChemistryChapters;
    if (subjectId.includes('math')) return defaultMathChapters;
    return defaultPhysicsChapters;
  }, [subjectId]);

  const handleSharePress = async () => {
    try {
      await Share.share({
        title: `${title} Playlist`,
        message: `Watch ${title} - ${description} on Gyanoda!`,
      });
    } catch {
      // User dismissed share
    }
  };

  const playerPlaylist: PlayerPlaylistItem[] = useMemo(() => {
    return chapters.map((c) => ({
      id: c.id,
      chapterNumber: c.chapterNumber,
      title: c.title,
      subtitle: c.subtitle,
      duration: c.duration,
      thumbnailUrl: c.thumbnailUrl ?? 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop',
      videoUrl: DEFAULT_SAMPLE_VIDEO,
      questionText: `Chapter ${c.chapterNumber}: ${c.title}. Focus on ${c.subtitle}. Solve previous year questions step by step.`,
      answerText: `Key Concepts & Derivations:\n\n1. Foundational Theory for ${c.title}:\n   Review core equations and conceptual fundamentals.\n\n2. Analytical Steps:\n   Follow step-by-step mathematical reasoning demonstrated in the player above.\n\n3. High-Yield Examination Tips:\n   Common error patterns and time-saving calculation shortcuts.`,
    }));
  }, [chapters]);

  const handlePlayAll = () => {
    navigation.navigate('Player', {
      videoId: playerPlaylist[0]?.id,
      initialIndex: 0,
      playlist: playerPlaylist,
      year,
      subjectId,
      title: playerPlaylist[0]?.title,
    });
  };

  const handleShuffle = () => {
    const shuffled = [...playerPlaylist].sort(() => Math.random() - 0.5);
    navigation.navigate('Player', {
      videoId: shuffled[0]?.id,
      initialIndex: 0,
      playlist: shuffled,
      year,
      subjectId,
      title: shuffled[0]?.title,
    });
  };

  const handleToggleSave = () => {
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    customAlert.show({
      title: nextSaved ? 'Saved to Library' : 'Removed from Library',
      message: nextSaved
        ? `${title} has been added to your saved playlists.`
        : `${title} removed from your saved playlists.`,
      type: 'success',
    });
  };

  const handleChapterPress = (item: YearChapterItem, index: number) => {
    navigation.navigate('Player', {
      videoId: item.id,
      initialIndex: index,
      playlist: playerPlaylist,
      year,
      subjectId,
      title: item.title,
    });
  };

  const handleChapterMore = (item: YearChapterItem, index: number) => {
    customAlert.show({
      title: item.title,
      message: `Chapter ${item.chapterNumber} • ${item.duration} • ${item.questionsCount} Questions.\n\nKey topics: ${item.subtitle}`,
      type: 'confirm',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Play Video',
          style: 'primary',
          onPress: () => handleChapterPress(item, index),
        },
      ],
    });
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        data={chapters}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + Spacing.six },
        ]}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            {/* 16:12 Media Thumbnail Container matching Course Details (Full Width) */}
            <View style={styles.mediaWrapper}>
              <View style={styles.mediaContainer}>
                {/* 16:12 Banner Image */}
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.mediaImage}
                  contentFit="cover"
                  transition={300}
                />

                {/* Dark gradient overlay from bottom to guarantee contrast */}
                <LinearGradient
                  colors={[
                    'rgba(0, 0, 0, 0.15)',
                    'rgba(0, 0, 0, 0.40)',
                    'rgba(0, 0, 0, 0.90)',
                  ]}
                  locations={[0, 0.45, 1]}
                  style={StyleSheet.absoluteFill}
                  pointerEvents="none"
                />

                {/* Banner Content: Subject Pill, Title, Description */}
                <View style={styles.bannerContent}>
                  <View style={styles.subjectPill}>
                    <SolarIcon
                      name="Book2"
                      type="bold"
                      size={12}
                      color="#ffffff"
                    />
                    <Text style={styles.subjectPillText}>
                      {`${subjectId.toUpperCase()} • ${year}`}
                    </Text>
                  </View>

                  <Text style={styles.bannerTitle} numberOfLines={2}>
                    {title}
                  </Text>

                  <Text style={styles.bannerDescription} numberOfLines={2}>
                    {description}
                  </Text>
                </View>

                {/* Bottom Right Buttons Row: Shuffle button beside the round orange Play All button */}
                <View style={styles.bannerButtonsRow}>
                  {/* Circular Shuffle Button */}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Shuffle all videos"
                    onPress={handleShuffle}
                    style={({ pressed }) => [
                      styles.bannerShuffleButton,
                      pressed && styles.pressed,
                    ]}>
                    <SolarIcon
                      name="Shuffle"
                      type="bold"
                      size={20}
                      color="#ffffff"
                    />
                  </Pressable>

                  {/* Circular Orange Play All Button (plays 1st video one by one) */}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Play all videos from 1st video"
                    onPress={handlePlayAll}
                    style={({ pressed }) => [
                      styles.bannerPlayButton,
                      pressed && styles.pressed,
                    ]}>
                    <SolarIcon
                      name="Play"
                      type="bold"
                      size={22}
                      color="#ffffff"
                      style={styles.bannerPlayIcon}
                    />
                  </Pressable>
                </View>
              </View>

              {/* Top Navigation Control Bar (Back, Bookmark, Share) */}
              <View style={styles.topControlBar}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Go back"
                  onPress={() => navigation.goBack()}
                  style={({ pressed }) => [
                    styles.topBarButton,
                    { backgroundColor: theme.backgroundElement },
                    pressed && styles.pressed,
                  ]}>
                  <SolarIcon
                    name="ArrowLeft"
                    type="linear"
                    size={20}
                    color={theme.text}
                  />
                </Pressable>

                <View style={styles.topBarRightRow}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={isSaved ? 'Remove from saved' : 'Save playlist'}
                    onPress={handleToggleSave}
                    style={({ pressed }) => [
                      styles.topBarButton,
                      { backgroundColor: theme.backgroundElement },
                      pressed && styles.pressed,
                    ]}>
                    <SolarIcon
                      name="Bookmark"
                      type={isSaved ? 'bold' : 'linear'}
                      size={18}
                      color={isSaved ? Palette.accent : theme.text}
                    />
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Share playlist"
                    onPress={handleSharePress}
                    style={({ pressed }) => [
                      styles.topBarButton,
                      { backgroundColor: theme.backgroundElement },
                      pressed && styles.pressed,
                    ]}>
                    <SolarIcon
                      name="Share"
                      type="linear"
                      size={18}
                      color={theme.text}
                    />
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Padded Chapters Header Row (No blue/white play buttons) */}
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionHeaderLeft}>
                <ThemedText style={styles.sectionTitle}>Chapters</ThemedText>
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
                    {`${chapters.length} Videos`}
                  </Text>
                </View>
              </View>

              <Text
                style={[
                  styles.totalDurationText,
                  { color: theme.textSecondary },
                ]}>
                Past Paper PYQ Solutions
              </Text>
            </View>
          </View>
        }
        renderItem={({ item, index }) => (
          <ChapterRowItem
            item={item}
            onPress={() => handleChapterPress(item, index)}
            onMorePress={() => handleChapterMore(item, index)}
          />
        )}
      />
    </ThemedView>
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
  },
  headerContainer: {
    marginBottom: Spacing.two,
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  bannerContent: {
    position: 'absolute',
    bottom: Spacing.four,
    left: Spacing.four,
    right: 136, // Leaves room for both shuffle and play buttons on right
    zIndex: 2,
  },
  subjectPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Rounded.full,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  subjectPillText: {
    fontFamily: Fonts?.sans,
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  bannerTitle: {
    fontFamily: Fonts?.sans,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.4,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    marginBottom: 4,
  },
  bannerDescription: {
    fontFamily: Fonts?.sans,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.92)',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  bannerButtonsRow: {
    position: 'absolute',
    bottom: Spacing.three + 2,
    right: Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 4,
  },
  bannerShuffleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(26, 29, 41, 0.85)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.9)',
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
  bannerPlayButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Palette.accent,
    borderWidth: 2.5,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  bannerPlayIcon: {
    marginLeft: 2,
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
  topBarRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  topBarButton: {
    width: 40,
    height: 40,
    borderRadius: Rounded.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    marginTop: Spacing.four,
    marginBottom: Spacing.two,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  totalDurationText: {
    fontFamily: Fonts?.sans,
    fontSize: 12,
    fontWeight: '500',
  },
  chapterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: 10,
    gap: 12,
  },
  chapterThumbnailContainer: {
    width: 124,
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
  },
  chapterThumbnail: {
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
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationBadgeText: {
    fontFamily: Fonts?.sans,
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  thumbnailPlayOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chapterTextContent: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  chapterHeaderLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chapterIndexBadge: {
    fontFamily: Fonts?.sans,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  questionsCountText: {
    fontFamily: Fonts?.sans,
    fontSize: 11,
    fontWeight: '500',
  },
  chapterTitle: {
    fontFamily: Fonts?.sans,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  chapterSubtitle: {
    fontFamily: Fonts?.sans,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
  chapterMoreButton: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
});

