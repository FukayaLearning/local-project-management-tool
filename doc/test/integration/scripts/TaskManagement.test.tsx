import { describe, it, expect, beforeAll } from "vitest";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { TaskListPage } from "@/presentation/pages/TaskListPage";
import { demoDelay } from "./utils/demo";

// Mock CSS to avoid PostCSS/Tailwind errors in test
vi.mock("@/index.css", () => ({}));
import { ApiClient } from "@/infrastructure/api/client";

describe("Integration: Task Management", () => {
  // Ensure backend is initialized with a project
  beforeAll(async () => {
    await ApiClient.ensureSystemInitialized();
  });

  it("Should execute Task Management Flow (Create -> Edit)", async () => {
    render(
      <MemoryRouter>
        <TaskListPage />
      </MemoryRouter>,
    );

    // Wait for load
    await waitFor(
      () => {
        expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    // 1. Create New Task
    await demoDelay(); fireEvent.click(screen.getByText("+ New Task"));

    const modalTitle = await screen.findByText("New Task");
    expect(modalTitle).toBeInTheDocument();

    const taskTitle = `Integration Task ${Date.now()}`;
    await demoDelay(); fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: taskTitle },
    });
    await demoDelay(); fireEvent.change(screen.getByLabelText("Status"), {
      target: { value: "New" },
    });

    await demoDelay(); fireEvent.click(screen.getByRole("button", { name: "Save" }));

    // Wait for modal to close and task to appear
    await waitFor(() => {
      expect(screen.queryByText("New Task")).not.toBeInTheDocument(); // Modal closed
      expect(screen.getByText(taskTitle)).toBeInTheDocument();
    });

    // 2. Edit Task
    // Find the row with the task title
    const taskRow = screen.getByText(taskTitle).closest("tr");
    if (!taskRow) throw new Error("Task row not found");

    const editButton = within(taskRow as HTMLElement).getByRole("button", {
      name: "Edit",
    });
    await demoDelay(); fireEvent.click(editButton);

    const editModalTitle = await screen.findByText("Edit Task");
    expect(editModalTitle).toBeInTheDocument();

    await demoDelay(); fireEvent.change(screen.getByLabelText("Status"), {
      target: { value: "Implementation" },
    });
    await demoDelay(); fireEvent.click(screen.getByRole("button", { name: "Save" }));

    // Wait for update
    await waitFor(() => {
      expect(screen.queryByText("Edit Task")).not.toBeInTheDocument();
    });

    // Verify status in list (This depends on how list renders status.
    // Assuming TaskListView renders status text or badge)
    // We might need to look within the task card.

    // Verify status in list
    const updatedTaskRow = screen.getByText(taskTitle).closest("tr");
    if (!updatedTaskRow) throw new Error("Task row not found after update");
    expect(
      within(updatedTaskRow as HTMLElement).getByText("Implementation"),
    ).toBeInTheDocument();
  });
});
