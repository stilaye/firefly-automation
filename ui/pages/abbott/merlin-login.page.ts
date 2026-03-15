import type { Locator, Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { MerlinFooterComponent } from '../../components/abbott/merlin-footer.component';
import { Logger } from '../../../utils/logger';
import { AbbottTestData } from '../../../data/abbott/abbott-test-data';

/**
 * Merlin.net Login page object.
 *
 * Composes MerlinFooterComponent for the shared footer section.
 * This is a pre-login page — no authentication required.
 */
export class MerlinLoginPage extends BasePage {
  readonly footer: MerlinFooterComponent;
  readonly userIdInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly welcomeHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.footer = new MerlinFooterComponent(page);
    this.userIdInput = page.locator('#user');
    this.passwordInput = page.locator('#password');
    this.signInButton = page.getByRole('button', {
      name: AbbottTestData.ui.login.signInButtonText,
      exact: true,
    });
    this.forgotPasswordLink = page.getByRole('link', {
      name: AbbottTestData.ui.login.forgotPasswordLinkText,
      exact: true,
    });
    this.welcomeHeading = page.getByText(AbbottTestData.ui.login.welcomeHeading, { exact: false });
  }

  /** Navigate to the login page and wait for the Sign In button */
  async navigateToLogin(): Promise<void> {
    await this.goto(AbbottTestData.urls.login, this.signInButton);
  }

  /** Enter text in the User ID field */
  async enterUserId(userId: string): Promise<void> {
    Logger.info(`Entering User ID: ${userId}`);
    await this.userIdInput.fill(userId);
  }

  /** Enter text in the Password field */
  async enterPassword(password: string): Promise<void> {
    Logger.info('Entering Password');
    await this.passwordInput.fill(password);
  }

  /** Click the Sign In button */
  async clickSignIn(): Promise<void> {
    Logger.info('Clicking Sign In button');
    await this.signInButton.click();
  }

  /** Click the Forgot password link */
  async clickForgotPassword(): Promise<void> {
    Logger.info('Clicking Forgot user ID or password link');
    await this.forgotPasswordLink.click();
  }

  /** Assert the current URL matches the login page pattern */
  async assertOnLoginPage(): Promise<void> {
    await this.assertUrl(AbbottTestData.urlPatterns.login);
  }
}
