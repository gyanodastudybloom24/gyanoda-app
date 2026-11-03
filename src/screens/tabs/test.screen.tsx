import { ScrollView, StyleSheet, View } from 'react-native';

import { SolarIcon } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Header } from '@/components/ui';
import { BottomTabInset, Fonts, MaxContentWidth, Rounded, Spacing } from '@/constants/theme';
import { TESTS } from '@/data';
import { useTheme } from '@/hooks/use-theme';
import type { TestItem } from '@/types';
import type { MainTabScreenProps } from '@/types/navigation';

export type TestScreenProps = MainTabScreenProps<'Test'>;
export type { TestItem };
export { TESTS };

export function TestScreen({ navigation: _navigation }: TestScreenProps) {
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <Header
        title="Test Series"
        subtitle="Practice mock tests, quizzes & benchmark scores"
        right={
          <View style={[styles.headerIconBtn, { backgroundColor: theme.backgroundElement }]}>
            <SolarIcon name="ChecklistMinimalistic" type="linear" size={20} color={theme.text} />
          </View>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
            Available Tests
          </ThemedText>

          <View style={styles.testList}>
            {TESTS.map((test) => (
              <View
                key={test.id}
                style={[
                  styles.testCard,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                  },
                ]}>
                <View style={styles.testHeader}>
                  <View style={styles.subjectPill}>
                    <ThemedText style={[styles.subjectText, { color: theme.brand }]}>
                      {test.subject}
                    </ThemedText>
                  </View>
                  <ThemedText style={[styles.statusText, { color: theme.textSecondary }]}>
                    {test.status}
                  </ThemedText>
                </View>

                <ThemedText style={[styles.testTitle, { color: theme.text }]}>
                  {test.title}
                </ThemedText>

                <View style={styles.metaRow}>
                  <ThemedText style={[styles.metaText, { color: theme.textSecondary }]}>
                    {test.questions} Questions • {test.durationMins} Mins
                  </ThemedText>
                </View>
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
  testList: {
    gap: Spacing.three,
  },
  testCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subjectPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Rounded.full,
  },
  subjectText: {
    fontFamily: Fonts?.sans,
    fontSize: 12,
    fontWeight: '700',
  },
  statusText: {
    fontFamily: Fonts?.sans,
    fontSize: 12,
    fontWeight: '500',
  },
  testTitle: {
    fontFamily: Fonts?.sans,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontFamily: Fonts?.sans,
    fontSize: 13,
    fontWeight: '500',
  },
});
