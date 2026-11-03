import { ScrollView, StyleSheet, View } from 'react-native';

import { SolarIcon } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Header } from '@/components/ui';
import { BottomTabInset, Fonts, MaxContentWidth, Rounded, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { MainTabScreenProps } from '@/types/navigation';

export type StudyScreenProps = MainTabScreenProps<'Study'>;

interface StudyResource {
  id: string;
  title: string;
  description: string;
  type: string;
  icon: string;
}

const STUDY_RESOURCES: StudyResource[] = [
  {
    id: 'res-1',
    title: 'Formula & Equation Handbook',
    description: 'Quick-reference equations for Physics & Physical Chemistry',
    type: 'Handbook',
    icon: 'NotebookBookmark',
  },
  {
    id: 'res-2',
    title: 'High-Yield Revision Flashcards',
    description: 'Definitions, laws, and key constants for quick review',
    type: 'Flashcards',
    icon: 'CardSearch',
  },
  {
    id: 'res-3',
    title: 'Solved Exemplar Problems',
    description: 'Step-by-step verified solutions for advanced conceptual problems',
    type: 'Solutions',
    icon: 'DiplomaVerified',
  },
];

export function StudyScreen({ navigation: _navigation }: StudyScreenProps) {
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <Header
        title="Study Room"
        subtitle="Formula sheets, notes & concept revisions"
        right={
          <View style={[styles.headerIconBtn, { backgroundColor: theme.backgroundElement }]}>
            <SolarIcon name="BookmarkOpened" type="linear" size={20} color={theme.text} />
          </View>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
            Study Resources
          </ThemedText>

          <View style={styles.resourceList}>
            {STUDY_RESOURCES.map((res) => (
              <View
                key={res.id}
                style={[
                  styles.resourceCard,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                  },
                ]}>
                <View style={styles.resourceHeader}>
                  <View style={[styles.resourceIconBox, { backgroundColor: theme.backgroundElement }]}>
                    <SolarIcon name={res.icon} type="bold" size={22} color={theme.brand} />
                  </View>
                  <View style={styles.resourcePill}>
                    <ThemedText style={[styles.resourcePillText, { color: theme.textSecondary }]}>
                      {res.type}
                    </ThemedText>
                  </View>
                </View>

                <ThemedText style={[styles.resourceTitle, { color: theme.text }]}>
                  {res.title}
                </ThemedText>
                <ThemedText style={[styles.resourceDesc, { color: theme.textSecondary }]}>
                  {res.description}
                </ThemedText>
              </View>
            ))}
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
  headerIconBtn: {
    width: 44,
    height: 44,
    borderRadius: Rounded.full,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingTop: Spacing.two,
  },
  sectionTitle: {
    fontFamily: Fonts?.sans,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: Spacing.three,
  },
  resourceList: {
    gap: Spacing.three,
  },
  resourceCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  resourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resourceIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resourcePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Rounded.full,
  },
  resourcePillText: {
    fontFamily: Fonts?.sans,
    fontSize: 12,
    fontWeight: '600',
  },
  resourceTitle: {
    fontFamily: Fonts?.sans,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  resourceDesc: {
    fontFamily: Fonts?.sans,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
});
