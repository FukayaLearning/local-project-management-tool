import { test, expect } from "@playwright/test";

test.describe("Integration: Startup Initialization", () => {
  test("IT-SCN-INIT-000: Should have Git initialized on startup with 'main' branch", async ({
    request,
  }) => {
    const response = await request.get("/api/v1/system/status");
    expect(response.ok()).toBeTruthy();

    const status = await response.json();
    console.log("System Status:", status);

    // Gitが初期化されていること
    expect(status.is_git_initialized).toBe(true);
    // 初期状態ではデフォルトプロジェクトなし（branch: main）であること
    expect(status.has_default_project).toBe(false);
    expect(status.current_project).toBe("main");
  });
});
