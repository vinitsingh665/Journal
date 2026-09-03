export type TaskState = {
  task_key: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  completed_at?: string;
  metadata?: any;
};
