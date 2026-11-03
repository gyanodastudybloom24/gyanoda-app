import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SolarIcon } from '@/components/icons';
import { Fonts, Rounded } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { triggerHaptic } from '@/utils';

export type MembershipTier = 'free' | 'pro' | 'plus';

export interface MembershipBadgeProps {
  tier?: MembershipTier;
  size?: 'sm' | 'md';
  onPress?: () => void;
}

const TIER_CONFIG = {
  free: {
    label: 'FREE',
    iconName: 'Star' as const,
    light: {
      bg: '#f1f5f9',
      text: '#475569',
      border: '#cbd5e1',
      iconColor: '#64748b',
    },
    dark: {
      bg: '#1e293b',
      text: '#94a3b8',
      border: '#334155',
      iconColor: '#94a3b8',
    },
  },
  pro: {
    label: 'PRO',
    iconName: 'CrownStar' as const,
    light: {
      bg: '#fef3c7',
      text: '#b45309',
      border: '#fde68a',
      iconColor: '#f59e0b',
    },
    dark: {
      bg: '#451a03',
      text: '#fde68a',
      border: '#78350f',
      iconColor: '#fbbf24',
    },
  },
  plus: {
    label: 'PLUS',
    iconName: 'Bolt' as const,
    light: {
      bg: '#eff6ff',
      text: '#1d4ed8',
      border: '#bfdbfe',
      iconColor: '#3880FF',
    },
    dark: {
      bg: '#172554',
      text: '#93c5fd',
      border: '#1e40af',
      iconColor: '#60a5fa',
    },
  },
} as const;

export function MembershipBadge({ tier = 'free', size = 'sm', onPress }: MembershipBadgeProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const config = TIER_CONFIG[tier];
  const palette = isDark ? config.dark : config.light;

  const handlePress = () => {
    if (onPress) {
      triggerHaptic(20);
      onPress();
    }
  };

  const badgeContent = (
    <View
      style={[
        styles.badge,
        size === 'md' ? styles.badgeMd : styles.badgeSm,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
        },
      ]}>
      <SolarIcon
        name={config.iconName}
        type="bold"
        size={size === 'md' ? 13 : 11}
        color={palette.iconColor}
      />
      <Text
        style={[
          styles.label,
          size === 'md' ? styles.labelMd : styles.labelSm,
          { color: palette.text },
        ]}>
        {config.label}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Membership tier: ${config.label}`}
        onPress={handlePress}
        hitSlop={6}>
        {badgeContent}
      </Pressable>
    );
  }

  return badgeContent;
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Rounded.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    gap: 4,
  },
  badgeMd: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    gap: 5,
  },
  label: {
    fontFamily: Fonts?.sans,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  labelSm: {
    fontSize: 10,
    lineHeight: 13,
  },
  labelMd: {
    fontSize: 12,
    lineHeight: 15,
  },
});

