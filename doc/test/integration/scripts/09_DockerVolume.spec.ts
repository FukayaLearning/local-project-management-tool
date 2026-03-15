import { test, expect } from "@playwright/test";
// @ts-ignore
import { execSync } from "child_process";
// @ts-ignore
import * as path from "path";

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

test.describe("Integration: Docker Volume Persistence", () => {
  const TEST_PROJECT_VOL = `VolumeProject_${Date.now()}`;

  test.beforeAll(async ({ request }) => {
    // We assume backend is running before the tests start
    await ensureSystemInitialized(request);
    await createProject(request, TEST_PROJECT_VOL);
  });

  test("IT-SCN-ENV-004 (SPEC-ENV-004-001): Data should persist across backend container restarts", async ({
    page,
  }) => {
    // 1. Switch to test project
    await page.goto("/");
    await expect(page).toHaveURL(/\/tasks/, { timeout: 10000 });
    const projectSelect = page.locator("select");
    await Promise.all([
      page.waitForNavigation({ waitUntil: "load", timeout: 30000 }),
      projectSelect.selectOption({ label: TEST_PROJECT_VOL }),
    ]);

    // 2. Create a task
    const taskTitle = `PersistTask ${Date.now()}`;
    await page.click("text=+ New Task");
    await page.getByLabel("Title").fill(taskTitle);
    await page.getByLabel("Status").selectOption("New");
    await page.click('button:has-text("Save")');
    await expect(page.locator(`text=${taskTitle}`)).toBeVisible({
      timeout: 10000,
    });

    // 3. Restart the backend container
    console.log("Restarting backend container...");
    try {
      const containerId = execSync(
        "docker ps -q -f label=com.docker.compose.service=backend",
      )
        .toString()
        .trim()
        .split("\\n")[0];
      if (containerId) {
        execSync(`docker restart ${containerId}`);
      } else {
        throw new Error("Backend container not found");
      }
    } catch (e) {
      console.warn(
        "Could not restart backend via docker. Assuming it's running bare-metal or different compose structure.",
      );
      // We gracefully skip the restart step if docker is not available
      test.skip();
    }

    // 4. Wait for backend to be ready again
    // We poll the health/status endpoint until it replies 200
    await expect
      .poll(
        async () => {
          try {
            const res = await page.request.get("/api/v1/system/status");
            return res.ok();
          } catch {
            return false;
          }
        },
        {
          intervals: [1000, 2000, 5000],
          timeout: 30000,
        },
      )
      .toBeTruthy();

    // 5. Reload page and check if task is still there
    await page.reload();
    await expect(page.locator("text=Loading")).not.toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator(`text=${taskTitle}`)).toBeVisible({
      timeout: 10000,
    });
  });
});
