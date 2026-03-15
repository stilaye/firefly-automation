/**
 * Typed error hierarchy for precise failure diagnostics.
 *
 * These custom errors replace generic Playwright TimeoutErrors with
 * contextual information that makes debugging faster.
 */

/** Thrown when a page fails to load or reach the expected state */
export class PageLoadError extends Error {
  public readonly originalError?: Error;
  constructor(
    public readonly url: string,
    public readonly timeout: number,
    cause?: Error,
  ) {
    super(`Page failed to load: "${url}" (waited ${timeout}ms)`);
    this.name = 'PageLoadError';
    this.originalError = cause;
  }
}

/** Thrown when a locator times out or an element is not found */
export class ElementNotFoundError extends Error {
  public readonly originalError?: Error;
  constructor(
    public readonly descriptor: string,
    public readonly timeout: number,
    cause?: Error,
  ) {
    super(`Element not found: "${descriptor}" (waited ${timeout}ms)`);
    this.name = 'ElementNotFoundError';
    this.originalError = cause;
  }
}

/** Thrown when navigation to an expected URL pattern fails */
export class NavigationError extends Error {
  public readonly originalError?: Error;
  constructor(
    public readonly actualUrl: string,
    public readonly expectedPattern: string,
    cause?: Error,
  ) {
    super(`Navigation failed: expected URL matching "${expectedPattern}", got "${actualUrl}"`);
    this.name = 'NavigationError';
    this.originalError = cause;
  }
}

/** Thrown when authentication fails (login, token refresh, etc.) */
export class AuthenticationError extends Error {
  public readonly originalError?: Error;
  constructor(
    public readonly reason: string,
    cause?: Error,
  ) {
    super(`Authentication failed: ${reason}`);
    this.name = 'AuthenticationError';
    this.originalError = cause;
  }
}

/** Thrown when an API call returns an unexpected status or response */
export class ApiError extends Error {
  public readonly originalError?: Error;
  constructor(
    public readonly statusCode: number,
    public readonly endpoint: string,
    message?: string,
    cause?: Error,
  ) {
    super(`API error ${statusCode} at "${endpoint}"${message ? `: ${message}` : ''}`);
    this.name = 'ApiError';
    this.originalError = cause;
  }
}

/** Thrown when required test data or environment variables are missing */
export class TestDataError extends Error {
  public readonly originalError?: Error;
  constructor(
    public readonly field: string,
    cause?: Error,
  ) {
    super(`Missing required test data: "${field}". Check your .env file or test-data configuration.`);
    this.name = 'TestDataError';
    this.originalError = cause;
  }
}
