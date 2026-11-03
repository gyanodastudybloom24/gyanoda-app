import { ExploreScreen } from '@/screens/explore.screen';
import type { MainTabScreenProps } from '@/types/navigation';

export function Explore(props: MainTabScreenProps<'Explore'>) {
  return <ExploreScreen {...props} />;
}

export default Explore;
