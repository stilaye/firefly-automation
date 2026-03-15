import type { Locator, Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { MerlinFooterComponent } from '../../components/abbott/merlin-footer.component';
import { MerlinHelpMenuComponent } from '../../components/abbott/merlin-help-menu.component';
import { Logger } from '../../../utils/logger';
import { AbbottTestData } from '../../../data/abbott/abbott-test-data';

/**
 * Merlin.net Reset Password page object.
 *
 * Composes MerlinFooterComponent (shared footer) and
 * MerlinHelpMenuComponent (help dropdown).
 * This is a pre-login page — no authentication required.
 */
export class MerlinResetPasswordPage extends BasePage {
  readonly footer: MerlinFooterComponent;
  readonly helpMenu: MerlinHelpMenuComponent;
  readonly userIdInput: Locator;
  readonly emailInput: Locator;
  readonly resetPasswordButton: Locator;
  readonly cancelButton: Locator;
  readonly instructionText: Locator;
  readonly forgotUserIdText: Locator;
  readonly pageHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.footer = new MerlinFooterComponent(page);
    this.helpMenu = new MerlinHelpMenuComponent(page);
    this.userIdInput = page.locator('#resetPasswordForm_userId');
    this.emailInput = page.locator('#resetPasswordForm_email');
    this.resetPasswordButton = page.getByRole('link', {
      name: AbbottTestData.ui.resetPassword.resetButtonText,
      exact: true,
    });
    this.cancelButton = page.getByRole('link', {
      name: AbbottTestData.ui.resetPassword.cancelButtonText,
      exact: true,
    });
    this.instructionText = page.getByText(AbbottTestData.ui.resetPassword.instructionText, {
      exact: false,
    });
    this.forgotUserIdText = page.getByText(AbbottTestData.ui.resetPassword.forgotUserIdText, {
      exact: false,
    });
    this.pageHeading = page.locator('div.ssn_page_title');
  }

  /** Navigate to the reset password page and wait for the Reset Password button */
  async navigateToResetPassword(): Promise<void> {
    await this.goto(AbbottTestData.urls.resetPassword, this.resetPasswordButton);
  }

  /** Enter text in the User ID field */
  async enterUserId(userId: string): Promise<void> {
    Logger.info(`Entering User ID: ${userId}`);
    await this.userIdInput.fill(userId);
  }

  /** Enter text in the Email field */
  async enterEmail(email: string): Promise<void> {
    Logger.info(`Entering Email: ${email}`);
    await this.emailInput.fill(email);
  }

  /** Click the Reset Password button */
  async clickResetPassword(): Promise<void> {
    Logger.info('Clicking Reset Password button');
    await this.resetPasswordButton.click();
  }

  /** Click the Cancel button */
  async clickCancel(): Promise<void> {
    Logger.info('Clicking Cancel button');
    await this.cancelButton.click();
  }

  /** Assert the current URL matches the reset password page pattern */
  async assertOnResetPage(): Promise<void> {
    await this.assertUrl(AbbottTestData.urlPatterns.resetPassword);
  }
}
