import type { APIRequestContext } from '@playwright/test';

/**
 *
 */
export class UserClient {
  /**
   *
   */
  constructor(private request: APIRequestContext) {}

  /**
   *
   */
  async createUser(_data: any) {
    // Implementation for creating user
  }

  /**
   *
   */
  async getUser(_id: string) {
    // Implementation for getting user
  }
}
