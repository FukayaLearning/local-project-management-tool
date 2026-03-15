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

    // 空の場合は New Project ボタンが存在する
    await page.getByRole("button", { name: "+ New Project" }).click();

    // /projects/new への遷移
    await expect(page).toHaveURL(/.*\/projects\/new/);
    await expect(page.locator("text=新規プロジェクト作成")).toBeVisible();

    // 2. プロジェクト作成
    const projectName = "MyFirstProject";
    await page.locator("#project-name").fill(projectName);
    await page.getByRole("button", { name: "プロジェクト作成開始" }).click();

    // 作成後、該当プロジェクトのタスク一覧ページへ遷移
    await expect(page).toHaveURL(new RegExp(`/projects/${projectName}`), {
      timeout: 10000,
    });
    await expect(page.locator("text=Loading")).not.toBeVisible({
      timeout: 10000,
    });

    // メニューバー（ヘッダー等）にプロジェクト名が表示されているか確認
    const projectSelect = page.locator("select");
    await expect(projectSelect).toContainText(projectName);
  });
});
