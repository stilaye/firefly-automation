import { test, expect } from '../fixtures/browser.fixture';
import { UserClient } from '../api/clients/user.client';

test.describe('User Lifecycle', () => {
  test('should create and delete user', async ({ page, request }) => {
    const userClient = new UserClient(request);
    // Test implementation
  });
});
