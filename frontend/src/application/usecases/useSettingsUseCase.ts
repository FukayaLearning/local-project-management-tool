import { useState, useCallback } from "react";
import { ProjectSettings, Settings } from "../../domain/entities/settings";
import { useDependencies } from "../providers/DependencyProvider";

export const useSettingsUseCase = () => {
  const { settingsRepository: repository } = useDependencies();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await repository.getSettings();
      setSettings(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch settings"),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProjectSettings = useCallback(
    async (newSettings: Partial<ProjectSettings>) => {
      setIsLoading(true);
      setError(null);
      try {
        const updatedProject =
          await repository.updateProjectSettings(newSettings);
        setSettings((prev) =>
          prev ? { ...prev, project: updatedProject } : null,
        );
        return updatedProject;
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to update project settings"),
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    settings,
    isLoading,
    error,
    fetchSettings,
    updateProjectSettings,
  };
};
