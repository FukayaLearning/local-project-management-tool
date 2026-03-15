import { useState, useCallback } from "react";
import { BasicSettings, ProjectSettings } from "../../domain/entities/settings";
import { useDependencies } from "../providers/DependencyProvider";

export const useSettingsUseCase = () => {
  const { settingsRepository: repository } = useDependencies();
  const [globalSettings, setGlobalSettings] = useState<BasicSettings | null>(
    null,
  );
  const [projectSettings, setProjectSettings] =
    useState<ProjectSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchGlobalSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await repository.getGlobalSettings();
      setGlobalSettings(data);
      return data;
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to fetch global settings"),
      );
    } finally {
      setIsLoading(false);
    }
  }, [repository]);

  const updateGlobalSettings = useCallback(
    async (settings: BasicSettings) => {
      setIsLoading(true);
      setError(null);
      try {
        const updated = await repository.updateGlobalSettings(settings);
        setGlobalSettings(updated);
        return updated;
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to update global settings"),
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [repository],
  );

  const fetchProjectSettings = useCallback(
    async (projectName: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await repository.getProjectSettings(projectName);
        setProjectSettings(data);
        return data;
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to fetch project settings"),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [repository],
  );

  const updateProjectSettings = useCallback(
    async (projectName: string, settings: Partial<ProjectSettings>) => {
      setIsLoading(true);
      setError(null);
      try {
        const updated = await repository.updateProjectSettings(
          projectName,
          settings,
        );
        setProjectSettings(updated);
        return updated;
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
    [repository],
  );

  return {
    globalSettings,
    projectSettings,
    isLoading,
    error,
    fetchGlobalSettings,
    updateGlobalSettings,
    fetchProjectSettings,
    updateProjectSettings,
  };
};
