import type { APIRequestContext } from '@playwright/test';

/**
 *
 */
export class AuthClient {
  /**
   *
   */
  constructor(private request: APIRequestContext) {}

  /**
   *
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async login(_user: any) {
    // Implementation for login
  }
}
