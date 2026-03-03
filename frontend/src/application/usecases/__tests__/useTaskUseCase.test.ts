import { DependencyProvider } from "../../providers/DependencyProvider";
import { TaskApiRepository } from "../../../infrastructure/api/repositories/taskApiRepository";
import { useTaskUseCase } from "../useTaskUseCase";
import { renderHook, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
// Mock the dependencies provider
vi.mock("../../providers/DependencyProvider", () => ({
  useDependencies: () => ({
    taskRepository: new TaskApiRepository(),
  }),
  DependencyProvider: ({ children }: any) => children,
}));

// Mock the module
vi.mock("../../../infrastructure/api/repositories/taskApiRepository", () => {
  const TaskApiRepository = vi.fn();
  TaskApiRepository.prototype.getAll = vi.fn();
  TaskApiRepository.prototype.create = vi.fn();
  TaskApiRepository.prototype.update = vi.fn();
  TaskApiRepository.prototype.delete = vi.fn();
  TaskApiRepository.prototype.updateOrders = vi.fn();
  return { TaskApiRepository };
});

describe("useTaskUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches tasks successfully", async () => {
    const mockTasks = [{ id: "1", title: "Task 1", status: "New" }];
    // @ts-ignore
    TaskApiRepository.prototype.getAll.mockResolvedValue(mockTasks);

    const { result } = renderHook(() => useTaskUseCase());

    // Initial state
    expect(result.current.tasks).toEqual([]);
    expect(result.current.isLoading).toBe(false);

    // Trigger fetch
    await act(async () => {
      await result.current.fetchTasks();
    });

    expect(result.current.isLoading).toBe(false);
    await waitFor(() => {
      expect(result.current.tasks).toEqual(mockTasks);
    });
    expect(result.current.error).toBeNull();
  });

  it("handles fetch error", async () => {
    // @ts-ignore
    TaskApiRepository.prototype.getAll.mockRejectedValue(
      new Error("Fetch failed"),
    );

    const { result } = renderHook(() => useTaskUseCase());

    await act(async () => {
      await result.current.fetchTasks();
    });

    expect(result.current.isLoading).toBe(false);
    await waitFor(() => {
      expect(result.current.tasks).toEqual([]);
      expect(result.current.error).toEqual(new Error("Fetch failed"));
    });
  });

  it("creates task successfully", async () => {
    const newTask = { title: "New Task", status: "New" };
    const createdTask = { id: "2", ...newTask };
    // @ts-ignore
    TaskApiRepository.prototype.create.mockResolvedValue(createdTask);

    const { result } = renderHook(() => useTaskUseCase());

    await act(async () => {
      await result.current.createTask(newTask as any);
    });

    await waitFor(() => {
      expect(result.current.tasks).toContainEqual(createdTask);
    });
    expect(TaskApiRepository.prototype.create).toHaveBeenCalledWith(newTask);
  });

  it("creates task with parent successfully", async () => {
    const newTask = { title: "Sub Task", status: "New", parent_id: "parent-1" };
    const createdTask = { id: "3", ...newTask };
    // @ts-ignore
    TaskApiRepository.prototype.create.mockResolvedValue(createdTask);

    const { result } = renderHook(() => useTaskUseCase());

    await act(async () => {
      await result.current.createTask(newTask as any);
    });

    await waitFor(() => {
      expect(result.current.tasks).toContainEqual(createdTask);
    });
    expect(TaskApiRepository.prototype.create).toHaveBeenCalledWith(newTask);
  });

  it("reorders tasks successfully", async () => {
    // @ts-ignore
    TaskApiRepository.prototype.updateOrders.mockResolvedValue(undefined);
    // @ts-ignore
    TaskApiRepository.prototype.getAll.mockResolvedValue([]);

    const { result } = renderHook(() => useTaskUseCase());

    await act(async () => {
      await result.current.reorderTasks([{ id: "1", display_order: 1 }]);
    });

    expect(TaskApiRepository.prototype.updateOrders).toHaveBeenCalledWith([
      { id: "1", display_order: 1 },
    ]);
    expect(TaskApiRepository.prototype.getAll).toHaveBeenCalled();
  });
});
