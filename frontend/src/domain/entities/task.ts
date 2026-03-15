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
  actual_start_date?: string | null;
  actual_end_date?: string | null;
}

export type TaskCreate = Omit<Task, "id" | "actual_hours" | "progress"> & {
  id?: string;
};

export type TaskUpdate = Partial<Task>;
