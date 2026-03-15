import { test, expect } from "@playwright/test";

async function ensureSystemInitialized(request: any) {
  const res = await request.get("/api/v1/projects/");
  const projects = await res.json();
  if (!projects.includes("Default Project")) {
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
    await page.goto("/projects/Default Project");
    await expect(page.locator("text=Loading")).not.toBeVisible({
      timeout: 10000,
    });

    // Click Gantt Chart in navigation
    await page.click('text="Gantt Chart"');
    await expect(page).toHaveURL(/.*\/gantt/);

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

    await request.post("/api/v1/projects/Default%20Project/tasks/", {
      data: {
        title: "Gantt Test Task",
        status: "New",
        start_date: startDate,
        due_date: dueDate,
        progress: 50,
      },
    });

    // Navigate to Gantt Chart page
    await page.goto("/projects/Default Project/gantt");
    await expect(page.locator("text=Gantt Chart").first()).toBeVisible({
      timeout: 10000,
    });

    // Verify the task label is shown in the chart
    await expect(page.locator("text=Gantt Test Task")).toBeVisible();
  });

  test("IT-SCN-GANTT-003: Should toggle Inazuma line display", async ({
    page,
    request,
  }) => {
    // Ensure we have at least two tasks with dates to draw the Inazuma line
    const today = new Date();
    const startDate = today.toISOString().split("T")[0];
    const dueDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    await request.post("/api/v1/projects/Default%20Project/tasks/", {
      data: {
        title: "Inazuma Task 1",
        status: "New",
        start_date: startDate,
        due_date: dueDate,
        progress: 20,
      },
    });
    await request.post("/api/v1/projects/Default%20Project/tasks/", {
      data: {
        title: "Inazuma Task 2",
        status: "Doing",
        start_date: startDate,
        due_date: dueDate,
        progress: 80,
      },
    });

    // Navigate to Gantt Chart page
    await page.goto("/projects/Default Project/gantt");
    await expect(page.locator("text=Gantt Chart").first()).toBeVisible({
      timeout: 10000,
    });

    // Initially, Inazuma line should not be visible (checkbox unchecked)
    const checkbox = page.locator('input[type="checkbox"]');
    await expect(checkbox).not.toBeChecked();
    // The SVG path for the inazuma line should not be in the document
    await expect(page.locator('svg path[stroke="#ef4444"]')).not.toBeVisible();

    // Enable progress line
    await checkbox.check();
    await expect(checkbox).toBeChecked();

    // Verify reference date input appears when checkbox is checked
    await expect(page.locator('input[type="date"]')).toBeVisible();

    // Verify the Inazuma line SVG is drawn
    const inazumaPath = page.locator('svg path[stroke="#ef4444"]');
    await expect(inazumaPath).toBeAttached({ timeout: 10000 });

    // Check that it has coordinates in the 'd' attribute
    const dAttr = await inazumaPath.getAttribute("d");
    expect(dAttr).not.toBeNull();
    expect(dAttr?.length).toBeGreaterThan(5); // "M x y L x y" etc.

    // Verify that the task points (circles) are rendered
    const circles = page.locator('svg circle[fill="#ef4444"]');
    expect(await circles.count()).toBeGreaterThanOrEqual(2);
  });
});
