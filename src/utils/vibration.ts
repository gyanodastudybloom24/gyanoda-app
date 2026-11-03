import { Platform, Vibration } from 'react-native';

/**
 * Triggers a subtle tactile haptic vibration for interactions like long-press or actions.
 * Safe across Android, iOS, and Web environments.
 *
 * @param durationMs Duration of vibration in milliseconds (default: 45ms)
 */
export function triggerHaptic(durationMs = 45): void {
  try {
    if (Platform.OS === 'android') {
      Vibration.vibrate(durationMs);
    } else if (Platform.OS === 'ios') {
      Vibration.vibrate();
    } else if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      navigator.vibrate(durationMs);
    }
  } catch {
    // Graceful fallback when vibration hardware/permissions are unavailable
  }
}
