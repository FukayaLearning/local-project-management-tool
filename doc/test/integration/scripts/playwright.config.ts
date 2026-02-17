import { defineConfig, devices } from "@playwright/test";
import path from "path";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: ".",
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: 1, // Sequential execution for integration tests involving state
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ["list"],
    ["html", { outputFolder: "../result/report", open: "never" }],
    ["json", { outputFile: "../result/test-results.json" }],
  ],

  outputDir: "../result/test-results", // For traces, screenshots, videos

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.BASE_URL || "http://localhost:3000",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",

    screenshot: "on",
    video: "on",

    /* Demo mode settings (Host Browser) or Container Headless */
    // If PLAYWRIGHT_WS_ENDPOINT is set, we connect to it.
    // Otherwise we launch locally (which means inside container headlessly).
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Connect to host browser if WS endpoint is provided
        ...(process.env.PLAYWRIGHT_WS_ENDPOINT
          ? {
              connectOptions: {
                wsEndpoint: process.env.PLAYWRIGHT_WS_ENDPOINT,
              },
            }
          : {}),
      },
    },
  ],
});
