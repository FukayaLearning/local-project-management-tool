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
    const uniqueTitle = `Task Extra ${Date.now()}`;
    const extraTask = {
      title: uniqueTitle,
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

    const taskRow = page.locator(`tr:has-text("${uniqueTitle}")`).first();
    await expect(taskRow).toBeVisible();
    await taskRow.getByRole("button", { name: "Edit" }).click();

    // Change a standard field inside the modal
    const modal = page.getByRole("dialog");
    await modal.getByLabel("Status").selectOption("Done");
    await modal.getByRole("button", { name: "Save" }).click();

    // Wait for modal to close
    await expect(modal).not.toBeVisible();

    // Debug: Print all td contents
    const cells = await taskRow.locator("td").allInnerTexts();
    console.log(`TaskRow cells [${uniqueTitle}]:`, cells);

    // Verify status changed in the row
    // If cells[4] is not status, the log will tell us what's there.
    expect(cells.some((c) => c.includes("Done"))).toBe(true);

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

    // Get any task row that has dates enabled
    const taskRow = page.locator("tr.task-item").first();
    await expect(taskRow).toBeVisible();

    // After apply, the task should have a date visible in the row
    // We check for the presence of a date string anywhere in the row's date cells
    const deadlineCell = taskRow.locator("td").nth(3);
    await expect(deadlineCell).not.toHaveText("-");
    await expect(deadlineCell).toContainText(/\d{4}-\d{2}-\d{2}/);
  });
});
