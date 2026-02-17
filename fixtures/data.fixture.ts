import { test as base, type APIRequestContext } from '@playwright/test';
import { Logger } from '../utils/logger';
import { TestContext } from '../utils/test.context';

/**
 * Test data fixture for API-based setup and teardown.
 *
 * Design Decision: API fixtures for setup/teardown — never UI for setup.
 * All test data is created and cleaned up via API calls, ensuring fast
 * and reliable test isolation.
 */

export type TestData = {
  /** Unique ID for this test run (useful for naming resources) */
  testRunId: string;
  /** Tracks resources created during this test for cleanup */
  createdResources: string[];
};

export type DataFixtures = {
  /** Provides test data context with automatic cleanup */
  testData: TestData;
  /** Provides an API request context for data setup */
  apiContext: APIRequestContext;
};

export const dataTest = base.extend<DataFixtures>({
  apiContext: async ({ playwright }, use) => {
    const context = await playwright.request.newContext({
      baseURL: process.env.BASE_URL || 'https://firefly.adobe.com',
      extraHTTPHeaders: {
        Accept: 'application/json',
      },
    });
    await use(context);
    await context.dispose();
  },

  testData: async ({}, use) => {
    const testRunId = TestContext.generateId();
    const createdResources: string[] = [];

    Logger.info(`Test data setup — run ID: ${testRunId}`);

    // Provide the test data context to the test
    await use({ testRunId, createdResources });

    // Teardown: clean up any resources created during the test
    Logger.info(`Test data teardown — cleaning ${createdResources.length} resources`);
    for (const resourceId of createdResources) {
      try {
        Logger.info(`Cleaning up resource: ${resourceId}`);
        // Resource cleanup will be implemented per-resource type
        // e.g., delete created projects, images, etc.
      } catch (error) {
        Logger.warn(`Failed to clean up resource ${resourceId}: ${error}`);
      }
    }
  },
});
