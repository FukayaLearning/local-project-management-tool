import { useState, useCallback } from 'react';
import { ProjectSettings, Settings } from "../../domain/entities/settings";
import { ISettingsRepository } from "../../domain/repositories/settingsRepository";
import { SettingsApiRepository } from "../../infrastructure/api/repositories/settingsApiRepository";

export const useSettingsUseCase = () => {
    const [settings, setSettings] = useState<Settings | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const repository: ISettingsRepository = new SettingsApiRepository();

    const fetchSettings = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await repository.getSettings();
            setSettings(data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch settings'));
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateProjectSettings = useCallback(async (newSettings: Partial<ProjectSettings>) => {
        setIsLoading(true);
        setError(null);
        try {
            const updatedProject = await repository.updateProjectSettings(newSettings);
            setSettings(prev => prev ? { ...prev, project: updatedProject } : null);
            return updatedProject;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to update project settings'));
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        settings,
        isLoading,
        error,
        fetchSettings,
        updateProjectSettings
    };
};
