import { test, expect } from "@playwright/test";

test.describe("Integration: Advanced Scheduling", () => {
  const projectName = "SchedulingTest";

  test.beforeAll(async ({ request }) => {
    // Ensure project exists
    await request.post("/api/v1/projects/", {
      data: { project_name: projectName },
    });
  });

  test("IT-SCN-SCHED-001: Should schedule tasks sequentially for the same assignee", async ({
    page,
  }) => {
    await page.goto(`/projects/${projectName}/settings`);
    await expect(page.locator("text=Loading")).not.toBeVisible();

    // 1. Add Assignee "User A"
    await page.getByPlaceholder("New Assignee Name").fill("User A");
    await page.click('button:has-text("Add")');
    await page.click('button:has-text("Save Changes")');
    await expect(page.locator("ul >> text=User A").first()).toBeVisible();

    // 2. Go to Task List and create tasks
    await page.goto(`/projects/${projectName}`);
    await expect(page.locator("text=Loading")).not.toBeVisible();

    // Task 1: 8h
    await page.click("text=+ New Task");
    await page.getByLabel("Title").fill("Seq Task 1");
    await page.getByLabel("Planned Hours").fill("8");
    await page.getByLabel("Assignee").selectOption({ label: "User A" });
    await page.click('button:has-text("Save")');

    // Task 2: 16h
    await page.click("text=+ New Task");
    await page.getByLabel("Title").fill("Seq Task 2");
    await page.getByLabel("Planned Hours").fill("16");
    await page.getByLabel("Assignee").selectOption({ label: "User A" });
    await page.click('button:has-text("Save")');

    // 3. Verify dates
    const row1 = page.locator('tr:has-text("Seq Task 1")');
    const row2 = page.locator('tr:has-text("Seq Task 2")');

    // Column Indices: 1:Title, 2:Start, 3:End
    const end1 = await row1.locator("td").nth(3).innerText();
    const start2 = await row2.locator("td").nth(2).innerText();

    console.log(`Task 1 End: ${end1}, Task 2 Start: ${start2}`);
    expect(start2 > end1).toBe(true);
  });

  test("IT-SCN-SCHED-002: Should adjust duration based on assignee productivity", async ({
    page,
  }) => {
    await page.goto(`/projects/${projectName}/settings`);
    await expect(page.locator("text=Loading")).not.toBeVisible();

    // 1. Add High Productivity User
    await page.getByPlaceholder("New Assignee Name").fill("Pro User");
    await page.click('button:has-text("Add")');

    // Find the added user and set productivity to 2.0
    // The list item contains the name and an input for productivity
    const proUserRow = page.locator('li:has-text("Pro User")');
    await proUserRow.locator('input[type="number"]').fill("2.0");
    await page.click('button:has-text("Save Changes")');

    // 2. Add Normal User
    await page.getByPlaceholder("New Assignee Name").fill("Normal User");
    await page.click('button:has-text("Add")');
    await page.click('button:has-text("Save Changes")');

    // 3. Create Tasks
    await page.goto(`/projects/${projectName}`);
    await expect(page.locator("text=Loading")).not.toBeVisible();

    // Task for Normal User: 16h (Should take 2 days if work_hours=8)
    await page.click("text=+ New Task");
    await page.getByLabel("Title").fill("Normal Task");
    await page.getByLabel("Planned Hours").fill("16");
    await page.getByLabel("Assignee").selectOption({ label: "Normal User" });
    await page.click('button:has-text("Save")');

    // Task for Pro User: 16h (Should take 1 day because productivity=2.0)
    await page.click("text=+ New Task");
    await page.getByLabel("Title").fill("Pro Task");
    await page.getByLabel("Planned Hours").fill("16");
    await page.getByLabel("Assignee").selectOption({ label: "Pro User" });
    await page.click('button:has-text("Save")');

    // 4. Verify Durations
    const logRow = (title: string) => page.locator(`tr:has-text("${title}")`);

    const startN = await logRow("Normal Task").locator("td").nth(2).innerText();
    const endN = await logRow("Normal Task").locator("td").nth(3).innerText();
    const startP = await logRow("Pro Task").locator("td").nth(2).innerText();
    const endP = await logRow("Pro Task").locator("td").nth(3).innerText();

    console.log(`Normal Task: ${startN} to ${endN}`);
    console.log(`Pro Task: ${startP} to ${endP}`);

    // Helper to calculate diff (YYYY-MM-DD comparison is enough for equality here)
    expect(startN).toBe(startP); // Both start today
    expect(endN > endP).toBe(true); // Normal end should be after Pro end
  });

  test("IT-SCN-SCHED-003: Should support intra-day continuation and gap-filling", async ({
    page,
  }) => {
    await page.goto(`/projects/${projectName}/settings`);
    await expect(page.locator("text=Loading")).not.toBeVisible();

    // 1. Add Assignee "Complex User"
    await page.getByPlaceholder("New Assignee Name").fill("Complex User");
    await page.click('button:has-text("Add")');
    await page.click('button:has-text("Save Changes")');

    // 2. Intra-day test: Two small tasks on same day
    await page.goto(`/projects/${projectName}`);
    await page.click("text=+ New Task");
    await page.getByLabel("Title").fill("Small Task 1");
    await page.getByLabel("Planned Hours").fill("4");
    await page.getByLabel("Assignee").selectOption({ label: "Complex User" });
    await page.click('button:has-text("Save")');

    await page.click("text=+ New Task");
    await page.getByLabel("Title").fill("Small Task 2");
    await page.getByLabel("Planned Hours").fill("4");
    await page.getByLabel("Assignee").selectOption({ label: "Complex User" });
    await page.click('button:has-text("Save")');

    const rowS1 = page.locator('tr:has-text("Small Task 1")');
    const rowS2 = page.locator('tr:has-text("Small Task 2")');
    const dateS1 = await rowS1.locator("td").nth(3).innerText();
    const dateS2 = await rowS2.locator("td").nth(3).innerText();
    console.log(`Intra-day: Task 1 End ${dateS1}, Task 2 End ${dateS2}`);
    expect(dateS1).toBe(dateS2); // Both should end on same day (4h + 4h = 8h/day)

    // 3. Gap-filling test
    // Task 3: High priority but fixed start in 10 days
    // Task 4: Lower priority but no constraint -> Should fill gap today
    const in10Days = new Date();
    in10Days.setDate(in10Days.getDate() + 10);
    const in10DaysStr = in10Days.toISOString().split("T")[0];

    await page.click("text=+ New Task");
    await page.getByLabel("Title").fill("Future High Priority");
    await page.getByLabel("Planned Hours").fill("8");
    await page.getByLabel("Assignee").selectOption({ label: "Complex User" });
    await page.getByLabel("Scheduling Rule").selectOption("start_fixed");
    // Correct label is "Fixed Start Date"
    await page.getByLabel("Fixed Start Date").fill(in10DaysStr);
    await page.click('button:has-text("Save")');

    await page.click("text=+ New Task");
    await page.getByLabel("Title").fill("Gap Filler Lower Priority");
    await page.getByLabel("Planned Hours").fill("8");
    await page.getByLabel("Assignee").selectOption({ label: "Complex User" });
    await page.click('button:has-text("Save")');

    const rowFuture = page.locator('tr:has-text("Future High Priority")');
    const rowGap = page.locator('tr:has-text("Gap Filler Lower Priority")');
    const startFuture = await rowFuture.locator("td").nth(2).innerText();
    const startGap = await rowGap.locator("td").nth(2).innerText();

    console.log(`Gap-filling: Future ${startFuture}, GapFiller ${startGap}`);
    expect(startFuture > startGap).toBe(true); // Gap Filler should start earlier (today)
  });
});
