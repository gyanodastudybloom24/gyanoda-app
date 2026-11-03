import { ChooseExamScreen } from '@/screens';
import type { RootStackScreenProps } from '@/types/navigation';

export function ChooseExam(props: RootStackScreenProps<'ChooseExam'>) {
  return <ChooseExamScreen {...props} />;
}

export default ChooseExam;

