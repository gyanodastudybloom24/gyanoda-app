export interface ProfileStats {
  testsTaken: number | string;
  avgScore: string;
  studyStreak: string;
  percentile: string;
  studyPercentile?: string;
}

export interface ProfileBadge {
  id: string;
  label: string;
  color?: string;
  backgroundColor?: string;
}

export interface ProfileMenuItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  badge?: string;
}

export interface DetailedUserProfile {
  name: string;
  subtitle?: string;
  location?: string;
  avatarUrl: string;
  status?: string;
  badges?: ProfileBadge[];
  stats: ProfileStats;
  menuItems?: ProfileMenuItem[];
}
