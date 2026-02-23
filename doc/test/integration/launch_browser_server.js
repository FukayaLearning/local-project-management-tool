const { chromium } = require("@playwright/test");

(async () => {
  const browserServer = await chromium.launchServer({
    headless: false,
    slowMo: 500,
    args: ["--disable-gpu"], // Optional, for stability
  });
  console.log(browserServer.wsEndpoint());

  // Keep alive until killed
  await new Promise(() => {});
})();
