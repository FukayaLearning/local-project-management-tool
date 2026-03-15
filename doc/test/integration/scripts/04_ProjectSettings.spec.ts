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

test.describe("Integration: Project Settings", () => {
  test.beforeAll(async ({ request }) => {
    await ensureSystemInitialized(request);
  });

  test("IT-SCN-SET-001/002: Should display and update project name", async ({
    page,
  }) => {
    await page.goto("/projects/Default Project/settings");

    // Loading 待機
    await expect(page.locator("text=Loading")).not.toBeVisible({
      timeout: 10000,
    });

    // Input 確認
    const nameInput = page.getByLabel("Project Name");
    await expect(nameInput).toBeVisible({ timeout: 10000 });

    const originalName = await nameInput.inputValue();
    const newName = `Updated Project ${Date.now()}`;

    // Update
    await nameInput.fill(newName);

    const saveButton = page.getByRole("button", { name: "Save Changes" });
    await saveButton.click();

    // Verify - リロードしても維持されているべき
    await page.reload();
    await expect(page.locator("text=Loading")).not.toBeVisible({
      timeout: 10000,
    });

    await expect(nameInput).toHaveValue(newName, { timeout: 10000 });
  });
});
