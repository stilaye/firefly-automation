import { expect, type Locator, type Page } from '@playwright/test';
import { ElementNotFoundError } from '../../utils/errors';

/**
 * Base component object for reusable UI sections.
 *
 * Components represent self-contained UI sections (navigation bar, settings panel,
 * output gallery, etc.) that can be composed into page objects and reused across
 * multiple pages.
 *
 * Usage:
 *   class NavigationComponent extends BaseComponent {
 *     readonly generateTab: Locator;
 *     constructor(page: Page) {
 *       super(page);
 *       this.generateTab = page.locator('sp-tab[value="generate"]');
 *     }
 *   }
 */
export abstract class BaseComponent {
  /**
   *
   */
  constructor(protected readonly page: Page) {}

  /** Wait for a component element to be visible */
  async waitForElement(locator: Locator, description: string, timeout = 15000): Promise<void> {
    try {
      await expect(locator).toBeVisible({ timeout });
    } catch (error) {
      throw new ElementNotFoundError(description, timeout, error as Error);
    }
  }

  /** Click a locator with logging */
  async click(locator: Locator): Promise<void> {
    await locator.click();
  }

  /** Verify an element is visible using web-first assertion */
  async verifyVisible(locator: Locator, description: string, timeout = 15000): Promise<void> {
    try {
      await expect(locator).toBeVisible({ timeout });
    } catch (error) {
      throw new ElementNotFoundError(description, timeout, error as Error);
    }
  }
}
