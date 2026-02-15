import { ProjectSettings, Settings } from "../../../domain/entities/settings";
import { ISettingsRepository } from "../../../domain/repositories/settingsRepository";
import { ApiClient } from "../client";

export class SettingsApiRepository implements ISettingsRepository {
    async getSettings(): Promise<Settings> {
        // Current API only supports fetching project settings separately in V1 outline,
        // but backend might expose full settings or split.
        // Assuming /projects/settings returns ProjectSettings
        // And maybe another endpoint for basic settings?
        // For now, let's construct a partial Settings object or mock parts not yet API ready.
        
        // Actually, backend V1 has GET /projects/settings -> ProjectSettings
        // We might need to fetch basic settings from somewhere else or hardcode defaults if not exposed.
        // Let's assume for now we only strictly need project settings for the valid V1 feature set.
        const project = await this.getProjectSettings();
        
        // Mock basic settings or fetch if endpoint exists
        return {
            basic: {
                task_statuses: [], // TODO: fetch or defaults
                task_types: [],
                assignees: [],
                daily_work_hours: 8,
                holiday_definition: {
                    holiday_csv_url: "",
                    weekend_days: [],
                    extra_holidays: [],
                    extra_workdays: []
                }
            },
            project: project
        };
    }

    async getProjectSettings(): Promise<ProjectSettings> {
        return ApiClient.get<ProjectSettings>('/projects/settings');
    }

    async updateProjectSettings(settings: Partial<ProjectSettings>): Promise<ProjectSettings> {
        return ApiClient.put<ProjectSettings>('/projects/settings', settings);
    }
}
