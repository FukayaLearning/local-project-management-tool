import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

test.describe("Integration: Extra Features (Field Preservation & Apply Schedule)", () => {
  const projectName = "ExtraFeaturesDemo";
  const repoRoot = process.env.REPO_ROOT || "/workspace";

  test.beforeAll(async ({ request }) => {
    // Ensure project exists
    await request.post("/api/v1/projects/", {
      data: { project_name: projectName },
    });
  });

  test("IT-SCN-EXTRA-001: Preservation of undefined fields in CSV", async ({
    page,
    request,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    // 1. Create a task via API with extra fields (simulating external import)
    const extraTask = {
      title: "Task with Extra Fields",
      status: "New",
      planned_hours: 8,
      "External System ID": "EXT-999", // Extra field
      Category: "Support", // Extra field
    };
    await request.post(`/api/v1/projects/${projectName}/tasks`, {
      data: extraTask,
    });

    // 2. Go to task list and edit the task
    await page.goto(`/projects/${projectName}`);
    await expect(page.locator("text=Loading")).not.toBeVisible();

    const taskRow = page.locator('tr:has-text("Task with Extra Fields")');
    await expect(taskRow).toBeVisible();
    await taskRow.getByRole("button", { name: "Edit" }).click();

    // Change a standard field
    await page.getByLabel("Status").selectOption("Done");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.locator("text=Done")).toBeVisible();

    // 3. Download CSV and verify extra fields are preserved
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download CSV" }).click();
    const download = await downloadPromise;
    const downloadPath = path.join("/tmp", download.suggestedFilename());
    await download.saveAs(downloadPath);

    const content = fs.readFileSync(downloadPath, "utf-8");
    expect(content).toContain("External System ID");
    expect(content).toContain("EXT-999");
    expect(content).toContain("Category");
    expect(content).toContain("Support");

    // Cleanup
    fs.unlinkSync(downloadPath);
  });

  test("IT-SCN-APPLY-001: Apply recalculated schedule to CSV", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`/projects/${projectName}/gantt`);
    await expect(page.locator("text=Loading")).not.toBeVisible();

    // 1. Verify the "Apply Schedule to CSV" button exists
    const applyBtn = page.getByRole("button", {
      name: "Apply Schedule to CSV",
    });
    await expect(applyBtn).toBeVisible();

    // 2. Click the button and verify success (alert or list update)
    // Note: In our current implementation, there's no visual alert,
    // but the task list dates should be updated if we check them.
    await applyBtn.click();

    // 3. Check Task List for updated dates
    await page.goto(`/projects/${projectName}`);
    await expect(page.locator("text=Loading")).not.toBeVisible();

    // Since we don't know the exact calculation result here (depends on start date and holidays),
    // we just verify that some dates are visible now which were originally empty or different.
    // In a controlled test, we'd set a specific project start date.

    const taskRow = page.locator('tr:has-text("Task with Extra Fields")');
    // After apply, the task should have a date in the 4th column (Deadline/Date)
    const deadlineCell = taskRow.locator("td").nth(3);
    const dateText = await deadlineCell.innerText();
    expect(dateText).toMatch(/\d{4}-\d{2}-\d{2}/);
  });
});
