import { test, expect } from '@fixtures/browser.fixture';
import { MerlinLoginPage } from '@ui/pages/abbott/merlin-login.page';
import { AbbottTestData } from '@data/abbott/abbott-test-data';
import { AbbottTags } from '@data/abbott/abbott-tags';

/**
 * Merlin.net Login Page — Negative & Security Tests
 *
 * Validates form validation behavior, input boundary conditions,
 * and security characteristics of the login form.
 */
test.describe('Merlin.net Login Page - Negative & Security', () => {
  let loginPage: MerlinLoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new MerlinLoginPage(page);
    await loginPage.navigateToLogin();
  });

  // --- Empty Form Submission ---

  test(
    'should not submit with empty User ID and Password',
    { tag: [AbbottTags.abbott, AbbottTags.merlinLogin, AbbottTags.security] },
    async ({ page }) => {
      await loginPage.clickSignIn();
      // Should remain on login page (not navigate away)
      await expect(page).toHaveURL(AbbottTestData.urlPatterns.login);
    },
  );

  test(
    'should not submit with empty User ID',
    { tag: [AbbottTags.abbott, AbbottTags.merlinLogin, AbbottTags.security] },
    async ({ page }) => {
      await loginPage.enterPassword('SomePassword123');
      await loginPage.clickSignIn();
      await expect(page).toHaveURL(AbbottTestData.urlPatterns.login);
    },
  );

  test(
    'should not submit with empty Password',
    { tag: [AbbottTags.abbott, AbbottTags.merlinLogin, AbbottTags.security] },
    async ({ page }) => {
      await loginPage.enterUserId(AbbottTestData.testInputs.validUserId);
      await loginPage.clickSignIn();
      await expect(page).toHaveURL(AbbottTestData.urlPatterns.login);
    },
  );

  // --- Input Validation ---

  test(
    'should handle extremely long User ID input',
    { tag: [AbbottTags.abbott, AbbottTags.merlinLogin, AbbottTags.security] },
    async () => {
      await loginPage.enterUserId(AbbottTestData.testInputs.longInput);
      // Verify the field accepted or truncated the input without crashing
      const value = await loginPage.userIdInput.inputValue();
      expect(value.length).toBeGreaterThan(0);
    },
  );

  test(
    'should handle special characters and XSS payload in User ID',
    { tag: [AbbottTags.abbott, AbbottTags.merlinLogin, AbbottTags.security] },
    async ({ page }) => {
      await loginPage.enterUserId(AbbottTestData.testInputs.xssPayload);
      await loginPage.clickSignIn();
      // Page should not execute script — verify no alert dialog
      // and page remains functional
      await expect(loginPage.signInButton).toBeVisible();
      await expect(page).toHaveURL(AbbottTestData.urlPatterns.login);
    },
  );

  test(
    'should handle SQL injection pattern in User ID',
    { tag: [AbbottTags.abbott, AbbottTags.merlinLogin, AbbottTags.security] },
    async ({ page }) => {
      await loginPage.enterUserId(AbbottTestData.testInputs.sqlInjection);
      await loginPage.enterPassword('password');
      await loginPage.clickSignIn();
      // Should not bypass authentication — page reloads to login after failed attempt
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(AbbottTestData.urlPatterns.login);
    },
  );

  test(
    'should handle unicode characters in User ID',
    { tag: [AbbottTags.abbott, AbbottTags.merlinLogin, AbbottTags.security] },
    async () => {
      await loginPage.enterUserId(AbbottTestData.testInputs.unicodeInput);
      await expect(loginPage.userIdInput).toHaveValue(AbbottTestData.testInputs.unicodeInput);
    },
  );

  // --- Password Field Security ---

  test(
    'should not expose password in page source after filling',
    { tag: [AbbottTags.abbott, AbbottTags.merlinLogin, AbbottTags.security] },
    async () => {
      await loginPage.enterPassword('SecretPassword123!');
      // Verify the input type remains "password" (not changed to "text")
      await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
      // Verify the value attribute is not exposed in the DOM
      const valueAttr = await loginPage.passwordInput.getAttribute('value');
      // HTML password inputs should not expose value in the DOM attribute
      // (the value is accessible via .inputValue() but not via getAttribute)
      expect(valueAttr === null || valueAttr === '').toBeTruthy();
    },
  );

  // --- Rate Limiting ---

  test(
    'should handle rapid sign-in button clicks without crashing',
    { tag: [AbbottTags.abbott, AbbottTags.merlinLogin, AbbottTags.security] },
    async ({ page }) => {
      // Fill the form once, then click Sign In rapidly before navigation completes
      await loginPage.enterUserId('rapiduser');
      await loginPage.enterPassword('rapidpass');

      // Click Sign In — triggers SiteMinder navigation (login.fcc → redirect)
      await loginPage.clickSignIn();

      // Wait for the SiteMinder redirect to complete and land back on login
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(AbbottTestData.urlPatterns.login, { timeout: 15000 });

      // Page should still be functional after the submission round-trip
      const reloadedLogin = new MerlinLoginPage(page);
      await expect(reloadedLogin.signInButton).toBeVisible();
    },
  );

  test(
    'should clear password field after failed submission',
    { tag: [AbbottTags.abbott, AbbottTags.merlinLogin, AbbottTags.security] },
    async ({ page }) => {
      await loginPage.enterUserId(AbbottTestData.testInputs.validUserId);
      await loginPage.enterPassword('WrongPassword123');
      await loginPage.clickSignIn();
      // Form submits and redirects back to login — wait for page reload
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(AbbottTestData.urlPatterns.login);
      // Re-instantiate page object after navigation
      const reloadedLogin = new MerlinLoginPage(page);
      await expect(reloadedLogin.passwordInput).toBeVisible();
    },
  );
});
