import { StudyScreen } from '@/screens';
import type { MainTabScreenProps } from '@/types/navigation';

export function Study(props: MainTabScreenProps<'Study'>) {
  return <StudyScreen {...props} />;
}

export default Study;
