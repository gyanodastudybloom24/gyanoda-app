import { ProfileScreen } from '@/screens';
import type { RootStackScreenProps } from '@/types/navigation';

export function Profile(props: RootStackScreenProps<'Profile'>) {
  return <ProfileScreen {...props} />;
}

export default Profile;
