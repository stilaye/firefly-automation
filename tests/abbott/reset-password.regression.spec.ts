import { test, expect } from '@fixtures/browser.fixture';
import { MerlinResetPasswordPage } from '@ui/pages/abbott/merlin-reset-password.page';
import { AbbottTestData } from '@data/abbott/abbott-test-data';
import { AbbottTags } from '@data/abbott/abbott-tags';

/**
 * Merlin.net Reset Password Page — Functional Regression Tests
 *
 * Validates page structure, form interactions, help menu,
 * footer links, and navigation on the Reset Password page.
 */
test.describe('Merlin.net Reset Password Page - Regression', () => {
  let resetPage: MerlinResetPasswordPage;

  test.beforeEach(async ({ page }) => {
    resetPage = new MerlinResetPasswordPage(page);
    await resetPage.navigateToResetPassword();
  });

  // --- Page Structure ---

  test(
    'should load reset password page and display all form elements',
    { tag: [AbbottTags.abbott, AbbottTags.merlinReset, AbbottTags.formValidation] },
    async () => {
      await expect(resetPage.userIdInput).toBeVisible();
      await expect(resetPage.emailInput).toBeVisible();
      await expect(resetPage.resetPasswordButton).toBeVisible();
      await expect(resetPage.cancelButton).toBeVisible();
    },
  );

  test(
    'should display the Reset Password heading',
    { tag: [AbbottTags.abbott, AbbottTags.merlinReset] },
    async () => {
      await expect(resetPage.pageHeading).toBeVisible();
    },
  );

  test(
    'should display help text instructions',
    { tag: [AbbottTags.abbott, AbbottTags.merlinReset] },
    async () => {
      await expect(resetPage.instructionText).toBeVisible();
    },
  );

  test(
    'should display forgotten User ID help text',
    { tag: [AbbottTags.abbott, AbbottTags.merlinReset] },
    async () => {
      await expect(resetPage.forgotUserIdText).toBeVisible();
    },
  );

  test(
    'should display the copyright notice',
    { tag: [AbbottTags.abbott, AbbottTags.merlinReset] },
    async () => {
      await expect(resetPage.footer.copyrightText.first()).toBeVisible();
    },
  );

  test(
    'should have a page title containing Merlin.net',
    { tag: [AbbottTags.abbott, AbbottTags.merlinReset] },
    async ({ page }) => {
      await expect(page).toHaveTitle(/Merlin\.net/);
    },
  );

  // --- Form Interaction ---

  test(
    'should accept text input in User ID field',
    { tag: [AbbottTags.abbott, AbbottTags.merlinReset, AbbottTags.formValidation] },
    async () => {
      await resetPage.enterUserId(AbbottTestData.testInputs.validUserId);
      await expect(resetPage.userIdInput).toHaveValue(AbbottTestData.testInputs.validUserId);
    },
  );

  test(
    'should accept text input in Email address field',
    { tag: [AbbottTags.abbott, AbbottTags.merlinReset, AbbottTags.formValidation] },
    async () => {
      await resetPage.enterEmail(AbbottTestData.testInputs.validEmail);
      await expect(resetPage.emailInput).toHaveValue(AbbottTestData.testInputs.validEmail);
    },
  );

  test(
    'should have functional Reset Password button',
    { tag: [AbbottTags.abbott, AbbottTags.merlinReset] },
    async () => {
      await expect(resetPage.resetPasswordButton).toBeEnabled();
    },
  );

  test(
    'should have functional Cancel button',
    { tag: [AbbottTags.abbott, AbbottTags.merlinReset] },
    async () => {
      await expect(resetPage.cancelButton).toBeEnabled();
    },
  );

  // --- Footer Links ---

  test(
    'should display all footer links',
    { tag: [AbbottTags.abbott, AbbottTags.merlinReset, AbbottTags.footerLinks] },
    async () => {
      await resetPage.footer.verifyAllLinksVisible();
    },
  );

  test(
    'should have correct href for Website Terms of Use',
    { tag: [AbbottTags.abbott, AbbottTags.merlinReset, AbbottTags.footerLinks] },
    async () => {
      const href = await resetPage.footer.termsOfUseLink.getAttribute('href');
      expect(href).toMatch(AbbottTestData.urlPatterns.termsOfUsePdf);
    },
  );

  test(
    'should have correct href for Privacy Policy',
    { tag: [AbbottTags.abbott, AbbottTags.merlinReset, AbbottTags.footerLinks] },
    async () => {
      const href = await resetPage.footer.privacyPolicyLink.getAttribute('href');
      expect(href).toMatch(AbbottTestData.urlPatterns.privacyPolicyPdf);
    },
  );

  test(
    'should have correct href for www.cardiovascular.abbott',
    { tag: [AbbottTags.abbott, AbbottTags.merlinReset, AbbottTags.footerLinks] },
    async () => {
      await expect(resetPage.footer.abbottLink).toHaveAttribute('href', /cardiovascular\.abbott/);
    },
  );

  // --- Navigation ---

  test(
    'should navigate back to login when clicking Cancel',
    { tag: [AbbottTags.abbott, AbbottTags.merlinReset] },
    async ({ page }) => {
      await resetPage.clickCancel();
      await expect(page).toHaveURL(AbbottTestData.urlPatterns.login);
    },
  );
});
