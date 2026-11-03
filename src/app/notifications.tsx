import { NotificationsScreen } from '@/screens';
import type { RootStackScreenProps } from '@/types/navigation';

export function Notifications(props: RootStackScreenProps<'Notifications'>) {
  return <NotificationsScreen {...props} />;
}

export default Notifications;
