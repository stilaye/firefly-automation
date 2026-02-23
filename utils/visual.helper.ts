import { type Page, type PageScreenshotOptions, expect } from '@playwright/test';
import { Logger } from './logger';

/**
 * Visual regression testing utilities.
 *
 * Design Decision: Visual Regression — toHaveScreenshot() with pixel threshold.
 *
 * Wraps Playwright's built-in visual comparison with sensible defaults
 * for Adobe Firefly's dynamic content (AI-generated images, animations).
 */

/** Default visual comparison options for Firefly pages */
export const DEFAULT_VISUAL_OPTIONS = {
  /** Max allowed difference ratio (0.02 = 2% of pixels can differ) */
  maxDiffPixelRatio: 0.02,
  /** Threshold for individual pixel color difference (0-1 scale) */
  threshold: 0.2,
  /** Animation settling time before screenshot */
  animations: 'disabled' as const,
};

/**
 * Compare a full-page screenshot against a stored baseline.
 *
 * @param page - Playwright page instance
 * @param name - Unique name for the screenshot baseline (e.g., 'generate-page-empty')
 * @param options - Override default visual comparison options
 */
export async function compareScreenshot(
  page: Page,
  name: string,
  options: {
    maxDiffPixelRatio?: number;
    threshold?: number;
    mask?: PageScreenshotOptions['mask'];
    fullPage?: boolean;
  } = {},
): Promise<void> {
  Logger.info(`Visual comparison: ${name}`);
  const mergedOptions = { ...DEFAULT_VISUAL_OPTIONS, ...options };

  await expect(page).toHaveScreenshot(`${name}.png`, {
    maxDiffPixelRatio: mergedOptions.maxDiffPixelRatio,
    threshold: mergedOptions.threshold,
    animations: mergedOptions.animations,
    mask: options.mask,
    fullPage: options.fullPage ?? false,
  });
}

/**
 * Compare an element screenshot against a stored baseline.
 *
 * Useful for comparing specific UI components (e.g., the generated image grid)
 * without being affected by dynamic header/sidebar content.
 *
 * @param page - Playwright page instance
 * @param selector - CSS selector or data-testid of the element to screenshot
 * @param name - Unique name for the screenshot baseline
 * @param options - Override default visual comparison options
 */
export async function compareElementScreenshot(
  page: Page,
  selector: string,
  name: string,
  options: {
    maxDiffPixelRatio?: number;
    threshold?: number;
  } = {},
): Promise<void> {
  Logger.info(`Visual element comparison: ${name} (${selector})`);
  const element = page.locator(selector);
  const mergedOptions = { ...DEFAULT_VISUAL_OPTIONS, ...options };

  await expect(element).toHaveScreenshot(`${name}.png`, {
    maxDiffPixelRatio: mergedOptions.maxDiffPixelRatio,
    threshold: mergedOptions.threshold,
    animations: mergedOptions.animations,
  });
}

/**
 * Wait for the page to be fully loaded before taking a screenshot.
 *
 * Replaces hard `waitForTimeout()` waits with event-driven readiness checks,
 * ensuring tests only proceed once the page is genuinely stable.
 *
 * Uses `domcontentloaded` + `load` rather than `networkidle` to stay
 * aligned with Playwright best practices (networkidle is discouraged
 * due to its fragility with long-polling / WebSocket traffic).
 *
 * @param page - Playwright page instance
 */
export async function waitForPageReady(page: Page): Promise<void> {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('load');
}

/**
 * Mask dynamic areas of the page before visual comparison.
 *
 * Firefly pages contain dynamic elements (user avatar, credit counters,
 * AI-generated content) that should be masked during visual regression.
 *
 * @param page - Playwright page instance
 * @returns Array of locators to mask
 */
export function getDynamicMasks(page: Page) {
  return [
    page.locator('[data-testid="user-avatar-account-icon"]'),
    page.locator('[data-testid="credits-counter-remaining-credits"]'),
    page.locator('[data-testid="generation-cost-indicator-button"]'),
  ];
}
