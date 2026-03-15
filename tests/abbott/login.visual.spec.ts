import { test } from '@fixtures/browser.fixture';
import { MerlinLoginPage } from '@ui/pages/abbott/merlin-login.page';
import { compareScreenshot, waitForPageReady } from '@utils/visual.helper';
import { AbbottTags } from '@data/abbott/abbott-tags';

/**
 * Merlin.net Login Page — Visual Regression Tests
 *
 * Captures screenshots of the login page in various states
 * and compares against stored baselines. Uses a tighter threshold
 * (1%) since this is a static server-rendered page.
 */
test.describe('Merlin.net Login Page - Visual Regression', () => {
  let loginPage: MerlinLoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new MerlinLoginPage(page);
    await loginPage.navigateToLogin();
    await waitForPageReady(page);
  });

  test(
    'visual: login page default state',
    { tag: [AbbottTags.abbott, AbbottTags.merlinLogin, '@visual'] },
    async ({ page }) => {
      await compareScreenshot(page, 'merlin-login-default', {
        maxDiffPixelRatio: 0.01,
        fullPage: true,
      });
    },
  );

  test(
    'visual: login page with focused User ID field',
    { tag: [AbbottTags.abbott, AbbottTags.merlinLogin, '@visual'] },
    async ({ page }) => {
      await loginPage.userIdInput.click();
      await compareScreenshot(page, 'merlin-login-focused-userid', {
        maxDiffPixelRatio: 0.01,
      });
    },
  );

  test(
    'visual: login page with focused Password field',
    { tag: [AbbottTags.abbott, AbbottTags.merlinLogin, '@visual'] },
    async ({ page }) => {
      await loginPage.passwordInput.click();
      await compareScreenshot(page, 'merlin-login-focused-password', {
        maxDiffPixelRatio: 0.01,
      });
    },
  );

  test(
    'visual: login page footer section',
    { tag: [AbbottTags.abbott, AbbottTags.merlinLogin, '@visual'] },
    async ({ page }) => {
      await loginPage.scrollToElement(loginPage.footer.termsOfUseLink);
      await compareScreenshot(page, 'merlin-login-footer', {
        maxDiffPixelRatio: 0.01,
      });
    },
  );
});
