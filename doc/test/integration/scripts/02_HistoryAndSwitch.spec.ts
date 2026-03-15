import { test, expect } from "@playwright/test";

// ヘルパー: システム初期化とプロジェクト作成
async function ensureSystemInitialized(request: any) {
  const res = await request.get("/api/v1/projects/");
  const projects = await res.json();
  if (projects.length === 0) {
    await request.post("/api/v1/projects/", {
      data: { project_name: "DefaultProject" },
    });
  }
}

async function createProject(request: any, name: string) {
  try {
    const res = await request.post("/api/v1/projects/", {
      data: { project_name: name },
    });
    return res.ok();
  } catch (e) {
    return false;
  }
}

// ヘルパー: プロジェクト切り替えとフルリロード完了を待機
// handleSwitchProject は API呼び出し後に window.location.reload() でフルリロード
async function switchProjectAndWaitForReload(
  page: any,
  projectSelect: any,
  label: string,
) {
  // selectOption後に発生するフルブラウザリロードを待機
  await Promise.all([
    page.waitForNavigation({ waitUntil: "load", timeout: 30000 }),
    projectSelect.selectOption({ label }),
  ]);

  // リロード後のページ安定を待機
  await expect(page.locator("text=Loading")).not.toBeVisible({
    timeout: 10000,
  });
}

test.describe("Integration: History and Switching", () => {
  const TEST_PROJECT_A = `HistoryProjectA_${Date.now()}`;
  const TEST_PROJECT_B = `HistoryProjectB_${Date.now()}`;

  test.beforeAll(async ({ request }) => {
    await ensureSystemInitialized(request);
    await createProject(request, TEST_PROJECT_A);
    await createProject(request, TEST_PROJECT_B);
  });

  test("IT-SCN-SW-001: Should switch projects", async ({ page }) => {
    await page.goto(`/projects/${TEST_PROJECT_A}`);

    await expect(page.locator("text=Loading")).not.toBeVisible({
      timeout: 10000,
    });

    // プロジェクトA選択
    const projectSelect = page.locator("select");
    await switchProjectAndWaitForReload(page, projectSelect, TEST_PROJECT_A);

    // タスク作成 (Project A)
    const taskTitleA = `Task in A ${Date.now()}`;
    await page.click("text=+ New Task");
    await expect(page.locator('h3:has-text("New Task")')).toBeVisible();

    await page.getByLabel("Title").fill(taskTitleA);
    await page.getByLabel("Status").selectOption("New");
    await page.click('button:has-text("Save")');

    // タスク表示確認
    await expect(page.locator(`text=${taskTitleA}`)).toBeVisible({
      timeout: 10000,
    });

    // プロジェクトBへ切り替え
    await switchProjectAndWaitForReload(page, projectSelect, TEST_PROJECT_B);

    // タスクA消滅確認
    await expect(page.locator(`text=${taskTitleA}`)).not.toBeVisible({
      timeout: 10000,
    });

    // プロジェクトAへ戻る
    await switchProjectAndWaitForReload(page, projectSelect, TEST_PROJECT_A);

    // タスクA復活確認
    await expect(page.locator(`text=${taskTitleA}`)).toBeVisible({
      timeout: 10000,
    });
  });

  test("IT-SCN-HIST-001/002/003: Should Undo and Redo task creation", async ({
    page,
  }) => {
    // alert() ダイアログを自動的にacceptする
    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    await page.goto(`/projects/${TEST_PROJECT_A}`);

    await expect(page.locator("text=Loading")).not.toBeVisible({
      timeout: 10000,
    });

    // プロジェクトA選択
    const projectSelect = page.locator("select");
    await switchProjectAndWaitForReload(page, projectSelect, TEST_PROJECT_A);

    // Undo用タスク作成
    const taskTitleUndo = `Task to Undo ${Date.now()}`;
    await page.click("text=+ New Task");
    await page.getByLabel("Title").fill(taskTitleUndo);
    await page.getByLabel("Status").selectOption("New");
    await page.click('button:has-text("Save")');

    await expect(page.locator(`text=${taskTitleUndo}`)).toBeVisible({
      timeout: 10000,
    });

    // Undo実行 (alert()が出るのでdialogハンドラで自動accept)
    // Undo後にwindow.location.reload()が呼ばれるのでフルリロードを待機
    await Promise.all([
      page.waitForNavigation({ waitUntil: "load", timeout: 30000 }),
      page.click('button:has-text("Undo")'),
    ]);
    await expect(page.locator("text=Loading")).not.toBeVisible({
      timeout: 10000,
    });

    // タスク消滅確認
    await expect(page.locator(`text=${taskTitleUndo}`)).not.toBeVisible({
      timeout: 10000,
    });

    // Redo実行 (alert()が出るのでdialogハンドラで自動accept)
    await Promise.all([
      page.waitForNavigation({ waitUntil: "load", timeout: 30000 }),
      page.click('button:has-text("Redo")'),
    ]);
    await expect(page.locator("text=Loading")).not.toBeVisible({
      timeout: 10000,
    });

    // タスク復活確認
    await expect(page.locator(`text=${taskTitleUndo}`)).toBeVisible({
      timeout: 10000,
    });
  });
});
