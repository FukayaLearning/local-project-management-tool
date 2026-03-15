import { test, expect } from "@playwright/test";
// @ts-ignore
import { execSync } from "child_process";
// @ts-ignore
import * as path from "path";

// ヘルパー: システム初期化とプロジェクト作成
async function ensureSystemInitialized(request: any) {
  const res = await request.get("/api/v1/projects/");
  const projects = await res.json();
  if (!projects.includes("DefaultProject")) {
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

test.describe("Integration: Auto Commit Log Format", () => {
  const TEST_PROJECT_LOG = `GitLogProject_${Date.now()}`;

  test.beforeAll(async ({ request }) => {
    await ensureSystemInitialized(request);
    await createProject(request, TEST_PROJECT_LOG);
  });

  test("IT-SCN-SYNC-001-3 (SPEC-HIST-001-002): Should format auto commit logs correctly", async ({
    page,
    request,
  }) => {
    // 1. Switch to test project
    await page.goto(`/projects/${TEST_PROJECT_LOG}`);
    await expect(page.locator("text=Loading")).not.toBeVisible({
      timeout: 10000,
    });

    // 2. Perform an action that creates a commit
    const taskTitle = `CommitLogTask ${Date.now()}`;
    await page.click("text=+ New Task");
    await page.getByLabel("Title").fill(taskTitle);
    await page.getByLabel("Status").selectOption("New");
    await page.click('button:has-text("Save")');
    await expect(page.locator(`text=${taskTitle}`)).toBeVisible({
      timeout: 10000,
    });

    // 3. Update the task to create another commit
    const row = page.locator(`tr:has-text("${taskTitle}")`);
    await row.getByRole("button", { name: "Edit" }).click();
    await expect(page.locator("text=Edit Task")).toBeVisible();
    await page.getByLabel("Title").fill(`${taskTitle} Updated`);
    await page.click('button:has-text("Save")');
    await expect(page.locator(`text=${taskTitle} Updated`)).toBeVisible({
      timeout: 10000,
    });

    // 4. Verify Git Log from the backend container using child_process
    // We assume backend is running locally alongside frontend for these tests
    // or mounted volume is accessible at `backend/data` relative to project root
    // @ts-ignore
    const projectRoot = process.env.CI
      ? "/app"
      : // @ts-ignore
        path.resolve(__dirname, "../../../..");
    const repoPath = path.join(
      projectRoot,
      "backend",
      "data",
      TEST_PROJECT_LOG,
    );

    // Check if the directory exists first, in some configurations the git repo is in 'data' directly
    let gitCwd = repoPath;
    try {
      execSync("git status", { cwd: repoPath, stdio: "ignore" });
    } catch {
      // Fallback to default data dir if project-specific dirs aren't created yet or we use one global repo
      gitCwd = path.join(projectRoot, "backend", "data");
    }

    const logOutput = execSync("git log -n 5 --oneline", {
      cwd: gitCwd,
    }).toString();

    // 5. Assert the expected commit messages exist
    expect(logOutput).toContain(`Add task ${taskTitle}`);
    expect(logOutput).toContain(`Update task ${taskTitle} Updated`);
  });
});
