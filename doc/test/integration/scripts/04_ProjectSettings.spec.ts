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

test.describe("Integration: Project Settings", () => {
  test.beforeAll(async ({ request }) => {
    await ensureSystemInitialized(request);
  });

  test("IT-SCN-SET-001/002: Should display and update project name", async ({
    page,
  }) => {
    await page.goto("/settings");

    // Loading 待機
    await expect(page.locator("text=Loading")).not.toBeVisible();

    // Input 確認
    const nameInput = page.getByLabel("Project Name");
    await expect(nameInput).toBeVisible();

    const originalName = await nameInput.inputValue();
    const newName = `Updated Project ${Date.now()}`;

    // Update
    await nameInput.fill(newName);

    const saveButton = page.getByRole("button", { name: "Save Changes" });
    await saveButton.click();

    // Verify
    // ボタンの非活性化などをチェックするのも良いが、ここでは値が維持されているか確認
    // リロードしても維持されているべき
    await page.reload();
    await expect(page.locator("text=Loading")).not.toBeVisible();

    await expect(nameInput).toHaveValue(newName);
  });
});
