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

test.describe("Integration: Task Management", () => {
  test.beforeAll(async ({ request }) => {
    await ensureSystemInitialized(request);
  });

  test("Should execute Task Management Flow (Create -> Edit)", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.locator("text=Loading")).not.toBeVisible();

    // 1. Create New Task
    await page.click("text=+ New Task");
    await expect(page.locator("text=New Task")).toBeVisible();

    const taskTitle = `Integration Task ${Date.now()}`;
    await page.getByLabel("Title").fill(taskTitle);
    await page.getByLabel("Status").selectOption("New");

    await page.click('button:has-text("Save")');

    // Modal closed and task matches
    // await expect(page.locator('text=New Task')).not.toBeVisible(); // "New Task" button also has text "New Task"? No, button is "+ New Task". Title is "New Task".
    // 厳密にはモーダルのタイトル
    await expect(page.locator('h2:has-text("New Task")')).not.toBeVisible();
    await expect(page.locator(`text=${taskTitle}`)).toBeVisible();

    // 2. Edit Task
    // 特定のタスク行のEditボタンをクリック
    // Playwright では locator chaining が便利
    // 行を見つける: has-text でタイトルを含む tr を探す
    const row = page.locator(`tr:has-text("${taskTitle}")`);
    await row.getByRole("button", { name: "Edit" }).click();

    await expect(page.locator("text=Edit Task")).toBeVisible();

    // Status Update
    await page.getByLabel("Status").selectOption("Implementation");
    await page.click('button:has-text("Save")');

    await expect(page.locator("text=Edit Task")).not.toBeVisible();

    // Verify Status in List
    // リストの表示形式に依存するが、行の中に "Implementation" があるか確認
    await expect(row).toContainText("Implementation");
  });
});
