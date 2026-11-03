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
