import type { SettingsItem } from '@/types';

export const APP_VERSION = '4.0.9';

export const settingsItems: SettingsItem[] = [
  {
    id: 'communication-preferences',
    title: 'Communication Preferences',
    subtitle: 'Manage SMS, WhatsApp and email updates',
    icon: 'ChatRoundDots',
    type: 'link',
  },
  {
    id: 'switch-exam',
    title: 'Switch Exam',
    subtitle: 'Currently: Class 10 CBSE Board',
    icon: 'SquareAcademicCap',
    type: 'link',
  },
  {
    id: 'email-verification',
    title: 'Email Verification',
    subtitle: 'ankan.learner@gyanoda.edu',
    icon: 'CheckCircle',
    type: 'value',
    value: 'Verified',
  },
  {
    id: 'theme',
    title: 'Theme',
    subtitle: 'System default, Light, or Dark mode',
    icon: 'Palette',
    type: 'link',
  },
  {
    id: 'notifications',
    title: 'Notifications',
    subtitle: 'Reminders, test alerts and daily targets',
    icon: 'Bell',
    type: 'link',
  },
  {
    id: 'help-support',
    title: 'Help & Support',
    subtitle: 'FAQs, academic counselors and guides',
    icon: 'QuestionCircle',
    type: 'link',
  },
  {
    id: 'share-app',
    title: 'Share App',
    subtitle: 'Invite friends and earn test passes',
    icon: 'Share',
    type: 'link',
  },
  {
    id: 'about-us',
    title: 'About Us',
    subtitle: 'Learn more about Gyanoda Learning',
    icon: 'InfoCircle',
    type: 'link',
  },
  {
    id: 'rate-us',
    title: 'Rate Us',
    subtitle: 'Share your feedback on the store',
    icon: 'Star',
    type: 'link',
  },
  {
    id: 'app-version',
    title: 'App Version',
    subtitle: 'Up to date with latest features',
    icon: 'Smartphone',
    type: 'value',
    value: APP_VERSION,
  },
];
