import { SettingsScreen } from '@/screens';
import type { RootStackScreenProps } from '@/types/navigation';

export function Settings(props: RootStackScreenProps<'Settings'>) {
  return <SettingsScreen {...props} />;
}

export default Settings;
