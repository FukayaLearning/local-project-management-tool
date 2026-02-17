export const demoDelay = async (ms: number = 1000) => {
  if (process.env.DEMO_MODE === "true") {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
};
