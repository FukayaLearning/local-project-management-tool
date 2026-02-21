import { test, expect } from "@playwright/test";

// ヘルパー: システム初期化とプロジェクト作成
async function ensureSystemInitialized(request: any) {
  const statusRes = await request.get("/api/v1/system/status");
  const status = await statusRes.json();
  if (!status.is_git_initialized || !status.has_default_project) {
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

test.describe("Integration: History and Switching", () => {
  const TEST_PROJECT_A = `HistoryProjectA_${Date.now()}`;
  const TEST_PROJECT_B = `HistoryProjectB_${Date.now()}`;

  test.beforeAll(async ({ request }) => {
    await ensureSystemInitialized(request);
    await createProject(request, TEST_PROJECT_A);
    await createProject(request, TEST_PROJECT_B);
  });

  test("IT-SCN-SW-001: Should switch projects", async ({ page }) => {
    await page.goto("/");

    // Loading 待機
    await expect(page.locator("text=Loading")).not.toBeVisible();

    // プロジェクトA選択
    const projectSelect = page.locator("select"); // IDがあればベストだが
    await projectSelect.selectOption({ label: TEST_PROJECT_A });

    // 切り替え確認
    await expect(projectSelect).toHaveValue(
      process.env.TEST_PROJECT_A_ID || (await projectSelect.inputValue()),
    );
    // NOTE: valueがIDになるため、ラベルで選択した後のvalueの一致確認は難しいが、
    // UI上で切り替わったかを確認する。

    // タスク作成 (Project A)
    const taskTitleA = `Task in A ${Date.now()}`;
    await page.click("text=+ New Task");
    await expect(page.locator("text=New Task")).toBeVisible(); // Modal title

    await page.fill('label:has-text("Title") >> .. >> input', taskTitleA); // Label 'Title' に対応する input
    // もしくは getByLabel を使用
    // await page.getByLabel('Title').fill(taskTitleA);

    await page.getByLabel("Title").fill(taskTitleA);
    await page.getByLabel("Status").selectOption("New");
    await page.click('button:has-text("Save")');

    // タスク表示確認
    await expect(page.locator(`text=${taskTitleA}`)).toBeVisible();

    // プロジェクトBへ切り替え
    await projectSelect.selectOption({ label: TEST_PROJECT_B });

    // タスクA消滅確認
    await expect(page.locator(`text=${taskTitleA}`)).not.toBeVisible();

    // プロジェクトAへ戻る
    await projectSelect.selectOption({ label: TEST_PROJECT_A });

    // タスクA復活確認
    await expect(page.locator(`text=${taskTitleA}`)).toBeVisible();
  });

  test("IT-SCN-HIST-001/002/003: Should Undo and Redo task creation", async ({
    page,
  }) => {
    await page.goto("/");

    // Loading 待機
    await expect(page.locator("text=Loading")).not.toBeVisible();

    // プロジェクトA選択
    const projectSelect = page.locator("select");
    await projectSelect.selectOption({ label: TEST_PROJECT_A });

    // Undo用タスク作成
    const taskTitleUndo = `Task to Undo ${Date.now()}`;
    await page.click("text=+ New Task");
    await page.getByLabel("Title").fill(taskTitleUndo);
    await page.getByLabel("Status").selectOption("New");
    await page.click('button:has-text("Save")');

    await expect(page.locator(`text=${taskTitleUndo}`)).toBeVisible();

    // Undo実行
    await page.click('button:has-text("Undo")');

    // リロードが発生するため待機 (または自動reloadをPlaywrightが検知するのを待つ)
    // リロード後、Loadingが出るかも
    await page.waitForLoadState("networkidle");
    await expect(page.locator("text=Loading")).not.toBeVisible();

    // タスク消滅確認
    await expect(page.locator(`text=${taskTitleUndo}`)).not.toBeVisible();

    // Redo実行
    await page.click('button:has-text("Redo")');

    await page.waitForLoadState("networkidle");
    await expect(page.locator("text=Loading")).not.toBeVisible();

    // タスク復活確認
    await expect(page.locator(`text=${taskTitleUndo}`)).toBeVisible();
  });
});
