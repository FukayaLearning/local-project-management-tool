import { useState, useCallback, useMemo } from "react";
import { Task, TaskCreate, TaskUpdate } from "../../domain/entities/task";
import { useDependencies } from "../providers/DependencyProvider";
import { calculateScheduledTasks } from "../../domain/services/taskCalculationService";
import { BasicSettings } from "../../types";

export const useTaskUseCase = (settings?: BasicSettings | null) => {
  const { taskRepository: repository } = useDependencies();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const scheduledTasks = useMemo(() => {
    if (!settings || tasks.length === 0) return tasks;
    try {
      return calculateScheduledTasks(tasks, settings);
    } catch (err) {
      console.error("Failed to calculate scheduled tasks", err);
      return tasks;
    }
  }, [tasks, settings]);

  const fetchTasks = useCallback(
    async (projectName: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await repository.getAll(projectName);
        setTasks(data);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch tasks"),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [repository],
  );

  const createTask = useCallback(
    async (projectName: string, task: TaskCreate) => {
      setIsLoading(true);
      setError(null);
      try {
        const newTask = await repository.create(projectName, task);
        setTasks((prev) => [...prev, newTask]);
        return newTask;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to create task"),
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [repository],
  );

  const updateTask = useCallback(
    async (projectName: string, id: string, task: TaskUpdate) => {
      setIsLoading(true);
      setError(null);
      try {
        const existingTask = tasks.find((t) => t.id === id);
        let updatedTaskData = { ...task };

        // Auto-record progress history if progress changed
        if (
          task.progress !== undefined &&
          existingTask &&
          existingTask.progress !== task.progress
        ) {
          const today = new Date().toISOString().split("T")[0];
          const history = existingTask.progress_history
            ? [...existingTask.progress_history]
            : [];
          const existingEntryIndex = history.findIndex((h) => h.date === today);
          if (existingEntryIndex >= 0) {
            history[existingEntryIndex] = {
              ...history[existingEntryIndex],
              progress: task.progress,
            };
          } else {
            history.push({ date: today, progress: task.progress });
          }
          updatedTaskData.progress_history = history;
        }

        const updatedTask = await repository.update(
          projectName,
          id,
          updatedTaskData,
        );
        setTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)));
        return updatedTask;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to update task"),
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [repository, tasks],
  );

  const deleteTask = useCallback(
    async (projectName: string, id: string) => {
      setIsLoading(true);
      setError(null);
      try {
        await repository.delete(projectName, id);
        setTasks((prev) => prev.filter((t) => t.id !== id));
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to delete task"),
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [repository],
  );

  const reorderTasks = useCallback(
    async (
      projectName: string,
      orders: { id: string; display_order: number }[],
    ) => {
      setIsLoading(true);
      setError(null);
      try {
        await repository.updateOrders(projectName, orders);
        fetchTasks(projectName);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to reorder tasks"),
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchTasks, repository],
  );

  const applySchedule = useCallback(
    async (projectName: string) => {
      if (scheduledTasks.length === 0) return;
      setIsLoading(true);
      setError(null);
      try {
        const updates = scheduledTasks
          .filter((t) => !t.parent_id) // Only update leaf tasks or manage parent dates via leaves
          .map((t) => ({
            id: t.id,
            start_date: t.calculated_start_date || undefined,
            due_date: t.calculated_end_date || undefined,
          }));
        await repository.bulkUpdate(projectName, updates);
        await fetchTasks(projectName);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to apply schedule"),
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchTasks, repository, scheduledTasks],
  );

  return {
    tasks,
    scheduledTasks,
    isLoading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    reorderTasks,
    applySchedule,
    exportTasks: (projectName: string) => {
      window.location.href = `/api/v1/projects/${encodeURIComponent(
        projectName,
      )}/tasks/export`;
    },
  };
};
