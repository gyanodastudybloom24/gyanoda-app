import { RecentlyWatchedScreen } from '@/screens';
import type { RootStackScreenProps } from '@/types/navigation';

export function RecentlyWatched(props: RootStackScreenProps<'RecentlyWatched'>) {
  return <RecentlyWatchedScreen {...props} />;
}

export default RecentlyWatched;
