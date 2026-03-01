import { test, expect } from '../fixtures/browser.fixture';

test.describe('User Lifecycle', () => {
  test('should create and delete user', async ({ page }) => {
    await expect(page).toHaveURL(/./);
    // TODO: implement user lifecycle flow with UserClient
  });
});
