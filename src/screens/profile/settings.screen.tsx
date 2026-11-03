import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { SolarIcon } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Header, customAlert } from '@/components/ui';
import { Fonts, MaxContentWidth, Rounded, Spacing } from '@/constants/theme';
import { settingsItems } from '@/data';
import { useTheme } from '@/hooks/use-theme';
import type { SettingsItem } from '@/types';
import type { RootStackScreenProps } from '@/types/navigation';

export type SettingsScreenProps = RootStackScreenProps<'Settings'>;

export function SettingsScreen({ navigation }: SettingsScreenProps) {
  const theme = useTheme();

  const handleItemPress = (item: SettingsItem) => {
    if (item.id === 'app-version') {
      customAlert.show({
        title: 'App Version',
        message: `Gyanoda version ${item.value ?? '4.0.9'} is installed and up to date.`,
        type: 'info',
      });
      return;
    }

    customAlert.show({
      title: item.title,
      message: `${item.title} settings and preferences will be available in the next release.`,
      type: 'info',
    });
  };

  const renderItem = ({ item }: { item: SettingsItem }) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={item.title}
      onPress={() => handleItemPress(item)}
      style={({ pressed }) => [styles.itemContainer, pressed && { opacity: 0.65 }]}>
      {/* Icon */}
      <View style={[styles.iconWrapper, { backgroundColor: theme.backgroundElement }]}>
        <SolarIcon name={item.icon as any} type="linear" size={22} color={theme.brand} />
      </View>

      {/* Middle Text Details */}
      <View style={styles.textDetails}>
        <ThemedText type="smallBold" style={styles.title}>
          {item.title}
        </ThemedText>
        {item.subtitle ? (
          <ThemedText type="small" themeColor="muted" style={styles.subtitle}>
            {item.subtitle}
          </ThemedText>
        ) : null}
      </View>

      {/* Right Trailing Action / Value */}
      {item.value ? (
        <View style={[styles.valueBadge, { backgroundColor: theme.backgroundElement }]}>
          <Text style={[styles.valueText, { color: theme.brand }]}>{item.value}</Text>
        </View>
      ) : (
        <SolarIcon name="AltArrowRight" type="linear" size={18} color={theme.muted} />
      )}
    </Pressable>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Header with Back button only */}
      <Header
        title="Settings"
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
        right={<View style={styles.headerSpacer} />}
      />

      {/* FlatList for all Settings items */}
      <FlatList
        data={settingsItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: theme.border }]} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
  headerSpacer: {
    width: 44,
    height: 44,
  },
  listContent: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.six,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    gap: Spacing.three,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: Rounded.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textDetails: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 16,
    lineHeight: 22,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  valueBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: Rounded.full,
  },
  valueText: {
    fontFamily: Fonts?.sans,
    fontSize: 13,
    fontWeight: '600',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 56,
  },
});
