import { expect, type Locator, type Page } from '@playwright/test';
import { Logger } from '../../utils/logger';
import { PageLoadError, ElementNotFoundError, NavigationError } from '../../utils/errors';

/**
 * Base page object with shared navigation, waiting, and assertion methods.
 *
 * All page objects should extend this class to inherit common functionality
 * and consistent error handling with typed exceptions.
 */
export abstract class BasePage {
  /**
   *
   */
  constructor(protected readonly page: Page) {}

  /** Navigate to a URL path and wait for the page to reach the expected state */
  async goto(urlPath: string, waitForLocator?: Locator): Promise<void> {
    Logger.info(`Navigating to ${urlPath}`);
    try {
      await this.page.goto(urlPath, { waitUntil: 'domcontentloaded' });
      if (waitForLocator) {
        await expect(waitForLocator).toBeVisible({ timeout: 15000 });
      }
    } catch (error) {
      throw new PageLoadError(urlPath, 15000, error as Error);
    }
  }

  /** Wait for an element to be visible, throwing a typed error on timeout */
  async waitForElement(locator: Locator, description: string, timeout = 15000): Promise<void> {
    try {
      await expect(locator).toBeVisible({ timeout });
    } catch (error) {
      throw new ElementNotFoundError(description, timeout, error as Error);
    }
  }

  /** Assert the page URL matches an expected pattern */
  async assertUrl(pattern: RegExp): Promise<void> {
    try {
      await expect(this.page).toHaveURL(pattern);
    } catch (error) {
      throw new NavigationError(this.page.url(), pattern.source, error as Error);
    }
  }

  /** Scroll an element into view */
  async scrollToElement(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  /** Get the current page URL */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /** Get the page title */
  async getTitle(): Promise<string> {
    return this.page.title();
  }

  /** Take a full-page screenshot (for debugging) */
  async takeScreenshot(name: string): Promise<Buffer> {
    return this.page.screenshot({ fullPage: true, path: `test-results/${name}.png` });
  }
}
