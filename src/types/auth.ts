export type ExamType = 'WBJEE' | 'NEET';

export interface ExamCardConfig {
  id: ExamType;
  title: string;
  subtitle: string;
  badge: string;
  icon: 'Rocket' | 'Stethoscope';
  primaryColor: string;
  midColor: string;
  fadeColor: string;
  titleColor: string;
  subtitleColor: string;
}
