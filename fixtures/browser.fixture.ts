import { test as base } from '@playwright/test';
import { Logger } from '../utils/logger';

export const test = base.extend({
  // Define custom fixtures here
  contextLogs: async ({ page }, use) => {
    Logger.info('Starting test context');
    await use(page);
    Logger.info('Ending test context');
  },
});

export { expect } from '@playwright/test';
