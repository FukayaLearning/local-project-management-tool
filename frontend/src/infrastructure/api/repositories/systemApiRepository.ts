import {
  ISystemRepository,
  SystemStatus,
} from "../../../domain/repositories/systemRepository";
import { ApiClient } from "../client";

export class SystemApiRepository implements ISystemRepository {
  async getSystemStatus(): Promise<SystemStatus> {
    return ApiClient.get<SystemStatus>("/system/status");
  }

  async getProjects(): Promise<string[]> {
    return ApiClient.get<string[]>("/projects/");
  }

  async switchProject(projectName: string): Promise<void> {
    return ApiClient.post(`/projects/${projectName}/switch`, {});
  }

  async createProject(projectName: string): Promise<void> {
    return ApiClient.post("/projects/", { project_name: projectName });
  }
}
