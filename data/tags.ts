/**
 * Type-safe test tags for filtering and CI gating.
 *
 * Usage in tests:
 *   test('should generate image', { tag: [Tags.smoke, Tags.generation] }, async () => { ... });
 *
 * Usage from CLI:
 *   npx playwright test --grep "@smoke"
 *   npx playwright test --grep "@generation"
 */
export const Tags = {
  /** Fast smoke tests — run on every PR */
  smoke: '@smoke',
  /** Critical path tests */
  critical: '@critical',
  /** Full regression suite */
  regression: '@regression',
  /** UI-only tests */
  ui: '@ui',
  /** API-only tests */
  api: '@api',
  /** Image generation feature */
  generation: '@generation',
  /** Image editing feature */
  editing: '@editing',
  /** Project/file management */
  projects: '@projects',
  /** Authentication flows */
  auth: '@auth',
  /** Visual regression tests */
  visual: '@visual',
  /** Performance tests */
  performance: '@performance',
  /** Tests requiring authentication */
  authenticated: '@authenticated',
} as const;

/** Union type of all valid tag values */
export type Tag = (typeof Tags)[keyof typeof Tags];
