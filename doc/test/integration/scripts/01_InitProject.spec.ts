import { test, expect } from "@playwright/test";

test.describe("Integration: Project Initialization", () => {
  // 環境がクリーンな状態で始まることを前提とする (runner scriptでvolume削除)

  test("IT-SCN-INIT-001/002: Should redirect to create project and allow creation", async ({
    page,
    request,
  }) => {
    // 1. 初回アクセス -> リダイレクト確認
    await page.goto("/");

    // データがない場合、/create_project にリダイレクトされるはず
    await expect(page).toHaveURL(/\/create_project/, { timeout: 10000 });
    await expect(page.locator("text=新規プロジェクト作成")).toBeVisible();

    // 2. プロジェクト作成
    const projectName = "MyFirstProject";
    await page.getByLabel("プロジェクト名").fill(projectName);
    await page.getByRole("button", { name: "プロジェクト作成開始" }).click();

    // 作成後、/tasks へ遷移
    await expect(page).toHaveURL(/\/tasks/, { timeout: 10000 });
    await expect(page.locator("text=Loading")).not.toBeVisible({
      timeout: 10000,
    });

    // ヘッダー等にプロジェクト名が表示されているか確認
    const projectSelect = page.locator("select");
    await expect(projectSelect).toContainText(projectName);
  });
});
