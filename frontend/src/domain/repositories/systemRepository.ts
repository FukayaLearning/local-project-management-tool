export interface SystemStatus {
  is_git_initialized: boolean;
  has_default_project: boolean;
  current_project: string | null;
}

export interface ISystemRepository {
  getSystemStatus(): Promise<SystemStatus>;
  getProjects(): Promise<string[]>;
  switchProject(projectName: string): Promise<void>;
  createProject(projectName: string): Promise<void>;
}
