import { UpgradePlanScreen } from '@/screens/upgrade-plan.screen';
import type { RootStackScreenProps } from '@/types/navigation';

export function UpgradePlan(props: RootStackScreenProps<'UpgradePlan'>) {
  return <UpgradePlanScreen {...props} />;
}

export default UpgradePlan;

