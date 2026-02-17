import { test as base } from '@playwright/test';
import { Logger } from '../utils/logger';

/**
 * Feature flag fixture for toggling experimental Firefly features.
 *
 * Adobe Firefly uses feature flags to gate experimental capabilities.
 * This fixture provides a clean way to enable/disable flags per test.
 *
 * Feature flags can be set via:
 * - URL query parameters (e.g., ?ff_experimental=true)
 * - Local storage overrides
 * - Cookie-based toggles
 */

export type FeatureFlags = {
  /** Map of feature flag names to their enabled/disabled state */
  flags: Record<string, boolean>;
  /** Enable a specific feature flag */
  enable: (flagName: string) => void;
  /** Disable a specific feature flag */
  disable: (flagName: string) => void;
};

export type FeatureFlagFixtures = {
  /** Provides feature flag management for the current test */
  featureFlags: FeatureFlags;
};

export const featureFlagTest = base.extend<FeatureFlagFixtures>({
  featureFlags: async ({ page }, use) => {
    const flags: Record<string, boolean> = {};

    /**
     * Enable a specific feature flag for the current test.
     * @param flagName - The name of the feature flag to enable.
     */
    const enable = (flagName: string) => {
      Logger.info(`Enabling feature flag: ${flagName}`);
      flags[flagName] = true;
    };

    /**
     * Disable a specific feature flag for the current test.
     * @param flagName - The name of the feature flag to disable.
     */
    const disable = (flagName: string) => {
      Logger.info(`Disabling feature flag: ${flagName}`);
      flags[flagName] = false;
    };

    // Apply feature flags before each navigation via local storage
    await page.addInitScript((flagMap: Record<string, boolean>) => {
      for (const [key, value] of Object.entries(flagMap)) {
        localStorage.setItem(`ff_${key}`, String(value));
      }
    }, flags);

    await use({ flags, enable, disable });

    // Teardown: clear all feature flag overrides
    Logger.info('Clearing feature flag overrides');
    await page.evaluate((flagMap: Record<string, boolean>) => {
      for (const key of Object.keys(flagMap)) {
        localStorage.removeItem(`ff_${key}`);
      }
    }, flags);
  },
});
