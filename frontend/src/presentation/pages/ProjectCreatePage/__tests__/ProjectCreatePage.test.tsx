import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ProjectCreatePage } from "../index";
import { ApiClient } from "../../../../infrastructure/api/client";

// Mock ApiClient
vi.mock("../../../../infrastructure/api/client", () => ({
  ApiClient: {
    post: vi.fn(),
  },
}));

describe("ProjectCreatePage", () => {
  const mockOnProjectCreated = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("UNIT-FE-PG-PCP-001: Should render correctly", () => {
    render(<ProjectCreatePage onProjectCreated={mockOnProjectCreated} />);

    expect(screen.getByText("新規プロジェクト作成")).toBeInTheDocument();
    expect(screen.getByLabelText("プロジェクト名")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "プロジェクト作成開始" }),
    ).toBeInTheDocument();
  });

  it("UNIT-FE-PG-PCP-002: Should create project and call onProjectCreated", async () => {
    (ApiClient.post as any).mockResolvedValue({});

    render(<ProjectCreatePage onProjectCreated={mockOnProjectCreated} />);

    const input = screen.getByLabelText("プロジェクト名");
    fireEvent.change(input, { target: { value: "New Project" } });

    const submitButton = screen.getByRole("button", {
      name: "プロジェクト作成開始",
    });
    fireEvent.click(submitButton);

    // Initial loading state check
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent("作成中...");

    await waitFor(() => {
      expect(ApiClient.post).toHaveBeenCalledWith("/projects/", {
        project_name: "New Project",
      });
      expect(mockOnProjectCreated).toHaveBeenCalledWith("New Project");
    });
  });

  it("Should display error message on API failure", async () => {
    const errorMessage = "Failed to create project";
    (ApiClient.post as any).mockRejectedValue(new Error(errorMessage));

    render(<ProjectCreatePage onProjectCreated={mockOnProjectCreated} />);

    fireEvent.change(screen.getByLabelText("プロジェクト名"), {
      target: { value: "Error Project" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "プロジェクト作成開始" }),
    );

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(mockOnProjectCreated).not.toHaveBeenCalled();
    });
  });
});
