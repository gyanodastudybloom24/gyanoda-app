import { YearPlaylistScreen } from '@/screens';
import type { RootStackScreenProps } from '@/types/navigation';

export function YearPlaylist(props: RootStackScreenProps<'YearPlaylist'>) {
  const yearId = props.route.params?.yearId ?? 'year-default';
  return <YearPlaylistScreen key={yearId} {...props} />;
}

export default YearPlaylist;

