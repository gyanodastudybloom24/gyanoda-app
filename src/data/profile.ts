import type { DetailedUserProfile, ProfileMenuItem } from '@/types';

export const profileMenuItems: ProfileMenuItem[] = [
  {
    id: 'enrollments',
    title: 'My Enrollments',
    subtitle: 'Active courses & curriculum tracks',
    icon: 'BookBookmark',
  },
  {
    id: 'test-history',
    title: 'Test History',
    subtitle: 'Past assessments, quizzes & scorecards',
    icon: 'ClipboardText',
  },
  {
    id: 'certificates',
    title: 'Certificates & Achievements',
    subtitle: 'Earned diplomas, badges & honors',
    icon: 'Diploma',
  },
  {
    id: 'payment-history',
    title: 'Payment History',
    subtitle: 'Invoices, subscriptions & billing receipts',
    icon: 'CardRecive',
  },
  {
    id: 'settings',
    title: 'Settings',
    subtitle: 'Preferences, account & security',
    icon: 'Settings',
  },
];

export const profileData: DetailedUserProfile = {
  name: 'Ankan (You)',
  subtitle: 'Class 10 • CBSE Board',
  location: '17 Km from your location',
  avatarUrl:
    'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=256&auto=format&fit=crop',
  status: 'Active Learner',
  badges: [
    { id: '1', label: 'Scholar', color: '#c46800', backgroundColor: '#fff0d6' },
    { id: '2', label: 'Explorer', color: '#1a6fd9', backgroundColor: '#e3efff' },
  ],
  stats: {
    testsTaken: '30',
    avgScore: '93%',
    studyStreak: '69',
    percentile: '98%',
    studyPercentile: '98%',
  },
  menuItems: profileMenuItems,
};
