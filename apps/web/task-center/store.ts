import { create } from 'zustand';
import type { TaskState } from './types';

type TaskCenterState = {
  tasks: Map<string, TaskState>;
  isHydrated: boolean;
};

export const useTaskCenterStore = create<TaskCenterState>(() => ({
  tasks: new Map(),
  isHydrated: true,
}));
