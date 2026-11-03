import { useNavigation } from '@react-navigation/native';
import { type ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  type StyleProp,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SolarIcon } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type HeaderProps = {
  /**
   * Title text or custom ReactNode
   */
  title?: string | ReactNode;
  /**
   * Subtitle text or custom ReactNode
   */
  subtitle?: string | ReactNode;
  /**
   * Content rendered in the left slot (e.g. back button, avatar, logo)
   */
  left?: ReactNode;
  /**
   * Content rendered in the right slot (e.g. action icons, notifications, settings)
   */
  right?: ReactNode;
  /**
   * Custom center content; overrides default title/subtitle display
   */
  center?: ReactNode;
  /**
   * Optional custom content rendered below the main header bar (e.g. search bar, segmented control)
   */
  children?: ReactNode;
  /**
   * Automatically render a back button if navigation can go back
   */
  showBack?: boolean;
  /**
   * Custom callback for back press
   */
  onBackPress?: () => void;
  /**
   * Alignment of the title/subtitle when using default center content
   * @default 'left'
   */
  align?: 'left' | 'center';
  /**
   * Whether to include top padding for the device safe area / status bar
   * @default true
   */
  withSafeArea?: boolean;
  /**
   * Additional container styles (backgroundColor remains transparent)
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Custom title text styles
   */
  titleStyle?: StyleProp<TextStyle>;
};

/**
 * Reusable transparent header component.
 * Background is strictly transparent and content adapts to the page context.
 */
export function Header({
  title,
  subtitle,
  left,
  right,
  center,
  children,
  showBack = false,
  onBackPress,
  align = 'left',
  withSafeArea = true,
  style,
  titleStyle,
}: HeaderProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const navigation = useNavigation();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const renderLeft = () => {
    if (left !== undefined) {
      return left;
    }
    if (showBack) {
      return (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={handleBack}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
          <SolarIcon name="AltArrowLeft" type="bold" size={24} color={theme.text} />
        </Pressable>
      );
    }
    return null;
  };

  const renderCenter = () => {
    if (center !== undefined) {
      return center;
    }

    if (!title && !subtitle) {
      return null;
    }

    const isCentered = align === 'center';

    return (
      <View style={[styles.textWrapper, isCentered && styles.textWrapperCentered]}>
        {typeof title === 'string' ? (
          <ThemedText
            type="smallBold"
            numberOfLines={1}
            style={[styles.title, isCentered && styles.textCenter, titleStyle]}>
            {title}
          </ThemedText>
        ) : (
          title
        )}
        {typeof subtitle === 'string' ? (
          <ThemedText
            type="small"
            themeColor="muted"
            numberOfLines={1}
            style={[styles.subtitle, isCentered && styles.textCenter]}>
            {subtitle}
          </ThemedText>
        ) : (
          subtitle
        )}
      </View>
    );
  };

  return (
    <View
      style={[
        styles.outerContainer,
        { paddingTop: withSafeArea ? Math.max(insets.top, Spacing.two) : 0 },
        style,
        styles.strictlyTransparent,
      ]}>
      <View style={styles.bar}>
        <View style={styles.leftSlot}>{renderLeft()}</View>
        <View style={[styles.centerSlot, align === 'center' ? styles.centerSlotCentered : styles.centerSlotLeft]}>
          {renderCenter()}
        </View>
        <View style={styles.rightSlot}>{right}</View>
      </View>
      {children ? <View style={styles.extraContent}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
    alignSelf: 'center',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.two,
    zIndex: 50,
  },
  strictlyTransparent: {
    backgroundColor: 'transparent',
  },
  bar: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minWidth: 40,
  },
  centerSlot: {
    flex: 1,
    paddingHorizontal: Spacing.two,
  },
  centerSlotLeft: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  centerSlotCentered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 40,
    gap: Spacing.two,
  },
  textWrapper: {
    gap: 2,
  },
  textWrapperCentered: {
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  textCenter: {
    textAlign: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  pressed: {
    opacity: 0.6,
  },
  extraContent: {
    paddingTop: Spacing.two,
  },
});
