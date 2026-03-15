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

test.describe("Integration: UI Layout and Navigation", () => {
  test.beforeAll(async ({ request }) => {
    await ensureSystemInitialized(request);
  });

  test("IT-SCN-UI-001: Should display common layout elements and navigate correctly", async ({
    page,
  }) => {
    // 1. Initial Load - should redirect to /tasks
    await page.goto("/");
    await expect(page).toHaveURL(/\/tasks/, { timeout: 10000 });

    // 2. Verify Header and Sidebar existence
    // Assuming Mantine AppShell is used, there should be header and navbar regions
    const header = page.locator("header");
    await expect(header).toBeVisible();
    await expect(header).toContainText("Local PM");

    const nav = page.locator("nav");
    await expect(nav).toBeVisible();

    // 3. Verify Navigation Links
    // Click Settings
    await page.click('text="Settings"');
    await expect(page).toHaveURL(/\/settings/);
    await expect(page.locator("text=Project Settings")).toBeVisible();

    // Click Tasks
    await page.click('text="Tasks"');
    await expect(page).toHaveURL(/\/tasks/);
    await expect(page.locator("text=+ New Task")).toBeVisible();
  });
});
