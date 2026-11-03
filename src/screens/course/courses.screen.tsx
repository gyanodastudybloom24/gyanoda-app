import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

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
import { CourseCard, EnrolledCourseCard } from '@/features/courses';
import { useEnrolledCourses } from '@/hooks/use-enrolled-courses';
import { useTheme } from '@/hooks/use-theme';
import type { CourseItem } from '@/types';
import type { MainTabScreenProps } from '@/types/navigation';

export type CoursesScreenProps = MainTabScreenProps<'Courses'>;

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
  cardPlaceholder: {
    flex: 1,
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
