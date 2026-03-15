import type { Locator, Page } from '@playwright/test';
import { BaseComponent } from '../base.component';
import { Logger } from '../../../utils/logger';

/**
 * Merlin.net footer component — shared across Login and Reset Password pages.
 *
 * Contains: Website Terms of Use (PDF), Privacy Policy (PDF),
 * Contact Us, www.cardiovascular.abbott, and copyright notice.
 */
export class MerlinFooterComponent extends BaseComponent {
  readonly termsOfUseLink: Locator;
  readonly privacyPolicyLink: Locator;
  readonly contactUsLink: Locator;
  readonly abbottLink: Locator;
  readonly copyrightText: Locator;

  constructor(page: Page) {
    super(page);
    this.termsOfUseLink = page.getByRole('link', { name: 'Website Terms of Use', exact: true });
    this.privacyPolicyLink = page.getByRole('link', { name: 'Privacy Policy', exact: true });
    this.contactUsLink = page.getByRole('link', { name: 'Contact Us', exact: true });
    this.abbottLink = page.getByRole('link', { name: 'www.cardiovascular.abbott', exact: true });
    this.copyrightText = page.getByText('Merlin.net', { exact: false });
  }

  async clickTermsOfUse(): Promise<void> {
    Logger.info('Clicking Website Terms of Use link');
    await this.click(this.termsOfUseLink);
  }

  async clickPrivacyPolicy(): Promise<void> {
    Logger.info('Clicking Privacy Policy link');
    await this.click(this.privacyPolicyLink);
  }

  async clickContactUs(): Promise<void> {
    Logger.info('Clicking Contact Us link');
    await this.click(this.contactUsLink);
  }

  async clickAbbottLink(): Promise<void> {
    Logger.info('Clicking www.cardiovascular.abbott link');
    await this.click(this.abbottLink);
  }

  /** Verify all footer links are visible */
  async verifyAllLinksVisible(): Promise<void> {
    await this.verifyVisible(this.termsOfUseLink, 'Website Terms of Use link');
    await this.verifyVisible(this.privacyPolicyLink, 'Privacy Policy link');
    await this.verifyVisible(this.contactUsLink, 'Contact Us link');
    await this.verifyVisible(this.abbottLink, 'www.cardiovascular.abbott link');
  }
}
