import { test } from '@fixtures/browser.fixture';
import { MerlinResetPasswordPage } from '@ui/pages/abbott/merlin-reset-password.page';
import { compareScreenshot, waitForPageReady } from '@utils/visual.helper';
import { AbbottTags } from '@data/abbott/abbott-tags';
import { AbbottTestData } from '@data/abbott/abbott-test-data';

/**
 * Merlin.net Reset Password Page — Visual Regression Tests
 *
 * Captures screenshots of the reset password page in various states
 * and compares against stored baselines.
 */
test.describe('Merlin.net Reset Password Page - Visual Regression', () => {
  let resetPage: MerlinResetPasswordPage;

  test.beforeEach(async ({ page }) => {
    resetPage = new MerlinResetPasswordPage(page);
    await resetPage.navigateToResetPassword();
    await waitForPageReady(page);
  });

  test(
    'visual: reset password page default state',
    { tag: [AbbottTags.abbott, AbbottTags.merlinReset, '@visual'] },
    async ({ page }) => {
      await compareScreenshot(page, 'merlin-reset-default', {
        maxDiffPixelRatio: 0.01,
        fullPage: true,
      });
    },
  );

  test(
    'visual: reset password page with filled form',
    { tag: [AbbottTags.abbott, AbbottTags.merlinReset, '@visual'] },
    async ({ page }) => {
      await resetPage.enterUserId(AbbottTestData.testInputs.validUserId);
      await resetPage.enterEmail(AbbottTestData.testInputs.validEmail);
      await compareScreenshot(page, 'merlin-reset-filled-form', {
        maxDiffPixelRatio: 0.01,
      });
    },
  );

  // Help menu is not visible on the reset password page (hidden via CSS)
  // Skipping help menu visual test — element not interactable

  test(
    'visual: reset password page footer section',
    { tag: [AbbottTags.abbott, AbbottTags.merlinReset, '@visual'] },
    async ({ page }) => {
      await resetPage.scrollToElement(resetPage.footer.termsOfUseLink);
      await compareScreenshot(page, 'merlin-reset-footer', {
        maxDiffPixelRatio: 0.01,
      });
    },
  );
});
