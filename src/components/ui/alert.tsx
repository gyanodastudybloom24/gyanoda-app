import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Button, type ButtonVariant } from './button';

import { SolarIcon } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Rounded, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type AlertType = 'info' | 'success' | 'warning' | 'error' | 'confirm';

export type AlertButton = {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive' | 'primary' | 'secondary';
};

export type AlertOptions = {
  title: string;
  message?: string;
  type?: AlertType;
  buttons?: AlertButton[];
  dismissible?: boolean;
  onDismiss?: () => void;
};

type AlertContextType = {
  showAlert: (options: AlertOptions) => void;
  hideAlert: () => void;
};

const AlertContext = createContext<AlertContextType | undefined>(undefined);

// Singleton handler for imperative calls without hook
let imperativeShowAlert: ((options: AlertOptions) => void) | null = null;
let imperativeHideAlert: (() => void) | null = null;

/**
 * Global custom alert trigger replacing native Alert.alert.
 *
 * @example
 * ```ts
 * customAlert.show({
 *   title: 'Save Changes?',
 *   message: 'Your progress will be saved to the learning service.',
 *   type: 'confirm',
 *   buttons: [
 *     { text: 'Cancel', style: 'cancel' },
 *     { text: 'Save', style: 'primary', onPress: () => handleSave() },
 *   ],
 * });
 * ```
 */
export const customAlert = {
  show: (options: AlertOptions) => {
    if (imperativeShowAlert) {
      imperativeShowAlert(options);
    } else {
      console.warn('AlertProvider is not mounted yet.');
    }
  },
  hide: () => {
    if (imperativeHideAlert) {
      imperativeHideAlert();
    }
  },
  info: (title: string, message?: string, buttons?: AlertButton[]) => {
    customAlert.show({ title, message, type: 'info', buttons });
  },
  success: (title: string, message?: string, buttons?: AlertButton[]) => {
    customAlert.show({ title, message, type: 'success', buttons });
  },
  warning: (title: string, message?: string, buttons?: AlertButton[]) => {
    customAlert.show({ title, message, type: 'warning', buttons });
  },
  error: (title: string, message?: string, buttons?: AlertButton[]) => {
    customAlert.show({ title, message, type: 'error', buttons });
  },
};

/**
 * Hook to trigger custom alerts.
 */
export function useAlert(): AlertContextType {
  const context = useContext(AlertContext);
  if (!context) {
    return {
      showAlert: customAlert.show,
      hideAlert: customAlert.hide,
    };
  }
  return context;
}

