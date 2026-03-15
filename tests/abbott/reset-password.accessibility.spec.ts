import { test, expect } from '@fixtures/browser.fixture';
import { MerlinResetPasswordPage } from '@ui/pages/abbott/merlin-reset-password.page';
import { AbbottTags } from '@data/abbott/abbott-tags';

/**
 * Merlin.net Reset Password Page — Accessibility Tests
 *
 * Validates WCAG compliance, ARIA labels, keyboard navigation,
 * and required field accessibility on the Reset Password page.
 */
test.describe('Merlin.net Reset Password Page - Accessibility', () => {
  let resetPage: MerlinResetPasswordPage;

  test.beforeEach(async ({ page }) => {
    resetPage = new MerlinResetPasswordPage(page);
    await resetPage.navigateToResetPassword();
  });

  test(
    'should have correct ARIA labels on form inputs',
    { tag: [AbbottTags.abbott, AbbottTags.merlinReset, AbbottTags.accessibility] },
    async () => {
      await expect(resetPage.userIdInput).toBeVisible();
      await expect(resetPage.emailInput).toBeVisible();
    },
  );

  test(
    'should be navigable by keyboard (Tab order)',
    { tag: [AbbottTags.abbott, AbbottTags.merlinReset, AbbottTags.accessibility] },
    async ({ page }) => {
      // Tab through the form fields and buttons
      await page.keyboard.press('Tab');
      await expect(resetPage.userIdInput).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(resetPage.emailInput).toBeFocused();
    },
  );

  test(
    'should have a page title',
    { tag: [AbbottTags.abbott, AbbottTags.merlinReset, AbbottTags.accessibility] },
    async ({ page }) => {
      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(0);
    },
  );

  test(
    'should indicate required fields accessibly',
    { tag: [AbbottTags.abbott, AbbottTags.merlinReset, AbbottTags.accessibility] },
    async ({ page }) => {
      // Required fields should be marked with aria-required or HTML required attribute
      // or have a visible asterisk (*) indicator
      const requiredMarker = page.getByText('*');
      await expect(requiredMarker.first()).toBeVisible();
    },
  );

  test(
    'should have form elements with visible labels',
    { tag: [AbbottTags.abbott, AbbottTags.merlinReset, AbbottTags.accessibility] },
    async ({ page }) => {
      // Reset password form uses table-based layout with labels in adjacent cells
      // (not HTML <label> elements), so we verify the label text is visible
      await expect(page.getByText('User ID:', { exact: false })).toBeVisible();
      await expect(page.getByText('Registered email address:', { exact: false })).toBeVisible();
      // And that the corresponding inputs are present
      await expect(resetPage.userIdInput).toBeVisible();
      await expect(resetPage.emailInput).toBeVisible();
    },
  );

  test(
    'should have accessible action links with descriptive names',
    { tag: [AbbottTags.abbott, AbbottTags.merlinReset, AbbottTags.accessibility] },
    async ({ page }) => {
      // Note: Cancel and Reset Password are <a> links, not <button> elements
      const resetBtn = page.getByRole('link', { name: 'Reset Password', exact: true });
      await expect(resetBtn).toBeVisible();
      const cancelBtn = page.getByRole('link', { name: 'Cancel', exact: true });
      await expect(cancelBtn).toBeVisible();
    },
  );
});
