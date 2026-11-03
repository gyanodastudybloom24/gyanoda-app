export interface FilterOption {
  id: string;
  label: string;
}

export interface CurriculumFilterState {
  subject: string | null;
  chapter: string | null;
  year: string | null;
}

export interface SyllabusModule {
  id: string;
  title: string;
  subtitle?: string;
  subject: string;
  chapter: string;
  year: string;
  lessonsCount?: number;
  duration?: string;
  progress?: number;
  backgroundColor?: string;
  textColor?: string;
}

export interface StudyResource {
  id: string;
  title: string;
  description: string;
  type: string;
  icon: string;
}

export interface TestItem {
  id: string;
  title: string;
  subject: string;
  questions: number;
  durationMins: number;
  status: 'Available' | 'Completed' | 'Upcoming';
}
