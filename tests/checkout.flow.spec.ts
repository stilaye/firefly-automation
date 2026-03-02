import { test } from '../fixtures/browser.fixture';

test.describe('Checkout Flow', () => {
  test('should complete checkout', async ({ page }) => {
    await page.goto('/');
    // TODO: implement checkout flow
  });
});
