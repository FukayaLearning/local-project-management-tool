import { test, expect } from "@playwright/test";

test.describe("Integration: Startup Initialization", () => {
  test("IT-SCN-INIT-000: Should have no projects on startup", async ({
    request,
  }) => {
    const response = await request.get("/api/v1/projects/");
    expect(response.ok()).toBeTruthy();

    const projects = await response.json();
    console.log("Initial Projects:", projects);

    // 初期化状態ではプロジェクトがないこと
    expect(projects).toEqual([]);
  });
});
