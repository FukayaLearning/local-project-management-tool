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

    // 空の場合はどちらかのボタンが存在する
    // /projects 画面上で入力と作成ボタンを操作する
    const projectName = "MyFirstProject";
    await page.getByPlaceholder("New project name...").fill(projectName);
    await page.getByRole("button", { name: "Create Project" }).click();

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
