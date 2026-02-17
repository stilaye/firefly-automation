/**
 * Structured logging utility for standardized output.
 */
export class Logger {
  /**
   * Log an info message.
   * @param message - The message to log.
   */
  static info(message: string) {
    console.log(`[INFO] ${message}`);
  }

  /**
   * Log an error message.
   * @param message - The error message.
   */
  static error(message: string) {
    // eslint-disable-next-line no-console
    console.error(`[ERROR] ${message}`);
  }

  /**
   * Log a warning message.
   * @param message - The warning message.
   */
  static warn(message: string) {
    // eslint-disable-next-line no-console
    console.warn(`[WARN] ${message}`);
  }
}
