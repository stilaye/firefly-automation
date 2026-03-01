import type { APIRequestContext } from '@playwright/test';

/**
 *
 */
export class OrderClient {
  /**
   *
   */
  constructor(private request: APIRequestContext) {}

  /**
   *
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createOrder(_data: any) {
    // Implementation for creating order
  }
}
