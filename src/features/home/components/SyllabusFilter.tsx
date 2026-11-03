import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Rounded, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type SyllabusFilterOption = 'Subjects' | 'Chapters' | 'Years';

export type SyllabusFilterProps = {
  activeFilter: SyllabusFilterOption;
  onSelectFilter: (filter: SyllabusFilterOption) => void;
};

const FILTER_OPTIONS: SyllabusFilterOption[] = ['Subjects', 'Chapters', 'Years'];

export function SyllabusFilter({
  activeFilter,
  onSelectFilter,
}: SyllabusFilterProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {FILTER_OPTIONS.map((option) => {
          const isActive = activeFilter === option;

          return (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityLabel={`Filter by ${option}`}
              accessibilityState={{ selected: isActive }}
              onPress={() => onSelectFilter(option)}
              style={[
                styles.chip,
                {
                  backgroundColor: isActive ? theme.accent : theme.card,
                  borderColor: isActive ? theme.accent : theme.border,
                },
              ]}>
              <ThemedText
                type="small"
                style={[
                  styles.chipText,
                  {
                    color: isActive ? '#ffffff' : theme.text,
                    fontWeight: isActive ? '700' : '500',
                  },
                ]}>
                {option}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: Spacing.two,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  chip: {
    borderRadius: Rounded.full,
    borderWidth: 1,
    paddingVertical: 7,
    paddingHorizontal: 16,
  },
  chipText: {
    fontFamily: Fonts?.sans,
    fontSize: 13,
    lineHeight: 18,
  },
});
