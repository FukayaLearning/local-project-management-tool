import { Task, TaskCreate, TaskUpdate } from "../entities/task";

export interface ITaskRepository {
  getAll(projectName: string): Promise<Task[]>;
  getById(projectName: string, id: string): Promise<Task | null>;
  create(projectName: string, task: TaskCreate): Promise<Task>;
  update(projectName: string, id: string, task: TaskUpdate): Promise<Task>;
  delete(projectName: string, id: string): Promise<void>;
  updateOrders(
    projectName: string,
    orders: { id: string; display_order: number }[],
  ): Promise<void>;
  bulkUpdate(
    projectName: string,
    updates: { id: string; start_date?: string; due_date?: string }[],
  ): Promise<void>;
}
