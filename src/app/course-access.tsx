import { CourseAccessScreen } from '@/screens';
import type { RootStackScreenProps } from '@/types/navigation';

export function CourseAccess(props: RootStackScreenProps<'CourseAccess'>) {
  const subjectId = props.route.params?.subjectId ?? 'physics';
  return <CourseAccessScreen key={subjectId} {...props} />;
}

export default CourseAccess;
