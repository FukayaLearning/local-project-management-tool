import { describe, it, expect, beforeAll, vi, afterEach } from "vitest";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  cleanup,
} from "@testing-library/react";
import { ApiClient } from "@/infrastructure/api/client";

import { demoDelay } from "./utils/demo";

// Mock CSS to avoid PostCSS/Tailwind errors in test
vi.mock("@/index.css", () => ({}));

// Mock window.alert
window.alert = vi.fn();

// Mock window.location.reload
const reloadMock = vi.fn();
Object.defineProperty(window, "location", {
  value: { reload: reloadMock },
  writable: true,
});

// Import App AFTER mocking CSS
import App from "@/App";

describe("Integration: History and Switching", () => {
  const TEST_PROJECT_A = `HistoryProjectA_${Date.now()}`;
  const TEST_PROJECT_B = `HistoryProjectB_${Date.now()}`;

  beforeAll(async () => {
    // 1. Ensure system is initialized
    await ApiClient.ensureSystemInitialized();

    // 2. Create two projects for testing
    try {
      const resA = await ApiClient.createProject(TEST_PROJECT_A);
      console.log(`DEBUG: Project ${TEST_PROJECT_A} created.`, resA);
    } catch (e) {
      console.log(
        `DEBUG: Project ${TEST_PROJECT_A} creation failed/exists:`,
        e,
      );
    }

    try {
      const resB = await ApiClient.createProject(TEST_PROJECT_B);
      console.log(`DEBUG: Project ${TEST_PROJECT_B} created.`, resB);
    } catch (e) {
      console.log(
        `DEBUG: Project ${TEST_PROJECT_B} creation failed/exists:`,
        e,
      );
    }
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("IT-SCN-SW-001: Should switch projects", async () => {
    render(<App />);

    // Wait for initial load
    await waitFor(
      () => {
        expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
      },
      { timeout: 5000 },
    );

    // DEBUG: Initial Status
    try {
      const status = await ApiClient.getSystemStatus();
      console.log("DEBUG: Initial System Status:", status);
    } catch (e) {
      console.log("DEBUG: Failed to get status", e);
    }

    // Switch to Project A
    const projectSelect = await screen.findByRole("combobox");
    console.log(
      "DEBUG: Select Value Before Change:",
      (projectSelect as HTMLSelectElement).value,
    );

    await demoDelay(); fireEvent.change(projectSelect, { target: { value: TEST_PROJECT_A } });
    console.log("DEBUG: FireEvent Change called with:", TEST_PROJECT_A);

    // Verify switch
    await waitFor(
      () => {
        const select = screen.getByRole("combobox") as HTMLSelectElement;
        if (select.value !== TEST_PROJECT_A) {
          console.log("DEBUG: Waiting for switch... Current:", select.value);
          // Verify if API call happening?
          // We can check status again
          ApiClient.getSystemStatus().then((s) =>
            console.log("DEBUG: Current Status poll:", s),
          );
        }
        expect(select.value).toBe(TEST_PROJECT_A);
      },
      { timeout: 5000 },
    );

    // Create Task in Project A
    const taskTitleA = `Task in A ${Date.now()}`;
    await demoDelay(); fireEvent.click(screen.getByText("+ New Task"));

    const modalTitle = await screen.findByText("New Task");
    expect(modalTitle).toBeInTheDocument();

    await demoDelay(); fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: taskTitleA },
    });
    await demoDelay(); fireEvent.change(screen.getByLabelText("Status"), {
      target: { value: "New" },
    });
    await demoDelay(); fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(screen.getByText(taskTitleA)).toBeInTheDocument();
    });

    // Switch to Project B
    await demoDelay(); fireEvent.change(projectSelect, { target: { value: TEST_PROJECT_B } });

    // Verify task list update (Task A gone)
    await waitFor(() => {
      expect(screen.queryByText(taskTitleA)).not.toBeInTheDocument();
    });

    // Switch back to Project A
    await demoDelay(); fireEvent.change(projectSelect, { target: { value: TEST_PROJECT_A } });

    // Verify Task A back
    await waitFor(() => {
      expect(screen.getByText(taskTitleA)).toBeInTheDocument();
    });
  });

  it("IT-SCN-HIST-001/002/003: Should Undo and Redo task creation", async () => {
    render(<App />);

    await waitFor(
      () => expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument(),
      { timeout: 5000 },
    );

    const projectSelect = await screen.findByRole("combobox");
    // Ensure we switch to Project A
    await demoDelay(); fireEvent.change(projectSelect, { target: { value: TEST_PROJECT_A } });
    await waitFor(() =>
      expect((projectSelect as HTMLSelectElement).value).toBe(TEST_PROJECT_A),
    );

    // Create Task to Undo
    const taskTitleUndo = `Task to Undo ${Date.now()}`;
    await demoDelay(); fireEvent.click(screen.getByText("+ New Task"));

    await screen.findByText("New Task");
    await demoDelay(); fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: taskTitleUndo },
    });
    await demoDelay(); fireEvent.change(screen.getByLabelText("Status"), {
      target: { value: "New" },
    });
    await demoDelay(); fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(screen.getByText(taskTitleUndo)).toBeInTheDocument();
    });

    // Click Undo
    const undoButton = screen.getByRole("button", { name: "Undo" });
    await demoDelay(); fireEvent.click(undoButton);

    // Wait for reload call
    await waitFor(() => {
      expect(reloadMock).toHaveBeenCalled();
    });

    // Simulate Reload
    cleanup();
    render(<App />);
    await waitFor(
      () => expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument(),
      { timeout: 5000 },
    );

    // Check if task is gone
    // NOTE: After reload, we need to be sure we are looking at the right project.
    // If backend persisted current branch, it should be Project A.
    const projectSelect2 = await screen.findByRole("combobox");
    console.log(
      "DEBUG: After Reload(Undo), Project is:",
      (projectSelect2 as HTMLSelectElement).value,
    );

    // Verify Task is GONE
    await waitFor(() => {
      expect(screen.queryByText(taskTitleUndo)).not.toBeInTheDocument();
    });

    // Click Redo
    const redoButton = screen.getByRole("button", { name: "Redo" });
    await demoDelay(); fireEvent.click(redoButton);

    // Wait for reload call
    await waitFor(() => {
      expect(reloadMock).toHaveBeenCalledTimes(2);
    });

    // Simulate Reload
    cleanup();
    render(<App />);
    await waitFor(
      () => expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument(),
      { timeout: 5000 },
    );

    // Verify Task is BACK
    await waitFor(() => {
      expect(screen.getByText(taskTitleUndo)).toBeInTheDocument();
    });
  });
});
