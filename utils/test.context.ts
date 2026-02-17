export class TestContext {
  // Shared context logic can go here
  // e.g., generating unique IDs for test runs
  static generateId(): string {
    return Math.random().toString(36).substring(7);
  }
}
