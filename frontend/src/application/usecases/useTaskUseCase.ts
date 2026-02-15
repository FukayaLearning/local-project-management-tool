import { useState, useCallback } from 'react';
import { Task, TaskCreate, TaskUpdate } from "../../domain/entities/task";
import { ITaskRepository } from "../../domain/repositories/taskRepository";
import { TaskApiRepository } from "../../infrastructure/api/repositories/taskApiRepository";

export const useTaskUseCase = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    // Dependency Injection (Manual for now, typically passed via Context or specialized hook)
    const repository: ITaskRepository = new TaskApiRepository();

    const fetchTasks = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await repository.getAll();
            setTasks(data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch tasks'));
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createTask = useCallback(async (task: TaskCreate) => {
        setIsLoading(true);
        setError(null);
        try {
            const newTask = await repository.create(task);
            setTasks(prev => [...prev, newTask]);
            return newTask;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to create task'));
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateTask = useCallback(async (id: string, task: TaskUpdate) => {
        setIsLoading(true);
        setError(null);
        try {
            const updatedTask = await repository.update(id, task);
            setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
            return updatedTask;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to update task'));
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const deleteTask = useCallback(async (id: string) => {
        setIsLoading(true);
        setError(null);
        try {
            await repository.delete(id);
            setTasks(prev => prev.filter(t => t.id !== id));
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to delete task'));
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        tasks,
        isLoading,
        error,
        fetchTasks,
        createTask,
        updateTask,
        deleteTask
    };
};
