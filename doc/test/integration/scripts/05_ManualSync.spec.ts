import { test, expect } from "@playwright/test";
// @ts-ignore
import * as fs from "fs";
// @ts-ignore
import * as path from "path";

// 実行コンテナ内でのデータパス (docker-compose.e2e.yaml でマウント)
const DATA_DIR = "/app/backend/data";
const TASKS_CSV = path.join(DATA_DIR, "ManualSyncTest", "tasks.csv");

async function ensureSystemInitialized(request: any) {
  const res = await request.get("/api/v1/projects/");
  const projects = await res.json();
  if (!projects.includes("ManualSyncTest")) {
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
    await page.goto("/projects/ManualSyncTest");
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

  test("IT-SCN-SYNC-001-3/4: Should detect manual directory creation", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/projects/);

    // 1. data/ 配下に新しいディレクトリを作成する
    const newProjectName = `ManualProject_${Date.now()}`;
    const newProjectDir = path.join(DATA_DIR, newProjectName);
    console.log(`Manually creating new project directory: ${newProjectDir}`);
    fs.mkdirSync(newProjectDir, { recursive: true });

    // Wait for docker volume propagation between containers
    await page.waitForTimeout(2000);

    // 2. ページをリロードしてプロジェクト一覧へ遷移
    await page.reload();
    await expect(page.locator("text=Loading")).not.toBeVisible();

    // 3. プロジェクトがリストに表示されているか確認
    await page.waitForTimeout(1000);
    await expect(page.locator(`text=${newProjectName}`)).toBeVisible({
      timeout: 15000,
    });

    console.log(
      "Manual project directory creation detected and synced successfully.",
    );
  });
});
