import { useMemo, useState } from 'react';
import {
  LayoutAnimation,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  UIManager,
  View,
} from 'react-native';
import Animated, {
  Extrapolation,
  LinearTransition,
  SlideInLeft,
  SlideInRight,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { SolarIcon } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Header, customAlert } from '@/components/ui';
import { Fonts, MaxContentWidth, Rounded, Spacing } from '@/constants/theme';
import { initialNotifications } from '@/data';
import { useTheme } from '@/hooks/use-theme';
import type { AppNotification } from '@/types';
import type { RootStackScreenProps } from '@/types/navigation';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export type NotificationsScreenProps = RootStackScreenProps<'Notifications'>;

type NotificationCardProps = {
  item: AppNotification;
  index: number;
  onDismiss: (id: string) => void;
  onToggleRead: (id: string) => void;
};

function NotificationCard({ item, index, onDismiss, onToggleRead }: NotificationCardProps) {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const isLongDescription = item.description.length > 45;

  // Swipe-to-dismiss gesture tracking with Reanimated
  const translateX = useSharedValue(0);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          gestureState.dx > 12 && Math.abs(gestureState.dy) < 14,
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dx > 0) {
            translateX.value = gestureState.dx;
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx > 130) {
            translateX.value = withTiming(500, { duration: 200 }, (finished) => {
              if (finished) {
                runOnJS(onDismiss)(item.id);
              }
            });
          } else {
            translateX.value = withSpring(0, { damping: 14, stiffness: 160 });
          }
        },
        onPanResponderTerminate: () => {
          translateX.value = withSpring(0, { damping: 14, stiffness: 160 });
        },
      }),
    [item.id, onDismiss, translateX]
  );

  const animatedCardStyle = useAnimatedStyle(() => {
    const cardOpacity = interpolate(
      translateX.value,
      [0, 150],
      [1, 0.25],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ translateX: translateX.value }],
      opacity: cardOpacity,
    };
  });

  const handleCardPress = () => {
    // Smooth layout expansion without bounce or wobble
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded((prev) => !prev);
    if (!item.isRead) {
      onToggleRead(item.id);
    }
  };

  // Normal slow slide animation from alternating left & right
  const enteringAnimation =
    index % 2 === 0
      ? SlideInLeft.duration(600).delay(index * 75)
      : SlideInRight.duration(600).delay(index * 75);

  return (
    <Animated.View
      entering={enteringAnimation}
      layout={LinearTransition.duration(260)}
      style={styles.cardWrapper}>
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.cardContainer,
          {
            backgroundColor: theme.backgroundElement,
          },
          animatedCardStyle,
        ]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${item.title}, ${item.isRead ? 'read' : 'unread'}`}
          onPress={handleCardPress}
          style={styles.cardInner}>
          {/* Direct compact icon without any container */}
          <View style={styles.iconSlot}>
            <SolarIcon
              name={item.icon as any}
              type="linear"
              size={18}
              color={item.accentColor ?? theme.brand}
            />
          </View>

          {/* Text and details column */}
          <View style={styles.contentColumn}>
            <View style={styles.titleRow}>
              <ThemedText type="smallBold" numberOfLines={1} style={styles.titleText}>
                {item.title}
              </ThemedText>

              <View style={styles.timeWrapper}>
                <ThemedText type="small" themeColor="muted" style={styles.timeText}>
                  {item.timestamp}
                </ThemedText>
                {!item.isRead && (
                  <View
                    style={[
                      styles.unreadDot,
                      { backgroundColor: theme.notificationBadge },
                    ]}
                  />
                )}
              </View>
            </View>

            {/* Description with ellipsis when collapsed, expandable on tap */}
            <ThemedText
              type="small"
              themeColor="muted"
              numberOfLines={isExpanded ? undefined : 1}
              style={styles.descriptionText}>
              {item.description}
            </ThemedText>

            {/* Tap indicator when expanded */}
            {isLongDescription && isExpanded && (
              <ThemedText style={[styles.expandHint, { color: theme.brand }]}>
                Show less
              </ThemedText>
            )}
          </View>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

export function NotificationsScreen({ navigation }: NotificationsScreenProps) {
  const theme = useTheme();
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);

  const handleDismiss = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    if (notifications.every((n) => n.isRead)) {
      customAlert.show({
        title: 'All Caught Up',
        message: 'All notifications are already marked as read.',
        type: 'info',
      });
      return;
    }

    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    customAlert.show({
      title: 'Marked as Read',
      message: 'All notifications have been marked as read.',
      type: 'success',
    });
  };

  const handleDeleteAll = () => {
    if (notifications.length === 0) return;

    customAlert.show({
      title: 'Clear All Notifications',
      message: 'Are you sure you want to delete all notifications? This action cannot be undone.',
      type: 'confirm',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: () => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setNotifications([]);
          },
        },
      ],
    });
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header with balanced left and right slots for exact title centering */}
      <Header
        title="Notifications"
        align="center"
        left={
          <View style={styles.headerLeft}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={() => navigation.goBack()}
              style={[styles.circleButton, { backgroundColor: theme.backgroundElement }]}>
              <SolarIcon name="ArrowLeft" type="linear" size={22} color={theme.text} />
            </Pressable>
            <View style={styles.headerSpacer} />
          </View>
        }
        right={
          <View style={styles.headerRight}>
            {/* Double-Tick: Mark all read */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Mark all as read"
              onPress={handleMarkAllAsRead}
              style={[styles.circleButton, { backgroundColor: theme.backgroundElement }]}>
              <SolarIcon name="CheckRead" type="linear" size={20} color={theme.text} />
            </Pressable>

            {/* Trash Bin: Delete all with accent color */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Delete all notifications"
              onPress={handleDeleteAll}
              style={[styles.circleButton, { backgroundColor: theme.backgroundElement }]}>
              <SolarIcon name="TrashBinTrash" type="linear" size={20} color={theme.accent} />
            </Pressable>
          </View>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {notifications.length === 0 ? (
            /* Empty state when all notifications dismissed or deleted */
            <View style={styles.emptyContainer}>
              <SolarIcon name="Bell" type="linear" size={48} themeColor="muted" />
              <ThemedText type="smallBold" style={styles.emptyTitle}>
                No Notifications
              </ThemedText>
              <ThemedText type="small" themeColor="muted" style={styles.emptySubtitle}>
                You are all caught up with your study announcements, test reminders, and curriculum milestones.
              </ThemedText>
            </View>
          ) : (
            notifications.map((item, index) => (
              <NotificationCard
                key={item.id}
                item={item}
                index={index}
                onDismiss={handleDismiss}
                onToggleRead={handleToggleRead}
              />
            ))
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 96,
  },
  headerSpacer: {
    width: 52,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 96,
    justifyContent: 'flex-end',
    gap: Spacing.two,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: Rounded.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.six,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    gap: 6,
  },
  cardWrapper: {
    width: '100%',
  },
  cardContainer: {
    width: '100%',
    borderRadius: Rounded.card,
    borderWidth: 0,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 10,
  },
  iconSlot: {
    paddingTop: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentColumn: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.one,
  },
  titleText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 17,
  },
  timeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  timeText: {
    fontSize: 10.5,
    lineHeight: 14,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: Rounded.full,
  },
  descriptionText: {
    fontSize: 11.5,
    lineHeight: 15,
  },
  expandHint: {
    fontFamily: Fonts?.sans,
    fontSize: 10.5,
    fontWeight: '600',
    marginTop: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.six,
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
    marginTop: Spacing.five,
  },
  emptyTitle: {
    fontSize: 18,
    lineHeight: 24,
    marginTop: Spacing.two,
  },
  emptySubtitle: {
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 20,
  },
});
