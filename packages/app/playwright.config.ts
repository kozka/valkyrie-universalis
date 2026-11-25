// End-to-end tests of the app in a real browser (npm run test:app). On a new machine: npx playwright install chromium.
// PW_CHROMIUM_PATH points to another Chromium when the installed one does not match this Playwright.
import { defineConfig, devices } from '@playwright/test';

const port = 5199;
const previewPort = 5197;

/** The tests' browsers have seen the welcome (ui/Splash.tsx); splash.spec.ts starts without it. */
function storage(items: { name: string; value: string }[]) {
  const localStorage = [{ name: 'universalis.welcome', value: 'hidden' }, ...items];
  return { cookies: [], origins: [port, previewPort].map((p) => ({ origin: `http://localhost:${p}`, localStorage })) };
}

export default defineConfig({
  testDir: 'tests',
  // The *.test.ts files next to them are Vitest unit tests (npm test)
  testMatch: '*.spec.ts',
  outputDir: 'test-results',
  timeout: 60_000,
  fullyParallel: false,
  use: {
    baseURL: `http://localhost:${port}`,
    launchOptions: process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {},
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 }, storageState: storage([]) } },
    // Held upright, its games go on upright instead of asking to turn the phone (host/orientation.ts)
    { name: 'phone', use: { ...devices['Pixel 7'], storageState: storage([{ name: 'universalis.upright', value: 'yes' }]) } },
  ],
  webServer: [
    {
      command: `npm run dev -- --port ${port} --strictPort`,
      port,
      reuseExistingServer: false,
    },
    // The production build, the only one with a service worker (pwa.spec.ts)
    {
      command: `npm run build && npm run preview -- --port ${previewPort} --strictPort`,
      port: previewPort,
      reuseExistingServer: false,
      timeout: 180_000,
    },
  ],
});
