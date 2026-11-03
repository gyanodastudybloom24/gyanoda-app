import { LoginScreen } from '@/screens/login.screen';
import type { RootStackScreenProps } from '@/types/navigation';

export function Login(props: RootStackScreenProps<'Login'>) {
  return <LoginScreen {...props} />;
}

export default Login;

