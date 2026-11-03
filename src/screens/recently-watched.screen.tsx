import { Image } from 'expo-image';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { SolarIcon } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Header, customAlert } from '@/components/ui';
import { BottomTabInset, Fonts, MaxContentWidth, Palette, Rounded, Spacing } from '@/constants/theme';
import { recentlyWatchedItems } from '@/data';
import { useTheme } from '@/hooks/use-theme';
import type { RecentlyWatchedItem } from '@/types';
import type { RootStackScreenProps } from '@/types/navigation';
import { triggerHaptic } from '@/utils';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type RecentlyWatchedScreenProps = RootStackScreenProps<'RecentlyWatched'>;

function YouTubeStyleVideoCard({
  item,
  onPress,
  onLongPress,
}: {
  item: RecentlyWatchedItem;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const theme = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const progress = Math.min(Math.max(typeof item.progress === 'number' ? item.progress : 0.7, 0), 1);

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={`Video: ${item.title}. Long press to remove from history.`}
      accessibilityHint="Long press to remove from watch history"
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={350}
      onPressIn={() => {
        scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      }}
      style={[
        styles.cardContainer,
        {
          backgroundColor: theme.card,
        },
        animatedStyle,
      ]}>
      {/* 16:9 Thumbnail on Left */}
      <View style={styles.thumbnailWrapper}>
        <Image
          source={{ uri: item.thumbnailUrl }}
          style={styles.thumbnailImage}
          contentFit="cover"
          transition={250}
        />

        {/* Duration badge at bottom-right of thumbnail */}
        {item.duration && (
          <View style={styles.durationBadge}>
            <ThemedText style={styles.durationText}>{item.duration}</ThemedText>
          </View>
        )}

        {/* Accent watch progress bar along bottom of thumbnail */}
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.round(progress * 100)}%` },
            ]}
          />
        </View>
      </View>

      {/* Video Details on Right */}
      <View style={styles.detailsContainer}>
        <View style={styles.titleRow}>
          <ThemedText style={styles.videoTitle} numberOfLines={2}>
            {item.title}
          </ThemedText>
        </View>

        <View style={styles.metadataContainer}>
          {item.subject && (
            <ThemedText style={[styles.metadataText, { color: theme.textSecondary }]}>
              {item.subject} • Class 12
            </ThemedText>
          )}
        </View>
      </View>
    </AnimatedPressable>
  );
}

export function RecentlyWatchedScreen({ navigation }: RecentlyWatchedScreenProps) {
  const theme = useTheme();
  const [videos, setVideos] = useState<RecentlyWatchedItem[]>(recentlyWatchedItems);

  const handleVideoPress = (item: RecentlyWatchedItem) => {
    customAlert.show({
      title: item.title,
      message: `Resuming video playback for ${item.title}...`,
      type: 'info',
    });
  };

  const handleVideoLongPress = (item: RecentlyWatchedItem) => {
    // Tactile vibration feedback on long-press
    triggerHaptic(50);

    // Confirmation Alert
    customAlert.show({
      title: 'Remove from Watch History',
      message: `Are you sure you want to remove "${item.title}" from your watch history?`,
      type: 'confirm',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'primary',
          onPress: () => {
            setVideos((prev) => prev.filter((v) => v.id !== item.id));
          },
        },
      ],
    });
  };

  const handleClearAll = () => {
    if (videos.length === 0) return;

    triggerHaptic(50);
    customAlert.show({
      title: 'Clear Watch History',
      message: 'Are you sure you want to clear your entire watch history?',
      type: 'confirm',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'primary',
          onPress: () => setVideos([]),
        },
      ],
    });
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header with Back Button and Clear All option */}
      <Header
        align="center"
        title="Watch History"
        titleStyle={styles.headerTitle}
        left={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => navigation.goBack()}
            style={[styles.circleButton, { backgroundColor: theme.backgroundElement }]}>
            <SolarIcon name="ArrowLeft" type="linear" size={22} color={theme.text} />
          </Pressable>
        }
        right={
          videos.length > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear all watch history"
              onPress={handleClearAll}
              style={[styles.circleButton, { backgroundColor: theme.backgroundElement }]}>
              <SolarIcon name="TrashBinTrash" type="linear" size={20} color={theme.accent} />
            </Pressable>
          ) : (
            <View style={styles.circleButtonPlaceholder} />
          )
        }
      />

      {/* Screen Body */}
      <View style={styles.content}>
        {videos.length === 0 ? (
          /* Empty State */
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconCircle, { backgroundColor: theme.backgroundElement }]}>
              <SolarIcon name="History" type="linear" size={44} color={theme.textSecondary} />
            </View>
            <ThemedText style={styles.emptyTitle}>No Watch History</ThemedText>
            <ThemedText style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Videos you watch will appear here. Tap or long-press videos to manage your history.
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={videos}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <YouTubeStyleVideoCard
                item={item}
                onPress={() => handleVideoPress(item)}
                onLongPress={() => handleVideoLongPress(item)}
              />
            )}
          />
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: Rounded.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleButtonPlaceholder: {
    width: 44,
    height: 44,
  },
  headerTitle: {
    fontFamily: Fonts?.sans,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: BottomTabInset + Spacing.five,
    gap: Spacing.three,
  },
  cardContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    overflow: 'hidden',
    padding: 10,
    gap: 12,
  },
  thumbnailWrapper: {
    width: 136,
    aspectRatio: 16 / 9,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000000',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: Fonts?.sans,
  },
  progressTrack: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Palette.accent, // Accent color (#fc8019)
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  titleRow: {
    flex: 1,
  },
  videoTitle: {
    fontFamily: Fonts?.sans,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  metadataContainer: {
    gap: 4,
    marginTop: 6,
  },
  metadataText: {
    fontFamily: Fonts?.sans,
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.five,
    paddingBottom: Spacing.six,
    gap: Spacing.two,
  },
  emptyIconCircle: {
    width: 84,
    height: 84,
    borderRadius: Rounded.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  emptyTitle: {
    fontFamily: Fonts?.sans,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontFamily: Fonts?.sans,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    maxWidth: 280,
  },
});
