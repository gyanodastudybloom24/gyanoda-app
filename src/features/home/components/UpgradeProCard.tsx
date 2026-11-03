import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { SolarIcon } from '@/components/icons';
import { Fonts, Palette, Rounded, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { RootStackParamList } from '@/types/navigation';
import { triggerHaptic } from '@/utils';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface UpgradeProCardProps {
  onUpgradePress?: () => void;
}

export function UpgradeProCard({ onUpgradePress }: UpgradeProCardProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = () => {
    triggerHaptic(25);
    if (onUpgradePress) {
      onUpgradePress();
      return;
    }
    navigation.navigate('Wallet');
  };

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel="Go to Pro - Unlock full exam prep with Pro"
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.card,
        animatedStyle,
        {
          backgroundColor: isDark ? '#063023' : '#dcfce7',
          borderColor: isDark ? '#065f46' : '#bbf7d0',
        },
      ]}>
      {/* Black Circular Icon Container with Gold Crown */}
      <View style={styles.iconContainer}>
        <SolarIcon name="Crown" type="bold" size={16} color="#f59e0b" />
      </View>

      {/* Middle Text Content */}
      <View style={styles.textCol}>
        <Text style={[styles.title, { color: isDark ? '#ecfdf5' : '#064e3b' }]}>
          Go to Pro
        </Text>
        <Text style={[styles.subtitle, { color: isDark ? '#a7f3d0' : '#047857' }]}>
          Unlock full exam prep with Pro
        </Text>
      </View>

      {/* Circular Button with Constant Accent Color & Diagonal Up-Right Arrow */}
      <View style={[styles.actionButton, { backgroundColor: Palette.accent }]}>
        <SolarIcon name="ArrowRightUp" type="linear" size={15} color="#ffffff" />
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: Rounded.full,
    borderWidth: 1,
    marginBottom: Spacing.two,
    gap: 10,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: Rounded.full,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textCol: {
    flex: 1,
    justifyContent: 'center',
    gap: 1,
  },
  title: {
    fontFamily: Fonts?.sans,
    fontSize: 13.5,
    lineHeight: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontFamily: Fonts?.sans,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: Rounded.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
