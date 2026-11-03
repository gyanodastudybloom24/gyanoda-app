import { CoursesScreen } from '@/screens/courses.screen';
import type { MainTabScreenProps } from '@/types/navigation';

export function Courses(props: MainTabScreenProps<'Courses'>) {
  return <CoursesScreen {...props} />;
}

export default Courses;
