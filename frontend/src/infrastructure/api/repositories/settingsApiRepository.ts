import {
  BasicSettings,
  ProjectSettings,
} from "../../../domain/entities/settings";
import { ISettingsRepository } from "../../../domain/repositories/settingsRepository";
import { ApiClient } from "../client";

export class SettingsApiRepository implements ISettingsRepository {
  async getGlobalSettings(): Promise<BasicSettings> {
    return ApiClient.get<BasicSettings>("/settings/");
  }

  async updateGlobalSettings(settings: BasicSettings): Promise<BasicSettings> {
    return ApiClient.put<BasicSettings>("/settings/", settings);
  }

  async getProjectSettings(projectName: string): Promise<ProjectSettings> {
    return ApiClient.get<ProjectSettings>(
      `/projects/${encodeURIComponent(projectName)}/settings`,
    );
  }

  async updateProjectSettings(
    projectName: string,
    settings: Partial<ProjectSettings>,
  ): Promise<ProjectSettings> {
    return ApiClient.put<ProjectSettings>(
      `/projects/${encodeURIComponent(projectName)}/settings`,
      settings,
    );
  }
}
