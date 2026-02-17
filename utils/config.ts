import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.dev') });

/**
 * Environment configuration and constants.
 */
export class Config {
  public static readonly BASE_URL = process.env.BASE_URL || 'https://firefly.adobe.com';
  public static readonly USERNAME = process.env.USERNAME || '';
  public static readonly PASSWORD = process.env.PASSWORD || '';
  public static readonly SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || '';
}
