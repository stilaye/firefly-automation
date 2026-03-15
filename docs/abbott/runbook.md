# Abbott Merlin.net Test Suite — Runbook

## Overview

Automated Playwright test suite for **Abbott Merlin.net Patient Care Network** covering the pre-login pages:

- **Login** — `https://www.merlin.net/web/chakravyuh/login`
- **Reset Password** — `https://www.merlin.net/web/chakravyuh/resetpassword`

**59 tests** across 7 spec files, running in ~30 seconds.

## Quick Start

```bash
# Run all Abbott tests
npm run test:abbott

# Run with visible browser (great for demos)
npm run test:abbott -- --headed

# Run only regression tests
npx playwright test --project=abbott tests/abbott/login.regression.spec.ts tests/abbott/reset-password.regression.spec.ts

# Show HTML report after run
npx playwright show-report
```

## Test Inventory

| Spec File | Count | Category | What It Validates |
|---|---|---|---|
| `login.regression.spec.ts` | 14 | Regression | Form elements, footer links, password masking, forgot password navigation |
| `reset-password.regression.spec.ts` | 15 | Regression | Form elements, heading, footer links, Cancel → login navigation |
| `login.negative.spec.ts` | 10 | Security | XSS, SQL injection, unicode, empty fields, rapid submits, password exposure |
| `login.accessibility.spec.ts` | 7 | Accessibility | ARIA labels, keyboard Tab order, landmarks, placeholder labels, page title |
| `reset-password.accessibility.spec.ts` | 6 | Accessibility | ARIA, tab order, required field indicators, visible labels, link names |
| `login.visual.spec.ts` | 4 | Visual | Default state, focused User ID, focused Password, footer section |
| `reset-password.visual.spec.ts` | 3 | Visual | Default state, filled form, footer section |

## Architecture

### Project Structure

```
data/abbott/
├── abbott-tags.ts              # Type-safe tags (@abbott, @merlin-login, etc.)
└── abbott-test-data.ts         # URLs, UI strings, test inputs (single source of truth)

ui/pages/abbott/
├── merlin-login.page.ts        # Login page object (extends BasePage)
└── merlin-reset-password.page.ts  # Reset password page object (extends BasePage)

ui/components/abbott/
├── merlin-footer.component.ts  # Shared footer (Terms, Privacy, Contact, Abbott link)
└── merlin-help-menu.component.ts  # Help dropdown (hidden on reset page — not tested)

tests/abbott/
├── login.regression.spec.ts
├── login.negative.spec.ts
├── login.accessibility.spec.ts
├── login.visual.spec.ts
├── login.visual.spec.ts-snapshots/     # Visual baselines (PNG)
├── reset-password.regression.spec.ts
├── reset-password.accessibility.spec.ts
├── reset-password.visual.spec.ts
├── reset-password.visual.spec.ts-snapshots/  # Visual baselines (PNG)
└── visual-config/
    └── abbott.visual.config.json       # Data-driven visual config
```

### Component Composition

```
MerlinLoginPage (extends BasePage)
├── MerlinFooterComponent      ← shared
├── userIdInput (#user)
├── passwordInput (#password)
├── signInButton (getByRole button "Sign in")
└── forgotPasswordLink (getByRole link "Forgot user ID or password")

MerlinResetPasswordPage (extends BasePage)
├── MerlinFooterComponent      ← shared (same component, reused)
├── MerlinHelpMenuComponent    ← exists but hidden via CSS
├── userIdInput (#resetPasswordForm_userId)
├── emailInput (#resetPasswordForm_email)
├── resetPasswordButton (getByRole link "Reset Password")
├── cancelButton (getByRole link "Cancel")
├── pageHeading (div.ssn_page_title)
├── instructionText
└── forgotUserIdText
```

### Playwright Config

The `abbott` project in `playwright.config.ts`:

```typescript
{
  name: 'abbott',
  testMatch: /abbott\/.*/,
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'https://www.merlin.net',
  },
}
```

- No auth dependency (pre-login pages)
- Separate `baseURL` from Firefly tests
- `testMatch` scopes only `tests/abbott/` files

## Running Tests

### By Category

```bash
# All Abbott tests (~30s)
npm run test:abbott

# Only regression (login + reset password)
npx playwright test --project=abbott --grep "@merlin-login|@merlin-reset" --grep-invert "@accessibility|@visual|@security"

# Only login page tests
npx playwright test --project=abbott --grep "@merlin-login"

# Only reset password page tests
npx playwright test --project=abbott --grep "@merlin-reset"

# Only security/negative tests
npx playwright test --project=abbott --grep "@security"

# Only accessibility tests
npm run test:abbott:a11y

# Only visual regression
npm run test:abbott:visual
```

