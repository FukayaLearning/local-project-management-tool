import { DependencyProvider } from "../../providers/DependencyProvider";
import { SettingsApiRepository } from "../../../infrastructure/api/repositories/settingsApiRepository";
import { useSettingsUseCase } from "../useSettingsUseCase";
import { renderHook, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
// Mock the dependencies provider
vi.mock("../../providers/DependencyProvider", () => ({
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
    SettingsApiRepository.prototype.getGlobalSettings = vi.fn();
    SettingsApiRepository.prototype.updateGlobalSettings = vi.fn();
    SettingsApiRepository.prototype.getProjectSettings = vi.fn();
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
    SettingsApiRepository.prototype.getGlobalSettings.mockResolvedValue(
      mockSettings.basic,
    );

    const { result } = renderHook(() => useSettingsUseCase());

    await act(async () => {
      await result.current.fetchGlobalSettings();
    });

    await waitFor(() => {
      expect(result.current.globalSettings).toEqual(mockSettings.basic);
    });
  });

  it("updates project settings successfully", async () => {
    const updatedProject = { project_name: "Updated Project" };

    // Setup mocks
    // @ts-ignore
    SettingsApiRepository.prototype.getProjectSettings.mockResolvedValue(
      mockSettings.project,
    );
    // @ts-ignore
    SettingsApiRepository.prototype.updateProjectSettings.mockResolvedValue(
      updatedProject,
    );

    const { result } = renderHook(() => useSettingsUseCase());

    // Initial fetch
    await act(async () => {
      await result.current.fetchProjectSettings("Test Project");
    });

    // Update
    let res;
    await act(async () => {
      res = await result.current.updateProjectSettings(
        "Test Project",
        updatedProject,
      );
    });

    expect(res).toEqual(updatedProject);

    await waitFor(() => {
      expect(result.current.projectSettings).toEqual(updatedProject);
    });
  });
});
