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
