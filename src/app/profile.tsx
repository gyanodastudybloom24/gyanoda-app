import { ProfileScreen } from '@/screens/profile.screen';
import type { RootStackScreenProps } from '@/types/navigation';

export function Profile(props: RootStackScreenProps<'Profile'>) {
  return <ProfileScreen {...props} />;
}

export default Profile;
