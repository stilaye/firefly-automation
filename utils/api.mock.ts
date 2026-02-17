import { type Page, type Route } from '@playwright/test';
import { Logger } from './logger';
import { type GenerationResponse } from '../api/api.types';

/**
 * API mocking utilities for deterministic testing.
 *
 * Design Decision: AI Output Testing — mock the generation API for
 * deterministic tests; separate smoke tests for non-deterministic
 * with broad assertions.
 *
 * These helpers intercept Firefly API requests and return controlled
 * responses, enabling fast and reliable tests without hitting real AI models.
 */

/** Default mock generation response for deterministic tests */
export const MOCK_GENERATION_RESPONSE: GenerationResponse = {
  id: 'mock-generation-001',
  status: 'completed',
  images: [
    {
      id: 'mock-image-001',
      url: 'https://firefly.adobe.com/mock/image-001.png',
      width: 1024,
      height: 768,
      contentType: 'image/png',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'mock-image-002',
      url: 'https://firefly.adobe.com/mock/image-002.png',
      width: 1024,
      height: 768,
      contentType: 'image/png',
      createdAt: new Date().toISOString(),
    },
  ],
  prompt: 'A mock prompt for testing',
  model: 'firefly-image-5',
};

/**
 * Mock the Firefly image generation API with a controlled response.
 *
 * @param page - Playwright page instance
 * @param response - Custom response to return (defaults to MOCK_GENERATION_RESPONSE)
 */
export async function mockGenerationAPI(
  page: Page,
  response: GenerationResponse = MOCK_GENERATION_RESPONSE,
): Promise<void> {
  Logger.info('Mocking generation API');
  await page.route('**/api/v2/generate/**', async (route: Route) => {
    Logger.info(`Intercepted generation request: ${route.request().url()}`);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response),
    });
  });
}

/**
 * Mock any API route with a custom response.
 *
 * @param page - Playwright page instance
 * @param urlPattern - URL pattern to intercept (glob or regex)
 * @param responseBody - Response body to return
 * @param options - Additional options (status, headers, contentType)
 */
export async function mockRoute(
  page: Page,
  urlPattern: string,
  responseBody: unknown,
  options: {
    status?: number;
    contentType?: string;
    headers?: Record<string, string>;
  } = {},
): Promise<void> {
  const { status = 200, contentType = 'application/json', headers = {} } = options;
  Logger.info(`Mocking route: ${urlPattern}`);
  await page.route(urlPattern, async (route: Route) => {
    await route.fulfill({
      status,
      contentType,
      headers,
      body: typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody),
    });
  });
}

/**
 * Mock the generation API to simulate a failure response.
 *
 * @param page - Playwright page instance
 * @param errorMessage - Error message to include in the response
 */
export async function mockGenerationFailure(
  page: Page,
  errorMessage = 'Generation failed due to content policy violation',
): Promise<void> {
  Logger.info('Mocking generation API failure');
  await page.route('**/api/v2/generate/**', async (route: Route) => {
    await route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({ error: errorMessage }),
    });
  });
}

/**
 * Remove all mocked routes from the page.
 *
 * @param page - Playwright page instance
 */
export async function clearMocks(page: Page): Promise<void> {
  Logger.info('Clearing all mocked routes');
  await page.unrouteAll({ behavior: 'ignoreErrors' });
}
