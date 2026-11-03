import { PlayerScreen } from '@/screens';
import type { RootStackScreenProps } from '@/types/navigation';

export function Player(props: RootStackScreenProps<'Player'>) {
  const videoId = props.route.params?.videoId ?? 'default-video';
  return <PlayerScreen key={videoId} {...props} />;
}

export default Player;

