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

async function dragAndDrop(page: any, src: any, dst: any) {
  const srcBox = await src.boundingBox();
  const dstBox = await dst.boundingBox();
  if (!srcBox || !dstBox) return;

  await page.mouse.move(
    srcBox.x + srcBox.width / 2,
    srcBox.y + srcBox.height / 2,
  );
  await page.mouse.down();

  // Move > 5px to trigger dnd-kit PointerSensor
  await page.mouse.move(
    srcBox.x + srcBox.width / 2,
    srcBox.y + srcBox.height / 2 + 10,
  );
  await page.waitForTimeout(200);

  // Move to destination
  await page.mouse.move(
    dstBox.x + dstBox.width / 2,
    dstBox.y + dstBox.height / 2,
    { steps: 5 },
  );
  await page.waitForTimeout(200);

  await page.mouse.up();
}

test.describe("Integration: Task Reorder", () => {
  const testProjectName = `ReorderProject_${Date.now()}`;

  test.beforeEach(async ({ request }) => {
    const res = await request.get("/api/v1/projects/");
    const projects = await res.json();
    if (!projects.includes(testProjectName)) {
      await request.post("/api/v1/projects/", {
        data: { project_name: testProjectName },
      });
    }
  });

  test("IT-SCN-REORDER-001: Should drag and drop task rows in Task List", async ({
    page,
    request,
  }) => {
    const taskTitle1 = `T1 ${Date.now()}`;
    const taskTitle2 = `T2 ${Date.now()}`;

    // Create tasks via API since form usage is verified in other tests
    await request.post(`/api/v1/projects/${testProjectName}/tasks`, {
      data: { title: taskTitle1, status: "New" },
    });
    await request.post(`/api/v1/projects/${testProjectName}/tasks`, {
      data: { title: taskTitle2, status: "New" },
    });

    await page.goto(`/projects/${testProjectName}`);
    await expect(page.locator("text=Loading")).not.toBeVisible({
      timeout: 10000,
    });

    await expect(page.locator(`text=${taskTitle1}`)).toBeVisible();
    await expect(page.locator(`text=${taskTitle2}`)).toBeVisible();

    const row1 = page
      .locator(`tr:has-text("${taskTitle1}")`)
      .locator("td.cursor-grab");
    const row2 = page
      .locator(`tr:has-text("${taskTitle2}")`)
      .locator("td.cursor-grab");

    await row1.waitFor();
    await row2.waitFor();

    await dragAndDrop(page, row2, row1);

    await page.waitForTimeout(1000); // give time for the API put /tasks/reorder

    await page.reload();
    await expect(page.locator("text=Loading")).not.toBeVisible({
      timeout: 10000,
    });

    const rows = page.locator("tbody tr");
    const count = await rows.count();

    let idx1 = -1;
    let idx2 = -1;
    for (let i = 0; i < count; i++) {
      const text = await rows.nth(i).textContent();
      if (text?.includes(taskTitle1)) idx1 = i;
      if (text?.includes(taskTitle2)) idx2 = i;
    }

    expect(idx1).toBeGreaterThan(-1);
    expect(idx2).toBeGreaterThan(-1);
    expect(idx2).toBeLessThan(idx1);
  });

  test("IT-SCN-REORDER-002: Should drag and drop task rows in Gantt Chart", async ({
    page,
    request,
  }) => {
    const taskTitle1 = `GT1 ${Date.now()}`;
    const taskTitle2 = `GT2 ${Date.now()}`;

    const today = new Date();
    const startDate = today.toISOString().split("T")[0];
    const dueDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    // Create Tasks via API to set dates properly
    await request.post(`/api/v1/projects/${testProjectName}/tasks`, {
      data: {
        title: taskTitle1,
        status: "New",
        start_date: startDate,
        due_date: dueDate,
      },
    });
    await request.post(`/api/v1/projects/${testProjectName}/tasks`, {
      data: {
        title: taskTitle2,
        status: "New",
        start_date: startDate,
        due_date: dueDate,
      },
    });

    await page.goto(`/projects/${testProjectName}/gantt`);
    await expect(page.locator("text=Loading")).not.toBeVisible({
      timeout: 10000,
    });

    const label1 = page.locator(`div[title="${taskTitle1}"]`);
    const label2 = page.locator(`div[title="${taskTitle2}"]`);

    await expect(label1).toBeVisible();
    await expect(label2).toBeVisible();

    // Drag label2 onto label1
    await dragAndDrop(page, label2, label1);

    await page.waitForTimeout(1000);

    await page.reload();
    await expect(page.locator("text=Loading")).not.toBeVisible({
      timeout: 10000,
    });

    const labels = page.locator("div[title]");
    const count = await labels.count();

    let idx1 = -1;
    let idx2 = -1;
    for (let i = 0; i < count; i++) {
      const text = await labels.nth(i).textContent();
      if (text?.includes(taskTitle1)) idx1 = i;
      if (text?.includes(taskTitle2)) idx2 = i;
    }

    expect(idx1).toBeGreaterThan(-1);
    expect(idx2).toBeGreaterThan(-1);
    expect(idx2).toBeLessThan(idx1);
  });
});
