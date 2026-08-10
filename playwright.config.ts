import { defineConfig, devices } from "@playwright/test";

const externalBaseUrl = process.env.E2E_BASE_URL?.replace(/\/$/u, "");
const requestedLocalPort = process.env.E2E_LOCAL_PORT?.trim() || "3000";
const localPort = /^\d{2,5}$/u.test(requestedLocalPort) ? requestedLocalPort : "3000";
const baseURL = externalBaseUrl || `http://127.0.0.1:${localPort}`;
const chromiumExecutablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["line"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    locale: "ar-JO",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: chromiumExecutablePath ? "off" : "retain-on-failure",
    launchOptions: chromiumExecutablePath
      ? {
          executablePath: chromiumExecutablePath,
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-gpu",
            "--disable-software-rasterizer",
            "--disable-webgl",
          ],
        }
      : undefined,
  },
  webServer: externalBaseUrl
    ? undefined
    : {
        command: `npm run start -- --hostname 127.0.0.1 --port ${localPort}`,
        url: baseURL,
        reuseExistingServer: !process.env.CI && !process.env.E2E_LOCAL_PORT,
        timeout: 120_000,
      },
  projects: [
    {
      name: "desktop-chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 7"] },
    },
  ],
});
