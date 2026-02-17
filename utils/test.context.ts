/**
 * Shared context helpers for tests.
 */
export class TestContext {
  // Shared context logic can go here
  // e.g., generating unique IDs for test runs

  /**
   * Generates a random alphanumeric ID string.
   * @returns A random string.
   */
  static generateId(): string {
    return Math.random().toString(36).substring(7);
  }
}
