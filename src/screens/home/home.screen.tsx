import { Image } from 'expo-image';
import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { SolarIcon } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Header } from '@/components/ui';
import { BottomTabInset, Fonts, MaxContentWidth, Rounded, Spacing } from '@/constants/theme';
import { homeData, recentlyWatchedItems } from '@/data';
import { RecentlyWatchedCard } from '@/features/home/components/RecentlyWatchedCard';
import { StreakCard } from '@/features/home/components/StreakCard';
import { SubjectCardsGrid } from '@/features/home/components/SubjectCardsGrid';
import { UpgradeProCard } from '@/features/home/components/UpgradeProCard';
import { WelcomeHeader } from '@/features/home/components/WelcomeHeader';
import { useSubscription } from '@/hooks/use-subscription';
import { useTheme } from '@/hooks/use-theme';
import type { MainTabScreenProps } from '@/types/navigation';

export type HomeScreenProps = MainTabScreenProps<'Home'>;

export function HomeScreen({ navigation }: HomeScreenProps) {
  const theme = useTheme();
  const { tier } = useSubscription();

  const handleWalletPress = () => {
    navigation.navigate('Wallet');
  };

  return (
    <ThemedView style={styles.container}>
      {/* Transparent header with profile image on left, search, wallet, and notification on right */}
      <Header
        left={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Profile of ${homeData.profile.name}`}
            onPress={() => navigation.navigate('Profile')}
            style={[styles.avatarButton, { borderColor: theme.border }]}>
            <Image
              source={{ uri: homeData.profile.avatarUrl }}
              style={styles.avatarImage}
              contentFit="cover"
              transition={300}
            />
          </Pressable>
        }
        right={
          <View style={styles.headerRight}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Search curriculum"
              style={[styles.circleButton, { backgroundColor: theme.backgroundElement }]}>
              <SolarIcon name="Magnifer" type="linear" size={20} color={theme.text} />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Wallet"
              onPress={handleWalletPress}
              style={[styles.circleButton, { backgroundColor: theme.backgroundElement }]}>
              <SolarIcon name="Wallet2" type="linear" size={20} color={theme.text} />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              onPress={() => navigation.navigate('Notifications')}
              style={[styles.circleButton, { backgroundColor: theme.backgroundElement }]}>
              <SolarIcon name="Bell" type="linear" size={20} color={theme.text} />
              {homeData.notifications?.hasUnread && (
                <View
                  style={[
                    styles.notificationBadge,
                    {
                      backgroundColor: theme.notificationBadge,
                      borderColor: theme.background,
                    },
                  ]}
                />
              )}
            </Pressable>
          </View>
        }
      />

      {/* Screen Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Animated Welcome Message with Blur & Typing Animation */}
          <WelcomeHeader
            data={homeData.welcome}
            tier={tier}
            onTierPress={() => navigation.navigate('Wallet')}
          />

          {/* Sleek card to upgrade the plan to Pro (only shown when on free tier) */}
          {tier === 'free' && (
            <UpgradeProCard onUpgradePress={() => navigation.navigate('Wallet')} />
          )}

          {/* "Let's Study" Section Title */}
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>{"Let's Study"}</ThemedText>
          </View>

          {/* 4 Subject Cards (Physics, Chemistry, Maths, All) */}
          <SubjectCardsGrid />

          {/* "Recently Watched" Section Header with Clickable "All" + History Icon */}
          <View style={[styles.sectionHeaderRow, styles.sectionHeaderSpaced]}>
            <ThemedText style={styles.sectionTitle}>Recently Watched</ThemedText>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View all watch history"
              onPress={() => navigation.navigate('RecentlyWatched')}
              style={[styles.seeAllButton, { backgroundColor: theme.backgroundElement }]}>
              <SolarIcon name="History" type="linear" size={15} color={theme.text} />
              <ThemedText style={[styles.seeAllText, { color: theme.text }]}>All</ThemedText>
            </Pressable>
          </View>

          {/* Horizontal FlatList showing only 4 most recent watches */}
          <FlatList
            horizontal
            data={recentlyWatchedItems.slice(0, 4)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <RecentlyWatchedCard item={item} />}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentListContent}
            style={styles.recentList}
          />

          {/* Thin separation line extending from left to just past center */}
          <View style={[styles.separatorLine, { backgroundColor: theme.border }]} />

          {/* Streak Performance & Graph Card */}
          <StreakCard />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: Rounded.full,
    overflow: 'hidden',
    borderWidth: 1.5,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: Rounded.full,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: Rounded.full,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 9,
    height: 9,
    borderRadius: Rounded.full,
    borderWidth: 1.5,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: BottomTabInset + Spacing.five,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  sectionHeader: {
    marginTop: Spacing.two,
    marginBottom: Spacing.two,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Rounded.full,
  },
  seeAllText: {
    fontFamily: Fonts?.sans,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  sectionHeaderSpaced: {
    marginTop: Spacing.four,
  },
  sectionTitle: {
    fontFamily: Fonts?.sans,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  recentList: {
    marginHorizontal: -Spacing.four,
  },
  recentListContent: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    paddingBottom: Spacing.three,
  },
  separatorLine: {
    width: '58%',
    height: 1,
    marginTop: Spacing.four,
    marginBottom: Spacing.four,
    borderRadius: Rounded.full,
    alignSelf: 'flex-start',
  },
});
