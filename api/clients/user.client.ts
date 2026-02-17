import { APIRequestContext } from '@playwright/test';

export class UserClient {
  constructor(private request: APIRequestContext) {}

  async createUser(_data: any) {
    // Implementation for creating user
  }

  async getUser(id: string) {
    // Implementation for getting user
  }
}
