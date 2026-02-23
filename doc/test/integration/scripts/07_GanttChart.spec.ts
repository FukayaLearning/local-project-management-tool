import { test, expect } from "@playwright/test";

async function ensureSystemInitialized(request: any) {
  const statusRes = await request.get("/api/v1/system/status");
  const status = await statusRes.json();
  if (!status.is_git_initialized || !status.has_default_project) {
    await request.post("/api/v1/projects/", {
      data: { project_name: "Default Project" },
    });
  }
}

test.describe("Integration: Gantt Chart Display Flow", () => {
  test.beforeAll(async ({ request }) => {
    await ensureSystemInitialized(request);
  });

  test("IT-SCN-GANTT-001: Should display Gantt Chart page", async ({
    page,
  }) => {
    // Navigate to Gantt Chart page
    await page.goto("/");
    await expect(page).toHaveURL(/\/tasks/, { timeout: 10000 });

    // Click Gantt Chart in navigation
    await page.click('text="Gantt Chart"');
    await expect(page).toHaveURL(/\/gantt/);

    // Verify Gantt Chart title is displayed
    await expect(page.locator("text=Gantt Chart").first()).toBeVisible();

    // Verify zoom controls exist
    await expect(page.locator("text=Zoom In")).toBeVisible();
    await expect(page.locator("text=Zoom Out")).toBeVisible();

    // Verify progress line toggle exists
    await expect(page.locator("text=Show Progress Line")).toBeVisible();
  });

  test("IT-SCN-GANTT-002: Should display bar for task with dates", async ({
    page,
    request,
  }) => {
    // Create a task with start and due dates via API
    const today = new Date();
    const startDate = today.toISOString().split("T")[0];
    const dueDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    await request.post("/api/v1/tasks/", {
      data: {
        title: "Gantt Test Task",
        status: "New",
        start_date: startDate,
        due_date: dueDate,
        progress: 50,
      },
    });

    // Navigate to Gantt Chart page
    await page.goto("/gantt");
    await expect(page.locator("text=Gantt Chart").first()).toBeVisible({
      timeout: 10000,
    });

    // Verify the task label is shown in the chart
    await expect(page.locator("text=Gantt Test Task")).toBeVisible();
  });

  test("IT-SCN-GANTT-003: Should toggle Inazuma line display", async ({
    page,
  }) => {
    // Navigate to Gantt Chart page
    await page.goto("/gantt");
    await expect(page.locator("text=Gantt Chart").first()).toBeVisible({
      timeout: 10000,
    });

    // Initially, Inazuma line should not be visible (checkbox unchecked)
    const checkbox = page.locator('input[type="checkbox"]');
    await expect(checkbox).not.toBeChecked();

    // Enable progress line
    await checkbox.check();
    await expect(checkbox).toBeChecked();

    // Verify reference date input appears when checkbox is checked
    await expect(page.locator('input[type="date"]')).toBeVisible();
  });
});
