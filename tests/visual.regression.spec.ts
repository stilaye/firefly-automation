import { test } from '@fixtures/browser.fixture';
import { compareScreenshot, waitForPageReady } from '@utils/visual.helper';
import type { VisualPageConfig } from '@ui/ui.types';
import visualConfig from './visual-config/visual.config.json';

/**
 * Data-driven visual regression suite for Adobe Firefly.
 *
 * Design Decision: Hybrid Visual Regression — JSON config + Playwright best practices.
 *
 * Combines the scalability of a data-driven URL registry (add pages via JSON,
 * zero TypeScript changes) with the reliability of proper Playwright patterns:
 * - authenticatedPage fixture for session reuse (no login flakiness)
 * - waitForPageReady() — event-driven waits, never waitForTimeout()
 * - Per-page maskSelectors for dynamic content (avatars, credit counters)
 * - animations: 'disabled' + 2% pixel threshold via DEFAULT_VISUAL_OPTIONS
 *
 * To add a new page: edit tests/visual-config/visual.config.json only.
 * To skip a page temporarily: set "active": false in the config.
 * To run full suite: set "SMOKE_ONLY": false in the config.
 */

const { SMOKE_ONLY, MAX_DIFF_PIXEL_RATIO, pages } = visualConfig;

/** Resolve the active page list based on the SMOKE_ONLY flag */
const activePages: VisualPageConfig[] = (
  SMOKE_ONLY ? pages.smoke : [...pages.detailed, ...pages.smoke]
).filter((p) => p.active);

test.describe('Visual Regression', () => {
  for (const pageConfig of activePages) {
    test(`visual: ${pageConfig.name}`, async ({ authenticatedPage }) => {
      await authenticatedPage.goto(pageConfig.path);
      await waitForPageReady(authenticatedPage);

      const masks = (pageConfig.maskSelectors ?? []).map((selector) =>
        authenticatedPage.locator(selector),
      );

      await compareScreenshot(authenticatedPage, pageConfig.name, {
        mask: masks,
        maxDiffPixelRatio: MAX_DIFF_PIXEL_RATIO,
      });
    });
  }
});
