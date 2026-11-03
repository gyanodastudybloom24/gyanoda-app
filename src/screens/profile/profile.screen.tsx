import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SolarIcon } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Header, customAlert } from '@/components/ui';
import { Fonts, MaxContentWidth, Rounded, Spacing, Typography } from '@/constants/theme';
import { profileData, profileMenuItems } from '@/data';
import { useTheme } from '@/hooks/use-theme';
import { authService } from '@/services';
import type { ProfileMenuItem } from '@/types';
import type { RootStackScreenProps } from '@/types/navigation';

export type ProfileScreenProps = RootStackScreenProps<'Profile'>;

export function ProfileScreen({ navigation }: ProfileScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
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

  const handleEditPress = () => {
    customAlert.show({
      title: 'Edit Profile',
      message: 'Profile editing and avatar customization will be available in the next release.',
      type: 'info',
    });
  };

  const handleMenuItemPress = (item: ProfileMenuItem) => {
    if (item.id === 'settings') {
      navigation.navigate('Settings');
      return;
    }

    customAlert.show({
      title: item.title,
      message: `${item.title} details will be available in the upcoming release.`,
      type: 'info',
    });
  };

  const handleContactPress = () => {
    setIsMenuOpen(false);
    customAlert.show({
      title: 'Contact Us',
      message: 'Reach out to our student counselors at support@gyanoda.edu or call +91 98765 43210.',
      type: 'info',
    });
  };

  const handleLogoutPress = () => {
    setIsMenuOpen(false);
    customAlert.show({
      title: 'Logout',
      message: 'Are you sure you want to log out of your Gyanoda account?',
      type: 'confirm',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            authService.logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ],
    });
  };

  // Header component for FlatList: Round Avatar + Pencil + Details + Numbers (Stats)
  const renderListHeader = () => (
    <View style={styles.headerContentWrapper}>
      {/* Profile User Info Section */}
      <View style={styles.profileHeaderSection}>
        {/* Round Avatar Container with Pencil Icon */}
        <View style={styles.avatarWrapper}>
          <View style={[styles.avatarContainer, { borderColor: theme.border }]}>
            <Image
              source={{ uri: profileData.avatarUrl }}
              style={styles.avatarImage}
              contentFit="cover"
              transition={300}
            />
          </View>

          {/* Pencil Edit Icon Badge */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Edit profile photo"
            onPress={handleEditPress}
            style={[styles.pencilBadge, { borderColor: theme.background }]}>
            <SolarIcon name="Pen" type="linear" size={14} color="#ffffff" />
          </Pressable>
        </View>

        {/* Profile Text & Badges Details */}
        <View style={styles.profileDetails}>
          <ThemedText type="smallBold" style={styles.userName}>
            {profileData.name}
          </ThemedText>

          {profileData.location ? (
            <View style={styles.locationRow}>
              <SolarIcon name="MapPoint" type="linear" size={15} color={theme.brand} />
              <ThemedText type="small" themeColor="muted" style={styles.locationText}>
                {profileData.location}
              </ThemedText>
            </View>
          ) : null}

          {/* Badges Row */}
          {profileData.badges && profileData.badges.length > 0 ? (
            <View style={styles.badgesRow}>
              {profileData.badges.map((badge) => (
                <View
                  key={badge.id}
                  style={[
                    styles.badgePill,
                    { backgroundColor: badge.backgroundColor ?? theme.backgroundElement },
                  ]}>
                  <Text style={[styles.badgeText, { color: badge.color ?? theme.text }]}>
                    {badge.label}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </View>

      {/* Stats Section without card box (Clean, borderless layout with dividers) */}
      <View style={styles.statsContainer}>
        <View style={styles.statsGrid}>
          {/* Test Taken */}
          <View style={styles.statColumn}>
            <ThemedText style={styles.statNumber}>
              {profileData.stats.testsTaken}
            </ThemedText>
            <ThemedText type="small" themeColor="muted" style={styles.statLabel}>
              Test Taken
            </ThemedText>
          </View>

          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />

          {/* Avg Score */}
          <View style={styles.statColumn}>
            <ThemedText style={styles.statNumber}>
              {profileData.stats.avgScore}
            </ThemedText>
            <ThemedText type="small" themeColor="muted" style={styles.statLabel}>
              Avg Score
            </ThemedText>
          </View>

          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />

          {/* Study Streak */}
          <View style={styles.statColumn}>
            <ThemedText style={styles.statNumber}>
              {profileData.stats.studyStreak}
            </ThemedText>
            <ThemedText type="small" themeColor="muted" style={styles.statLabel}>
              Study Streak
            </ThemedText>
          </View>

          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />

          {/* Percentile */}
          <View style={styles.statColumn}>
            <ThemedText style={styles.statNumber}>
              {profileData.stats.percentile ?? profileData.stats.studyPercentile}
            </ThemedText>
            <ThemedText type="small" themeColor="muted" style={styles.statLabel}>
              Percentile
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Section Divider / Label before Menu Items */}
      <View style={styles.menuSectionHeader}>
        <ThemedText type="small" themeColor="muted" style={styles.menuSectionTitle}>
          LEARNING & ACCOUNT
        </ThemedText>
      </View>
    </View>
  );

  // Render each menu item in FlatList
  const renderMenuItem = ({ item }: { item: ProfileMenuItem }) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={item.title}
      onPress={() => handleMenuItemPress(item)}
      style={({ pressed }) => [
        styles.menuItem,
        pressed && { opacity: 0.65 },
      ]}>
      {/* Left Icon Container */}
      <View style={[styles.menuIconWrapper, { backgroundColor: theme.backgroundElement }]}>
        <SolarIcon name={item.icon as any} type="linear" size={22} color={theme.brand} />
      </View>

      {/* Middle Text Details */}
      <View style={styles.menuContent}>
        <ThemedText type="smallBold" style={styles.menuTitle}>
          {item.title}
        </ThemedText>
        {item.subtitle ? (
          <ThemedText type="small" themeColor="muted" style={styles.menuSubtitle}>
            {item.subtitle}
          </ThemedText>
        ) : null}
      </View>

      {/* Right Chevron Arrow */}
      <SolarIcon name="AltArrowRight" type="linear" size={18} color={theme.muted} />
    </Pressable>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Top Header with ArrowLeft Back and Three-Dot Menu button */}
      <Header
        title="Profile"
        align="center"
        left={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => navigation.goBack()}
            style={[styles.backButton, { backgroundColor: theme.backgroundElement }]}>
            <SolarIcon name="ArrowLeft" type="linear" size={22} color={theme.text} />
          </Pressable>
        }
        right={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="More options"
            onPress={() => setIsMenuOpen((prev) => !prev)}
            style={[styles.backButton, { backgroundColor: theme.backgroundElement }]}>
            <SolarIcon name="MenuDots" type="bold" size={20} color={theme.text} />
          </Pressable>
        }
      />

      {/* FlatList for all content: Header + Stats + Menu Items */}
      <FlatList
        data={profileData.menuItems ?? profileMenuItems}
        keyExtractor={(item) => item.id}
        renderItem={renderMenuItem}
        ListHeaderComponent={renderListHeader}
        ItemSeparatorComponent={() => (
          <View style={[styles.menuSeparator, { backgroundColor: theme.border }]} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

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
            styles.popupMenu,
            {
              top: insets.top + 54,
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
            animatedMenuStyle,
          ]}>
          {/* Contact Option */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Contact Support"
            onPress={handleContactPress}
            style={({ pressed }) => [
              styles.popupItem,
              pressed && { backgroundColor: theme.backgroundElement },
            ]}>
            <SolarIcon name="Phone" type="linear" size={16} color={theme.text} />
            <ThemedText type="smallBold" style={styles.popupText}>
              Contact
            </ThemedText>
          </Pressable>

          {/* Divider */}
          <View style={[styles.popupDivider, { backgroundColor: theme.border }]} />

          {/* Logout Option (Pinkish Red) */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Logout"
            onPress={handleLogoutPress}
            style={({ pressed }) => [
              styles.popupItem,
              pressed && { backgroundColor: theme.backgroundElement },
            ]}>
            <SolarIcon name="Logout2" type="linear" size={16} color={theme.pinkishRed} />
            <Text
              style={[
                styles.popupText,
                { color: theme.pinkishRed, fontWeight: '600' },
              ]}>
              Logout
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
  backButton: {
    width: 44,
    height: 44,
    borderRadius: Rounded.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
  },
  headerContentWrapper: {
    paddingTop: Spacing.two,
  },
  profileHeaderSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarContainer: {
    width: 92,
    height: 92,
    borderRadius: Rounded.full,
    overflow: 'hidden',
    borderWidth: 2,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: Rounded.full,
  },
  pencilBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: Rounded.full,
    backgroundColor: '#282c3f',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  profileDetails: {
    flex: 1,
    gap: Spacing.half,
  },
  userName: {
    fontSize: 22,
    lineHeight: 28,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
    marginTop: 2,
  },
  locationText: {
    fontSize: 13,
    lineHeight: 18,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    marginTop: Spacing.one,
    flexWrap: 'wrap',
  },
  badgePill: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 3,
    borderRadius: Rounded.full,
  },
  badgeText: {
    fontFamily: Fonts?.sans,
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    marginTop: Spacing.four,
    paddingVertical: Spacing.two,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statColumn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.one,
  },
  statNumber: {
    fontFamily: Fonts?.sans,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: Typography.heading.fontWeight,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 28,
    opacity: 0.6,
  },
  menuSectionHeader: {
    marginTop: Spacing.five,
    marginBottom: Spacing.two,
    paddingTop: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(150, 150, 150, 0.2)',
  },
  menuSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    gap: Spacing.three,
  },
  menuIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: Rounded.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
    gap: 2,
  },
  menuTitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  menuSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  menuSeparator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 56,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
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
});
