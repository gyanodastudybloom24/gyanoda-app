import { useSyncExternalStore } from 'react';

import { subscriptionService, type SubscriptionState } from '@/services';

export function useSubscription(): SubscriptionState {
  return useSyncExternalStore(
    subscriptionService.subscribe,
    subscriptionService.getSnapshot,
    subscriptionService.getSnapshot
  );
}
