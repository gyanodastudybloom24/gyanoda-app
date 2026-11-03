import { CoursesScreen } from '@/screens';
import type { MainTabScreenProps } from '@/types/navigation';

export function Courses(props: MainTabScreenProps<'Courses'>) {
  return <CoursesScreen {...props} />;
}

export default Courses;
