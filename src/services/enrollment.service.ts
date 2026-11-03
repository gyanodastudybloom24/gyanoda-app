import { coursesData } from '@/data/courses';
import type { CourseItem } from '@/types';

type EnrollmentListener = () => void;

class EnrollmentService {
  private enrolledCourseIds = new Set<string>();
  private listeners = new Set<EnrollmentListener>();
  private cachedEnrolledCourses: CourseItem[] = [];

  constructor() {
    coursesData.forEach((course) => {
      if (course.isEnrolled) {
        this.enrolledCourseIds.add(course.id);
      }
    });
    this.updateCache();
  }

  private updateCache = () => {
    this.cachedEnrolledCourses = coursesData.filter(
      (c) => this.enrolledCourseIds.has(c.id) || c.isEnrolled
    );
  };

  isEnrolled = (courseId: string): boolean => {
    return this.enrolledCourseIds.has(courseId);
  };

  enroll = (courseId: string): void => {
    this.enrolledCourseIds.add(courseId);
    const course = coursesData.find((c) => c.id === courseId);
    if (course) {
      course.isEnrolled = true;
    }
    this.updateCache();
    this.notify();
  };

  getEnrolledCourses = (): CourseItem[] => {
    return this.cachedEnrolledCourses;
  };

  subscribe = (listener: EnrollmentListener): () => void => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private notify = () => {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Error notifying enrollment listener:', err);
      }
    });
  };
}

export const enrollmentService = new EnrollmentService();
