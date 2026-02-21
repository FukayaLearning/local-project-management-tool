import { useState, useCallback } from "react";
import { SystemStatus } from "../../domain/repositories/systemRepository";
import { useDependencies } from "../providers/DependencyProvider";

export const useSystemUseCase = () => {
  const { systemRepository: repository } = useDependencies();
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [projects, setProjects] = useState<string[]>([]);

  const fetchSystemStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const status = await repository.getSystemStatus();
      setSystemStatus(status);
      return status;
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch system status"),
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [repository]);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const projectList = await repository.getProjects();
      setProjects(projectList);
      return projectList;
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch projects"),
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [repository]);

  const switchProject = useCallback(
    async (projectName: string) => {
      setIsLoading(true);
      setError(null);
      try {
        await repository.switchProject(projectName);
        setSystemStatus((prev) =>
          prev ? { ...prev, current_project: projectName } : null,
        );
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to switch project"),
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [repository],
  );

  const createProject = useCallback(
    async (projectName: string) => {
      setIsLoading(true);
      setError(null);
      try {
        await repository.createProject(projectName);
        setSystemStatus(() => ({
          is_git_initialized: true,
          has_default_project: true,
          current_project: projectName,
        }));
        setProjects((prev) => [...prev, projectName]);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to create project"),
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [repository],
  );

  return {
    systemStatus,
    projects,
    isLoading,
    error,
    fetchSystemStatus,
    fetchProjects,
    switchProject,
    createProject,
    setSystemStatus,
    setProjects,
  };
};
