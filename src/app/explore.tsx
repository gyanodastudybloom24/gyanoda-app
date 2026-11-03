import { ExploreScreen } from '@/screens';
import type { MainTabScreenProps } from '@/types/navigation';

export function Explore(props: MainTabScreenProps<'Explore'>) {
  return <ExploreScreen {...props} />;
}

export default Explore;
