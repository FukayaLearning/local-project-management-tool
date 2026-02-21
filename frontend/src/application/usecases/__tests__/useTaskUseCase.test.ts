import { DependencyProvider } from "../providers/DependencyProvider";

// Mock the dependencies provider
vi.mock("../providers/DependencyProvider", () => ({
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
    await result.current.fetchTasks();

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

    await result.current.fetchTasks();

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

    await result.current.createTask(newTask as any);

    await waitFor(() => {
      expect(result.current.tasks).toContainEqual(createdTask);
    });
    expect(TaskApiRepository.prototype.create).toHaveBeenCalledWith(newTask);
  });
});
