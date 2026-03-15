export interface IProjectRepository {
  listProjects(): Promise<string[]>;
  createProject(projectName: string): Promise<{ project_name: string }>;
  undo(projectName: string): Promise<{ message: string }>;
  redo(projectName: string): Promise<{ message: string }>;
}
