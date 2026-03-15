import { test, expect } from '@fixtures/browser.fixture';
import { MerlinLoginPage } from '@ui/pages/abbott/merlin-login.page';
import { AbbottTestData } from '@data/abbott/abbott-test-data';
import { AbbottTags } from '@data/abbott/abbott-tags';

/**
 * Merlin.net Login Page — Functional Regression Tests
 *
 * Validates page structure, form interactions, footer links,
 * and navigation on the Merlin.net login page.
 */
test.describe('Merlin.net Login Page - Regression', () => {
  let loginPage: MerlinLoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new MerlinLoginPage(page);
    await loginPage.navigateToLogin();
  });

  // --- Page Structure ---

  test(
    'should load login page and display all form elements',
    { tag: [AbbottTags.abbott, AbbottTags.merlinLogin, AbbottTags.formValidation] },
    async () => {
      await expect(loginPage.userIdInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
      await expect(loginPage.signInButton).toBeVisible();
    },
  );

  test(
    'should display the Forgot user ID or password link',
    { tag: [AbbottTags.abbott, AbbottTags.merlinLogin] },
    async () => {
      await expect(loginPage.forgotPasswordLink).toBeVisible();
      await expect(loginPage.forgotPasswordLink).toHaveText(
        AbbottTestData.ui.login.forgotPasswordLinkText,
      );
    },
  );

  test(
    'should display the copyright notice',
    { tag: [AbbottTags.abbott, AbbottTags.merlinLogin] },
    async () => {
      await expect(loginPage.footer.copyrightText.first()).toBeVisible();
    },
  );

  test(
    'should have a page title containing Merlin.net',
    { tag: [AbbottTags.abbott, AbbottTags.merlinLogin] },
    async ({ page }) => {
      await expect(page).toHaveTitle(/Merlin\.net/);
    },
  );

  // --- Form Interaction ---

  test(
    'should accept text input in User ID field',
    { tag: [AbbottTags.abbott, AbbottTags.merlinLogin, AbbottTags.formValidation] },
    async () => {
      await loginPage.enterUserId(AbbottTestData.testInputs.validUserId);
      await expect(loginPage.userIdInput).toHaveValue(AbbottTestData.testInputs.validUserId);
    },
  );

  test(
    'should accept text input in Password field',
    { tag: [AbbottTags.abbott, AbbottTags.merlinLogin, AbbottTags.formValidation] },
    async () => {
      await loginPage.enterPassword('TestPassword123');
      await expect(loginPage.passwordInput).toHaveValue('TestPassword123');
    },
  );

  test(
    'should mask password input',
    { tag: [AbbottTags.abbott, AbbottTags.merlinLogin, AbbottTags.security] },
    async () => {
      await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
    },
  );

  test(
    'should have Sign In button enabled',
    { tag: [AbbottTags.abbott, AbbottTags.merlinLogin] },
    async () => {
      await expect(loginPage.signInButton).toBeEnabled();
    },
  );

  // --- Footer Links ---

  test(
    'should display all footer links',
    { tag: [AbbottTags.abbott, AbbottTags.merlinLogin, AbbottTags.footerLinks] },
    async () => {
      await loginPage.footer.verifyAllLinksVisible();
    },
  );

  test(
    'should have correct href for Website Terms of Use',
    { tag: [AbbottTags.abbott, AbbottTags.merlinLogin, AbbottTags.footerLinks] },
    async () => {
      const href = await loginPage.footer.termsOfUseLink.getAttribute('href');
      expect(href).toMatch(AbbottTestData.urlPatterns.termsOfUsePdf);
    },
  );

  test(
    'should have correct href for Privacy Policy',
    { tag: [AbbottTags.abbott, AbbottTags.merlinLogin, AbbottTags.footerLinks] },
    async () => {
      const href = await loginPage.footer.privacyPolicyLink.getAttribute('href');
      expect(href).toMatch(AbbottTestData.urlPatterns.privacyPolicyPdf);
    },
  );

  test(
    'should have correct href for www.cardiovascular.abbott',
    { tag: [AbbottTags.abbott, AbbottTags.merlinLogin, AbbottTags.footerLinks] },
    async () => {
      await expect(loginPage.footer.abbottLink).toHaveAttribute('href', /cardiovascular\.abbott/);
    },
  );

  test(
    'should display Contact Us link',
    { tag: [AbbottTags.abbott, AbbottTags.merlinLogin, AbbottTags.footerLinks] },
    async () => {
      await expect(loginPage.footer.contactUsLink).toBeVisible();
    },
  );

  // --- Navigation ---

  test(
    'should navigate to reset password page when clicking forgot password link',
    { tag: [AbbottTags.abbott, AbbottTags.merlinLogin] },
    async ({ page }) => {
      await loginPage.clickForgotPassword();
      await expect(page).toHaveURL(AbbottTestData.urlPatterns.resetPassword);
    },
  );
});
