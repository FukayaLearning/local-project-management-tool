import { Task, TaskCreate, TaskUpdate } from "../../../domain/entities/task";
import { ITaskRepository } from "../../../domain/repositories/taskRepository";
import { ApiClient } from "../client";

export class TaskApiRepository implements ITaskRepository {
  async getAll(): Promise<Task[]> {
    return ApiClient.get<Task[]>("/tasks/");
  }

  async getById(id: string): Promise<Task | null> {
    try {
      return await ApiClient.get<Task>(`/tasks/${id}`);
    } catch (error) {
      // Treat 404 as null
      if (error instanceof Error && error.message.includes("404")) {
        return null;
      }
      throw error;
    }
  }

  async create(task: TaskCreate): Promise<Task> {
    return ApiClient.post<Task>("/tasks/", task);
  }

  async update(id: string, task: TaskUpdate): Promise<Task> {
    return ApiClient.put<Task>(`/tasks/${id}`, task);
  }

  async delete(id: string): Promise<void> {
    return ApiClient.delete<void>(`/tasks/${id}`);
  }

  async updateOrders(
    orders: { id: string; display_order: number }[],
  ): Promise<void> {
    return ApiClient.put<void>("/tasks/reorder", orders);
  }
}
