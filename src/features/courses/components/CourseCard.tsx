import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { SolarIcon } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { Fonts, Rounded, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { CourseItem } from '@/types/courses';
import type { RootStackParamList } from '@/types/navigation';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface CourseCardProps {
  item: CourseItem;
  onPress?: (item: CourseItem) => void;
}

export function CourseCard({ item, onPress }: CourseCardProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const scale = useSharedValue(1);
  const theme = useTheme();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = () => {
    if (onPress) {
      onPress(item);
    } else {
      navigation.navigate('CourseDetails', {
        courseId: item.id,
        title: item.title,
      });
    }
  };

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${item.subtitle}`}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
        animatedStyle,
      ]}>
      {/* Full Image Covered */}
      <Image
        source={{ uri: item.imageUrl }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={300}
      />

      {/* Top Left Title and Subtitle */}
      <View style={styles.cardHeader}>
        <ThemedText style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </ThemedText>
        <ThemedText style={styles.cardSubtitle} numberOfLines={2}>
          {item.subtitle}
        </ThemedText>
      </View>

      {/* Bottom Right Rounded Button with Arrow Up Right Icon */}
      <View
        style={[
          styles.actionButton,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: theme.border,
          },
        ]}>
        <SolarIcon name="ArrowRightUp" type="linear" size={20} color={theme.text} />
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    aspectRatio: 1, // Standard 1:1 rounded square shape matching home study section
    borderRadius: Rounded.card, // 24px clean soft rounded corners
    overflow: 'hidden',
    padding: Spacing.three,
    justifyContent: 'space-between',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardHeader: {
    zIndex: 2,
    gap: 3,
  },
  cardTitle: {
    fontFamily: Fonts?.sans,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardSubtitle: {
    fontFamily: Fonts?.sans,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  actionButton: {
    position: 'absolute',
    bottom: Spacing.one, // 4px offset - prevents touching the corner while staying tucked into bottom-right
    right: Spacing.one,
    width: 48,
    height: 48,
    borderRadius: Rounded.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    zIndex: 3,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
});

