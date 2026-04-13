export type SchedulingRule = "priority" | "start_fixed" | "end_fixed";

export interface ProgressHistoryEntry {
  date: string; // YYYY-MM-DD
  progress: number; // 0-100
}

export interface Task {
  id: string;
  title: string;
  status: string;
  assignee_id?: string | null;
  start_date?: string | null; // YYYY-MM-DD (Manual or Fixed)
  due_date?: string | null; // YYYY-MM-DD (Manual or Fixed)
  parent_id?: string | null;
  description?: string | null;
  task_type?: string | null;
  planned_hours?: number | null;
  actual_hours?: number | null;
  progress: number;
  display_order: number;
  actual_start_date?: string | null;
  actual_end_date?: string | null;

  // New Scheduling fields
  scheduling_rule?: SchedulingRule | null;
  dependencies?: string[] | null; // Array of task IDs
  progress_history?: ProgressHistoryEntry[] | null;

  // Calculated fields (Frontend only, not necessarily persisted if backend doesn't support)
  calculated_start_date?: string | null;
  calculated_end_date?: string | null;
}

export type TaskCreate = Omit<Task, "id" | "actual_hours" | "progress"> & {
  id?: string;
};

export type TaskUpdate = Partial<Task>;
