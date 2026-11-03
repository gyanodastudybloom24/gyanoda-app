import { ChapterPlaylistScreen } from '@/screens';
import type { RootStackScreenProps } from '@/types/navigation';

export function ChapterPlaylist(props: RootStackScreenProps<'ChapterPlaylist'>) {
  const chapterId = props.route.params?.chapterId ?? 'chapter-default';
  return <ChapterPlaylistScreen key={chapterId} {...props} />;
}

export default ChapterPlaylist;

