import { useState } from 'react';
import {
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { SolarIcon } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button, FocusAwareStatusBar } from '@/components/ui';
import { Fonts, MaxContentWidth, Rounded, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { authService } from '@/services';
import type { RootStackScreenProps } from '@/types/navigation';

export type ChooseExamScreenProps = RootStackScreenProps<'ChooseExam'>;

export type ExamType = 'WBJEE' | 'NEET';

interface ExamCardConfig {
  id: ExamType;
  title: string;
  subtitle: string;
  badge: string;
  icon: 'Rocket' | 'Stethoscope';
  primaryColor: string;
  midColor: string;
  fadeColor: string;
  titleColor: string;
  subtitleColor: string;
}

const EXAM_OPTIONS: ExamCardConfig[] = [
  {
    id: 'WBJEE',
    title: 'WBJEE',
    subtitle: 'Engineering & Tech',
    badge: 'PCM Track',
    icon: 'Rocket',
    primaryColor: '#0284c7', // Vibrant Deep Cerulean / Cyan
    midColor: '#38bdf8',
    fadeColor: '#e0f2fe',
    titleColor: '#075985',
    subtitleColor: 'rgba(7, 89, 133, 0.78)',
  },
  {
    id: 'NEET',
    title: 'NEET',
    subtitle: 'Medical Entrance',
    badge: 'PCB Track',
    icon: 'Stethoscope',
    primaryColor: '#e11d48', // Vivid Coral Rose / Crimson
    midColor: '#fb7185',
    fadeColor: '#ffe4e6',
    titleColor: '#881337',
    subtitleColor: 'rgba(136, 19, 55, 0.78)',
  },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ExamCard({
  item,
  isSelected,
  onSelect,
}: {
  item: ExamCardConfig;
  isSelected: boolean;
  onSelect: (id: ExamType) => void;
}) {
  const theme = useTheme();
  const isDark = theme.background === '#121212';
  const scale = useSharedValue(1);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setDimensions({ width: Math.round(width), height: Math.round(height) });
    }
  };

  const cardBg = isDark ? '#1e2230' : item.fadeColor;
  const gradientStart = isDark ? '#1e293b' : item.fadeColor;
  const gradientMid = isDark ? '#1e2230' : item.midColor;
  const gradientEnd = item.primaryColor;
  const titleColor = isDark ? '#ffffff' : item.titleColor;
  const subtitleColor = isDark ? 'rgba(255, 255, 255, 0.78)' : item.subtitleColor;

  const cardWidth = dimensions.width > 0 ? dimensions.width : '100%';
  const cardHeight = dimensions.height > 0 ? dimensions.height : '100%';

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${item.subtitle}`}
      accessibilityState={{ selected: isSelected }}
      onPress={() => onSelect(item.id)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onLayout={handleLayout}
      style={[
        styles.card,
        { backgroundColor: cardBg },
        isSelected && styles.cardSelected,
        animatedStyle,
      ]}>
      {/* Edge-to-edge full bleed gradient matching the Let's Study cards */}
      <Svg width={cardWidth} height={cardHeight} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient
            id={`diag-exam-${item.id}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%">
            <Stop offset="0%" stopColor={gradientStart} stopOpacity="1" />
            <Stop offset="55%" stopColor={gradientMid} stopOpacity="1" />
            <Stop offset="100%" stopColor={gradientEnd} stopOpacity="1" />
          </LinearGradient>
        </Defs>

        <Rect
          x="0"
          y="0"
          width={cardWidth}
          height={cardHeight}
          fill={`url(#diag-exam-${item.id})`}
        />
      </Svg>

      {/* Top Header Row with Title & Active Selection Pill Badge */}
      <View style={styles.cardTopHeader}>
        <View style={styles.textContainer}>
          <ThemedText style={[styles.cardTitle, { color: titleColor }]}>
            {item.title}
          </ThemedText>
          <ThemedText style={[styles.cardSubtitle, { color: subtitleColor }]}>
            {item.subtitle}
          </ThemedText>
        </View>

        {/* Selected Checkmark Badge */}
        {isSelected && (
          <View style={styles.selectedBadge}>
            <SolarIcon name="CheckCircle" type="bold" size={16} color="#ffffff" />
          </View>
        )}
      </View>

      {/* Bottom Track Tag */}
      <View style={styles.cardBottomRow}>
        <View style={styles.trackPill}>
          <Text style={styles.trackPillText}>{item.badge}</Text>
        </View>
      </View>

      {/* Crisp watermark icon at bottom-right corner: half visible, outer half clipped */}
      <View style={styles.iconSlot} pointerEvents="none">
        <SolarIcon
          name={item.icon}
          type="bold"
          size={84}
          color="#ffffff"
        />
      </View>
    </AnimatedPressable>
  );
}

