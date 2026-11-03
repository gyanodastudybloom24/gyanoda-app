export type CourseFilter = 'overview' | 'videos' | 'review';

export interface CourseVideoLecture {
  id: string;
  year?: string;
  title: string;
  subtitle: string;
  duration: string;
  videoUrl?: string;
}

export interface CourseReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
}

export interface CourseReviewItem {
  id: string;
  name: string;
  rating: number;
  date: string;
  comment: string;
}

export interface VideoYearItem {
  id: string;
  year: string;
  description?: string;
  duration?: string;
}

export interface YearWiseItem {
  id: string;
  year: string;
  title: string;
  description: string;
  duration: string;
  questionsCount: number;
  thumbnailUrl?: string;
}

export interface ChapterWiseItem {
  id: string;
  chapterNumber: string;
  title: string;
  subtitle: string;
  duration: string;
  lessonsCount: number;
}

export interface SubjectAccessData {
  title: string;
  description: string;
  imageUrl: string;
  years: YearWiseItem[];
  chapters: ChapterWiseItem[];
}

export interface ChapterYearItem {
  id: string;
  year: string;
  title: string;
  subtitle: string;
  duration: string;
  questionsCount: number;
  thumbnailUrl?: string;
  videoUrl?: string;
  questionText?: string;
  answerText?: string;
}

export interface YearChapterItem {
  id: string;
  chapterNumber: string;
  title: string;
  subtitle: string;
  duration: string;
  thumbnailUrl?: string;
  questionsCount: number;
  videoUrl?: string;
  questionText?: string;
  answerText?: string;
}

export interface CourseInclusion {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export type CourseRequiredTier = 'free' | 'pro' | 'plus';

export interface CourseItem {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  subjectId?: string;
  category?: string;
  lessonsCount?: number;
  description?: string;
  chaptersCount?: number;
  videosCount?: number;
  yearsCount?: number;
  duration?: string;
  rating?: number;
  about?: string;
  inclusions?: CourseInclusion[];
  price?: number;
  originalPrice?: number;
  isFree?: boolean;
  isEnrolled?: boolean;
  progress?: number;
  requiredTier?: CourseRequiredTier;
  coins?: number;
  tierLabel?: string;
  lectures?: CourseVideoLecture[];
  reviews?: CourseReview[];
}
