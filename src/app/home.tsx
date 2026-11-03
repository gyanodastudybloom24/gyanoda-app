import { HomeScreen } from '@/screens';
import type { MainTabScreenProps } from '@/types/navigation';

export function Home(props: MainTabScreenProps<'Home'>) {
  return <HomeScreen {...props} />;
}

export default Home;
