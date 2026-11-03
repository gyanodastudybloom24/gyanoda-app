import { NotificationsScreen } from '@/screens/notifications.screen';
import type { RootStackScreenProps } from '@/types/navigation';

export function Notifications(props: RootStackScreenProps<'Notifications'>) {
  return <NotificationsScreen {...props} />;
}

export default Notifications;
