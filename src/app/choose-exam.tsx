import { ChooseExamScreen } from '@/screens/choose-exam.screen';
import type { RootStackScreenProps } from '@/types/navigation';

export function ChooseExam(props: RootStackScreenProps<'ChooseExam'>) {
  return <ChooseExamScreen {...props} />;
}

export default ChooseExam;

