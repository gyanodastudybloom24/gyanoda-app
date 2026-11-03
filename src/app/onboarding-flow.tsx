import { OnboardingFlowScreen } from '@/screens/onboarding-flow.screen';
import type { RootStackScreenProps } from '@/types/navigation';

export function OnboardingFlow(props: RootStackScreenProps<'OnboardingFlow'>) {
  return <OnboardingFlowScreen {...props} />;
}

export default OnboardingFlow;

