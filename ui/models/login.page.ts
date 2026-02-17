import { type Locator, type Page } from '@playwright/test';
import { Logger } from '../../utils/logger';

/**
 * Page Object Model for the Adobe Firefly login flow.
 *
 * Adobe Firefly uses Adobe IMS (Identity Management System) for authentication.
 * The login flow redirects to an Adobe sign-in page before returning to Firefly.
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
    this.emailInput = page.getByLabel('Email address');
    this.passwordInput = page.getByLabel('Password');
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.signInButton = page.getByRole('button', { name: 'Sign in' });

    // Firefly authenticated state locators
    this.fireflyLogo = page.getByRole('link', { name: 'Adobe Firefly' });
    this.userAvatar = page.locator('[data-testid="user-avatar-account-icon"]');
    this.welcomeHeading = page.getByRole('heading', {
      name: 'Welcome to Adobe Firefly',
    });
  }

  /** Navigate to the Firefly homepage (triggers login redirect if unauthenticated) */
  async navigateToLogin(): Promise<void> {
    Logger.info('Navigating to Adobe Firefly homepage');
    await this.page.goto('/');
  }

  /** Perform a full sign-in through the Adobe IMS flow */
  async signIn(email: string, password: string): Promise<void> {
    Logger.info(`Signing in with email: ${email}`);
    await this.emailInput.fill(email);
    await this.continueButton.click();
    await this.passwordInput.fill(password);
    await this.signInButton.click();
    Logger.info('Sign-in form submitted, waiting for redirect');
  }

  /** Get the welcome message text from the Firefly homepage */
  async getWelcomeMessage(): Promise<string> {
    return (await this.welcomeHeading.textContent()) ?? '';
  }

  /** Check if the user is currently signed in */
  async isSignedIn(): Promise<boolean> {
    return this.userAvatar.isVisible({ timeout: 5000 }).catch(() => false);
  }

  /** Save the authenticated browser storage state to a file */
  async saveStorageState(path: string): Promise<void> {
    Logger.info(`Saving storage state to ${path}`);
    await this.page.context().storageState({ path });
  }
}
