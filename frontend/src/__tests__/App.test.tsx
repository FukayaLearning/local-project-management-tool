import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import App from "../App";
import { useSystemUseCase } from "../application/usecases/useSystemUseCase";

// Mock pages so we don't need contexts
vi.mock("../presentation/pages/SettingsPage", () => ({
  SettingsPage: () => <div>Settings Page Content</div>,
}));
vi.mock("../presentation/pages/TaskListPage", () => ({
  TaskListPage: () => <div>Tasks Page Content</div>,
}));
vi.mock("../presentation/pages/ProjectCreatePage", () => ({
  ProjectCreatePage: () => <div>Create Project Page Content</div>,
}));
vi.mock("../presentation/pages/GanttChartPage", () => ({
  GanttChartPage: () => <div>Gantt Chart Page Content</div>,
}));

// Mock useSystemUseCase
vi.mock("../application/usecases/useSystemUseCase", () => ({
  useSystemUseCase: vi.fn(),
}));

describe("App Routing and Layout", () => {
  const mockFetchSystemStatus = vi.fn();
  const mockFetchProjects = vi.fn();
  const mockSwitchProject = vi.fn();
  const mockCreateProject = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const setupMock = (systemStatus: any, projects: any, isLoading: boolean) => {
    (useSystemUseCase as any).mockReturnValue({
      systemStatus,
      projects,
      isLoading,
      fetchSystemStatus: mockFetchSystemStatus.mockResolvedValue(systemStatus),
      fetchProjects: mockFetchProjects.mockResolvedValue(projects),
      switchProject: mockSwitchProject,
      createProject: mockCreateProject,
    });
  };

  it("UNIT-FE-APP-001: Should show loading screen initially", () => {
    // Return a promise that never resolves to simulate loading state indefinitely for the test
    const unresolvedPromise = new Promise(() => {});
    (useSystemUseCase as any).mockReturnValue({
      systemStatus: null,
      projects: [],
      isLoading: true,
      fetchSystemStatus: vi.fn().mockReturnValue(unresolvedPromise),
      fetchProjects: mockFetchProjects,
      switchProject: mockSwitchProject,
      createProject: mockCreateProject,
    });
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("UNIT-FE-APP-002: Should navigate to /create_project if system not initialized", async () => {
    setupMock(
      { is_git_initialized: false, has_default_project: false },
      [],
      false,
    );

    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    // In our mock, ProjectCreatePage will just render its content.
    // We need to wait for the async navigation to complete.
    expect(
      await screen.findByText("Create Project Page Content"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Local PM")).not.toBeInTheDocument();
  });

  it("UNIT-FE-APP-003: Should render MenuBar and TaskListPage on /tasks", async () => {
    setupMock(
      {
        is_git_initialized: true,
        has_default_project: true,
        current_project: "ProjA",
      },
      ["ProjA"],
      false,
    );

    render(
      <MemoryRouter initialEntries={["/tasks"]}>
        <App />
      </MemoryRouter>,
    );

    // Layout should show MenuBar
    expect(screen.getByText("Local PM")).toBeInTheDocument();
    expect(screen.getByText("Tasks")).toBeInTheDocument();

    // MenuBar layout wrap
    const mainArea = screen.getByRole("main");
    expect(mainArea).toBeInTheDocument();
  });

  it("UNIT-FE-APP-004: Should render GanttChartPage on /gantt", async () => {
    setupMock(
      {
        is_git_initialized: true,
        has_default_project: true,
        current_project: "ProjA",
      },
      ["ProjA"],
      false,
    );

    render(
      <MemoryRouter initialEntries={["/gantt"]}>
        <App />
      </MemoryRouter>,
    );

    // MenuBar should be present
    expect(screen.getByText("Local PM")).toBeInTheDocument();

    // Gantt Chart should be rendered
    expect(screen.getByText("Gantt Chart Page Content")).toBeInTheDocument();
  });

  it("UNIT-FE-APP-005: Should render SettingsPage on /settings", async () => {
    setupMock(
      {
        is_git_initialized: true,
        has_default_project: true,
        current_project: "ProjA",
      },
      ["ProjA"],
      false,
    );

    render(
      <MemoryRouter initialEntries={["/settings"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByText("Local PM")).toBeInTheDocument();
    expect(screen.getByText("Settings Page Content")).toBeInTheDocument();
  });
});
