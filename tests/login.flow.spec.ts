import { test, expect } from '../fixtures/browser.fixture';
import { AuthClient } from '../api/clients/auth.client';

test.describe('Login Flow', () => {
  test('should login successfully', async ({ page, request }) => {
    const auth = new AuthClient(request);
    await auth.login({ username: 'test', password: 'password' });
    // Add assertions
  });
});
