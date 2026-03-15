import { Task, TaskCreate, TaskUpdate } from "../../../domain/entities/task";
import { ITaskRepository } from "../../../domain/repositories/taskRepository";
import { ApiClient } from "../client";

export class TaskApiRepository implements ITaskRepository {
  async getAll(projectName: string): Promise<Task[]> {
    return ApiClient.get<Task[]>(
      `/projects/${encodeURIComponent(projectName)}/tasks`,
    );
  }

  async getById(projectName: string, id: string): Promise<Task | null> {
    try {
      return await ApiClient.get<Task>(
        `/projects/${encodeURIComponent(projectName)}/tasks/${id}`,
      );
    } catch (error) {
      if (error instanceof Error && error.message.includes("404")) {
        return null;
      }
      throw error;
    }
  }

  async create(projectName: string, task: TaskCreate): Promise<Task> {
    return ApiClient.post<Task>(
      `/projects/${encodeURIComponent(projectName)}/tasks`,
      task,
    );
  }

  async update(
    projectName: string,
    id: string,
    task: TaskUpdate,
  ): Promise<Task> {
    return ApiClient.put<Task>(
      `/projects/${encodeURIComponent(projectName)}/tasks/${id}`,
      task,
    );
  }

  async delete(projectName: string, id: string): Promise<void> {
    return ApiClient.delete<void>(
      `/projects/${encodeURIComponent(projectName)}/tasks/${id}`,
    );
  }

  async updateOrders(
    projectName: string,
    orders: { id: string; display_order: number }[],
  ): Promise<void> {
    return ApiClient.put<void>(
      `/projects/${encodeURIComponent(projectName)}/tasks/reorder`,
      orders,
    );
  }
}
