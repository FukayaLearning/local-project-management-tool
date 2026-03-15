import { BasicSettings, ProjectSettings } from "../entities/settings";

export interface ISettingsRepository {
  getGlobalSettings(): Promise<BasicSettings>;
  updateGlobalSettings(settings: BasicSettings): Promise<BasicSettings>;
  getProjectSettings(projectName: string): Promise<ProjectSettings>;
  updateProjectSettings(
    projectName: string,
    settings: Partial<ProjectSettings>,
  ): Promise<ProjectSettings>;
}
