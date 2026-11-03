import { WalletScreen } from '@/screens';
import type { RootStackScreenProps } from '@/types/navigation';

export function Wallet(props: RootStackScreenProps<'Wallet'>) {
  return <WalletScreen {...props} />;
}

export default Wallet;
