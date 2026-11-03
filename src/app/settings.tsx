import { SettingsScreen } from '@/screens/settings.screen';
import type { RootStackScreenProps } from '@/types/navigation';

export function Settings(props: RootStackScreenProps<'Settings'>) {
  return <SettingsScreen {...props} />;
}

export default Settings;
