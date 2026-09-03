import { create } from 'zustand';

type RewardEventsState = {
  triggerMockAccessoryUnlock: () => void;
  triggerMockAccessoryBatchUnlock: () => void;
};

export const useRewardEventsStore = create<RewardEventsState>(() => ({
  triggerMockAccessoryUnlock: () => {},
  triggerMockAccessoryBatchUnlock: () => {},
}));
