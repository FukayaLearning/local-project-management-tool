import { test, expect } from "@playwright/test";

async function ensureSystemInitialized(request: any) {
  const res = await request.get("/api/v1/projects/");
  const projects = await res.json();
  if (!projects.includes("DefaultProject")) {
    await request.post("/api/v1/projects/", {
      data: { project_name: "DefaultProject" },
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
    await page.goto("/projects/DefaultProject");
    await expect(page).toHaveURL(/.*\/projects\/DefaultProject/, {
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
    await page.getByRole("button", { name: "Project Settings" }).click();
    await expect(page).toHaveURL(/.*\/projects\/DefaultProject\/settings/);
    await expect(page.locator("h1:has-text('Project Settings')")).toBeVisible();

    // Click Tasks
    await page.getByRole("button", { name: "Tasks", exact: true }).click();
    await expect(page).toHaveURL(/.*\/projects\/DefaultProject$/);
    await expect(
      page.getByRole("button", { name: "+ New Task" }),
    ).toBeVisible();
  });
});
