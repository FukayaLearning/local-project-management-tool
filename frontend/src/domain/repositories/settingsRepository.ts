import { ProjectSettings, Settings } from "../entities/settings";

export interface ISettingsRepository {
    getSettings(): Promise<Settings>;
    getProjectSettings(): Promise<ProjectSettings>; // For V1 Project endpoint
    updateProjectSettings(settings: Partial<ProjectSettings>): Promise<ProjectSettings>;
}
