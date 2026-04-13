import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TaskDetailModal } from "../TaskDetailModal";

describe("TaskDetailModal Component", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSave: vi.fn(),
    task: null,
    tasks: [] as any[],
    assignees: [] as any[],
  };

  it("renders new task modal correctly", () => {
    render(<TaskDetailModal {...defaultProps} />);
    expect(screen.getByText("New Task")).toBeInTheDocument();
    expect(screen.getByLabelText("Title")).toHaveValue("");
    expect(screen.getByLabelText("Status")).toHaveValue("New");
  });

  it("renders edit task modal correctly", () => {
    const task = {
      id: "1",
      title: "Existing Task",
      status: "Design",
      progress: 50,
    };
    // @ts-ignore
    render(<TaskDetailModal {...defaultProps} task={task} />);
    expect(screen.getByText("Edit Task")).toBeInTheDocument();
    expect(screen.getByLabelText("Title")).toHaveValue("Existing Task");
    expect(screen.getByLabelText("Status")).toHaveValue("Design");
  });

  it("calls onSave with input values when form is submitted", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<TaskDetailModal {...defaultProps} onSave={onSave} />);

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "New Title" },
    });
    fireEvent.change(screen.getByLabelText("Status"), {
      target: { value: "Design" },
    });

    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "New Title",
          status: "Design",
        }),
      );
    });
  });

  it("calls onClose when cancel button is clicked", () => {
    render(<TaskDetailModal {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("disables inputs and buttons while loading", async () => {
    // Mock onSave to not resolve immediately or trigger loading state internal
    // However, component manages loading state internally based on await onSave.
    // We can simulate a slow save.
    const slowSave = vi
      .fn()
      .mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      );
    render(<TaskDetailModal {...defaultProps} onSave={slowSave} />);

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Test" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(screen.getByLabelText("Title")).toBeDisabled();
    expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /save/i })).toBeEnabled();
    });
  });
});
