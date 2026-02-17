import { test, expect } from '../fixtures/browser.fixture';
import { LoginPage } from '../ui/models/login.page';
import { Config } from '../utils/config';

test.describe('Login Flow', () => {
  test('should display the Firefly homepage when authenticated', async ({ authenticatedPage }) => {
    const loginPage = new LoginPage(authenticatedPage);
    await loginPage.navigateToLogin();

    // Verify the user is signed in and the homepage loads
    await expect(loginPage.welcomeHeading).toBeVisible();
    await expect(loginPage.fireflyLogo).toBeVisible();
    expect(await loginPage.isSignedIn()).toBe(true);
  });

  test('should show user avatar when signed in', async ({ authenticatedPage }) => {
    const loginPage = new LoginPage(authenticatedPage);
    await loginPage.navigateToLogin();

    await expect(loginPage.userAvatar).toBeVisible();
  });

  test('should redirect unauthenticated users to Adobe IMS login', async ({ page }) => {
    // Use a fresh (non-authenticated) page
    await page.goto(Config.BASE_URL);

    // Should redirect to Adobe IMS sign-in
    const loginPage = new LoginPage(page);
    await expect(loginPage.emailInput).toBeVisible({ timeout: 15000 });
  });
});
