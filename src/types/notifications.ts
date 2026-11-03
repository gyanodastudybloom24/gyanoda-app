export type NotificationType = 'academic' | 'test' | 'reminder' | 'achievement' | 'system';

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  type: NotificationType;
  icon: string;
  accentColor?: string;
}
