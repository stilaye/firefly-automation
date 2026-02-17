import { APIRequestContext } from '@playwright/test';

export class AuthClient {
  constructor(private request: APIRequestContext) {}

  async login(user: any) {
    // Implementation for login
  }
}
