import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { CourseAccess } from '@/app/course-access';
import { CourseDetails } from '@/app/course-details';
import { ChooseExam } from '@/app/choose-exam';
import { Login } from '@/app/login';
import { Notifications } from '@/app/notifications';
import { OnboardingFlow } from '@/app/onboarding-flow';
import { Profile } from '@/app/profile';
import { RecentlyWatched } from '@/app/recently-watched';
import { Settings } from '@/app/settings';
import { Wallet } from '@/app/wallet';
import { UpgradePlan } from '@/app/upgrade-plan';
import { YearPlaylist } from '@/app/year-playlist';
import { ChapterPlaylist } from '@/app/chapter-playlist';
import { Player } from '@/app/player';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MainTabNavigator } from './MainTabNavigator';

import type { RootStackParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 280,
        contentStyle: { backgroundColor: colors.background },
      }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="OnboardingFlow" component={OnboardingFlow} />
      <Stack.Screen name="ChooseExam" component={ChooseExam} />
      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="Notifications" component={Notifications} />
      <Stack.Screen name="RecentlyWatched" component={RecentlyWatched} />
      <Stack.Screen name="Wallet" component={Wallet} />
      <Stack.Screen name="UpgradePlan" component={UpgradePlan} />
      <Stack.Screen name="CourseDetails" component={CourseDetails} />
      <Stack.Screen name="CourseAccess" component={CourseAccess} />
      <Stack.Screen name="YearPlaylist" component={YearPlaylist} />
      <Stack.Screen name="ChapterPlaylist" component={ChapterPlaylist} />
      <Stack.Screen name="Player" component={Player} />
    </Stack.Navigator>
  );
}
