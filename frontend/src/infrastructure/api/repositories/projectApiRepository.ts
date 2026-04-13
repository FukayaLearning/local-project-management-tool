import { IProjectRepository } from "../../../domain/repositories/projectRepository";
import { ApiClient } from "../client";

export class ProjectApiRepository implements IProjectRepository {
  async listProjects(): Promise<string[]> {
    return ApiClient.get<string[]>("/projects/");
  }

  async createProject(projectName: string): Promise<{ project_name: string }> {
    return ApiClient.post<{ project_name: string }>("/projects/", {
      project_name: projectName,
    });
  }

  async undo(projectName: string): Promise<{ message: string }> {
    return ApiClient.post<{ message: string }>(
      `/projects/${encodeURIComponent(projectName)}/undo`,
      {},
    );
  }

  async redo(projectName: string): Promise<{ message: string }> {
    return ApiClient.post<{ message: string }>(
      `/projects/${encodeURIComponent(projectName)}/redo`,
      {},
    );
  }
}
