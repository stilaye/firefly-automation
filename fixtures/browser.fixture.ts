import { mergeTests } from '@playwright/test';
import { authTest } from './auth.fixture';
import { dataTest } from './data.fixture';
import { featureFlagTest } from './feature.flag.fixture';
import { screenshotTest } from './screenshot.fixture';

/**
 * Composed test fixture that merges all custom fixtures.
 *
 * Tests should import `test` and `expect` from this file:
 *   import { test, expect } from '@fixtures/browser.fixture';
 *
 * Available fixtures:
 * - authenticatedPage: A page pre-authenticated with Adobe IMS
 * - authenticatedContext: The authenticated browser context
 * - testData: Test data context with automatic cleanup
 * - apiContext: API request context for data setup
 * - featureFlags: Feature flag management
 * - screenshotOnFailure: Auto-captures screenshot on test failure (auto-fixture)
 */
export const test = mergeTests(authTest, dataTest, featureFlagTest, screenshotTest);

export { expect } from '@playwright/test';

/** Re-export fixture types for use in custom extensions */
export type { AuthFixtures } from './auth.fixture';
export type { DataFixtures, TestData } from './data.fixture';
export type { FeatureFlagFixtures, FeatureFlags } from './feature.flag.fixture';
