import { HomeScreen } from '@/screens/home.screen';
import type { MainTabScreenProps } from '@/types/navigation';

export function Home(props: MainTabScreenProps<'Home'>) {
  return <HomeScreen {...props} />;
}

export default Home;
