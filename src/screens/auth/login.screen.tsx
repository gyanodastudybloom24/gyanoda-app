import { Image } from 'expo-image';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button, FocusAwareStatusBar } from '@/components/ui';
import { Fonts, MaxContentWidth, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import type { RootStackScreenProps } from '@/types/navigation';

export type LoginScreenProps = RootStackScreenProps<'Login'>;

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// High-quality online education hero image
const HERO_ILLUSTRATION_URL =
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop';

export function LoginScreen({ navigation }: LoginScreenProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleLogin = () => {
    // Open progressive onboarding setup flow
    navigation.navigate('OnboardingFlow');
  };

  return (
    <ThemedView style={styles.container}>
      <FocusAwareStatusBar />

      {/* Top Hero Section: Image completely covers the entire area with no gaps and no extra graphics */}
      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: isDark ? '#102A6B' : '#1A56DB',
          },
        ]}>
        <Image
          source={{ uri: HERO_ILLUSTRATION_URL }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={300}
        />
      </View>

      {/* Bottom Content Section: Welcome Text, Description, and Full-Width Brand Button */}
      <View
        style={[
          styles.contentSection,
          {
            paddingBottom: Math.max(insets.bottom, 24) + Spacing.two,
          },
        ]}>
        <View style={styles.textContent}>
          {/* Main Headline styled like the reference layout */}
          <ThemedText style={styles.headline}>
            Welcome to Gyanoda.
          </ThemedText>
          <Text style={[styles.headlineAccent, { color: theme.brand }]}>
            Master your exams with ease.
          </Text>

          {/* Professional Supporting Subtitle */}
          <ThemedText
            themeColor="textSecondary"
            style={styles.subtitle}
            numberOfLines={3}>
            High-yield past year solutions, chapter video walkthroughs, and step-by-step examination drills crafted for your success.
          </ThemedText>
        </View>

        {/* Action Button: Log in only (no sign up button) */}
        <View style={styles.buttonContainer}>
          <Button
            title="Log in"
            variant="primary"
            size="lg"
            rounded="full"
            onPress={handleLogin}
            style={styles.loginButton}
          />
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroCard: {
    height: SCREEN_HEIGHT * 0.54,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  contentSection: {
    flex: 1,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.four + 4,
    justifyContent: 'space-between',
  },
  textContent: {
    gap: 4,
  },
  headline: {
    fontFamily: Fonts?.sans,
    fontSize: 27,
    lineHeight: 33,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headlineAccent: {
    fontFamily: Fonts?.sans,
    fontSize: 27,
    lineHeight: 33,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: Spacing.two,
  },
  subtitle: {
    fontFamily: Fonts?.sans,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '400',
  },
  buttonContainer: {
    width: '100%',
    marginTop: Spacing.two,
  },
  loginButton: {
    width: '100%',
  },
});
