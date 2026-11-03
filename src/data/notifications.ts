import type { AppNotification } from '@/types';

export const initialNotifications: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Upcoming Mock Exam: Mathematics',
    description:
      'The term-end revision mock test for Class 10 CBSE Foundation Mathematics begins tomorrow at 10:00 AM IST. Make sure your formula sheets and practice problems are revised before entering the timed 90-minute test portal.',
    timestamp: '10m ago',
    isRead: false,
    type: 'test',
    icon: 'Diploma',
    accentColor: '#3880FF',
  },
  {
    id: 'notif-2',
    title: 'Streak Milestone Achieved!',
    description:
      'You have maintained an active 69-day study streak! Keep going to unlock the next Scholar achievement tier.',
    timestamp: '1h ago',
    isRead: false,
    type: 'achievement',
    icon: 'Star',
    accentColor: '#fc8019',
  },
  {
    id: 'notif-3',
    title: 'New Chapter Added to Your Syllabus',
    description:
      'Chapter 7: Coordinate Geometry and Triangles is now available in your custom syllabus. It features 12 bite-sized video lessons, self-paced diagnostic problems, and downloadable revision summaries curated by senior faculty.',
    timestamp: '3h ago',
    isRead: false,
    type: 'academic',
    icon: 'BookBookmark',
    accentColor: '#3880FF',
  },
  {
    id: 'notif-4',
    title: 'Daily Practice Quiz Ready',
    description:
      '5 quick questions on Science & Optics are waiting. Finish them today to maintain your percentile and earn 50 credit points.',
    timestamp: '1d ago',
    isRead: true,
    type: 'reminder',
    icon: 'Alarm',
    accentColor: '#686b78',
  },
  {
    id: 'notif-5',
    title: 'Certificate of Distinction Verified',
    description:
      'Your Term 1 Science Foundation Certificate has been officially verified by the Gyanoda Academic Board. You can view, download, or share it from your Certificates & Achievements section.',
    timestamp: '2d ago',
    isRead: true,
    type: 'system',
    icon: 'ShieldCheck',
    accentColor: '#10b981',
  },
];
