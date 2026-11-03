import { SolarIcon as BaseSolarIcon } from 'react-native-solar-icons';
import type { ComponentProps } from 'react';

import { ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type IconStyle = 'bold' | 'bold-duotone' | 'broken' | 'line-duotone' | 'linear' | 'outline';

export type SolarIconProps = ComponentProps<typeof BaseSolarIcon> & {
  themeColor?: ThemeColor;
};

/**
 * Solar icon component with theme color support.
 *
 * @example
 * ```tsx
 * <SolarIcon name="Home" type="bold" size={24} themeColor="brand" />
 * ```
 */
export function SolarIcon({ themeColor, color, size = 24, type = 'linear', ...props }: SolarIconProps) {
  const theme = useTheme();
  const resolvedColor = themeColor ? theme[themeColor] : (color ?? theme.text);

  return <BaseSolarIcon {...props} size={size} type={type} color={resolvedColor} />;
}
