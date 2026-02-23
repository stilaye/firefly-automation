import { expect, type Locator, type Page } from '@playwright/test';
import { Logger } from '../../utils/logger';

/**
 * Page Object Model for the Adobe Firefly login flow.
 *
 * Adobe Firefly uses Adobe IMS (Identity Management System) for authentication.
 * The login flow redirects to an Adobe sign-in page before returning to Firefly.
 *
 * Anti-pattern compliance (Elaichenkov's 17 Playwright Mistakes):
 *   #2:  Web-first assertions only (toBeVisible) — NOT isVisible()/textContent()
 *   #5:  No pre-waits before fill/click — they already auto-wait
 *   #11: { exact: true } on all getByRole / getByText locators
 *   #16: Action methods return void — test decides what comes next
 */
export class LoginPage {
  /** Adobe IMS email input field */
  readonly emailInput: Locator;

  /** Adobe IMS password input field */
  readonly passwordInput: Locator;

  /** Adobe IMS "Continue" button after entering email */
  readonly continueButton: Locator;

  /** Adobe IMS "Sign in" / submit button */
  readonly signInButton: Locator;

  /** Firefly header logo — visible when authenticated */
  readonly fireflyLogo: Locator;

  /** User avatar icon — visible when signed in */
  readonly userAvatar: Locator;

  /** "Welcome to Adobe Firefly" heading on the homepage */
  readonly welcomeHeading: Locator;

  constructor(private page: Page) {
    // Adobe IMS sign-in form locators
    // #11: { exact: true } on all role/label locators
    this.emailInput = page.getByLabel('Email address', { exact: true });
    this.passwordInput = page.getByLabel('Password', { exact: true });
    this.continueButton = page.getByRole('button', { name: 'Continue', exact: true });
    this.signInButton = page.getByRole('button', { name: 'Sign in', exact: true });

    // Firefly authenticated state locators
    this.fireflyLogo = page.getByRole('link', { name: 'Adobe Firefly', exact: true });
    this.userAvatar = page.getByTestId('user-avatar-account-icon');
    this.welcomeHeading = page.getByRole('heading', {
      name: 'Welcome to Adobe Firefly',
      exact: true,
    });
  }

  /** Navigate to the Firefly homepage (triggers login redirect if unauthenticated) */
  async navigateToLogin(): Promise<void> {
    Logger.info('Navigating to Adobe Firefly homepage');
    await this.page.goto('/');
  }

  /**
   * Perform a full sign-in through the Adobe IMS flow.
   *
   * Anti-pattern #5: fill/click already auto-wait — no pre-waits needed.
   * Anti-pattern #16: returns void — test decides what to assert next.
   */
  async signIn(email: string, password: string): Promise<void> {
    Logger.info(`Signing in with email: ${email}`);
    await this.emailInput.fill(email); // #5: fill auto-waits — no pre-click needed
    await this.continueButton.click();
    await this.passwordInput.fill(password);
    await this.signInButton.click();
    Logger.info('Sign-in form submitted, waiting for redirect');
  }

  /** Get the welcome message text from the Firefly homepage */
  async getWelcomeMessage(): Promise<string> {
    return (await this.welcomeHeading.textContent()) ?? '';
  }

  /**
   * Assert that the user is currently signed in.
   *
   * Anti-pattern #2: use web-first toBeVisible() — NOT isVisible() which does not retry.
   */
  async assertSignedIn(): Promise<void> {
    await expect(this.userAvatar).toBeVisible(); // #2: web-first — retries until timeout
  }

  /** Save the authenticated browser storage state to a file */
  async saveStorageState(path: string): Promise<void> {
    Logger.info(`Saving storage state to ${path}`);
    await this.page.context().storageState({ path });
  }
}
