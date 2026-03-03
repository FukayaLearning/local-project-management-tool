export interface Task {
  id: string;
  title: string;
  status: string;
  assignee_id?: string | null;
  start_date?: string | null; // YYYY-MM-DD
  due_date?: string | null; // YYYY-MM-DD
  parent_id?: string | null;
  description?: string | null;
  task_type?: string | null;
  planned_hours?: number | null;
  actual_hours?: number | null;
  progress: number;
  display_order: number;
}

// Helper types for UI or creation
export type TaskCreate = Omit<Task, "id" | "actual_hours" | "progress"> & {
  id?: string; // Optional if created locally before sync, but usually defined by backend
};

export type TaskUpdate = Partial<Task>;
