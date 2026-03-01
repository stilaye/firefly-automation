import dotenv from 'dotenv';
import path from 'path';
import { TestDataError } from './errors';

const envFile = process.env.TEST_ENV === 'qa' ? '.env.qa'
  : process.env.TEST_ENV === 'prod' ? '.env.prod'
  : '.env.dev';

dotenv.config({ path: path.resolve(__dirname, '..', envFile) });

/**
 * Require an environment variable, throwing a descriptive error if missing.
 * Prevents silent empty-string failures that waste debugging time.
 */
function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key];
  if (!value && fallback !== undefined) return fallback;
  if (!value) throw new TestDataError(key);
  return value;
}

/**
 * Environment configuration and constants.
 *
 * Required variables throw immediately if missing (fail-fast).
 * Optional variables have sensible defaults.
 */
export class Config {
  /** Base URL for the application under test */
  public static readonly BASE_URL = requireEnv('BASE_URL', 'https://firefly.adobe.com');

  /** Login username/email (required — will throw if missing) */
  public static readonly USERNAME = requireEnv('USERNAME');

  /** Login password (required — will throw if missing) */
  public static readonly PASSWORD = requireEnv('PASSWORD');

  /** Slack webhook URL for test notifications (optional) */
  public static readonly SLACK_WEBHOOK_URL = requireEnv('SLACK_WEBHOOK_URL', '');
}
