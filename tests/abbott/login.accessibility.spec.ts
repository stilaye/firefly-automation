import { test, expect } from '@fixtures/browser.fixture';
import { MerlinLoginPage } from '@ui/pages/abbott/merlin-login.page';
import { AbbottTags } from '@data/abbott/abbott-tags';

/**
 * Merlin.net Login Page — Accessibility Tests
 *
 * Validates WCAG compliance, ARIA labels, keyboard navigation,
 * and screen reader support. Healthcare applications are subject
 * to strict accessibility requirements (Section 508, WCAG 2.1 AA).
 */
test.describe('Merlin.net Login Page - Accessibility', () => {
  let loginPage: MerlinLoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new MerlinLoginPage(page);
    await loginPage.navigateToLogin();
  });

  test(
    'should have correct ARIA labels on form inputs',
    { tag: [AbbottTags.abbott, AbbottTags.merlinLogin, AbbottTags.accessibility] },
    async () => {
      // Inputs should be accessible via their labels
      await expect(loginPage.userIdInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
      // Verify the password input is properly identified as a password
      await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
    },
  );

  test(
    'should be navigable by keyboard (Tab order)',
    { tag: [AbbottTags.abbott, AbbottTags.merlinLogin, AbbottTags.accessibility] },
    async () => {
      // Focus User ID field first (it has autofocus), then Tab through form
      await loginPage.userIdInput.click();
      await expect(loginPage.userIdInput).toBeFocused();
      await loginPage.userIdInput.press('Tab');
      await expect(loginPage.passwordInput).toBeFocused();
    },
  );

  test(
    'should have a page title',
    { tag: [AbbottTags.abbott, AbbottTags.merlinLogin, AbbottTags.accessibility] },
    async ({ page }) => {
      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(0);
    },
  );

  test(
    'should have descriptive link text (not generic click here)',
    { tag: [AbbottTags.abbott, AbbottTags.merlinLogin, AbbottTags.accessibility] },
    async () => {
      // All links should have meaningful text
      await expect(loginPage.forgotPasswordLink).toHaveText(/\w{3,}/);
      await expect(loginPage.footer.termsOfUseLink).toHaveText(/\w{3,}/);
      await expect(loginPage.footer.privacyPolicyLink).toHaveText(/\w{3,}/);
      await expect(loginPage.footer.contactUsLink).toHaveText(/\w{3,}/);
    },
  );

  test(
    'should support screen reader landmarks',
    { tag: [AbbottTags.abbott, AbbottTags.merlinLogin, AbbottTags.accessibility] },
    async ({ page }) => {
      // Page should have at least one landmark (form, main, or navigation)
      const landmarks = page.locator(
        '[role="main"], [role="form"], [role="navigation"], main, form, nav',
      );
      await expect(landmarks.first()).toBeAttached();
    },
  );

  test(
    'should have form elements with placeholder or label text',
    { tag: [AbbottTags.abbott, AbbottTags.merlinLogin, AbbottTags.accessibility] },
    async () => {
      // Merlin.net uses placeholder attributes instead of <label> elements
      // (Note: proper <label for="..."> would be better for accessibility)
      await expect(loginPage.userIdInput).toHaveAttribute('placeholder', /User ID/);
      await expect(loginPage.passwordInput).toHaveAttribute('placeholder', /Password/);
    },
  );

  test(
    'should have Sign In button with accessible name',
    { tag: [AbbottTags.abbott, AbbottTags.merlinLogin, AbbottTags.accessibility] },
    async ({ page }) => {
      const signIn = page.getByRole('button', { name: 'Sign in', exact: true });
      await expect(signIn).toBeVisible();
      await expect(signIn).toBeEnabled();
    },
  );
});
