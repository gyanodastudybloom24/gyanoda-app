import { TestScreen } from '@/screens';
import type { MainTabScreenProps } from '@/types/navigation';

export function Test(props: MainTabScreenProps<'Test'>) {
  return <TestScreen {...props} />;
}

export default Test;