### By Spec File

```bash
npx playwright test --project=abbott tests/abbott/login.regression.spec.ts
npx playwright test --project=abbott tests/abbott/login.negative.spec.ts
npx playwright test --project=abbott tests/abbott/login.accessibility.spec.ts
npx playwright test --project=abbott tests/abbott/login.visual.spec.ts
npx playwright test --project=abbott tests/abbott/reset-password.regression.spec.ts
npx playwright test --project=abbott tests/abbott/reset-password.accessibility.spec.ts
npx playwright test --project=abbott tests/abbott/reset-password.visual.spec.ts
```

### Debug Mode

```bash
# Step through with Playwright Inspector
npx playwright test --project=abbott tests/abbott/login.regression.spec.ts --debug

# UI mode (interactive test runner)
npm run test:ui
```

## Visual Regression

### Updating Baselines

When a visual change is intentional (e.g., Abbott redesigns the footer):

```bash
npx playwright test --project=abbott --grep @visual --update-snapshots
```

Baseline PNGs are stored in `tests/abbott/<spec>-snapshots/` and committed to git.

### Baseline Files

| Baseline | Page State |
|---|---|
| `merlin-login-default` | Login page, no interaction |
| `merlin-login-focused-userid` | Login page, User ID field focused |
| `merlin-login-focused-password` | Login page, Password field focused |
| `merlin-login-footer` | Login page, scrolled to footer |
| `merlin-reset-default` | Reset password page, no interaction |
| `merlin-reset-filled-form` | Reset password page, User ID + Email filled |
| `merlin-reset-footer` | Reset password page, scrolled to footer |

## Known Findings

### Help Menu Hidden (Reset Password Page)

The Help dropdown (`Help▼`, Learn More, Practice Site, About) exists in the DOM but is **hidden via CSS** (`display: none` / `offsetParent === null`) on the reset password page. Tests for this component were removed since the element is not interactable. The `MerlinHelpMenuComponent` class is retained for potential future use if the menu becomes visible.

### Reset Password Heading Not a Semantic Heading

The "Reset Password" title on the reset password page uses `<div class="ssn_page_title">` instead of an `<h1>` or `<h2>`. The actual `<h2 class="portlet-title-text">` is hidden. The page object uses `page.locator('div.ssn_page_title')` to target the visible element.

### Login Form Lacks `<label>` Associations

The login form inputs use `placeholder` attributes instead of `<label for="...">` elements. The accessibility test documents this finding with a comment noting that proper `<label>` associations would improve screen reader support.

### Form Submission Triggers Full Page Navigation

Submitting the login form (even with invalid credentials) triggers a full page navigation through SiteMinder (`/siteminderagent/forms/login.fcc`) before redirecting back to the login URL. Tests that submit the form must account for this navigation by waiting for `domcontentloaded` and re-checking the URL pattern.

## Updating Test Data

All UI strings, URLs, and test inputs are centralized in `data/abbott/abbott-test-data.ts`. If Abbott changes the UI text (e.g., button label, footer link text), update this single file — no test code changes needed.

| What Changed | Where to Update |
|---|---|
| Button text ("Sign in" → "Log in") | `AbbottTestData.ui.login.signInButtonText` |
| URL path | `AbbottTestData.urls.*` |
| Footer link text | `AbbottTestData.ui.footer.*` |
| Test input values | `AbbottTestData.testInputs.*` |
| URL assertion patterns | `AbbottTestData.urlPatterns.*` |

## Adding a New Page

1. Create a page object in `ui/pages/abbott/` extending `BasePage`
2. If shared UI sections exist, create components in `ui/components/abbott/` extending `BaseComponent`
3. Add URL and UI string constants to `data/abbott/abbott-test-data.ts`
4. Create spec files in `tests/abbott/` importing from `@fixtures/browser.fixture`
5. Tag tests with `AbbottTags.abbott` plus feature-specific tags
6. Run `npx playwright test --project=abbott` to verify

## Tags Reference

| Tag | Constant | Purpose |
|---|---|---|
| `@abbott` | `AbbottTags.abbott` | All Abbott tests |
| `@merlin-login` | `AbbottTags.merlinLogin` | Login page tests |
| `@merlin-reset` | `AbbottTags.merlinReset` | Reset password page tests |
| `@footer-links` | `AbbottTags.footerLinks` | Footer link validation |
| `@form-validation` | `AbbottTags.formValidation` | Form field validation |
| `@accessibility` | `AbbottTags.accessibility` | Accessibility tests |
| `@security` | `AbbottTags.security` | Security/negative tests |
| `@visual` | (string literal) | Visual regression tests |
