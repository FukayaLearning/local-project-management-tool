import { Task, TaskCreate, TaskUpdate } from "../entities/task";

export interface ITaskRepository {
  getAll(): Promise<Task[]>;
  getById(id: string): Promise<Task | null>;
  create(task: TaskCreate): Promise<Task>;
  update(id: string, task: TaskUpdate): Promise<Task>;
  delete(id: string): Promise<void>;
  updateOrders(orders: { id: string; display_order: number }[]): Promise<void>;
}
