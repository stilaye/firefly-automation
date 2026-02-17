import { type Page } from '@playwright/test';
import { Logger } from './logger';

/**
 * Performance metrics utilities for tracking Firefly page performance.
 *
 * Uses the browser's Performance API to capture timing metrics.
 * Useful for monitoring page load times, generation latency, and
 * identifying performance regressions.
 */

/** Page load performance metrics */
export interface PageLoadMetrics {
  /** DNS lookup time (ms) */
  dnsLookup: number;
  /** TCP connection time (ms) */
  tcpConnection: number;
  /** Time to first byte (ms) */
  ttfb: number;
  /** DOM content loaded time (ms) */
  domContentLoaded: number;
  /** Full page load time (ms) */
  pageLoad: number;
  /** Largest contentful paint (ms) */
  lcp: number | null;
  /** First contentful paint (ms) */
  fcp: number | null;
}

/** Generation timing metrics */
export interface GenerationMetrics {
  /** Time from clicking Generate to first image visible (ms) */
  generationTime: number;
  /** Timestamp when generation started */
  startedAt: number;
  /** Timestamp when generation completed */
  completedAt: number;
}

/**
 * Measure page load performance metrics.
 *
 * @param page - Playwright page instance (must be loaded)
 * @returns Page load timing metrics
 */
export async function measurePageLoad(page: Page): Promise<PageLoadMetrics> {
  Logger.info('Measuring page load performance');

  const metrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    // Get paint entries
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find((e) => e.name === 'first-contentful-paint');

    // Get LCP via PerformanceObserver (if available)
    let lcpValue: number | null = null;
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
    if (lcpEntries.length > 0) {
      lcpValue = lcpEntries[lcpEntries.length - 1].startTime;
    }

    return {
      dnsLookup: nav.domainLookupEnd - nav.domainLookupStart,
      tcpConnection: nav.connectEnd - nav.connectStart,
      ttfb: nav.responseStart - nav.requestStart,
      domContentLoaded: nav.domContentLoadedEventEnd - nav.startTime,
      pageLoad: nav.loadEventEnd - nav.startTime,
      lcp: lcpValue,
      fcp: fcp ? fcp.startTime : null,
    };
  });

  Logger.info(
    `Page load: ${metrics.pageLoad.toFixed(0)}ms | ` +
      `TTFB: ${metrics.ttfb.toFixed(0)}ms | ` +
      `FCP: ${metrics.fcp?.toFixed(0) ?? 'N/A'}ms | ` +
      `LCP: ${metrics.lcp?.toFixed(0) ?? 'N/A'}ms`,
  );

  return metrics;
}

/**
 * Measure image generation time.
 *
 * Starts a timer, clicks Generate, and waits for results to appear.
 * Returns the elapsed time as generation metrics.
 *
 * @param page - Playwright page instance (on the generate page with prompt filled)
 * @returns Generation timing metrics
 */
export async function measureGenerationTime(page: Page): Promise<GenerationMetrics> {
  Logger.info('Measuring generation time');

  const startedAt = Date.now();

  // Click Generate
  await page.locator('[data-testid="generate-image-generate-button"]').click();

  // Wait for results to appear (empty state disappears)
  await page
    .locator('[data-testid="empty-state-container"]')
    .waitFor({ state: 'hidden', timeout: 120000 })
    .catch(() => {
      // Empty state may not exist if already generated before
    });

  // Wait for at least one image to appear
  await page
    .locator('img[src*="firefly"], [data-testid="generated-image"]')
    .first()
    .waitFor({ state: 'visible', timeout: 120000 });

  const completedAt = Date.now();
  const generationTime = completedAt - startedAt;

  Logger.info(`Generation completed in ${generationTime}ms`);

  return { generationTime, startedAt, completedAt };
}

/**
 * Log performance metrics to the console in a formatted table.
 *
 * @param label - Label for the metrics group
 * @param metrics - Key-value pairs of metric names and values
 */
export function logMetrics(label: string, metrics: Record<string, number | string | null>): void {
  Logger.info(`--- Performance: ${label} ---`);
  for (const [key, value] of Object.entries(metrics)) {
    const formatted = typeof value === 'number' ? `${value.toFixed(0)}ms` : String(value ?? 'N/A');
    Logger.info(`  ${key}: ${formatted}`);
  }
  Logger.info('---');
}
