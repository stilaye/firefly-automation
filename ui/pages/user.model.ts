import type { Page } from '@playwright/test';

/**
 *
 */
export class UserPage {
  /**
   *
   */
  constructor(private page: Page) {}

  /**
   *
   */
  async navigate() {
    await this.page.goto('/user');
  }

  /**
   *
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async fillForm(_data: any) {
    // Implementation
  }
}
