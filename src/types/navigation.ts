import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

/**
 * Parameter list for the bottom tab navigator.
 */
export type MainTabParamList = {
  Home: undefined;
  Courses: undefined;
  Test: undefined;
  Study: undefined;
  Explore?: undefined;
};

export interface PlayerPlaylistItem {
  id: string;
  chapterNumber: string;
  year?: string;
  title: string;
  subtitle?: string;
  duration: string;
  thumbnailUrl: string;
  videoUrl?: string;
  questionText?: string;
  answerText?: string;
}

/**
 * Parameter list for the root stack navigator.
 */
export type RootStackParamList = {
  Login: undefined;
  OnboardingFlow: undefined;
  ChooseExam: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  Profile: undefined;
  Settings: undefined;
  Notifications: undefined;
  RecentlyWatched: undefined;
  Wallet: undefined;
  UpgradePlan: undefined;
  CourseDetails?: { courseId?: string; title?: string };
  CourseAccess?: { subjectId?: string; title?: string };
  YearPlaylist?: {
    yearId?: string;
    year?: string;
    subjectId?: string;
    title?: string;
    description?: string;
    imageUrl?: string;
  };
  ChapterPlaylist?: {
    chapterId?: string;
    chapterNumber?: string;
    subjectId?: string;
    title?: string;
    subtitle?: string;
    description?: string;
    imageUrl?: string;
  };
  Player?: {
    videoId?: string;
    videoUrl?: string;
    title?: string;
    questionText?: string;
    answerText?: string;
    year?: string;
    subjectId?: string;
    playlist?: PlayerPlaylistItem[];
    initialIndex?: number;
  };
  NotFound?: undefined;
};

/**
 * Screen props for Root Stack screens.
 */
export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

/**
 * Screen props for Main Tab screens, composed with Root Stack props.
 */
export type MainTabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
