export type TransactionType = 'credit' | 'debit';

export interface WalletTransaction {
  id: string;
  type: TransactionType;
  title: string;
  category: string;
  coins: number;
  rupees?: number;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  paymentMethod?: string;
  referenceId?: string;
}

export interface MembershipPlan {
  id: string;
  tier: 'free' | 'pro' | 'plus';
  name: string;
  badgeLabel: string;
  tag?: string;
  coins: number;
  rupeesEquivalent: number;
  billingPeriod: string;
  description: string;
  features: string[];
  isCurrent?: boolean;
  isPopular?: boolean;
}

export interface WalletData {
  availableBalance: number;
  earnedAmount: number;
  usedAmount: number;
  currency: string;
  transactions: WalletTransaction[];
  membershipPlans: MembershipPlan[];
}
