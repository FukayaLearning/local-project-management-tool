import { test, expect } from "@playwright/test";
// @ts-ignore
import * as fs from "fs";
// @ts-ignore
import * as path from "path";

// 実行コンテナ内でのデータパス (docker-compose.e2e.yaml でマウント)
const DATA_DIR = "/app/backend/data";
const TASKS_CSV = path.join(DATA_DIR, "tasks.csv");
const SETTINGS_JSON = path.join(DATA_DIR, "settings.json");

async function ensureSystemInitialized(request: any) {
  const statusRes = await request.get("/api/v1/system/status");
  const status = await statusRes.json();
  if (!status.is_git_initialized || !status.has_default_project) {
    await request.post("/api/v1/projects/", {
      data: { project_name: "ManualSyncTest" },
    });
  }
}

test.describe("Integration: Manual Synchronization", () => {
  test.beforeEach(async ({ request }) => {
    await ensureSystemInitialized(request);
  });

  test("IT-SCN-SYNC-001-1/2: Should detect manual changes in tasks.csv", async ({
    page,
    request,
  }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/tasks/);
    await expect(page.locator("text=Loading")).not.toBeVisible();

    // 1. 現在のタスク数を取得
    const initialTasks = await page.locator(".task-item").count();
    console.log(`Initial tasks: ${initialTasks}`);

    // 2. tasks.csv を直接編集 (新しいタスクを1行追加)
    // ヘッダーが未作成（タスクが空）の場合はヘッダーも書き込む
    const header =
      "id,title,status,assignee_id,start_date,due_date,parent_id,description,task_type,planned_hours,actual_hours,progress,display_order\n";
    const newTaskId = `manual-${Date.now()}`;
    const newTaskTitle = `Manual Task ${Date.now()}`;
    const csvLine = `${newTaskId},${newTaskTitle},New,,,,,,,,,0,0\n`;

    console.log(`Manually adding task to ${TASKS_CSV}`);
    if (!fs.existsSync(TASKS_CSV)) {
      fs.writeFileSync(TASKS_CSV, header + csvLine);
    } else {
      fs.appendFileSync(TASKS_CSV, csvLine);
    }

    // Wait for docker volume propagation between containers
    await page.waitForTimeout(2000);

    // 3. ページをリロード (これにより API GET /tasks が呼ばれ、バックエンドが検知・コミットする)
    await page.reload();
    await expect(page.locator("text=Loading")).not.toBeVisible();

    // 4. 追加したタスクが表示されているか確認
    // Reload again just in case the backend sync is delayed
    await page.reload();
    await expect(page.locator("text=Loading")).not.toBeVisible();

    await expect(page.locator(`text=${newTaskTitle}`)).toBeVisible({
      timeout: 15000,
    });
    const finalTasks = await page.locator(".task-item").count();
    expect(finalTasks).toBe(initialTasks + 1);

    console.log("Manual task detected and synced successfully.");
  });

  test("IT-SCN-SYNC-001-3/4: Should detect manual change in settings.json (Project Name)", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/tasks/);

    // 1. settings.json を読み込み、プロジェクト名を書き換える
    const settingsRaw = fs.readFileSync(SETTINGS_JSON, "utf-8");
    const settings = JSON.parse(settingsRaw);
    const oldName = settings.project.project_name;
    const newName = `Renamed Project ${Date.now()}`;

    settings.project.project_name = newName;
    console.log(`Manually renaming project from ${oldName} to ${newName}`);
    fs.writeFileSync(SETTINGS_JSON, JSON.stringify(settings, null, 2));

    // Wait for docker volume propagation between containers
    await page.waitForTimeout(2000);

    // 2. ページをリロード (これにより API GET /system/status や /projects/settings が呼ばれる)
    // バックエンドの SystemUseCase.sync_manual_changes が走るはずだが、
    // 現在の実装では lifespan または明示的な呼び出しが必要。
    // 今回の実装では UseCase の読み込み時にもフックが入っている。
    await page.reload();
    await expect(page.locator("text=Loading")).not.toBeVisible();

    // 3. ヘッダーなどのプロジェクト名表示が変わっているか確認
    // ヘッダーのプロジェクト名が表示されている要素を探す (select か h2/span 等)
    // プロジェクト選択 select の値や表示を確認. Let system load.
    await page.waitForTimeout(1000);
    const projectSelect = page.locator("select");
    const expectedBranchName = newName.replace(/ /g, "_");
    await expect(projectSelect).toContainText(expectedBranchName, {
      timeout: 15000,
    });

    console.log("Manual project rename detected and synced successfully.");
  });
});
