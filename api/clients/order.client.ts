import { APIRequestContext } from '@playwright/test';

export class OrderClient {
  constructor(private request: APIRequestContext) {}

  async createOrder(data: any) {
    // Implementation for creating order
  }
}
