import { useSyncExternalStore } from 'react';

import { enrollmentService } from '@/services';
import type { CourseItem } from '@/types';

const subscribe = (callback: () => void) => enrollmentService.subscribe(callback);
const getSnapshot = () => enrollmentService.getEnrolledCourses();

/**
 * Custom hook to get the list of currently enrolled courses.
 * Automatically synchronizes with the enrollment service without cascading renders.
 */
export function useEnrolledCourses(): CourseItem[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
