import type { TaskState } from "./types";

export function isActive(task: TaskState): boolean {
  return task.status === 'running';
}

export function isTerminal(task: TaskState): boolean {
  return task.status === 'completed' || task.status === 'failed';
}

export function displayLabel(task: TaskState, t: (key: string) => string): string {
  return task.task_key;
}