export function AlertProvider({ children }: { children: ReactNode }) {
  const [currentAlert, setCurrentAlert] = useState<AlertOptions | null>(null);
  const theme = useTheme();

  const backdropOpacity = useSharedValue(0);
  const dialogScale = useSharedValue(0.9);
  const dialogOpacity = useSharedValue(0);

  const showAlert = useCallback((options: AlertOptions) => {
    setCurrentAlert(options);
  }, []);

  const hideAlert = useCallback(() => {
    backdropOpacity.value = withTiming(0, { duration: 150 });
    dialogScale.value = withTiming(0.92, { duration: 150 });
    dialogOpacity.value = withTiming(0, { duration: 150 });
    setTimeout(() => {
      setCurrentAlert((prev) => {
        prev?.onDismiss?.();
        return null;
      });
    }, 160);
  }, [backdropOpacity, dialogOpacity, dialogScale]);

  const handleDismiss = useCallback(() => {
    const cancelBtn = currentAlert?.buttons?.find(
      (b) => b.style === 'cancel' || b.text.toLowerCase() === 'cancel'
    );
    hideAlert();
    cancelBtn?.onPress?.();
  }, [currentAlert, hideAlert]);

  useEffect(() => {
    imperativeShowAlert = showAlert;
    imperativeHideAlert = hideAlert;
    return () => {
      imperativeShowAlert = null;
      imperativeHideAlert = null;
    };
  }, [showAlert, hideAlert]);

  useEffect(() => {
    if (currentAlert) {
      backdropOpacity.value = withTiming(1, { duration: 200 });
      dialogScale.value = withSpring(1, { damping: 18, stiffness: 220, mass: 0.9 });
      dialogOpacity.value = withTiming(1, { duration: 200 });
    }
  }, [currentAlert, backdropOpacity, dialogOpacity, dialogScale]);

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const dialogAnimatedStyle = useAnimatedStyle(() => ({
    opacity: dialogOpacity.value,
    transform: [{ scale: dialogScale.value }],
  }));

  const alertType = currentAlert?.type ?? 'info';

  const getTypeMeta = () => {
    switch (alertType) {
      case 'success':
        return {
          icon: <SolarIcon name="CheckCircle" type="bold" size={28} color="#10b981" />,
          color: '#10b981',
          bgColor: '#10b98118',
        };
      case 'warning':
        return {
          icon: <SolarIcon name="DangerTriangle" type="bold" size={28} color={theme.accent} />,
          color: theme.accent,
          bgColor: `${theme.accent}18`,
        };
      case 'error':
        return {
          icon: <SolarIcon name="CloseCircle" type="bold" size={28} color="#ef4444" />,
          color: '#ef4444',
          bgColor: '#ef444418',
        };
      case 'confirm':
        return {
          icon: <SolarIcon name="QuestionCircle" type="bold" size={28} color={theme.brand} />,
          color: theme.brand,
          bgColor: `${theme.brand}18`,
        };
      case 'info':
      default:
        return {
          icon: <SolarIcon name="InfoCircle" type="bold" size={28} color={theme.brand} />,
          color: theme.brand,
          bgColor: `${theme.brand}18`,
        };
    }
  };

  const meta = getTypeMeta();

  // Filter out redundant 'Cancel' button because the top-right close icon handles cancellation globally
  const actionButtons: AlertButton[] = (currentAlert?.buttons ?? []).filter(
    (b) => b.style !== 'cancel' && b.text.toLowerCase() !== 'cancel'
  );

  // Default buttons if none provided
  const buttons: AlertButton[] =
    actionButtons.length > 0
      ? actionButtons
      : [{ text: 'OK', style: 'primary' }];

  // Use vertical stack if more than 2 buttons or if any button text is long,
  // otherwise clean side-by-side row for short dual actions
  const isColumnLayout =
    buttons.length > 2 || buttons.some((b) => b.text.length > 10);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      {currentAlert && (
        <Modal
          transparent
          visible={!!currentAlert}
          animationType="none"
          statusBarTranslucent
          onRequestClose={() => {
            if (currentAlert.dismissible !== false) {
              handleDismiss();
            }
          }}>
          <View style={styles.overlay}>
            <Animated.View style={[styles.backdrop, backdropAnimatedStyle]}>
              <Pressable
                style={StyleSheet.absoluteFill}
                onPress={() => {
                  if (currentAlert.dismissible !== false) {
                    handleDismiss();
                  }
                }}
              />
            </Animated.View>

            <Animated.View
              style={[
                styles.dialog,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  borderRadius: Rounded.card,
                },
                dialogAnimatedStyle,
              ]}>
              {/* Close Icon at Top-Right Corner */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close alert"
                hitSlop={12}
                onPress={handleDismiss}
                style={({ pressed }) => [
                  styles.closeIconButton,
                  pressed && styles.closeIconPressed,
                ]}>
                <SolarIcon name="CloseCircle" size={24} type="linear" color={theme.textSecondary} />
              </Pressable>

              <View style={[styles.iconWrapper, { backgroundColor: meta.bgColor }]}>
                {meta.icon}
              </View>

              <View style={styles.body}>
                <ThemedText type="smallBold" style={styles.title}>
                  {currentAlert.title}
                </ThemedText>
                {currentAlert.message && (
                  <ThemedText type="small" themeColor="muted" style={styles.message}>
                    {currentAlert.message}
                  </ThemedText>
                )}
              </View>

              <View
                style={[
                  styles.buttonContainer,
                  isColumnLayout ? styles.buttonColumn : styles.buttonRow,
                ]}>
                {buttons.map((btn, index) => {
                  let variant: ButtonVariant = 'primary';
                  if (btn.style === 'cancel') variant = 'ghost';
                  else if (btn.style === 'destructive') variant = 'destructive';
                  else if (btn.style === 'secondary') variant = 'secondary';
                  else if (btn.style === 'default') variant = 'outline';

                  return (
                    <Button
                      key={index}
                      variant={variant}
                      size="md"
                      rounded="full"
                      style={isColumnLayout ? styles.fullButton : styles.flexButton}
                      title={btn.text}
                      onPress={() => {
                        hideAlert();
                        btn.onPress?.();
                      }}
                    />
                  );
                })}
              </View>
            </Animated.View>
          </View>
        </Modal>
      )}
    </AlertContext.Provider>
  );
}

/**
 * Inline alert banner for notices within screen content.
 */
export function InlineAlert({
  type = 'info',
  title,
  message,
}: {
  type?: AlertType;
  title: string;
  message?: string;
}) {
  const theme = useTheme();

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return '#10b981';
      case 'warning':
        return theme.accent;
      case 'error':
        return '#ef4444';
      case 'confirm':
      case 'info':
      default:
        return theme.brand;
    }
  };

  return (
    <View
      style={[
        styles.inlineAlert,
        {
          backgroundColor: theme.card,
          borderColor: getBorderColor(),
          borderRadius: Rounded.card,
        },
      ]}>
      <View style={styles.inlineContent}>
        <ThemedText type="smallBold">{title}</ThemedText>
        {message && (
          <ThemedText type="small" themeColor="muted">
            {message}
          </ThemedText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  dialog: {
    width: '100%',
    maxWidth: Math.min(420, MaxContentWidth),
    padding: Spacing.four,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    gap: Spacing.three,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
    zIndex: 10,
  },
  closeIconButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: Rounded.full,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  closeIconPressed: {
    opacity: 0.5,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: Rounded.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    gap: Spacing.one,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
  },
  message: {
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    marginTop: Spacing.two,
  },
  buttonColumn: {
    flexDirection: 'column',
    gap: 10,
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    width: '100%',
  },
  fullButton: {
    width: '100%',
  },
  flexButton: {
    flex: 1,
  },
  inlineAlert: {
    padding: Spacing.three,
    borderLeftWidth: 4,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    gap: Spacing.one,
  },
  inlineContent: {
    gap: 4,
  },
});
