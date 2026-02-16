import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MenuBar } from "../MenuBar";
import { ApiClient } from "../../../infrastructure/api/client";

// Mock ApiClient
vi.mock("../../../infrastructure/api/client", () => ({
  ApiClient: {
    post: vi.fn(),
  },
}));

// Mock window.location.reload
const reloadMock = vi.fn();
Object.defineProperty(window, "location", {
  value: { reload: reloadMock },
  writable: true,
});

// Mock window.alert
window.alert = vi.fn();

describe("MenuBar", () => {
  const mockOnNavigate = vi.fn();
  const mockOnSwitchProject = vi.fn();
  const defaultProps = {
    currentPage: "tasks",
    onNavigate: mockOnNavigate,
    currentProject: "Project A",
    projects: ["Project A", "Project B"],
    onSwitchProject: mockOnSwitchProject,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("UNIT-FE-MNU-001: Should render correctly", () => {
    render(<MenuBar {...defaultProps} />);

    // Check Navigation Buttons
    expect(screen.getByText("Local PM")).toBeInTheDocument();
    expect(screen.getByText("Tasks")).toBeInTheDocument();
    expect(screen.getByText("Gantt Chart")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();

    // Check Project Selector
    expect(screen.getByRole("combobox")).toHaveValue("Project A");
    expect(screen.getByText("Project B")).toBeInTheDocument();

    // Check Undo/Redo Buttons
    expect(screen.getByText("Undo")).toBeInTheDocument();
    expect(screen.getByText("Redo")).toBeInTheDocument();
  });

  it("Should highlight current page", () => {
    render(<MenuBar {...defaultProps} currentPage="tasks" />);
    const tasksButton = screen.getByRole("button", { name: "Tasks" });
    expect(tasksButton.className).toContain("border-blue-500");

    const settingsButton = screen.getByRole("button", { name: "Settings" });
    expect(settingsButton.className).toContain("border-transparent");
  });

  it("UNIT-FE-MNU-002: Should call onNavigate when buttons clicked", () => {
    render(<MenuBar {...defaultProps} />);

    fireEvent.click(screen.getByText("Settings"));
    expect(mockOnNavigate).toHaveBeenCalledWith("settings");

    fireEvent.click(screen.getByText("Gantt Chart"));
    expect(mockOnNavigate).toHaveBeenCalledWith("gantt");
  });

  it("UNIT-FE-MNU-002: Should call onSwitchProject when project selected", () => {
    render(<MenuBar {...defaultProps} />);

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "Project B" } });

    expect(mockOnSwitchProject).toHaveBeenCalledWith("Project B");
  });

  it("UNIT-FE-MNU-003: Should call Undo API and reload on success", async () => {
    (ApiClient.post as any).mockResolvedValue({});

    render(<MenuBar {...defaultProps} />);
    fireEvent.click(screen.getByText("Undo"));

    await waitFor(() => {
      expect(ApiClient.post).toHaveBeenCalledWith("/tasks/undo", {});
      expect(reloadMock).toHaveBeenCalled();
    });
  });

  it("UNIT-FE-MNU-004: Should call Redo API and reload on success", async () => {
    (ApiClient.post as any).mockResolvedValue({});

    render(<MenuBar {...defaultProps} />);
    fireEvent.click(screen.getByText("Redo"));

    await waitFor(() => {
      expect(ApiClient.post).toHaveBeenCalledWith("/tasks/redo", {});
      expect(reloadMock).toHaveBeenCalled();
    });
  });
});
