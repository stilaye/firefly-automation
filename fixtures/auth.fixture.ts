import { test as base, type Page, type BrowserContext } from '@playwright/test';
import { Config } from '../utils/config';
import { Logger } from '../utils/logger';
import { LoginPage } from '../ui/models/login.page';
import * as fs from 'fs';
import * as path from 'path';

const AUTH_FILE = path.resolve(__dirname, '../auth.json');

/**
 * Auth fixture that provides an authenticated page.
 *
 * On first run, it performs a full Adobe IMS login and saves the
 * storage state to `auth.json`. On subsequent runs it reuses the
 * saved state, avoiding the slow UI login flow.
 *
 * Design Decision: API fixtures for setup/teardown — never UI for setup.
 * The auth fixture is the one exception where UI login is performed once,
 * then the storage state is reused for all tests.
 */

/** Check if the saved auth state exists and is not expired */
function isAuthStateValid(): boolean {
  if (!fs.existsSync(AUTH_FILE)) return false;
  const stats = fs.statSync(AUTH_FILE);
  const ageMs = Date.now() - stats.mtimeMs;
  const maxAgeMs = 60 * 60 * 1000; // 1 hour
  return ageMs < maxAgeMs;
}

export type AuthFixtures = {
  /** A page that is already authenticated with Adobe IMS */
  authenticatedPage: Page;
  /** The authenticated browser context */
  authenticatedContext: BrowserContext;
};

export const authTest = base.extend<AuthFixtures>({
  authenticatedContext: async ({ browser }, use) => {
    let context;
    if (isAuthStateValid()) {
      Logger.info('Reusing existing auth storage state');
      context = await browser.newContext({ storageState: AUTH_FILE });
    } else {
      Logger.info('No valid auth state found — performing fresh login');
      context = await browser.newContext();
      const page = await context.newPage();
      const loginPage = new LoginPage(page);

      await loginPage.navigateToLogin();
      await loginPage.signIn(Config.USERNAME, Config.PASSWORD);

      // Wait for redirect back to Firefly
      await page.waitForURL('**/firefly.adobe.com/**', { timeout: 30000 });
      await loginPage.saveStorageState(AUTH_FILE);
      Logger.info('Auth storage state saved successfully');
      await page.close();
    }

    await use(context);
    await context.close();
  },

  authenticatedPage: async ({ authenticatedContext }, use) => {
    const page = await authenticatedContext.newPage();
    await use(page);
    await page.close();
  },
});
