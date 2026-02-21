import { DependencyProvider } from "../providers/DependencyProvider";

// Mock the dependencies provider
vi.mock("../providers/DependencyProvider", () => ({
  useDependencies: () => ({
    settingsRepository: new SettingsApiRepository(),
  }),
  DependencyProvider: ({ children }: any) => children,
}));

// Mock the module
vi.mock(
  "../../../infrastructure/api/repositories/settingsApiRepository",
  () => {
    const SettingsApiRepository = vi.fn();
    SettingsApiRepository.prototype.getSettings = vi.fn();
    SettingsApiRepository.prototype.updateProjectSettings = vi.fn();
    return { SettingsApiRepository };
  },
);

describe("useSettingsUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockSettings = {
    basic: { daily_work_hours: 8 },
    project: { project_name: "Test Project" },
  };

  it("fetches settings successfully", async () => {
    // Setup mock
    // @ts-ignore
    SettingsApiRepository.prototype.getSettings.mockResolvedValue(mockSettings);

    const { result } = renderHook(() => useSettingsUseCase());

    await result.current.fetchSettings();

    await waitFor(() => {
      expect(result.current.settings).toEqual(mockSettings);
    });
  });

  it("updates project settings successfully", async () => {
    const updatedProject = { project_name: "Updated Project" };

    // Setup mocks
    // @ts-ignore
    SettingsApiRepository.prototype.getSettings.mockResolvedValue(mockSettings);
    // @ts-ignore
    SettingsApiRepository.prototype.updateProjectSettings.mockResolvedValue(
      updatedProject,
    );

    const { result } = renderHook(() => useSettingsUseCase());

    // Initial fetch
    await result.current.fetchSettings();

    // Update
    const res = await result.current.updateProjectSettings(updatedProject);

    expect(res).toEqual(updatedProject);

    await waitFor(() => {
      expect(result.current.settings?.project).toEqual(updatedProject);
    });
  });
});
