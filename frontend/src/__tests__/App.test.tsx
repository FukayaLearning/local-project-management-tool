import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import App from "../App";
import { useProjectUseCase } from "../application/usecases/useProjectUseCase";

// Mock pages
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
vi.mock("../presentation/pages/GlobalSettingsPage", () => ({
  GlobalSettingsPage: () => <div>Global Settings Page Content</div>,
}));
vi.mock("../presentation/pages/ProjectManagementPage", () => ({
  ProjectManagementPage: () => <div>Project Management Page Content</div>,
}));

// Mock useProjectUseCase
vi.mock("../application/usecases/useProjectUseCase", () => ({
  useProjectUseCase: vi.fn(),
}));

describe("App Routing and Layout", () => {
  const mockFetchProjects = vi.fn();
  const mockUndo = vi.fn();
  const mockRedo = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useProjectUseCase as any).mockReturnValue({
      projects: ["Project A", "Project B"],
      fetchProjects: mockFetchProjects,
      undo: mockUndo,
      redo: mockRedo,
    });
  });

  it("UNIT-FE-APP-001: Should render ProjectManagementPage on /projects", () => {
    render(
      <MemoryRouter initialEntries={["/projects"]}>
        <App />
      </MemoryRouter>,
    );
    expect(
      screen.getByText("Project Management Page Content"),
    ).toBeInTheDocument();
  });

  it("UNIT-FE-APP-002: Should render GlobalSettingsPage on /settings", () => {
    render(
      <MemoryRouter initialEntries={["/settings"]}>
        <App />
      </MemoryRouter>,
    );
    expect(
      screen.getByText("Global Settings Page Content"),
    ).toBeInTheDocument();
  });

  it("UNIT-FE-APP-003: Should render TaskListPage on /projects/:projectName", () => {
    render(
      <MemoryRouter initialEntries={["/projects/ProjA"]}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByText("Tasks Page Content")).toBeInTheDocument();
    expect(mockFetchProjects).toHaveBeenCalled();
  });

  it("UNIT-FE-APP-004: Should render GanttChartPage on /projects/:projectName/gantt", () => {
    render(
      <MemoryRouter initialEntries={["/projects/ProjA/gantt"]}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByText("Gantt Chart Page Content")).toBeInTheDocument();
  });

  it("UNIT-FE-APP-005: Should render SettingsPage on /projects/:projectName/settings", () => {
    render(
      <MemoryRouter initialEntries={["/projects/ProjA/settings"]}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByText("Settings Page Content")).toBeInTheDocument();
  });
});
