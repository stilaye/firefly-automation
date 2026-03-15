/**
 * Type-safe tag constants for Abbott Merlin.net tests.
 *
 * Usage in tests:
 *   test('should load login page', { tag: [AbbottTags.abbott, AbbottTags.regression] }, async () => { ... });
 *
 * Usage from CLI:
 *   npx playwright test --project=abbott --grep "@abbott"
 *   npx playwright test --project=abbott --grep "@merlin-login"
 */
export const AbbottTags = {
  /** All Abbott tests */
  abbott: '@abbott',
  /** Login page tests */
  merlinLogin: '@merlin-login',
  /** Reset password page tests */
  merlinReset: '@merlin-reset',
  /** Footer link validation */
  footerLinks: '@footer-links',
  /** Form field validation */
  formValidation: '@form-validation',
  /** Accessibility tests */
  accessibility: '@accessibility',
  /** Security/negative tests */
  security: '@security',
} as const;

export type AbbottTag = (typeof AbbottTags)[keyof typeof AbbottTags];