export function ChooseExamScreen({ navigation }: ChooseExamScreenProps) {
  const insets = useSafeAreaInsets();
  const [selectedExam, setSelectedExam] = useState<ExamType | null>(null);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleContinue = () => {
    if (!selectedExam) return;

    // Save selected exam target in user session
    authService.setTargetExam(selectedExam);

    // Proceed to main application
    navigation.replace('Main');
  };

  return (
    <ThemedView style={styles.container}>
      <FocusAwareStatusBar />

      {/* Top Header: Back navigation button */}
      <View style={[styles.headerContainer, { paddingTop: insets.top + 8 }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={handleBack}
          hitSlop={12}
          style={({ pressed }) => [
            styles.navIconButton,
            pressed && styles.pressedState,
          ]}>
          <SolarIcon name="AltArrowLeft" size={20} themeColor="text" />
        </Pressable>
        <View style={styles.headerSpacer} />
      </View>

      {/* Main Content Area */}
      <View
        style={[
          styles.content,
          {
            paddingBottom: Math.max(insets.bottom, 24) + Spacing.three,
          },
        ]}>
        <View style={styles.centerBlock}>
          {/* Headline & Description */}
          <View style={styles.titleBlock}>
            <ThemedText style={styles.screenTitle}>
              Choose Your Target Exam
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.screenSubtitle}>
              Select the examination you are preparing for. You must select one to proceed.
            </ThemedText>
          </View>

          {/* 2 Exam Cards Grid (WBJEE and NEET) matching the Let's Study cards */}
          <View style={styles.cardsRow}>
            {EXAM_OPTIONS.map((exam) => (
              <ExamCard
                key={exam.id}
                item={exam}
                isSelected={selectedExam === exam.id}
                onSelect={(id) => setSelectedExam(id)}
              />
            ))}
          </View>
        </View>

        {/* Bottom Action: Disabled until user chooses an exam */}
        <View style={styles.actionContainer}>
          <Button
            title={selectedExam ? `Continue with ${selectedExam}` : 'Choose an Exam to Continue'}
            variant="primary"
            size="lg"
            rounded="full"
            disabled={!selectedExam}
            onPress={handleContinue}
            style={styles.submitButton}
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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.two,
  },
  navIconButton: {
    width: 40,
    height: 40,
    borderRadius: Rounded.full,
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  pressedState: {
    opacity: 0.7,
  },
  content: {
    flex: 1,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    justifyContent: 'space-between',
  },
  centerBlock: {
    gap: Spacing.four,
    marginTop: Spacing.two,
  },
  titleBlock: {
    gap: 6,
  },
  screenTitle: {
    fontFamily: Fonts?.sans,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontFamily: Fonts?.sans,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '400',
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  card: {
    flex: 1,
    aspectRatio: 1, // Standard 1:1 rounded square shape matching Let's Study
    borderRadius: Rounded.card,
    overflow: 'hidden',
    padding: Spacing.three,
    justifyContent: 'space-between',
    borderWidth: 2.5,
    borderColor: 'transparent',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  cardSelected: {
    borderColor: '#ffffff',
    shadowColor: '#000000',
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 4,
  },
  cardTopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 2,
  },
  textContainer: {
    gap: 2,
    flex: 1,
  },
  cardTitle: {
    fontFamily: Fonts?.sans,
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  cardSubtitle: {
    fontFamily: Fonts?.sans,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  selectedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBottomRow: {
    zIndex: 2,
    alignSelf: 'flex-start',
  },
  trackPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Rounded.full,
  },
  trackPillText: {
    fontFamily: Fonts?.sans,
    fontSize: 10.5,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  iconSlot: {
    position: 'absolute',
    bottom: -18,
    right: -18,
    zIndex: 1,
    opacity: 0.88, // Crisp and brightly visible white against saturated primary color corner
  },
  actionContainer: {
    width: '100%',
    marginTop: Spacing.three,
  },
  submitButton: {
    width: '100%',
  },
});

