import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { Courses } from '@/app/courses';
import { Home } from '@/app/home';
import { Study } from '@/app/study';
import { Test } from '@/app/test';
import { FloatingLiquidTabBar } from './FloatingLiquidTabBar';
import type { MainTabParamList } from '@/types/navigation';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <FloatingLiquidTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Courses" component={Courses} />
      <Tab.Screen name="Test" component={Test} />
      <Tab.Screen name="Study" component={Study} />
    </Tab.Navigator>
  );
}
