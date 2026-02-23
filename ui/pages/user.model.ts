import { Page } from '@playwright/test';

export class UserPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('/user');
  }

  async fillForm(data: any) {
    // Implementation
  }
}
