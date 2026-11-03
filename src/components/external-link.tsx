import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { type ReactNode } from 'react';
import { Linking, Platform, Pressable, type StyleProp, type ViewStyle } from 'react-native';

export type ExternalLinkProps = {
  href: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  asChild?: boolean;
};

export function ExternalLink({ href, children, style }: ExternalLinkProps) {
  const handlePress = async () => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        window.open(href, '_blank', 'noopener,noreferrer');
      } else {
        await Linking.openURL(href);
      }
      return;
    }

    try {
      await openBrowserAsync(href, {
        presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
      });
    } catch {
      await Linking.openURL(href);
    }
  };

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityHint={`Opens ${href} in browser`}
      onPress={handlePress}
      style={style}>
      {children}
    </Pressable>
  );
}
