import type { Locator, Page } from '@playwright/test';
import { BaseComponent } from '../base.component';
import { Logger } from '../../../utils/logger';

/**
 * Merlin.net help menu dropdown — appears on the Reset Password page.
 *
 * Contains: Help, Learn More, Practice Site, About options.
 */
export class MerlinHelpMenuComponent extends BaseComponent {
  readonly helpButton: Locator;
  readonly helpOption: Locator;
  readonly learnMoreOption: Locator;
  readonly practiceSiteOption: Locator;
  readonly aboutOption: Locator;

  constructor(page: Page) {
    super(page);
    // Help trigger is a link styled as a dropdown button ("Help▼")
    this.helpButton = page.getByRole('link', { name: /Help▼/ });
    // Dropdown items are links inside a nested list
    this.helpOption = page.locator('li li').getByRole('link', { name: 'Help', exact: true });
    this.learnMoreOption = page.getByRole('link', { name: 'Learn More', exact: true });
    this.practiceSiteOption = page.getByRole('link', { name: 'Practice Site', exact: true });
    this.aboutOption = page.getByRole('link', { name: 'About', exact: true });
  }

  /** Open the help dropdown menu */
  async openMenu(): Promise<void> {
    Logger.info('Opening Help menu dropdown');
    await this.click(this.helpButton);
  }

  /** Verify all menu items are visible (menu must be open first) */
  async verifyMenuItems(): Promise<void> {
    await this.verifyVisible(this.helpOption, 'Help menu item');
    await this.verifyVisible(this.learnMoreOption, 'Learn More menu item');
    await this.verifyVisible(this.practiceSiteOption, 'Practice Site menu item');
    await this.verifyVisible(this.aboutOption, 'About menu item');
  }
}
