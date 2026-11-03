import { CourseDetailsScreen } from '@/screens';
import type { RootStackScreenProps } from '@/types/navigation';

export function CourseDetails(props: RootStackScreenProps<'CourseDetails'>) {
  const courseId = props.route.params?.courseId ?? 'default';
  return <CourseDetailsScreen key={courseId} {...props} />;
}

export default CourseDetails;
