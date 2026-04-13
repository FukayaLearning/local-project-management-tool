import { test, expect } from "@playwright/test";

test.describe("Integration: Project Initialization", () => {
  // 環境がクリーンな状態で始まることを前提とする (runner scriptでvolume削除)

  test("IT-SCN-INIT-001/002: Should redirect to create project and allow creation", async ({
    page,
    request,
  }) => {
    // 1. 初回アクセス -> リダイレクト確認
    await page.goto("/");

    // データがない場合でも、/projects にリダイレクトされる
    await expect(page).toHaveURL(/.*\/projects/);

    // データがない場合でも、/projects にリダイレクトされる
    await expect(page).toHaveURL(/.*\/projects/);

    // ユニークなプロジェクト名を作成
    const projectName = `Proj_${Date.now()}`;
    console.log(`Creating project: ${projectName}`);
    await page.getByPlaceholder("New project name...").fill(projectName);
    await page.getByRole("button", { name: "Create Project" }).click();

    // 作成後、該当プロジェクトのタスク一覧ページへ遷移
    console.log("Waiting for redirection...");
    await expect(page).toHaveURL(
      new RegExp(`/projects/${encodeURIComponent(projectName)}`),
      {
        timeout: 30000,
      },
    );

    console.log("URL matched. Waiting for select element...");
    // 最初にLoadingが表示される場合があるため、それが消えるのを待つ
    await expect(page.locator("text=Loading projects...")).not.toBeVisible({
      timeout: 15000,
    });
    // TaskListPage自体のローディングも待つ
    await expect(page.locator("text=Loading tasks...")).not.toBeVisible({
      timeout: 10000,
    });

    await page.waitForLoadState("networkidle");
    const projectSelect = page.locator("#project-selector");
    await projectSelect.waitFor({ state: "visible", timeout: 20000 });

    // select内のoptionに新プロジェクト名が含まれることを確認
    await expect(projectSelect.locator("option")).toContainText([projectName], {
      timeout: 10000,
    });
    // 値が正しく設定されていることを確認
    await expect(projectSelect).toHaveValue(projectName);
  });
});
