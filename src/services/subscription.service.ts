import { coursesData } from '@/data/courses';
import { walletData } from '@/data/wallet';
import { enrollmentService } from '@/services/enrollment.service';
import type { CourseItem, CourseRequiredTier } from '@/types';

export type SubscriptionTier = CourseRequiredTier;

export interface SubscriptionState {
  tier: SubscriptionTier;
  coins: number;
  isSubscribed: boolean;
}

type SubscriptionListener = (state: SubscriptionState) => void;

class SubscriptionService {
  private currentTier: SubscriptionTier = 'free';
  private coins: number = walletData.availableBalance;
  private listeners = new Set<SubscriptionListener>();
  private cachedSnapshot: SubscriptionState;

  constructor() {
    const activePlan = walletData.membershipPlans.find((p) => p.isCurrent);
    if (activePlan) {
      this.currentTier = activePlan.tier;
    }
    this.cachedSnapshot = {
      tier: this.currentTier,
      coins: this.coins,
      isSubscribed: this.currentTier === 'pro' || this.currentTier === 'plus',
    };
  }

  private updateSnapshot = () => {
    this.cachedSnapshot = {
      tier: this.currentTier,
      coins: this.coins,
      isSubscribed: this.currentTier === 'pro' || this.currentTier === 'plus',
    };
  };

  getSnapshot = (): SubscriptionState => {
    return this.cachedSnapshot;
  };

  getTier = (): SubscriptionTier => {
    return this.currentTier;
  };

  setTier = (tier: SubscriptionTier): void => {
    if (this.currentTier === tier) return;
    this.currentTier = tier;
    walletData.membershipPlans.forEach((p) => {
      p.isCurrent = p.tier === tier;
    });
    this.updateSnapshot();
    this.notify();
  };

  getCoins = (): number => {
    return this.coins;
  };

  deductCoins = (amount: number): boolean => {
    if (this.coins >= amount) {
      this.coins -= amount;
      walletData.availableBalance = this.coins;
      walletData.usedAmount += amount;
      this.updateSnapshot();
      this.notify();
      return true;
    }
    return false;
  };

  addCoins = (amount: number): void => {
    this.coins += amount;
    walletData.availableBalance = this.coins;
    walletData.earnedAmount += amount;
    this.updateSnapshot();
    this.notify();
  };

  isSubscribed = (): boolean => {
    return this.currentTier === 'pro' || this.currentTier === 'plus';
  };

  matchesFreeTier = (course: CourseItem): boolean => {
    return Boolean(course.isFree || course.price === 0 || course.requiredTier === 'free');
  };

  hasAccessToCourse = (course: CourseItem): boolean => {
    if (course.isEnrolled || enrollmentService.isEnrolled(course.id)) {
      return true;
    }
    const required = course.requiredTier ?? (course.isFree || course.price === 0 ? 'free' : 'pro');
    if (required === 'free') {
      return true;
    }
    if (required === 'pro') {
      return this.currentTier === 'pro' || this.currentTier === 'plus';
    }
    if (required === 'plus') {
      return this.currentTier === 'plus';
    }
    return false;
  };

  unlockCourseWithCoins = (courseId: string, coinPrice: number): boolean => {
    if (this.deductCoins(coinPrice)) {
      enrollmentService.enroll(courseId);
      walletData.transactions.unshift({
        id: `tx-course-${Date.now()}`,
        type: 'debit',
        title: `Course Unlock: ${coursesData.find((c) => c.id === courseId)?.title ?? 'Course'}`,
        category: 'Course Access',
        coins: coinPrice,
        rupees: coinPrice,
        timestamp: 'Just now',
        status: 'completed',
        paymentMethod: 'Wallet Coins',
        referenceId: `CRSE_${courseId.toUpperCase()}_${Math.floor(1000 + Math.random() * 9000)}`,
      });
      return true;
    }
    return false;
  };

  subscribe = (listener: SubscriptionListener): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private notify = () => {
    const state = this.cachedSnapshot;
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (err) {
        console.error('Error notifying subscription listener:', err);
      }
    });
  };
}

export const subscriptionService = new SubscriptionService();
