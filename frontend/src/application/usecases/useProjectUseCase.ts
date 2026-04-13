import { useState, useCallback } from "react";
import { useDependencies } from "../providers/DependencyProvider";

export const useProjectUseCase = () => {
  const { projectRepository: repository } = useDependencies();
  const [projects, setProjects] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const projectList = await repository.listProjects();
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

  const createProject = useCallback(
    async (projectName: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await repository.createProject(projectName);
        setProjects((prev) => [...prev, result.project_name]);
        return result;
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

  const undo = useCallback(
    async (projectName: string) => {
      try {
        return await repository.undo(projectName);
      } catch (err) {
        throw err instanceof Error ? err : new Error("Undo failed");
      }
    },
    [repository],
  );

  const redo = useCallback(
    async (projectName: string) => {
      try {
        return await repository.redo(projectName);
      } catch (err) {
        throw err instanceof Error ? err : new Error("Redo failed");
      }
    },
    [repository],
  );

  return {
    projects,
    isLoading,
    error,
    fetchProjects,
    createProject,
    undo,
    redo,
  };
};
