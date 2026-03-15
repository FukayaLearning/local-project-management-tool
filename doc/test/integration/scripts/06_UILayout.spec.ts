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

test.describe("Integration: UI Layout and Navigation", () => {
  test.beforeAll(async ({ request }) => {
    await ensureSystemInitialized(request);
  });

  test("IT-SCN-UI-001: Should display common layout elements and navigate correctly", async ({
    page,
  }) => {
    // 1. Initial Load - should be able to get to a project
    await page.goto("/projects/Default Project");
    await expect(page).toHaveURL(/.*\/projects\/Default%20Project/, {
      timeout: 10000,
    });

    // 2. Verify Header and Sidebar existence
    // Assuming Mantine AppShell is used, there should be header and navbar regions
    const header = page.locator("header");
    await expect(header).toBeVisible();
    await expect(header).toContainText("Local PM");

    const nav = page.locator("nav");
    await expect(nav).toBeVisible();

    // 3. Verify Navigation Links
    // Click Settings
    await page.click('text="Project Settings"');
    await expect(page).toHaveURL(/.*\/projects\/Default%20Project\/settings/);
    await expect(page.locator("text=Project Settings")).toBeVisible();

    // Click Tasks
    await page.click('text="Tasks"');
    await expect(page).toHaveURL(/.*\/projects\/Default%20Project$/);
    await expect(page.locator("text=+ New Task")).toBeVisible();
  });
});
