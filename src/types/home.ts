export interface UserProfile {
  name: string;
  avatarUrl: string;
  status?: string;
}

export interface WelcomeMessage {
  greeting: string;
  title: string;
  subtitle?: string;
}

export interface NotificationState {
  hasUnread: boolean;
  count?: number;
}

export interface HomeData {
  profile: UserProfile;
  welcome: WelcomeMessage;
  notifications?: NotificationState;
}
