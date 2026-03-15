import { test as base, type Page, type TestInfo } from '@playwright/test';

/**
 * Auto-fixture that captures a full-page screenshot on test failure
 * and attaches it to the test report (HTML + Allure).
 *
 * This runs automatically for every test — no explicit import needed
 * in test files (it's composed into the main `test` export).
 */

type ScreenshotFixtures = {
  screenshotOnFailure: void;
};

export const screenshotTest = base.extend<ScreenshotFixtures>({
  screenshotOnFailure: [
    async ({ page }: { page: Page }, use: (r: void) => Promise<void>, testInfo: TestInfo) => {
      await use(undefined);

      // After the test body runs, check if it failed
      if (testInfo.status !== testInfo.expectedStatus) {
        const screenshotPath = testInfo.outputPath('failure-screenshot.png');
        const screenshot = await page.screenshot({
          fullPage: true,
          path: screenshotPath,
        });

        await testInfo.attach('failure-screenshot', {
          body: screenshot,
          contentType: 'image/png',
        });
      }
    },
    { auto: true },
  ],
});
