import { ScrollView, StyleSheet, View } from 'react-native';

import { SolarIcon } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card, CardContent, CardHeader, CardTitle, Collapsible, Header } from '@/components/ui';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import type { MainTabScreenProps } from '@/types/navigation';

export type ExploreScreenProps = MainTabScreenProps<'Explore'>;

export function ExploreScreen({ navigation }: ExploreScreenProps) {
  return (
    <ThemedView style={styles.container}>
      {/* Reusable transparent header configured for Explore context */}
      <Header
        title="Explore Curriculum"
        subtitle="Browse subjects, pathways, and resources"
        right={
          <View style={styles.headerRight}>
            <SolarIcon name="Magnifer" type="linear" size={24} themeColor="text" />
          </View>
        }
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Card variant="default" rounded="md">
          <CardHeader>
            <CardTitle>Content Repository Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ThemedText type="small" themeColor="muted">
              Active curriculum modules will be synchronized from the Gyanoda content service.
              The modules below outline the upcoming learning streams.
            </ThemedText>
          </CardContent>
        </Card>

        <View style={styles.sectionsWrapper}>
          <Collapsible title="Foundational Mathematics">
            <ThemedText type="small" themeColor="muted">
              Interactive numerical problem solving, mental arithmetic, and algebraic thinking
              pathways.
            </ThemedText>
          </Collapsible>

          <Collapsible title="Science & Discovery">
            <ThemedText type="small" themeColor="muted">
              Inquiry-based scientific concepts, experiments, and nature observation logs.
            </ThemedText>
          </Collapsible>

          <Collapsible title="Language & Literacy">
            <ThemedText type="small" themeColor="muted">
              Reading comprehension, vocabulary building, and language enrichment modules.
            </ThemedText>
          </Collapsible>

          <Collapsible title="Offline Learning Resources">
            <ThemedText type="small" themeColor="muted">
              Downloadable lesson plans and worksheets for continuous learning without internet
              connectivity.
            </ThemedText>
          </Collapsible>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.four,
  },
  sectionsWrapper: {
    gap: Spacing.three,
  },
});
